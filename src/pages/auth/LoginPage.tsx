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

  const handleLogin = useCallback(async (values: any) => {
    const { username, password } = values;

    setLoading(true);
    try {
      const response = await http.post(APIS.LOGIN, { username, password });
      const token = response.data.token;
      
      login(token);
      
      api.success({
        message: "Login Successful!",
        description: `Welcome back, ${username}!`,
        placement: "topRight",
      });
      
      setTimeout(() => navigate("/dashboard"), 500);
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
