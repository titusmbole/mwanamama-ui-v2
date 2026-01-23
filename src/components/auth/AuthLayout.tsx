import React from "react";
import { Typography } from "antd";

const { Title, Text } = Typography;

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Left Container - 70% - Branding (Hidden on mobile) */}
      <div 
        className="auth-branding"
        style={{ 
          flex: "0 0 70%", 
          background: "linear-gradient(135deg, #ac202d 0%, #d42a3a 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px",
          color: "#fff"
        }}
      >
        <div style={{ textAlign: "center" }}>
          <Title level={1} style={{ color: "#fff", fontSize: "48px", marginBottom: "24px" }}>
            Mwanamama
          </Title>
          <Text style={{ color: "#fff", fontSize: "18px", opacity: 0.9 }}>
            Empowering Communities Through Financial Solutions
          </Text>
          <div style={{ marginTop: "48px" }}>
            <Text style={{ color: "#fff", fontSize: "14px", opacity: 0.8 }}>
              Manage loans, track payments, and grow your business with ease.
            </Text>
          </div>
        </div>
      </div>

      {/* Right Container - 30% - Form (100% on mobile) */}
      <div 
        className="auth-form"
        style={{ 
          flex: "0 0 30%", 
          padding: "48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fff"
        }}
      >
        <div style={{ width: "100%", maxWidth: "500px" }}>
          {children}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .auth-branding {
            display: none !important;
          }
          .auth-form {
            flex: 0 0 100% !important;
            padding: 24px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AuthLayout;
