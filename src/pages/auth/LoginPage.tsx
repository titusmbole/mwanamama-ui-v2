import React, { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Row, Col, Card, Form, Input, Button, Typography, notification, Checkbox } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import http from "../../services/httpInterceptor";
import { APIS } from "../../services/APIS";

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
      api.error({
        message: "Login Failed",
        description: error.response?.data?.message || "Invalid credentials. Please try again.",
        placement: "topRight",
      });
    } finally {
      setLoading(false);
    }
  }, [login, navigate, api]);

  return (
    <>
      {contextHolder}

      <Row justify="center" align="middle" style={{ minHeight: "100vh", padding: "16px", background: "#f0f2f5" }}>
        <Col xs={24} sm={18} md={12} lg={8}>
          <Card style={{ borderRadius: 16, padding: "32px" }} bordered={false}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <Title level={2}>Welcome Back</Title>
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
