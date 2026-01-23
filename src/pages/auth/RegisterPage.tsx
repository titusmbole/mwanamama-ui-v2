import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Row, Col, Card, Form, Input, Button, Typography, notification, Space } from "antd";
import { UserOutlined, MailOutlined, LockOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [api, contextHolder] = notification.useNotification();

  const handleRegister = (values: any) => {
    const { username, email, password, confirmPassword } = values;

    if (password !== confirmPassword) {
      api.error({ message: "Password Mismatch", description: "Passwords do not match." });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      api.success({ message: "Registration Successful!", description: "Please login to continue." });
      setLoading(false);
      navigate("/auth/login");
    }, 1200);
  };

  return (
    <>
      {contextHolder}
      <Row justify="center" align="middle" style={{ minHeight: "100vh", padding: 16, background: "#f0f2f5" }}>
        <Col xs={24} sm={20} md={12} lg={8}>
          <Card style={{ borderRadius: 16, padding: 32 }} bordered={false}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <Title level={2}>Create Account</Title>
              <Text type="secondary">Sign up to get started</Text>
            </div>

            <Form layout="vertical" onFinish={handleRegister}>
              <Form.Item name="username" label="Username" rules={[{ required: true }]}>
                <Input prefix={<UserOutlined />} size="large" placeholder="Username" />
              </Form.Item>

              <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
                <Input prefix={<MailOutlined />} size="large" placeholder="Email" />
              </Form.Item>

              <Form.Item name="password" label="Password" rules={[{ required: true }]}>
                <Input.Password prefix={<LockOutlined />} size="large" placeholder="Password" />
              </Form.Item>

              <Form.Item name="confirmPassword" label="Confirm Password" rules={[{ required: true }]}>
                <Input.Password prefix={<LockOutlined />} size="large" placeholder="Confirm Password" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                  Create Account
                </Button>
              </Form.Item>
            </Form>

            <div style={{ textAlign: "center", marginTop: 24 }}>
              <Text>
                Already have an account? <Link to="/auth/login">Sign In</Link>
              </Text>
            </div>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default RegisterPage;
