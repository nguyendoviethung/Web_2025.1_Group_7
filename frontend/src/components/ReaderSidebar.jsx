import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Layout, Menu, Modal, Badge, Rate, Spin } from "antd";
import {
  LogoutOutlined, HomeOutlined, BookOutlined, UserOutlined,
  HistoryOutlined, MessageOutlined, BellOutlined, SaveOutlined,
  CheckOutlined, StarOutlined, CloseOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { logout } from "../services/authService";
import notificationService from "../services/notificationService";
import reviewService       from "../services/reviewService";
import bookService         from "../services/bookService";
import { useToast } from "./Toast";
import logo from "../assets/LibraryLogo.svg";
import "../style/ReaderSidebar.scss";

const { Sider } = Layout;

const MENU = [
  { key: "home",         icon: <HomeOutlined />,    label: "Home",         path: "/reader/home" },
  { key: "books",        icon: <BookOutlined />,    label: "Books",        path: "/reader/books" },
  { key: "reservations", icon: <SaveOutlined />,    label: "Reservations", path: "/reader/reservations" },
  { key: "history",      icon: <HistoryOutlined />, label: "My Borrows",   path: "/reader/history" },
  { key: "chat",         icon: <MessageOutlined />, label: "Chat",         path: "/reader/chat" },
  { key: "profile",      icon: <UserOutlined />,    label: "My Profile",   path: "/reader/profile" },
];

const fmtTime = (d) =>
  new Date(d).toLocaleString("vi-VN", {
    hour: "2-digit", minute: "2-digit",
    day: "2-digit",  month: "2-digit",
  });

// ── Review Modal Component ────────────────────────────
function ReviewModal({ bookId, onClose, onSuccess }) {
  const toast = useToast();
  const [book,    setBook]    = useState(null);
  const [rating,  setRating]  = useState(0);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching,setFetching]= useState(true);

  useEffect(() => {
    bookService.getById(bookId)
      .then(res => setBook(res.book))
      .catch(() => toast.error("Failed to load book info"))
      .finally(() => setFetching(false));
  }, [bookId]);

  const handleSubmit = async () => {
    if (!rating) { toast.warning("Please select a star rating"); return; }
    setLoading(true);
    try {
      await reviewService.upsert({ book_id: bookId, rating, content: content.trim() });
      toast.success("Thank you for your review! 🎉");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="review-modal-overlay" onClick={onClose}>
      <div className="review-modal-box" onClick={e => e.stopPropagation()}>
        <div className="review-modal-header">
          <div className="review-modal-title">
            <StarOutlined /> Rate this book
          </div>
          <button className="review-modal-close" onClick={onClose}><CloseOutlined /></button>
        </div>

        {fetching ? (
          <div style={{ textAlign: "center", padding: "3rem" }}><Spin /></div>
        ) : (
          <div className="review-modal-body">
            {book && (
              <div className="review-modal-book">
                <img
                  src={book.book_cover || "https://placehold.co/56x80?text=N/A"}
                  alt={book.title}
                  onError={e => { e.target.src = "https://placehold.co/56x80?text=N/A"; }}
                />
                <div>
                  <div className="review-modal-book-title">{book.title}</div>
                  <div className="review-modal-book-author">{book.author}</div>
                </div>
              </div>
            )}

            <div className="review-modal-rating-wrap">
              <span>Your Rating:</span>
              <Rate
                value={rating}
                onChange={setRating}
                style={{ fontSize: "2.8rem", color: "#faad14" }}
              />
            </div>

            <textarea
              className="review-modal-textarea"
              placeholder="Share your thoughts about this book... (optional)"
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={3}
            />
          </div>
        )}

        <div className="review-modal-footer">
          <button className="review-modal-btn-cancel" onClick={onClose}>Cancel</button>
          <button
            className="review-modal-btn-submit"
            onClick={handleSubmit}
            disabled={loading || !rating}
          >
            {loading ? <Spin size="small" /> : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Sidebar Component ────────────────────────────
export default function ReaderSidebar() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const toast      = useToast();
  const panelRef   = useRef(null);
  const triggerRef = useRef(null);

  const [showConfirm,    setShowConfirm]    = useState(false);
  const [logoutLoading,  setLogoutLoading]  = useState(false);
  const [unreadNotif,    setUnreadNotif]    = useState(0);
  const [notifications,  setNotifications]  = useState([]);
  const [notifOpen,      setNotifOpen]      = useState(false);
  const [loadingNotif,   setLoadingNotif]   = useState(false);
  const [panelStyle,     setPanelStyle]     = useState({});
  const [reviewModal,    setReviewModal]    = useState({ open: false, bookId: null, notifId: null });

  const activeKey = MENU.find(m => location.pathname.startsWith(m.path))?.key || "home";

  // ── Proactive unread count polling (every 15 seconds) ─
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await notificationService.getUnreadCount();
      setUnreadNotif(res.unread_count ?? 0);
    } catch {}
  }, []);

  useEffect(() => {
    fetchUnreadCount(); // immediate on mount
    const id = setInterval(fetchUnreadCount, 15000);
    return () => clearInterval(id);
  }, [fetchUnreadCount]);

  // ── Close panel on outside click ──────────────────────
  useEffect(() => {
    if (!notifOpen) return;
    const handler = (e) => {
      if (!panelRef.current?.contains(e.target) && !e.target.closest(".rs-notif-trigger")) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [notifOpen]);

  // ── Position panel next to trigger button ─────────────
  const updatePanelPosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect         = triggerRef.current.getBoundingClientRect();
    const panelWidth   = 360;
    const panelHeight  = 480;
    const gap          = 12;
    const vp           = 16;

    const left = Math.min(rect.right + gap, window.innerWidth - panelWidth - vp);
    // Align panel top with button top; clamp so it doesn't go off screen
    const top  = Math.min(
      Math.max(rect.top, vp),
      window.innerHeight - panelHeight - vp
    );

    setPanelStyle({ left: `${Math.max(vp, left)}px`, top: `${top}px` });
  }, []);

  useEffect(() => {
    if (!notifOpen) return;
    updatePanelPosition();
    window.addEventListener("resize", updatePanelPosition);
    window.addEventListener("scroll", updatePanelPosition, true);
    return () => {
      window.removeEventListener("resize", updatePanelPosition);
      window.removeEventListener("scroll", updatePanelPosition, true);
    };
  }, [notifOpen, updatePanelPosition]);

  // ── Open notification panel ───────────────────────────
  const openNotifPanel = async () => {
    const opening = !notifOpen;
    setNotifOpen(opening);
    if (!opening) return;

    setLoadingNotif(true);
    try {
      const res = await notificationService.getAll({ limit: 30 });
      setNotifications(res.notifications || []);
      setUnreadNotif(res.unread_count ?? 0);
    } catch {
      toast.error("Failed to load notifications");
    } finally {
      setLoadingNotif(false);
    }
  };

  // ── Handle notification click ─────────────────────────
  const handleNotifClick = async (notif) => {
    // Check if this is a review notification (has reference_id = book_id)
    if (notif.reference_id && notif.title === '⭐ Rate your returned book') {
      setNotifOpen(false);
      setReviewModal({ open: true, bookId: notif.reference_id, notifId: notif.id });
    }

    if (!notif.is_read) {
      try {
        await notificationService.markRead(notif.id);
        setNotifications(prev =>
          prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n)
        );
        setUnreadNotif(prev => Math.max(0, prev - 1));
      } catch {}
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadNotif(0);
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  const handleMenuClick = ({ key }) => {
    const item = MENU.find(m => m.key === key);
    if (item) navigate(item.path);
  };

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);
      await logout();
      toast.success("Logged out successfully!");
      setTimeout(() => navigate("/"), 500);
    } catch {
      localStorage.clear();
      navigate("/");
    } finally {
      setLogoutLoading(false);
      setShowConfirm(false);
    }
  };

  // ── Notification panel portal ─────────────────────────
  const notificationPanel = notifOpen && typeof document !== "undefined"
    ? createPortal(
        <div className="rs-notif-panel" ref={panelRef} style={panelStyle}>
          <div className="rs-notif-header">
            <span>Notifications</span>
            {unreadNotif > 0 && (
              <button className="rs-notif-mark-all" onClick={handleMarkAllRead}>
                <CheckOutlined /> Mark all read
              </button>
            )}
          </div>

          <div className="rs-notif-list">
            {loadingNotif ? (
              <div className="rs-notif-loading"><Spin /></div>
            ) : notifications.length === 0 ? (
              <div className="rs-notif-empty">
                <BellOutlined />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  className={`rs-notif-item ${!n.is_read ? "rs-notif-item--unread" : ""} ${n.reference_id && n.title === '⭐ Rate your returned book' ? "rs-notif-item--review" : ""}`}
                  onClick={() => handleNotifClick(n)}
                >
                  {!n.is_read && <span className="rs-notif-dot" />}
                  <div className="rs-notif-body">
                    <div className="rs-notif-title">{n.title}</div>
                    <div className="rs-notif-msg">{n.message}</div>
                    {n.reference_id && n.title === '⭐ Rate your returned book' && (
                      <div className="rs-notif-cta">Tap to rate →</div>
                    )}
                    <div className="rs-notif-time">{fmtTime(n.created_at)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <Sider className="reader-sidebar" width={220} theme="light">
        <div className="rs-logo"><img src={logo} alt="Logo" /></div>

        <Menu
          mode="inline"
          selectedKeys={[activeKey]}
          className="rs-menu"
          onClick={handleMenuClick}
          items={MENU.map(item => ({ key: item.key, icon: item.icon, label: item.label }))}
        />

        {/* Notification button */}
        <div className="rs-notif-area">
          <button
            ref={triggerRef}
            className={`rs-notif-trigger rs-notif-btn ${notifOpen ? "rs-notif-btn--active" : ""}`}
            onClick={openNotifPanel}
          >
            <Badge count={unreadNotif} size="small" offset={[4, -2]} overflowCount={99}>
              <BellOutlined className="rs-notif-icon" />
            </Badge>
            <span>Notifications</span>
            {unreadNotif > 0 && (
              <span className="rs-notif-count-pill">{unreadNotif > 99 ? "99+" : unreadNotif}</span>
            )}
          </button>
        </div>

        <div className="rs-footer">
          <button className="rs-logout-btn" onClick={() => setShowConfirm(true)} disabled={logoutLoading}>
            <LogoutOutlined className="rs-logout-icon" />
            <span>Logout</span>
          </button>
        </div>
      </Sider>

      {/* Confirm logout modal */}
      <Modal
        open={showConfirm}
        onOk={handleLogout}
        onCancel={() => setShowConfirm(false)}
        okText="Logout"
        cancelText="Cancel"
        okButtonProps={{ danger: true, loading: logoutLoading }}
        centered
        width={400}
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <LogoutOutlined style={{ color: "#ff4d4f" }} /> Confirm Logout
          </div>
        }
      >
        <p style={{ fontSize: "1.4rem", color: "#595959", margin: "1.6rem 0", fontWeight: 500 }}>
          Are you sure you want to logout?
        </p>
      </Modal>

      {notificationPanel}

      {/* Review modal */}
      {reviewModal.open && reviewModal.bookId && (
        <ReviewModal
          bookId={reviewModal.bookId}
          onClose={() => setReviewModal({ open: false, bookId: null, notifId: null })}
          onSuccess={() => {
            // Refresh unread count after review
            fetchUnreadCount();
          }}
        />
      )}
    </>
  );
}