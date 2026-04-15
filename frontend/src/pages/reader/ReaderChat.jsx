// frontend/src/pages/reader/ReaderChat.jsx
// Fix:
//  1. Bỏ sidebar chọn staff — auto-select staff đầu tiên khi mount
//  2. Hiện tin nhắn ngay khi vào trang, không cần click gì thêm
//  3. Giao diện full-width, gọn hơn

import { useState, useEffect, useRef } from "react";
import { Spin } from "antd";
import { SendOutlined, MessageOutlined } from "@ant-design/icons";
import { useChat }  from "../../hooks/useChat";
import chatService  from "../../services/chatService";
import { useToast } from "../../components/Toast";
import "../../style/ReaderChat.scss";

const fmtTime = d => {
  const date = new Date(d);
  const now  = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }) +
    " " + date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
};

const fmtDayHeader = d =>
  new Date(d).toLocaleDateString("vi-VN", {
    weekday: "long", day: "2-digit", month: "2-digit", year: "numeric"
  });

export default function ReaderChat() {
  const toast = useToast();
  const me    = JSON.parse(localStorage.getItem("user") || "{}");

  const [staff,       setStaff]       = useState(null);   // staff đang chat (auto-selected)
  const [inputText,   setInputText]   = useState("");
  const [loadingInit, setLoadingInit] = useState(true);   // loading lần đầu vào trang
  const [sending,     setSending]     = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);

  // useChat nhận staff.id — sẽ là null cho đến khi staff được load
  const { messages, sendMessage, markRead, loadMessages, connected } =
    useChat(staff?.id ?? null);

  // Auto-scroll khi tin nhắn thay đổi
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Auto-select staff đầu tiên khi mount ──────────────
  // Không cần user click gì — vào trang là hiện tin nhắn luôn
  useEffect(() => {
    chatService.getStaffList()
      .then(async res => {
        const list = res.staff || [];
        if (list.length === 0) return;

        const firstStaff = list[0];
        setStaff(firstStaff);

        // Truyền firstStaff.id tường minh để tránh stale closure
        await loadMessages(chatService.getMessages, firstStaff.id);
        markRead();
      })
      .catch(() => toast.error("Failed to connect to support"))
      .finally(() => {
        setLoadingInit(false);
        // Focus input sau khi load xong
        setTimeout(() => inputRef.current?.focus(), 100);
      });
  }, []); // chỉ chạy 1 lần khi mount

  const handleSend = () => {
    const text = inputText.trim();
    if (!text || !staff || sending) return;
    setSending(true);
    setInputText("");
    try {
      sendMessage(text);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // Group messages theo ngày
  const grouped = messages.reduce((acc, msg) => {
    const day = new Date(msg.created_at).toDateString();
    if (!acc[day]) acc[day] = [];
    acc[day].push(msg);
    return acc;
  }, {});

  // ── Loading toàn trang ─────────────────────────────────
  if (loadingInit) return (
    <div className="rc-page-loading">
      <Spin size="large" />
      <p>Connecting to support...</p>
    </div>
  );

  // ── Không có staff nào ─────────────────────────────────
  if (!staff) return (
    <div className="rc-page-loading">
      <MessageOutlined style={{ fontSize: "4rem", color: "#bfbfbf" }} />
      <p>No librarian available at the moment</p>
    </div>
  );

  return (
    <div className="reader-chat reader-chat--fullwidth">

      {/* ── Header ── */}
      <div className="rc-chat-header">
        <img
          src={staff.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${staff.full_name}`}
          alt={staff.full_name}
          onError={e => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${staff.full_name}`; }}
        />
        <div>
          <div className="rc-chat-partner-name">{staff.full_name}</div>
          {/* <div className="rc-chat-status">
            {connected
              ? <><span className="rc-online-dot rc-online-dot--inline" /> Online</>
              : <><span className="rc-offline-dot rc-offline-dot--inline" /> Reconnecting...</>
            }
          </div> */}
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="rc-messages-wrap">
        {messages.length === 0 ? (
          <div className="rc-msgs-empty">
            <MessageOutlined />
            <p>No messages yet. Say hello! 👋</p>
          </div>
        ) : (
          <>
            {Object.entries(grouped).map(([day, dayMsgs]) => (
              <div key={day}>
                <div className="rc-day-divider">
                  <span>{fmtDayHeader(dayMsgs[0].created_at)}</span>
                </div>
                {dayMsgs.map(msg => {
                  const isMine = msg.sender_id === me.id;
                  return (
                    <div
                      key={msg.id}
                      className={`rc-msg-row ${isMine ? "rc-msg-row--mine" : "rc-msg-row--theirs"}`}
                    >
                      {!isMine && (
                        <img
                          src={staff.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${staff.full_name}`}
                          alt={staff.full_name}
                          className="rc-msg-avatar"
                          onError={e => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${staff.full_name}`; }}
                        />
                      )}
                      <div className="rc-msg-col">
                        <div className={`rc-bubble ${isMine ? "rc-bubble--mine" : "rc-bubble--theirs"}`}>
                          {msg.content}
                        </div>
                        <div className={`rc-msg-time ${isMine ? "rc-msg-time--mine" : ""}`}>
                          {fmtTime(msg.created_at)}
                          {isMine && (
                            <span
                              className="rc-read-tick"
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

      {/* ── Input ── */}
      <div className="rc-input-row">
        <textarea
          ref={inputRef}
          className="rc-input"
          placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
        />
        <button
          className="rc-send-btn"
          onClick={handleSend}
          disabled={!inputText.trim() || !connected}
        >
          {sending ? <Spin size="small" /> : <SendOutlined />}
        </button>
      </div>
    </div>
  );
}