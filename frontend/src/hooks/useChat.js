// frontend/src/hooks/useChat.js
// Fix markRead: nhận explicitPartnerId giống loadMessages
// → tránh stale closure khi gọi ngay sau setPartner

import { useState, useEffect, useRef, useCallback } from 'react';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:5000/ws';

// ── Singleton WebSocket ────────────────────────────────
let globalSocket  = null;
let globalToken   = null;
const subscribers = new Map();

function getSocket() {
  const token = localStorage.getItem('accessToken');

  if (
    globalSocket &&
    globalSocket.readyState === WebSocket.OPEN &&
    globalToken === token
  ) return globalSocket;

  if (globalSocket) { globalSocket.onclose = null; globalSocket.close(); }

  globalToken  = token;
  globalSocket = new WebSocket(`${WS_URL}?token=${token}`);

  globalSocket.onopen    = () => { console.log('[WS] Connected'); emit('__connected', null); };
  globalSocket.onmessage = (e) => { try { const d = JSON.parse(e.data); emit(d.type, d.payload); } catch {} };
  globalSocket.onclose   = (e) => {
    console.log('[WS] Disconnected', e.code);
    emit('__disconnected', null);
    if (e.code !== 4001) setTimeout(() => getSocket(), 2000);
  };
  globalSocket.onerror = () => {};
  return globalSocket;
}

function emit(type, payload) {
  (subscribers.get(type) || new Set()).forEach(cb => cb(payload));
}

export function subscribe(type, cb) {
  if (!subscribers.has(type)) subscribers.set(type, new Set());
  subscribers.get(type).add(cb);
  return () => subscribers.get(type)?.delete(cb);
}

export function wsSend(type, payload) {
  const s = getSocket();
  const send = () => s.send(JSON.stringify({ type, payload }));
  if (s.readyState === WebSocket.OPEN) { send(); }
  else { const u = subscribe('__connected', () => { send(); u(); }); }
}

// ──────────────────────────────────────────────────────
export function useChat(partnerId) {
  const me = JSON.parse(localStorage.getItem('user') || '{}');
  const [messages,  setMessages]  = useState([]);
  const [connected, setConnected] = useState(false);
  const messagesRef = useRef([]);

  useEffect(() => { messagesRef.current = messages; }, [messages]);

  // Khởi socket
  useEffect(() => {
    getSocket();
    const u1 = subscribe('__connected',    () => setConnected(true));
    const u2 = subscribe('__disconnected', () => setConnected(false));
    if (globalSocket?.readyState === WebSocket.OPEN) setConnected(true);
    return () => { u1(); u2(); };
  }, []);

  // Nhận tin nhắn mới
  useEffect(() => {
    if (!partnerId) return;
    const pid = Number(partnerId);

    const unsub = subscribe('new_message', (msg) => {
      if (!msg) return;
      const relevant =
        (msg.sender_id === me.id && msg.receiver_id === pid) ||
        (msg.sender_id === pid   && msg.receiver_id === me.id);
      if (!relevant) return;

      if (!messagesRef.current.some(m => m.id === msg.id)) {
        setMessages(prev => [...prev, msg]);
      }

      // Nếu tin đến từ partner (không phải mình gửi) → tự động mark read
      if (msg.sender_id === pid) {
        wsSend('mark_read', { partner_id: pid });
      }
    });

    return unsub;
  }, [partnerId, me.id]);

  // Tick ✓✓
  useEffect(() => {
    if (!partnerId) return;
    const pid = Number(partnerId);

    const unsub = subscribe('messages_read', (data) => {
      if (!data || Number(data.reader_id) !== pid) return;
      setMessages(prev =>
        prev.map(m =>
          m.sender_id === me.id && m.receiver_id === pid
            ? { ...m, is_read: true } : m
        )
      );
    });

    return unsub;
  }, [partnerId, me.id]);

  // Gửi tin
  const sendMessage = useCallback((content) => {
    if (!content?.trim() || !partnerId) return;
    wsSend('send_message', { receiver_id: Number(partnerId), content });
  }, [partnerId]);

  // ── FIX: markRead nhận explicitPartnerId ──────────────
  // Gọi: markRead(explicitId) khi cần tránh stale closure
  // Gọi: markRead() khi partnerId state đã đúng
  const markRead = useCallback((explicitPartnerId) => {
    const pid = explicitPartnerId ?? partnerId;
    if (!pid) return;
    wsSend('mark_read', { partner_id: Number(pid) });
  }, [partnerId]);

  // Load history — nhận explicitPartnerId để tránh stale closure
  const loadMessages = useCallback(async (fetchFn, explicitPartnerId) => {
    const pid = explicitPartnerId ?? partnerId;
    if (!pid || !fetchFn) return;
    try {
      const res = await fetchFn(pid, { page: 1, limit: 100 });
      setMessages(res.messages || []);
    } catch {}
  }, [partnerId]);

  return { messages, setMessages, sendMessage, markRead, loadMessages, connected };
}