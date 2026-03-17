import { useState } from "react";
import { Layout, Menu, Modal } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import { menuItemsAdmin } from "../utils/MenuItems";
import logo from "../assets/LibraryLogo.svg";
import { useNavigate } from "react-router-dom";
import { logout } from "../services/authService";
import { useToast } from "./Toast";
import "../style/Sidebar.scss";

const { Sider } = Layout;

const Sidebar = () => {
  const [selectedKey, setSelectedKey]       = useState("dashboard");
  const [logoutLoading, setLogoutLoading]   = useState(false);
  const [showConfirm, setShowConfirm]       = useState(false);
  const navigate = useNavigate();
  const toast    = useToast();

  const handleMenuClick = ({ key }) => {
    const selectedItem = menuItemsAdmin.find((item) => item.key === key);
    setSelectedKey(key);
    if (selectedItem) navigate(selectedItem.path);
  };

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);
      await logout();                    // gọi API + xóa localStorage
      toast.success("Logged out successfully!");
      setTimeout(() => navigate("/"), 500);
    } catch {
      // API lỗi vẫn xóa local và về trang login
      localStorage.clear();
      navigate("/");
    } finally {
      setLogoutLoading(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <Sider className="sidebar" width={220} theme="light">

        {/* Logo */}
        <div className="logo-container">
          <img src={logo} alt="Logo" className="logo" />
        </div>

        {/* Menu items */}
        <Menu
          selectedKeys={[selectedKey]}
          mode="inline"
          items={menuItemsAdmin.map((item) => ({
            key:   item.key,
            icon:  item.icon,
            label: item.label,
          }))}
          onClick={handleMenuClick}
          className="sidebar-menu"
        />

        {/* Logout button — ghim dưới cùng */}
        <div className="sidebar-footer">
          <button
            className="logout-btn"
            onClick={() => setShowConfirm(true)}
            disabled={logoutLoading}
          >
            <LogoutOutlined className="logout-icon" />
            <span>Logout</span>
          </button>
        </div>

      </Sider>

      {/* Confirm modal */}
      <Modal
        open={showConfirm}
        onOk={handleLogout}
        onCancel={() => setShowConfirm(false)}
        okText="Logout"
        cancelText="Cancel"
        okButtonProps={{
          danger:   true,
          loading:  logoutLoading,
        }}
        centered
        width={400}
        title={
          <div className="logout-modal-title">
            <LogoutOutlined style={{ color: "#ff4d4f", marginRight: 8 }} />
            Confirm Logout
          </div>
        }
      >
        <p style={{ fontSize: "1.4rem", color: "#595959", margin: "1.6rem 0" , fontWeight: 500 }}>
          Are you sure you want to logout?
        </p>
      </Modal>
    </>
  );
};

export default Sidebar;