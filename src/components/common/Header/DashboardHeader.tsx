import React, { useState, useEffect } from "react";
import { Layout, Input, Badge, Avatar, Dropdown, Space, Button, Drawer, message } from "antd";
import type { MenuProps } from "antd/es/dropdown";
import {
  SearchOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const { Header } = Layout;
const SIDEBAR_WIDTH = 250; 
const COLLAPSED_WIDTH = 80;

interface DashboardHeaderProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  collapsed, 
  setCollapsed,
  mobileOpen = false,
  setMobileOpen
}) => {
  const [searchVisible, setSearchVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSearch = (value: string) => {
    console.log("Searching:", value);
    setSearchVisible(false);
  };

  const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
    if (key === "3") {
      logout(); // remove token and set user false
      message.success("Logged out successfully");
      navigate("/auth/login"); // redirect to login
    }
  };

  const userMenuItems: MenuProps["items"] = [
    { key: "1", label: "Profile", icon: <UserOutlined /> },
    { key: "2", label: "Settings", icon: <SettingOutlined /> },
    { type: "divider" },
    { key: "3", label: "Log Out", icon: <LogoutOutlined />, danger: true },
  ];

  return (
    <>
      <Header
        style={{
          padding: isMobile ? "0 16px" : "0 24px",
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 64,
          borderBottom: "1px solid #f0f0f0",
          position: 'fixed', 
          top: 0,           
          left: isMobile ? 0 : (collapsed ? COLLAPSED_WIDTH : SIDEBAR_WIDTH),
          width: isMobile ? '100%' : (collapsed ? `calc(100% - ${COLLAPSED_WIDTH}px)` : `calc(100% - ${SIDEBAR_WIDTH}px)`),
          transition: 'width 0.2s, left 0.2s', 
          zIndex: 99,       
        }}
      >
        {/* Left Section: Toggle Button */}
        <div style={{ flex: "0 0 auto", display: 'flex', alignItems: 'center' }}>
          <Button
            type="text"
            icon={
              isMobile ? 
                <MenuOutlined style={{ fontSize: 18 }} /> : 
                (collapsed ? <MenuUnfoldOutlined style={{ fontSize: 18 }} /> : <MenuFoldOutlined style={{ fontSize: 18 }} />)
            }
            onClick={() => {
              if (isMobile && setMobileOpen) {
                setMobileOpen(!mobileOpen);
              } else {
                setCollapsed(!collapsed);
              }
            }}
            style={{ marginRight: isMobile ? 8 : 16 }}
          />
          {!isMobile && (
            <h2 style={{ margin: 0, color: '#1890ff', fontSize: 18 }}>
              Dashboard
            </h2>
          )}
        </div>

        {/* Right Section */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: isMobile ? 8 : 16, 
          flex: 1, 
          justifyContent: "flex-end" 
        }}>
          
          {/* Search */}
          {!isMobile ? (
            <Input
              placeholder="Search loans, clients, reports..."
              prefix={<SearchOutlined />}
              style={{ maxWidth: 300, width: "100%" }}
              onPressEnter={(e) => handleSearch((e.target as HTMLInputElement).value)}
            />
          ) : (
            <Button
              type="text"
              icon={<SearchOutlined style={{ fontSize: 18 }} />}
              onClick={() => setSearchVisible(true)}
            />
          )}

          {/* Notifications */}
          <Badge count={5} dot>
            <BellOutlined style={{ fontSize: 20, cursor: "pointer", color: "#333" }} />
          </Badge>

          {/* User Dropdown */}
          <Dropdown menu={{ items: userMenuItems, onClick: handleMenuClick }} placement="bottomRight" arrow>
            <Space style={{ cursor: "pointer" }}>
              <Avatar 
                size={isMobile ? 32 : 40} 
                icon={<UserOutlined />} 
                style={{ backgroundColor: "#1890ff" }} 
              />
              {!isMobile && (
                <span style={{ fontWeight: 500, color: "#333" }}>Kenzi Abednego</span>
              )}
            </Space>
          </Dropdown>
        </div>
      </Header>

      {/* Mobile Search Drawer */}
      <Drawer
        title="Search"
        placement="top"
        onClose={() => setSearchVisible(false)}
        open={searchVisible}
        height="auto"
        styles={{
          body: { padding: '16px' }
        }}
      >
        <Input
          placeholder="Search loans, clients, reports..."
          prefix={<SearchOutlined />}
          size="large"
          autoFocus
          onPressEnter={(e) => handleSearch((e.target as HTMLInputElement).value)}
        />
      </Drawer>
    </>
  );
};

export default DashboardHeader;