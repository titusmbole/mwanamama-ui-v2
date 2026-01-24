import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Card, Form, Input, Button, Typography, notification, Alert } from "antd";
import { LockOutlined, CheckCircleOutlined } from "@ant-design/icons";
import AuthLayout from "../../components/auth/AuthLayout";
import http from "../../services/httpInterceptor";
import { APIS } from "../../services/APIS";

const { Title, Text } = Typography;

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [api, contextHolder] = notification.useNotification();
  const [form] = Form.useForm();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    
    if (!tokenParam) {
      api.error({
        message: "Invalid Link",
        description: "Password reset token is missing. Please request a new password reset.",
        placement: "topRight",
      });
      setTimeout(() => navigate("/auth/forgot-password"), 2000);
    } else {
      setToken(tokenParam);
    }
  }, [searchParams, navigate, api]);

  const handleResetPassword = async (values: any) => {
    const { newPassword, confirmPassword } = values;

    if (!token) {
      api.error({
        message: "Invalid Token",
        description: "Reset token is missing.",
        placement: "topRight",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await http.post(APIS.RESET_PASSWORD, {
        token,
        newPassword,
        confirmPassword,
      });

      api.success({
        message: "Password Reset Successful!",
        description: response.data.message || "Your password has been reset successfully. You can now log in with your new password.",
        placement: "topRight",
        duration: 5,
      });

      form.resetFields();
      
      // Redirect to login after 2 seconds
      setTimeout(() => navigate("/auth/login"), 2000);
    } catch (error: any) {
      api.error({
        message: "Reset Failed",
        description: error.response?.data?.message || "Failed to reset password. The link may have expired.",
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
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <LockOutlined style={{ fontSize: 48, color: "#ac202d", marginBottom: 16 }} />
          <Title level={2} style={{ marginBottom: 8 }}>Reset Your Password</Title>
          <Text type="secondary">Enter your new password below</Text>
        </div>

        {token && (
          <Alert
            message="Valid Reset Link"
            description="You can now set a new password for your account."
            type="success"
            showIcon
            icon={<CheckCircleOutlined />}
            style={{ marginBottom: 24 }}
          />
        )}

        <Form 
          form={form}
          layout="vertical" 
          onFinish={handleResetPassword}
        >
          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[
              { required: true, message: "Please enter your new password" },
              { min: 8, message: "Password must be at least 8 characters" }
            ]}
          >
            <Input.Password 
              size="large" 
              prefix={<LockOutlined />} 
              placeholder="Enter new password" 
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: "Please confirm your password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password 
              size="large" 
              prefix={<LockOutlined />} 
              placeholder="Confirm new password" 
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
              disabled={!token}
              style={{ borderRadius: 8 }}
            >
              Reset Password
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

export default ResetPassword;
