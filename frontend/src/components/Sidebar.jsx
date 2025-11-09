import React, { useState } from "react";
import { Layout, Menu } from "antd";
import { menuItemsAdmin } from "../utils/MenuItems";
import logo from "../assets/LibraryLogo.svg";
import { useNavigate } from "react-router-dom";
import "../style/Sidebar.scss";

const { Sider } = Layout;

const Sidebar = () => {
  const [selectedKey, setSelectedKey] = useState("dashboard");
  const navigate = useNavigate();

  const handleMenuClick = ({ key }) => {
    const selectedItem = menuItemsAdmin.find((item) => item.key === key);
    setSelectedKey(key);
    if (selectedItem) navigate(selectedItem.path);
  };

  return (
    <Sider
      className="sidebar"
      width={220}  
      theme="light"
    > 
      <div className="logo-container">
        <img src={logo} alt="Logo" className="logo" />
      </div>

      <Menu
        selectedKeys={[selectedKey]}
        mode="inline"
        items={menuItemsAdmin.map((item) => ({
          key: item.key,
          icon: item.icon,
          label: item.label,
        }))}
        onClick={handleMenuClick}
        className="sidebar-menu"
      />
    </Sider>
  );
};

export default Sidebar;
