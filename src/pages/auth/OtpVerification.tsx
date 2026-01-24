import React, { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Card, Form, Input, Button, Typography, notification, Alert } from "antd";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import http from "../../services/httpInterceptor";
import { APIS } from "../../services/APIS";
import AuthLayout from "../../components/auth/AuthLayout";

const { Title, Text } = Typography;

const OtpVerification: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [api, contextHolder] = notification.useNotification();
  const [form] = Form.useForm();

  // Get email from navigation state
  const email = location.state?.email || "";
  const username = location.state?.username || "";
  const password = location.state?.password || "";

  // Redirect to login if no email
  React.useEffect(() => {
    if (!email) {
      navigate("/auth/login");
    }
  }, [email, navigate]);

  const handleVerifyOtp = useCallback(async (values: any) => {
    const { otp } = values;

    setLoading(true);
    try {
      const verifyResponse = await http.post(APIS.VERIFY_OTP, { 
        email,
        otpCode: otp,
        purpose: "EMAIL_VERIFICATION"
      });
      
      if (verifyResponse.data.verified) {
        // OTP verified, now login with credentials
        try {
          const loginResponse = await http.post(APIS.LOGIN, { username, password });
          const token = loginResponse.data.token;
          
          // Login with the token
          login(token);
          
          api.success({
            message: "Success",
            description: "Login successful!",
            placement: "topRight",
          });
          
          setTimeout(() => navigate("/dashboard"), 500);
        } catch (loginError: any) {
          api.error({
            message: "Login Failed",
            description: loginError.response?.data?.message || "Failed to complete login.",
            placement: "topRight",
          });
        }
      } else {
        api.error({
          message: "Verification Failed",
          description: "Invalid or expired OTP code.",
          placement: "topRight",
        });
      }
    } catch (error: any) {
      api.error({
        message: "Verification Failed",
        description: error.response?.data?.message || "Invalid OTP. Please try again.",
        placement: "topRight",
      });
    } finally {
      setLoading(false);
    }
  }, [email, username, password, login, navigate, api]);

  const handleResendOtp = async () => {
    setResendLoading(true);
    try {
      await http.post(APIS.RESEND_OTP, { 
        email,
        purpose: "EMAIL_VERIFICATION"
      });
      
      api.success({
        message: "OTP Resent",
        description: "A new OTP has been sent to your email.",
        placement: "topRight",
      });
    } catch (error: any) {
      api.error({
        message: "Failed",
        description: error.response?.data?.message || "Failed to resend OTP.",
        placement: "topRight",
      });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <AuthLayout>
      {contextHolder}
      
      <Card style={{ padding: 32, boxShadow: "none" }} bordered={false}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <LockOutlined style={{ fontSize: 48, color: "#ac202d", marginBottom: 16 }} />
          <Title level={2} style={{ marginBottom: 8 }}>Two-Factor Authentication</Title>
          <Text type="secondary">Enter the OTP sent to your email</Text>
        </div>

        <Alert
          message="Check your email"
          description={
            <div>
              We've sent a One-Time Password (OTP) to <strong>{email}</strong>. 
              Please enter the code below to complete your login.
            </div>
          }
          type="info"
          showIcon
          icon={<MailOutlined />}
          style={{ marginBottom: 24 }}
        />

        <Form 
          form={form}
          layout="vertical" 
          onFinish={handleVerifyOtp}
        >
          <Form.Item
            name="otp"
            label="One-Time Password"
            rules={[
              { required: true, message: "Please enter the OTP" },
              { len: 6, message: "OTP must be 6 digits" }
            ]}
          >
            <Input 
              size="large" 
              placeholder="Enter 6-digit OTP" 
              maxLength={6}
              style={{ 
                fontSize: 24, 
                letterSpacing: 8, 
                textAlign: "center",
                fontWeight: "bold"
              }}
            />
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
              Verify OTP
            </Button>
          </Form.Item>

          <div style={{ textAlign: "center", marginTop: 16 }}>
            <Text type="secondary">Didn't receive the code? </Text>
            <Button 
              type="link" 
              onClick={handleResendOtp}
              loading={resendLoading}
              style={{ padding: 0 }}
            >
              Resend OTP
            </Button>
          </div>

          <div style={{ textAlign: "center", marginTop: 16 }}>
            <Button 
              type="link" 
              onClick={() => navigate("/auth/login")}
              style={{ padding: 0, color: "#ac202d" }}
            >
              Back to Login
            </Button>
          </div>
        </Form>
      </Card>
    </AuthLayout>
  );
};

export default OtpVerification;
