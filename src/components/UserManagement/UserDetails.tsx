import React, { useState } from 'react';
import { 
  Card, 
  Descriptions, 
  Button, 
  Tag, 
  Modal, 
  Form, 
  Input, 
  Divider, 
  Typography, 
  Space, 
  Badge, 
  Avatar, 
  message,
  Alert
} from 'antd';
import { UserOutlined, LockOutlined, SafetyOutlined, BranchesOutlined, IdcardOutlined } from '@ant-design/icons';
import http from '../../services/httpInterceptor';
import { APIS } from '../../services/APIS';
import UserAppManagement from './UserAppManagement';

const { Title, Text } = Typography;

interface Role {
  id: number;
  roleName: string;
  description: string;
  permissions: Permission[];
}

interface Permission {
  id: number;
  permissionName: string;
}

interface Branch {
  id: number;
  branchName: string;
  branchCode: string;
  branchStatus: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  operatingHours?: string;
}

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phoneNumber: string;
  idNo: string;
  gender: string;
  designation?: string;
  allowLogin: boolean;
  status?: string;
  first_login?: boolean;
  location?: string;
  role: Role;
  branch: Branch;
  createdAt: string;
}

interface UserDetailsProps {
  user: User;
}

const UserDetails: React.FC<UserDetailsProps> = ({ user }) => {
  const [isResetModalVisible, setIsResetModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const showResetModal = () => {
    setIsResetModalVisible(true);
    setSuccess(false);
  };

  const handleCancel = () => {
    setIsResetModalVisible(false);
    form.resetFields();
    setSuccess(false);
  };

  const handlePasswordReset = async () => {
    try {
      const values = await form.validateFields();
  
      if (values.newPassword !== values.confirmPassword) {
        message.error('Passwords do not match!');
        return;
      }
  
      setLoading(true);
      
      try {
        const payload = {
          password: values.newPassword
        };
        await http.put(`${APIS.UPDATE_PASSWORD}/${user.id}`, payload);
        setSuccess(true);
        message.success('Password updated successfully');
        form.resetFields();
        setTimeout(() => {
          setIsResetModalVisible(false);
          setSuccess(false);
        }, 2000);
      } catch (error: any) {
        message.error(error.response?.status === 403 ? 'Not authorized to perform this action!' : error.response?.data?.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    } catch (error) {
      message.error("Please fill in all required fields correctly.");
    }
  };

  const getUserStatusBadge = (status?: string) => {
    const userStatus = status || (user.allowLogin ? 'ACTIVE' : 'INACTIVE');
    if (userStatus.toUpperCase() === 'ACTIVE') return <Badge status="success" text="Active" />;
    if (userStatus.toUpperCase() === 'INACTIVE') return <Badge status="error" text="Inactive" />;
    if (userStatus.toUpperCase() === 'PENDING') return <Badge status="warning" text="Pending" />;
    return <Badge status="default" text={userStatus} />;
  };

  return (
    <Card
      bordered={false}
      style={{ width: '100%' }}
      title={
        <Space align="center">
          <Avatar 
            size={64} 
            style={{ backgroundColor: user.gender === 'MALE' ? '#1890ff' : '#ff6b81' }} 
            icon={<UserOutlined />} 
          />
          <div>
            <Title level={4} style={{ margin: 0 }}>{user.name}</Title>
            <Text type="secondary">{user.designation || 'N/A'}</Text>
          </div>
        </Space>
      }
      extra={
        <Button 
          type="primary" 
          icon={<LockOutlined />} 
          onClick={showResetModal}
        >
          Reset Password
        </Button>
      }
    >
      <Descriptions 
        bordered 
        column={{ xxl: 3, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}
      >
        <Descriptions.Item label="Username" span={1}>
          <Space>
            <UserOutlined />
            {user.username}
          </Space>
        </Descriptions.Item>
        
        <Descriptions.Item label="Email" span={2}>
          {user.email}
        </Descriptions.Item>
        
        <Descriptions.Item label="Phone">
          {user.phoneNumber}
        </Descriptions.Item>
        
        <Descriptions.Item label="Status">
          {getUserStatusBadge(user.status)}
        </Descriptions.Item>
        
        <Descriptions.Item label="ID Number">
          <Space>
            <IdcardOutlined />
            {user.idNo}
          </Space>
        </Descriptions.Item>

        {user.first_login !== undefined && (
          <Descriptions.Item label="First Login">
            {user.first_login ? 
              <Tag color="warning">Yes</Tag> : 
              <Tag color="success">No</Tag>
            }
          </Descriptions.Item>
        )}
        
        <Descriptions.Item label="Gender">
          {user.gender}
        </Descriptions.Item>
        
        {user.location && (
          <Descriptions.Item label="Location">
            {user.location}
          </Descriptions.Item>
        )}
        
        <Descriptions.Item label="Created At">
          {new Date(user.createdAt).toLocaleString()}
        </Descriptions.Item>
      </Descriptions>

      <Divider orientation="left">
        <Space>
          <SafetyOutlined />
          Role Information
        </Space>
      </Divider>
      
      <Descriptions bordered column={{ xxl: 3, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}>
        <Descriptions.Item label="Role Name" span={1}>
          <Tag color="blue">{user.role.roleName}</Tag>
        </Descriptions.Item>
        
        <Descriptions.Item label="Description" span={2}>
          {user.role.description}
        </Descriptions.Item>
        
        {user.role.permissions && user.role.permissions.length > 0 && (
          <Descriptions.Item label="Permissions" span={3}>
            <Space wrap>
              {user.role.permissions.map(permission => (
                <Tag color="green" key={permission.id}>
                  {permission.permissionName}
                </Tag>
              ))}
            </Space>
          </Descriptions.Item>
        )}
      </Descriptions>

      {user.branch && (
        <>
          <Divider orientation="left">
            <Space>
              <BranchesOutlined />
              Branch Information
            </Space>
          </Divider>
          
          <Descriptions bordered column={{ xxl: 3, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}>
            <Descriptions.Item label="Branch Name" span={1}>
              {user.branch.branchName}
            </Descriptions.Item>
            
            <Descriptions.Item label="Branch Code" span={1}>
              <Tag>{user.branch.branchCode}</Tag>
            </Descriptions.Item>
            
            <Descriptions.Item label="Status" span={1}>
              {user.branch.branchStatus === 'ACTIVE' ? 
                <Badge status="success" text="Active" /> : 
                <Badge status="error" text="Inactive" />
              }
            </Descriptions.Item>
            
            {user.branch.street && (
              <Descriptions.Item label="Address" span={3}>
                {`${user.branch.street}, ${user.branch.city}, ${user.branch.state} ${user.branch.postalCode}`}
              </Descriptions.Item>
            )}
            
            {user.branch.operatingHours && (
              <Descriptions.Item label="Operating Hours" span={3}>
                {user.branch.operatingHours}
              </Descriptions.Item>
            )}
          </Descriptions>
        </>
      )}

      {/* Application Access Management */}
      <Divider />
      <UserAppManagement userId={user.id} />

      <Modal
        title="Reset Password"
        open={isResetModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button 
            key="reset" 
            type="primary" 
            loading={loading} 
            onClick={handlePasswordReset}
          >
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </Button>,
        ]}
      >
        {success && <Alert message="Password Updated" type="success" showIcon style={{ marginBottom: 16 }} />}
        <Form
          form={form}
          layout="vertical"
          name="password_reset_form"
        >
          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[
              { required: true, message: 'Please input a new password!' },
              { min: 6, message: 'Password must be at least 6 characters long!' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="New password" />
          </Form.Item>
          
          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Please confirm the password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Confirm password" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default UserDetails;
