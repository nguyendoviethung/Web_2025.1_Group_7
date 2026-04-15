// frontend/src/pages/admin/Messages.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { Spin, Badge } from "antd";
import { SendOutlined, MessageOutlined, SearchOutlined } from "@ant-design/icons";
import { useChat, subscribe } from "../../hooks/useChat";
import chatService            from "../../services/chatService";
import { useToast }           from "../../components/Toast";
import "../../style/AdminChat.scss";

const fmtTime = d => {
  const date = new Date(d);
  const now  = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
};

const fmtFull = d =>
  new Date(d).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

const fmtDayHeader = d =>
  new Date(d).toLocaleDateString("vi-VN", {
    weekday: "long", day: "2-digit", month: "2-digit", year: "numeric"
  });

export default function Messages() {
  const toast = useToast();
  const me    = JSON.parse(localStorage.getItem("user") || "{}");

  const [conversations, setConversations] = useState([]);
  const [partner,       setPartner]       = useState(null);
  const [inputText,     setInputText]     = useState("");
  const [search,        setSearch]        = useState("");
  const [loadingConvs,  setLoadingConvs]  = useState(true);
  const [loadingMsgs,   setLoadingMsgs]   = useState(false);
  const [sending,       setSending]       = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);
  // Ref giữ partner hiện tại để dùng trong WS subscriber (tránh stale closure)
  const partnerRef     = useRef(null);

  const { messages, sendMessage, markRead, loadMessages, connected } =
    useChat(partner?.partner_id ?? null);

  // Sync partnerRef mỗi khi partner thay đổi
  useEffect(() => { partnerRef.current = partner; }, [partner]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load conversations 1 lần khi mount
  const loadConversations = useCallback(async () => {
    try {
      const res = await chatService.getConversations();
      setConversations(res.conversations || []);
    } catch {}
  }, []);

  useEffect(() => {
    loadConversations().finally(() => setLoadingConvs(false));
  }, [loadConversations]);

  // ── Lắng nghe tin nhắn mới từ WS ──────────────────────
  useEffect(() => {
    const unsub = subscribe('new_message', (msg) => {
      if (!msg) return;

      // Partner trong tin nhắn này là ai? (người kia, không phải mình)
      const otherUserId =
        msg.sender_id === me.id ? msg.receiver_id : msg.sender_id;

      // Nếu đang mở conversation với người này → đánh dấu đọc ngay
      // Dùng partnerRef.current (không bị stale) thay vì partner state
      const isCurrentConv = partnerRef.current?.partner_id === otherUserId;

      if (isCurrentConv && msg.sender_id !== me.id) {
        // Gọi markRead với explicit ID vì useChat.partnerId có thể chưa update
        markRead(otherUserId);
      }

      // Cập nhật preview trong sidebar
      setConversations(prev => {
        const exists = prev.find(c => c.partner_id === otherUserId);
        const updated = {
          partner_id:        otherUserId,
          partner_name:      exists?.partner_name   || `User ${otherUserId}`,
          partner_avatar:    exists?.partner_avatar || null,
          last_message:      msg.content,
          last_message_time: msg.created_at,
          // Nếu đang xem conv này → unread = 0, ngược lại tăng lên
          unread_count: isCurrentConv
            ? 0
            : (Number(exists?.unread_count) || 0) + 1,
        };

        if (exists) return prev.map(c => c.partner_id === otherUserId ? updated : c);
        return [updated, ...prev];
      });
    });

    return unsub;
  }, [me.id, markRead]); // không phụ thuộc vào `partner` state

  // Mở conversation — truyền explicit ID để tránh stale closure
  const openConversation = async (conv) => {
    setPartner(conv);
    setLoadingMsgs(true);

    // Truyền conv.partner_id tường minh → loadMessages và markRead
    // dùng giá trị này thay vì đọc từ state (lúc này vẫn là giá trị cũ)
    await loadMessages(chatService.getMessages, conv.partner_id)
      .finally(() => setLoadingMsgs(false));

    markRead(conv.partner_id);     // ← explicit ID, không stale

    setConversations(prev =>
      prev.map(c =>
        c.partner_id === conv.partner_id ? { ...c, unread_count: 0 } : c
      )
    );
    inputRef.current?.focus();
  };

  const handleSend = () => {
    const text = inputText.trim();
    if (!text || !partner || sending) return;
    setSending(true);
    setInputText("");
    try {
      sendMessage(text);
      setConversations(prev =>
        prev.map(c =>
          c.partner_id === partner.partner_id
            ? { ...c, last_message: text, last_message_time: new Date().toISOString() }
            : c
        )
      );
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const grouped = messages.reduce((acc, msg) => {
    const day = new Date(msg.created_at).toDateString();
    if (!acc[day]) acc[day] = [];
    acc[day].push(msg);
    return acc;
  }, {});

  const filteredConvs = conversations.filter(c =>
    c.partner_name?.toLowerCase().includes(search.toLowerCase())
  );

  const totalUnread = conversations.reduce((s, c) => s + (Number(c.unread_count) || 0), 0);

  return (
    <div className="admin-messages">

      {/* ══ LEFT ══ */}
      <div className="am-sidebar">
        <div className="am-sidebar-header">
          <div className="am-sidebar-title">
            <MessageOutlined />
            <span>Messages</span>
            {totalUnread > 0 && <Badge count={totalUnread} size="small" />}
            {!connected && <span className="am-offline-dot" title="Reconnecting..." />}
          </div>
          <div className="am-search">
            <SearchOutlined className="am-search-icon" />
            <input
              placeholder="Search readers..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="am-conv-list">
          {loadingConvs ? (
            <div className="am-center-spin"><Spin /></div>
          ) : filteredConvs.length === 0 ? (
            <div className="am-empty-conv">
              <MessageOutlined />
              <p>No conversations yet</p>
            </div>
          ) : (
            filteredConvs.map(conv => {
              const unread   = Number(conv.unread_count) || 0;
              const isActive = partner?.partner_id === conv.partner_id;
              return (
                <div
                  key={conv.partner_id}
                  className={`am-conv-item ${isActive ? "am-conv-item--active" : ""} ${unread > 0 ? "am-conv-item--unread" : ""}`}
                  onClick={() => openConversation(conv)}
                >
                  <div className="am-conv-avatar-wrap">
                    <img
                      src={conv.partner_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${conv.partner_name}`}
                      alt={conv.partner_name}
                      onError={e => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${conv.partner_name}`; }}
                    />
                  </div>
                  <div className="am-conv-info">
                    <div className="am-conv-top">
                      <span className="am-conv-name">{conv.partner_name}</span>
                      <span className="am-conv-time">
                        {conv.last_message_time ? fmtTime(conv.last_message_time) : ""}
                      </span>
                    </div>
                    <div className="am-conv-last">
                      <span className="am-conv-preview">{conv.last_message || "No messages yet"}</span>
                      {unread > 0 && <span className="am-unread-badge">{unread}</span>}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ══ RIGHT ══ */}
      <div className="am-chat">
        {!partner ? (
          <div className="am-no-partner">
            <MessageOutlined />
            <p>Select a conversation to start chatting</p>
            <small>New messages will appear here automatically</small>
          </div>
        ) : (
          <>
            <div className="am-chat-header">
              <img
                src={partner.partner_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${partner.partner_name}`}
                alt={partner.partner_name}
                onError={e => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${partner.partner_name}`; }}
              />
              <div>
                <div className="am-chat-name">{partner.partner_name}</div>
                <div className="am-chat-role">📖 Reader</div>
              </div>
            </div>

            <div className="am-messages">
              {loadingMsgs ? (
                <div className="am-center-spin"><Spin /></div>
              ) : messages.length === 0 ? (
                <div className="am-msgs-empty">
                  <MessageOutlined />
                  <p>No messages yet</p>
                </div>
              ) : (
                <>
                  {Object.entries(grouped).map(([day, dayMsgs]) => (
                    <div key={day}>
                      <div className="am-day-divider">
                        <span>{fmtDayHeader(dayMsgs[0].created_at)}</span>
                      </div>
                      {dayMsgs.map(msg => {
                        const isMine = msg.sender_id === me.id;
                        return (
                          <div
                            key={msg.id}
                            className={`am-msg-row ${isMine ? "am-msg-row--mine" : "am-msg-row--theirs"}`}
                          >
                            {!isMine && (
                              <img
                                src={partner.partner_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${partner.partner_name}`}
                                alt={partner.partner_name}
                                className="am-msg-avatar"
                                onError={e => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${partner.partner_name}`; }}
                              />
                            )}
                            <div className="am-msg-col">
                              <div className={`am-bubble ${isMine ? "am-bubble--mine" : "am-bubble--theirs"}`}>
                                {msg.content}
                              </div>
                              <div className={`am-msg-time ${isMine ? "am-msg-time--mine" : ""}`}>
                                {fmtFull(msg.created_at)}
                                {isMine && (
                                  <span
                                    className="am-read-tick"
                                    style={{ color: msg.is_read ? "#4facfe" : "#bfbfbf" }}
                                  >
                                    {msg.is_read ? " ✓✓" : " ✓"}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            <div className="am-input-row">
              <textarea
                ref={inputRef}
                className="am-input"
                placeholder="Type a reply... (Enter to send, Shift+Enter for new line)"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
              />
              <button
                className="am-send-btn"
                onClick={handleSend}
                disabled={!inputText.trim() || !connected}
              >
                {sending ? <Spin size="small" /> : <SendOutlined />}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}