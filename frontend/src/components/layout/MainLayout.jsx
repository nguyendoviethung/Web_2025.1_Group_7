import React, { useState } from "react";
import { Layout, Menu, Input, Badge, Avatar, Dropdown } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import {
    BookOutlined,
    DashboardOutlined,
    UserOutlined,
    CopyOutlined,
    EditOutlined,
    FolderOutlined,
    TeamOutlined,
    SafetyOutlined,
    SwapOutlined,
    DollarOutlined,
    StarOutlined,
    FileTextOutlined,
    SearchOutlined,
    BellOutlined,
} from "@ant-design/icons";

const { Header, Sider, Content } = Layout;
const { Search } = Input;

export default function MainLayout({ children, userType = "Staff" }) {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Lấy current page từ URL
    const getCurrentPage = () => {
        const path = location.pathname;
        if (path.includes("/books")) return "books";
        if (path.includes("/dashboard")) return "dashboard";
        if (path.includes("/authors")) return "authors";
        if (path.includes("/categories")) return "categories";
        if (path.includes("/members")) return "members";
        if (path.includes("/staff")) return "staff";
        if (path.includes("/loans")) return "loans";
        if (path.includes("/reservations")) return "reservations";
        if (path.includes("/fines")) return "fines";
        if (path.includes("/reviews")) return "reviews";
        if (path.includes("/activity-logs")) return "activity-logs";
        return "dashboard";
    };

    const menuItems = [
        {
            key: "dashboard",
            icon: <DashboardOutlined />,
            label: "Dashboard",
            path: "/admin/dashboard",
        },
        {
            key: "books",
            icon: <BookOutlined />,
            label: "Books",
            path: "/admin/books",
        },
        {
            key: "book-copies",
            icon: <CopyOutlined />,
            label: "Book Copies",
            path: "/admin/book-copies",
        },
        {
            key: "authors",
            icon: <EditOutlined />,
            label: "Authors",
            path: "/admin/authors",
        },
        {
            key: "categories",
            icon: <FolderOutlined />,
            label: "Categories",
            path: "/admin/categories",
        },
        {
            key: "members",
            icon: <TeamOutlined />,
            label: "Members",
            path: "/admin/members",
        },
        {
            key: "staff",
            icon: <SafetyOutlined />,
            label: "Staff",
            staffOnly: true,
            path: "/admin/staff",
        },
        {
            key: "loans",
            icon: <SwapOutlined />,
            label: "Loans",
            path: "/admin/loans",
        },
        {
            key: "reservations",
            icon: <BookOutlined />,
            label: "Reservations",
            path: "/admin/reservations",
        },
        {
            key: "fines",
            icon: <DollarOutlined />,
            label: "Fines",
            path: "/admin/fines",
        },
        {
            key: "reviews",
            icon: <StarOutlined />,
            label: "Reviews",
            path: "/admin/reviews",
        },
        {
            key: "activity-logs",
            icon: <FileTextOutlined />,
            label: "Activity Logs",
            staffOnly: true,
            path: "/admin/activity-logs",
        },
    ];

    const filteredMenuItems = menuItems.filter(
        (item) => !item.staffOnly || userType === "Staff"
    );

    const userMenuItems = [
        {
            key: "profile",
            label: "Profile",
            onClick: () => navigate("/admin/profile"),
        },
        {
            key: "settings",
            label: "Settings",
            onClick: () => navigate("/admin/settings"),
        },
        {
            key: "logout",
            label: "Logout",
            onClick: () => navigate("/"),
        },
    ];

    const handleMenuClick = ({ key }) => {
        const item = menuItems.find((i) => i.key === key);
        if (item?.path) {
            navigate(item.path);
        }
    };

    return (
        <Layout style={{ minHeight: "100vh" }}>
            {/* Sidebar */}
            <Sider
                collapsible
                collapsed={collapsed}
                onCollapse={setCollapsed}
                width={256}
                style={{ background: "#fff" }}
            >
                {/* Logo */}
                <div
                    style={{
                        padding: "24px 16px",
                        borderBottom: "1px solid #f0f0f0",
                        cursor: "pointer",
                    }}
                    onClick={() => navigate("/admin/dashboard")}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                        }}
                    >
                        <div
                            style={{
                                width: 40,
                                height: 40,
                                background: "#1890ff",
                                borderRadius: 8,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <BookOutlined
                                style={{ fontSize: 24, color: "#fff" }}
                            />
                        </div>
                        {!collapsed && (
                            <div>
                                <div style={{ fontWeight: 600, fontSize: 16 }}>
                                    Library
                                </div>
                                <div style={{ fontSize: 12, color: "#999" }}>
                                    Management System
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Menu */}
                <Menu
                    mode="inline"
                    selectedKeys={[getCurrentPage()]}
                    items={filteredMenuItems}
                    onClick={handleMenuClick}
                    style={{ borderRight: 0 }}
                />

                {/* User Info at Bottom */}
                {!collapsed && (
                    <div
                        style={{
                            position: "absolute",
                            bottom: 0,
                            width: "100%",
                            padding: 16,
                            borderTop: "1px solid #f0f0f0",
                            background: "#fff",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                            }}
                        >
                            <Avatar icon={<UserOutlined />} />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 500 }}>
                                    {userType} User
                                </div>
                                <div style={{ fontSize: 12, color: "#999" }}>
                                    {userType === "Staff"
                                        ? "Librarian"
                                        : "Member"}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Sider>

            <Layout>
                {/* Header */}
                <Header
                    style={{
                        background: "#fff",
                        padding: "0 24px",
                        borderBottom: "1px solid #f0f0f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <Search
                        placeholder="Search books, members, ISBN..."
                        style={{ maxWidth: 400 }}
                        size="large"
                    />

                    <div
                        style={{
                            display: "flex",
                            gap: 16,
                            alignItems: "center",
                        }}
                    >
                        <Badge count={5}>
                            <BellOutlined
                                style={{ fontSize: 20, cursor: "pointer" }}
                            />
                        </Badge>
                        <Dropdown
                            menu={{ items: userMenuItems }}
                            placement="bottomRight"
                        >
                            <Avatar
                                icon={<UserOutlined />}
                                style={{ cursor: "pointer" }}
                            />
                        </Dropdown>
                    </div>
                </Header>

                {/* Content */}
                <Content
                    style={{
                        margin: 24,
                        background: "#f0f2f5",
                    }}
                >
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
}
