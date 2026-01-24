import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, Input, Button, Typography, notification, Form } from "antd";
import { MailOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import AuthLayout from "../../components/auth/AuthLayout";
import http from "../../services/httpInterceptor";
import { APIS } from "../../services/APIS";

const { Title, Text } = Typography;

const ForgotPassword: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [api, contextHolder] = notification.useNotification();
  const [form] = Form.useForm();

  const handleReset = async (values: any) => {
    const { email } = values;

    setLoading(true);
    try {
      const response = await http.post(APIS.FORGOT_PASSWORD, { email });
      
      api.success({ 
        message: "Reset OTP Sent!", 
        description: response.data.message || `Password reset OTP has been sent to ${email}`,
        placement: "topRight",
        duration: 5
      });
      
      form.resetFields();
    } catch (error: any) {
      api.error({
        message: "Failed",
        description: error.response?.data?.message || "Failed to send password reset OTP. Please try again.",
        placement: "topRight",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      {contextHolder}
      
      <Card style={{ padding: 32, boxShadow: "none" }} bordered={false}>
        <Link to="/auth/login">
          <Button type="text" icon={<ArrowLeftOutlined />} style={{ marginBottom: 16 }}>
            Back to Login
          </Button>
        </Link>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Title level={2} style={{ marginBottom: 8 }}>Reset Password</Title>
          <Text type="secondary">Enter your email to receive a reset link</Text>
        </div>

        <Form layout="vertical" onFinish={handleReset} form={form}>
          <Form.Item 
            name="email" 
            label="Email" 
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Please enter a valid email" }
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              size="large"
              placeholder="Enter your email address"
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
            Remember your password? <Link to="/auth/login" style={{color: "#ac202d"}}>Sign In</Link>
          </Text>
        </div>
      </Card>
    </AuthLayout>
  );
};

export default ForgotPassword;
