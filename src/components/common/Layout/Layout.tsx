// src/routes/Layout.tsx
import React, { useEffect, useState } from "react";
import { Layout as AntdLayout } from "antd";
import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar"; // adjust path if your Sidebar lives elsewhere
import DashboardHeader from "../Header/DashboardHeader"; // adjust path accordingly

const { Content } = AntdLayout;

interface LayoutProps {
  // children will be provided by <Outlet />
}

const Layout: React.FC<LayoutProps> = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // Auto-collapse on tablet screens
      if (window.innerWidth < 992 && window.innerWidth >= 768) {
        setCollapsed(true);
      }

      // Close mobile drawer on resize to desktop
      if (!mobile && mobileOpen) {
        setMobileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener("resize", handleResize);
  }, [mobileOpen]);

  const SIDEBAR_WIDTH = 250;
  const COLLAPSED_WIDTH = 80;
  const sidebarWidth = isMobile ? 0 : (collapsed ? COLLAPSED_WIDTH : SIDEBAR_WIDTH);

  return (
    <AntdLayout style={{ minHeight: "100vh" }}>
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <AntdLayout
        style={{
          marginLeft: sidebarWidth,
          transition: "margin-left 0.2s",
        }}
      >
        <DashboardHeader
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        <Content
          style={{
            padding: isMobile ? "16px" : "24px",
            marginTop: 64,
            background: "#f0f2f5",
            minHeight: "calc(100vh - 64px)",
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          {/* Render nested route content */}
          <Outlet />
        </Content>
      </AntdLayout>
    </AntdLayout>
  );
};

export default Layout;
