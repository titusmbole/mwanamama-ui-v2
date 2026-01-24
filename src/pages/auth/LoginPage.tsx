import React, { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Card, Form, Input, Button, Typography, notification, Checkbox } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import http from "../../services/httpInterceptor";
import { APIS } from "../../services/APIS";
import AuthLayout from "../../components/auth/AuthLayout";

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [api, contextHolder] = notification.useNotification();
  const [form] = Form.useForm();

  // Helper function to decode JWT token
  const decodeToken = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      return null;
    }
  };

  const handleLogin = useCallback(async (values: any) => {
    const { username, password } = values;

    setLoading(true);
    try {
      const response = await http.post(APIS.LOGIN, { username, password });
      const token = response.data.token;
      
      // Decode token to check for 2FA claim
      const decodedToken = decodeToken(token);
      
      // Check if 2FA is enabled
      if (decodedToken && decodedToken.twoFactorEnabled === true) {
        // Get user email from decoded token
        const email = decodedToken.email || "";
        
        // Send OTP to user's email
        try {
          await http.post(APIS.SEND_OTP, {
            email,
            purpose: "EMAIL_VERIFICATION"
          });
          
          api.success({
            message: "OTP Sent",
            description: `A verification code has been sent to ${email}`,
            placement: "topRight",
          });
          
          // Navigate to OTP verification page
          navigate("/auth/verify-otp", { 
            state: { 
              email,
              username,
              password
            } 
          });
        } catch (otpError: any) {
          api.error({
            message: "Failed to Send OTP",
            description: otpError.response?.data?.message || "Could not send OTP. Please try again.",
            placement: "topRight",
          });
        }
      } else {
        // No 2FA, proceed with normal login
        login(token);
        setTimeout(() => navigate("/dashboard"), 500);
      }
    } catch (error: any) {
    } finally {
      setLoading(false);
    }
  }, [login, navigate, api]);

  return (
    <AuthLayout>
      {contextHolder}
      
      <Card style={{ padding: 32, boxShadow: "none" }} bordered={false}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Title level={2} style={{ marginBottom: 8 }}>Welcome Back</Title>
          <Text type="secondary">Sign in to continue to Mwanamama</Text>
        </div>

        <Form 
          form={form}
          layout="vertical" 
          onFinish={handleLogin}
          initialValues={{ remember: true }}
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: "Please enter your username" }]}
          >
            <Input size="large" prefix={<UserOutlined />} placeholder="Username" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please enter your password" }]}
          >
            <Input.Password size="large" prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>

          <Form.Item>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>Keep me logged in</Checkbox>
              </Form.Item>
              <Link to="/auth/forgot-password">Forgot Password?</Link>
            </div>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
              style={{ borderRadius: 8 }}
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </AuthLayout>
  );
};

export default LoginPage;
