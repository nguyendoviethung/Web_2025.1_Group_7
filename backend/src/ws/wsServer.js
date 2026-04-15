// backend/src/ws/wsServer.js
//
// Cách dùng trong server.js / app.js:
//
//   import { createServer } from 'http';
//   import app              from './app.js';
//   import { setupWsServer }from './ws/wsServer.js';
//
//   const httpServer = createServer(app);
//   setupWsServer(httpServer);
//   httpServer.listen(PORT, () => console.log(`Server on ${PORT}`));
//
// Thư viện cần: npm install ws jsonwebtoken

import { WebSocketServer, WebSocket } from 'ws';
import jwt                            from 'jsonwebtoken';
import ChatModel                      from '../models/chatModel.js';

// Map userId (number) → Set<WebSocket>
// Một user có thể mở nhiều tab → nhiều socket
const clients = new Map();

/**
 * Gắn WebSocket server vào HTTP server đã có.
 * WS endpoint: ws://host/ws  (path phân biệt với HTTP routes)
 */
export function setupWsServer(httpServer) {
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (socket, req) => {
    // ── 1. Xác thực token ──────────────────────────────  
    // Client gửi token qua query string: ws://host/ws?token=<accessToken>
    const url   = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get('token');

    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;
    } catch {
      socket.close(4001, 'Unauthorized');
      return;
    }

    // ── 2. Đăng ký socket ─────────────────────────────
    if (!clients.has(userId)) clients.set(userId, new Set());
    clients.get(userId).add(socket);

    console.log(`[WS] User ${userId} connected (${clients.get(userId).size} socket(s))`);

    // Gửi ping mỗi 25s để giữ kết nối
    const pingInterval = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) socket.ping();
    }, 25000);

    // ── 3. Nhận message từ client ─────────────────────
    socket.on('message', async (raw) => {
      let data;
      try { data = JSON.parse(raw); } catch { return; }

      // ── Event: send_message ──
      if (data.type === 'send_message') {
        const { receiver_id, content } = data.payload || {};
        if (!receiver_id || !content?.trim()) return;

        try {
          const msg = await ChatModel.createMessage(userId, receiver_id, content);

          // Gửi lại cho sender (để cập nhật UI ngay lập tức)
          sendTo(userId, { type: 'new_message', payload: msg });

          // Gửi đến receiver nếu đang online
          sendTo(receiver_id, { type: 'new_message', payload: msg });
        } catch (err) {
          console.error('[WS] createMessage error:', err);
          sendTo(userId, { type: 'error', payload: { message: 'Failed to send message' } });
        }
      }

      // ── Event: mark_read ──
      if (data.type === 'mark_read') {
        const { partner_id } = data.payload || {};
        if (!partner_id) return;
        try {
          await ChatModel.markRead(userId, partner_id);
          // Báo cho sender biết tin của họ đã được đọc
          sendTo(partner_id, { type: 'messages_read', payload: { reader_id: userId } });
        } catch (err) {
          console.error('[WS] markRead error:', err);
        }
      }

      // ── Event: ping (keep-alive từ client) ──
      if (data.type === 'ping') {
        sendTo(userId, { type: 'pong' });
      }
    });

    // ── 4. Cleanup khi đóng ───────────────────────────
    socket.on('close', () => {
      clearInterval(pingInterval);
      const set = clients.get(userId);
      if (set) {
        set.delete(socket);
        if (set.size === 0) clients.delete(userId);
      }
      console.log(`[WS] User ${userId} disconnected`);
    });

    socket.on('error', (err) => console.error(`[WS] Socket error user ${userId}:`, err));
  });

  console.log('[WS] WebSocket server ready on /ws');
}

/** Gửi JSON đến tất cả socket của userId */
function sendTo(userId, data) {
  const set = clients.get(Number(userId));
  if (!set) return;
  const json = JSON.stringify(data);
  set.forEach(socket => {
    if (socket.readyState === WebSocket.OPEN) socket.send(json);
  });
}

/** Kiểm tra user có đang online không (dùng để hiện dot) */
export function isOnline(userId) {
  return clients.has(Number(userId));
}