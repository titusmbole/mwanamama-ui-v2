import React, { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Row, Col, Card, Form, Input, Button, Typography, notification, Divider, Space } from "antd";
import { LockOutlined, UserOutlined, GoogleOutlined, GithubOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [api, contextHolder] = notification.useNotification();

  const handleLogin = useCallback((values: any) => {
    const { username, password } = values;

    if (!username || !password) {
      api.warning({
        message: "Missing Information",
        description: "Please enter both username and password.",
        placement: "topRight",
      });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      if (username === "admin" && password === "12345") {
        login(username);
        api.success({
          message: "Login Successful!",
          description: `Welcome back, ${username}!`,
          placement: "topRight",
        });
        navigate("/dashboard");
      } else {
        api.error({
          message: "Login Failed",
          description: "Invalid username or password. Please try again.",
          placement: "topRight",
        });
      }
      setLoading(false);
    }, 1000);
  }, [login, navigate, api]);

  const handleSocialLogin = (provider: string) => {
    api.info({
      message: "Social Login",
      description: `${provider} login is not yet configured.`,
      placement: "topRight",
    });
  };

  return (
    <>
      {contextHolder}

      <Row justify="center" align="middle" style={{ minHeight: "100vh", padding: "16px", background: "#f0f2f5" }}>
        <Col xs={24} sm={18} md={12} lg={8}>
          <Card style={{ borderRadius: 16, padding: "32px" }} bordered={false}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <Title level={2}>Welcome Back</Title>
              <Text type="secondary">Sign in to continue to your account</Text>
            </div>

            <Form layout="vertical" onFinish={handleLogin}>
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
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
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

            <div style={{ textAlign: "center", marginTop: 24 }}>
              <Text>
                Don't have an account? <Link to="/auth/register">Create Account</Link>
              </Text>
            </div>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default LoginPage;
