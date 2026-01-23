import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Row, Col, Card, Input, Button, Typography, notification, Space, Form } from "antd";
import { MailOutlined, ArrowLeftOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [api, contextHolder] = notification.useNotification();

  const handleReset = () => {
    if (!email) {
      api.warning({ message: "Enter Email", description: "Please enter your email." });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      api.success({ message: "Reset Link Sent!", description: `Check your inbox: ${email}` });
      setEmail("");
      setLoading(false);
    }, 1200);
  };

  return (
    <>
      {contextHolder}
      <Row justify="center" align="middle" style={{ minHeight: "100vh", padding: 16, background: "#f0f2f5" }}>
        <Col xs={24} sm={20} md={12} lg={8}>
          <Card style={{ borderRadius: 16, padding: 32 }} bordered={false}>
            <Link to="/auth/login">
              <Button type="text" icon={<ArrowLeftOutlined />} style={{ marginBottom: 16 }}>
                Back to Login
              </Button>
            </Link>

            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <Title level={2}>Reset Password</Title>
              <Text type="secondary">Enter your email to receive a reset link</Text>
            </div>

            <Form layout="vertical" onFinish={handleReset}>
              <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
                <Input
                  prefix={<MailOutlined />}
                  size="large"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                  Send Reset Link
                </Button>
              </Form.Item>
            </Form>

            <div style={{ textAlign: "center", marginTop: 16 }}>
              <Text>
                Remember your password? <Link to="/auth/login">Sign In</Link>
              </Text>
            </div>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default ForgotPassword;
