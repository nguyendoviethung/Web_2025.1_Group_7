import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Layout, Menu, Modal, Badge } from "antd";
import {
  LogoutOutlined, HomeOutlined, BookOutlined, UserOutlined,
  HistoryOutlined, MessageOutlined, BellOutlined, SaveOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { logout } from "../services/authService";
import notificationService from "../services/notificationService";
import { useToast } from "./Toast";
import logo from "../assets/LibraryLogo.svg";
import "../style/ReaderSidebar.scss";

const { Sider } = Layout;

const MENU = [
  { key: "home", icon: <HomeOutlined />, label: "Home", path: "/reader/home" },
  { key: "books", icon: <BookOutlined />, label: "Books", path: "/reader/books" },
  { key: "reservations", icon: <SaveOutlined />, label: "Reservations", path: "/reader/reservations" },
  { key: "history", icon: <HistoryOutlined />, label: "My Borrows", path: "/reader/history" },
  { key: "chat", icon: <MessageOutlined />, label: "Chat", path: "/reader/chat" },
  { key: "profile", icon: <UserOutlined />, label: "My Profile", path: "/reader/profile" },
];

const fmtTime = (d) =>
  new Date(d).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  });

export default function ReaderSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const panelRef = useRef(null);
  const triggerRef = useRef(null);

  const [showConfirm, setShowConfirm] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [unreadNotif, setUnreadNotif] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [loadingNotif, setLoadingNotif] = useState(false);
  const [notifPanelStyle, setNotifPanelStyle] = useState({});

  const activeKey = MENU.find((m) => location.pathname.startsWith(m.path))?.key || "home";

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await notificationService.getUnreadCount();
        setUnreadNotif(res.unread_count || 0);
      } catch {}
    };

    fetchUnread();
    const id = setInterval(fetchUnread, 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!notifOpen) return;

    const handleOutsideClick = (e) => {
      if (!panelRef.current?.contains(e.target) && !e.target.closest(".rs-notif-trigger")) {
        setNotifOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [notifOpen]);

  useEffect(() => {
    if (!notifOpen) return;

    const updatePanelPosition = () => {
      if (!triggerRef.current) return;

      const rect = triggerRef.current.getBoundingClientRect();
      const panelWidth = 340;
      const gap = 12;
      const viewportPadding = 16;
      const nextLeft = Math.min(
        rect.right + gap,
        window.innerWidth - panelWidth - viewportPadding
      );
      const nextBottom = Math.max(
        viewportPadding,
        window.innerHeight - rect.bottom
      );

      setNotifPanelStyle({
        left: `${Math.max(viewportPadding, nextLeft)}px`,
        bottom: `${nextBottom}px`,
      });
    };

    updatePanelPosition();
    window.addEventListener("resize", updatePanelPosition);
    window.addEventListener("scroll", updatePanelPosition, true);

    return () => {
      window.removeEventListener("resize", updatePanelPosition);
      window.removeEventListener("scroll", updatePanelPosition, true);
    };
  }, [notifOpen]);

  const openNotifPanel = async () => {
    const opening = !notifOpen;
    setNotifOpen(opening);
    if (!opening) return;

    setLoadingNotif(true);
    try {
      const res = await notificationService.getAll({ limit: 20 });
      setNotifications(res.notifications || []);
      setUnreadNotif(res.unread_count || 0);
    } catch {
      toast.error("Failed to load notifications");
    } finally {
      setLoadingNotif(false);
    }
  };

  const handleMarkRead = async (notif) => {
    if (!notif.is_read) {
      try {
        await notificationService.markRead(notif.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
        );
        setUnreadNotif((prev) => Math.max(0, prev - 1));
      } catch {}
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadNotif(0);
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  const handleMenuClick = ({ key }) => {
    const item = MENU.find((m) => m.key === key);
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

  const notificationPanel = notifOpen && typeof document !== "undefined"
    ? createPortal(
        <div className="rs-notif-panel" ref={panelRef} style={notifPanelStyle}>
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
              <div className="rs-notif-loading">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="rs-notif-empty">
                <BellOutlined />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`rs-notif-item ${!n.is_read ? "rs-notif-item--unread" : ""}`}
                  onClick={() => handleMarkRead(n)}
                >
                  {!n.is_read && <span className="rs-notif-dot" />}
                  <div className="rs-notif-body">
                    <div className="rs-notif-title">{n.title}</div>
                    <div className="rs-notif-msg">{n.message}</div>
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
          items={MENU.map((item) => ({ key: item.key, icon: item.icon, label: item.label }))}
        />

        <div className="rs-notif-area" style={{ position: "relative" }}>
          <button
            ref={triggerRef}
            className={`rs-notif-trigger rs-notif-btn ${notifOpen ? "rs-notif-btn--active" : ""}`}
            onClick={openNotifPanel}
          >
            <Badge count={unreadNotif} size="small" offset={[2, -2]}>
              <BellOutlined className="rs-notif-icon" />
            </Badge>
            <span>Notifications</span>
          </button>
        </div>

        <div className="rs-footer">
          <button className="rs-logout-btn" onClick={() => setShowConfirm(true)} disabled={logoutLoading}>
            <LogoutOutlined className="rs-logout-icon" />
            <span>Logout</span>
          </button>
        </div>
      </Sider>

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
    </>
  );
}
