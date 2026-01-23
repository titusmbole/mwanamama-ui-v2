import React, { useState } from 'react';
import { 
    Typography, Card, Form, Input, Select, Button, Switch, Divider, Row, Col, message, Drawer, Avatar
} from 'antd';
import { 
    UserOutlined, LockOutlined, BellOutlined, GlobalOutlined, DollarOutlined, 
    SafetyOutlined, HistoryOutlined, CreditCardOutlined, TeamOutlined, 
    SettingOutlined, RightOutlined, SaveOutlined, KeyOutlined, SecurityScanOutlined,
    MailOutlined, PhoneOutlined, EnvironmentOutlined, CalendarOutlined, LogoutOutlined
} from '@ant-design/icons';
import PageHeader from '../../components/common/Layout/PageHeader';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;
const { Option } = Select;

interface SettingsCard {
    key: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    category: string;
}

const settingsCards: SettingsCard[] = [
    // Account Settings
    {
        key: 'profile',
        title: 'My Profile',
        description: 'View and update your personal information',
        icon: <UserOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
        category: 'Account'
    },
    {
        key: 'password',
        title: 'Change Password',
        description: 'Update your account password',
        icon: <LockOutlined style={{ fontSize: 24, color: '#52c41a' }} />,
        category: 'Account'
    },
    {
        key: 'loginActivities',
        title: 'Login Activities',
        description: 'See all login activities and sessions',
        icon: <HistoryOutlined style={{ fontSize: 24, color: '#fa8c16' }} />,
        category: 'Security'
    },
    {
        key: 'twoFactor',
        title: 'Two-Factor Authentication',
        description: 'Add extra security to your account',
        icon: <SafetyOutlined style={{ fontSize: 24, color: '#f5222d' }} />,
        category: 'Security'
    },
    
    // System Settings
    {
        key: 'general',
        title: 'General Settings',
        description: 'Platform identity and regional formats',
        icon: <GlobalOutlined style={{ fontSize: 24, color: '#722ed1' }} />,
        category: 'System'
    },
    {
        key: 'financial',
        title: 'Financial Defaults',
        description: 'Loan calculation and payment settings',
        icon: <DollarOutlined style={{ fontSize: 24, color: '#13c2c2' }} />,
        category: 'System'
    },
    {
        key: 'notifications',
        title: 'Notifications',
        description: 'Email, SMS and alert preferences',
        icon: <BellOutlined style={{ fontSize: 24, color: '#eb2f96' }} />,
        category: 'System'
    },
    {
        key: 'apiKeys',
        title: 'API Integrations',
        description: 'Manage external service connections',
        icon: <KeyOutlined style={{ fontSize: 24, color: '#2f54eb' }} />,
        category: 'System'
    },
    
    // Preferences
    {
        key: 'language',
        title: 'Language & Region',
        description: 'Set your preferred language and timezone',
        icon: <EnvironmentOutlined style={{ fontSize: 24, color: '#faad14' }} />,
        category: 'Preferences'
    },
    {
        key: 'appearance',
        title: 'Appearance',
        description: 'Customize theme and display options',
        icon: <SettingOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
        category: 'Preferences'
    },
];

// ----------------------------------------------------
// 1. DATA STRUCTURES & MOCK DATA
// ----------------------------------------------------

interface GeneralSettings {
    appName: string;
    organizationName: string;
    defaultCurrency: string;
    dateFormat: string;
}

interface FinancialSettings {
    defaultInterestRate: number; // as percentage
    maxLoanAmount: number;
    loanTermUnit: 'Days' | 'Weeks' | 'Months' | 'Years';
    gracePeriodDays: number;
}

interface NotificationSettings {
    enableEmail: boolean;
    enableSMS: boolean;
    adminAlerts: boolean;
}

// Mock initial settings data
const initialGeneralSettings: GeneralSettings = {
    appName: 'Mwanamama Loan',
    organizationName: 'Mwanamama Loan',
    defaultCurrency: 'KSH',
    dateFormat: 'DD/MM/YYYY',
};

const initialFinancialSettings: FinancialSettings = {
    defaultInterestRate: 15.0,
    maxLoanAmount: 50000,
    loanTermUnit: 'Months',
    gracePeriodDays: 3,
};

const initialNotificationSettings: NotificationSettings = {
    enableEmail: true,
    enableSMS: false,
    adminAlerts: true,
};

// ----------------------------------------------------
// 2. MAIN COMPONENT (Settings)
// ----------------------------------------------------

const Settings: React.FC = () => {
    const { user } = useAuth();
    const [generalForm] = Form.useForm<GeneralSettings>();
    const [financialForm] = Form.useForm<FinancialSettings>();
    const [notificationForm] = Form.useForm<NotificationSettings>();
    const [profileForm] = Form.useForm();
    const [passwordForm] = Form.useForm();
    
    const [isLoading, setIsLoading] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [currentDrawer, setCurrentDrawer] = useState<string | null>(null);

    const openDrawer = (key: string) => {
        setCurrentDrawer(key);
        setDrawerVisible(true);
    };

    const closeDrawer = () => {
        setDrawerVisible(false);
        setCurrentDrawer(null);
    };

    const onSaveGeneral = async (values: GeneralSettings) => {
        setIsLoading(true);
        try {
            // Mock API call to save general settings
            console.log('Saving General Settings:', values);
            await new Promise(resolve => setTimeout(resolve, 1000));
            message.success('General settings saved successfully!');
        } catch (error) {
            message.error('Failed to save general settings.');
        } finally {
            setIsLoading(false);
        }
    };

    const onSaveFinancial = async (values: FinancialSettings) => {
        setIsLoading(true);
        try {
            // Mock API call to save financial settings
            console.log('Saving Financial Defaults:', values);
            await new Promise(resolve => setTimeout(resolve, 1000));
            message.success('Financial defaults saved successfully!');
        } catch (error) {
            message.error('Failed to save financial defaults.');
        } finally {
            setIsLoading(false);
        }
    };

    const onSaveNotification = async (values: NotificationSettings) => {
        setIsLoading(true);
        try {
            console.log('Saving Notification Settings:', values);
            await new Promise(resolve => setTimeout(resolve, 1000));
            message.success('Notification settings saved successfully!');
            closeDrawer();
        } catch (error) {
            message.error('Failed to save notification settings.');
        } finally {
            setIsLoading(false);
        }
    };

    const onSaveProfile = async (values: any) => {
        setIsLoading(true);
        try {
            console.log('Saving Profile:', values);
            await new Promise(resolve => setTimeout(resolve, 1000));
            message.success('Profile updated successfully!');
            closeDrawer();
        } catch (error) {
            message.error('Failed to update profile.');
        } finally {
            setIsLoading(false);
        }
    };

    const onSavePassword = async (values: any) => {
        setIsLoading(true);
        try {
            console.log('Changing Password:', values);
            await new Promise(resolve => setTimeout(resolve, 1000));
            message.success('Password changed successfully!');
            passwordForm.resetFields();
            closeDrawer();
        } catch (error) {
            message.error('Failed to change password.');
        } finally {
            setIsLoading(false);
        }
    };

    const renderDrawerContent = () => {
        switch (currentDrawer) {
            case 'profile':
                return (
                    <div>
                        <div style={{ textAlign: 'center', marginBottom: 24 }}>
                            <Avatar size={80} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                            <Title level={4} style={{ marginTop: 16 }}>{user?.name || 'User'}</Title>
                            <Text type="secondary">{user?.email}</Text>
                        </div>
                        <Divider />
                        <Form
                            form={profileForm}
                            layout="vertical"
                            initialValues={{
                                name: user?.name,
                                email: user?.email,
                                phone: user?.phone || '',
                                location: user?.location || '',
                                role: user?.role
                            }}
                            onFinish={onSaveProfile}
                        >
                            <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
                                <Input size="large" prefix={<UserOutlined />} />
                            </Form.Item>
                            <Form.Item name="email" label="Email Address" rules={[{ required: true, type: 'email' }]}>
                                <Input size="large" prefix={<MailOutlined />} disabled />
                            </Form.Item>
                            <Form.Item name="phone" label="Phone Number">
                                <Input size="large" prefix={<PhoneOutlined />} />
                            </Form.Item>
                            <Form.Item name="location" label="Location/Branch">
                                <Input size="large" prefix={<EnvironmentOutlined />} />
                            </Form.Item>
                            <Form.Item name="role" label="Role">
                                <Input size="large" disabled />
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={isLoading} block size="large">
                                    Save Changes
                                </Button>
                            </Form.Item>
                        </Form>
                    </div>
                );

            case 'password':
                return (
                    <Form
                        form={passwordForm}
                        layout="vertical"
                        onFinish={onSavePassword}
                    >
                        <Form.Item
                            name="currentPassword"
                            label="Current Password"
                            rules={[{ required: true, message: 'Please enter your current password' }]}
                        >
                            <Input.Password size="large" prefix={<LockOutlined />} />
                        </Form.Item>
                        <Form.Item
                            name="newPassword"
                            label="New Password"
                            rules={[
                                { required: true, message: 'Please enter a new password' },
                                { min: 8, message: 'Password must be at least 8 characters' }
                            ]}
                        >
                            <Input.Password size="large" prefix={<LockOutlined />} />
                        </Form.Item>
                        <Form.Item
                            name="confirmPassword"
                            label="Confirm New Password"
                            dependencies={['newPassword']}
                            rules={[
                                { required: true, message: 'Please confirm your password' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('newPassword') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Passwords do not match!'));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password size="large" prefix={<LockOutlined />} />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={isLoading} block size="large">
                                Change Password
                            </Button>
                        </Form.Item>
                    </Form>
                );

            case 'loginActivities':
                return (
                    <div>
                        <Text type="secondary">Recent login activities and active sessions</Text>
                        <Divider />
                        <Card className="mb-3" size="small">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <Text strong>Chrome on Windows</Text>
                                    <br />
                                    <Text type="secondary">Nairobi, Kenya • 2 minutes ago</Text>
                                </div>
                                <Text type="success">Active Now</Text>
                            </div>
                        </Card>
                        <Card className="mb-3" size="small">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <Text strong>Mobile App on Android</Text>
                                    <br />
                                    <Text type="secondary">Mombasa, Kenya • 1 day ago</Text>
                                </div>
                                <Button size="small" danger>Revoke</Button>
                            </div>
                        </Card>
                        <Button type="primary" danger block icon={<LogoutOutlined />} style={{ marginTop: 16 }}>
                            Sign Out All Devices
                        </Button>
                    </div>
                );

            case 'twoFactor':
                return (
                    <div>
                        <Card className="bg-blue-50">
                            <SafetyOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                            <Title level={4}>Two-Factor Authentication</Title>
                            <Text>Add an extra layer of security to your account by requiring a verification code in addition to your password.</Text>
                        </Card>
                        <Divider />
                        <Switch defaultChecked={false} /> <Text strong>Enable 2FA</Text>
                        <div style={{ marginTop: 16 }}>
                            <Button type="primary" block size="large">
                                Set Up 2FA
                            </Button>
                        </div>
                    </div>
                );

            case 'general':
                return (
                    <Form
                        form={generalForm}
                        layout="vertical"
                        initialValues={initialGeneralSettings}
                        onFinish={onSaveGeneral}
                    >
                        <Form.Item name="appName" label="Application Display Name" rules={[{ required: true }]}>
                            <Input size="large" />
                        </Form.Item>
                        <Form.Item name="organizationName" label="Organization/Company Name" rules={[{ required: true }]}>
                            <Input size="large" />
                        </Form.Item>
                        <Form.Item name="defaultCurrency" label="Default System Currency" rules={[{ required: true }]}>
                            <Select size="large">
                                <Option value="USD">USD - US Dollar</Option>
                                <Option value="EUR">EUR - Euro</Option>
                                <Option value="KES">KES - Kenyan Shilling</Option>
                                <Option value="GBP">GBP - British Pound</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item name="dateFormat" label="Default Date Format" rules={[{ required: true }]}>
                            <Select size="large">
                                <Option value="DD/MM/YYYY">DD/MM/YYYY</Option>
                                <Option value="MM/DD/YYYY">MM/DD/YYYY</Option>
                                <Option value="YYYY-MM-DD">YYYY-MM-DD</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={isLoading} block size="large">
                                Save General Settings
                            </Button>
                        </Form.Item>
                    </Form>
                );

            case 'financial':
                return (
                    <Form
                        form={financialForm}
                        layout="vertical"
                        initialValues={initialFinancialSettings}
                        onFinish={onSaveFinancial}
                    >
                        <Form.Item name="defaultInterestRate" label="Default Annual Interest Rate (%)" rules={[{ required: true }]}>
                            <Input size="large" suffix="%" type="number" step="0.1" />
                        </Form.Item>
                        <Form.Item name="maxLoanAmount" label="Maximum Loan Amount" rules={[{ required: true }]}>
                            <Input size="large" prefix="Ksh" type="number" />
                        </Form.Item>
                        <Form.Item name="loanTermUnit" label="Default Loan Term Unit" rules={[{ required: true }]}>
                            <Select size="large">
                                <Option value="Days">Days</Option>
                                <Option value="Weeks">Weeks</Option>
                                <Option value="Months">Months</Option>
                                <Option value="Years">Years</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item name="gracePeriodDays" label="Loan Grace Period (Days)" rules={[{ required: true }]}>
                            <Input size="large" suffix="Days" type="number" />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={isLoading} block size="large">
                                Save Financial Defaults
                            </Button>
                        </Form.Item>
                    </Form>
                );

            case 'notifications':
                return (
                    <Form
                        form={notificationForm}
                        layout="vertical"
                        initialValues={initialNotificationSettings}
                        onFinish={onSaveNotification}
                    >
                        <Card size="small" className="mb-3">
                            <Form.Item name="enableEmail" label="Email Notifications" valuePropName="checked">
                                <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
                            </Form.Item>
                        </Card>
                        <Card size="small" className="mb-3">
                            <Form.Item name="enableSMS" label="SMS Notifications" valuePropName="checked">
                                <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
                            </Form.Item>
                        </Card>
                        <Card size="small" className="mb-3">
                            <Form.Item name="adminAlerts" label="Admin Alerts" valuePropName="checked">
                                <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
                            </Form.Item>
                        </Card>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={isLoading} block size="large">
                                Save Notification Settings
                            </Button>
                        </Form.Item>
                    </Form>
                );

            case 'apiKeys':
                return (
                    <div>
                        <Text type="secondary">Manage API keys for external integrations</Text>
                        <Divider />
                        <Card className="mb-3">
                            <Text strong>SMS Gateway API</Text>
                            <br />
                            <Text type="secondary">Configure SMS provider credentials</Text>
                            <br />
                            <Button type="link">Configure</Button>
                        </Card>
                        <Card className="mb-3">
                            <Text strong>Payment Gateway API</Text>
                            <br />
                            <Text type="secondary">M-Pesa and card payment integration</Text>
                            <br />
                            <Button type="link">Configure</Button>
                        </Card>
                    </div>
                );

            case 'language':
                return (
                    <Form layout="vertical">
                        <Form.Item label="Preferred Language">
                            <Select size="large" defaultValue="en">
                                <Option value="en">English</Option>
                                <Option value="sw">Swahili</Option>
                                <Option value="fr">French</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item label="Timezone">
                            <Select size="large" defaultValue="Africa/Nairobi">
                                <Option value="Africa/Nairobi">East Africa Time (EAT)</Option>
                                <Option value="UTC">UTC</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" icon={<SaveOutlined />} block size="large">
                                Save Preferences
                            </Button>
                        </Form.Item>
                    </Form>
                );

            case 'appearance':
                return (
                    <div>
                        <Form layout="vertical">
                            <Form.Item label="Theme Mode">
                                <Select size="large" defaultValue="light">
                                    <Option value="light">Light Mode</Option>
                                    <Option value="dark">Dark Mode</Option>
                                    <Option value="auto">Auto (System)</Option>
                                </Select>
                            </Form.Item>
                            <Form.Item label="Compact View">
                                <Switch /> <Text>Enable compact table and card layouts</Text>
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" icon={<SaveOutlined />} block size="large">
                                    Save Appearance
                                </Button>
                            </Form.Item>
                        </Form>
                    </div>
                );

            default:
                return <Text>Select a setting to configure</Text>;
        }
    };

    return (
        <div>
            <PageHeader 
                title="Settings" 
                breadcrumbs={[
                    { title: 'Settings' }
                ]} 
            />
            
            <div style={{ padding: '24px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
                {/* User Info Card */}
                <Card style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                        <div>
                            <Title level={5} style={{ margin: 0 }}>{user?.email || 'user@example.com'}</Title>
                            <Text type="secondary">{user?.location || 'KE'}</Text>
                            <br />
                            <Text type="secondary">{user?.role || 'ADMIN'}</Text>
                        </div>
                    </div>
                </Card>

                {/* Settings Categories */}
                {['Account', 'Security', 'System', 'Preferences'].map((category) => (
                    <div key={category} style={{ marginBottom: 24 }}>
                        <Title level={5} style={{ marginBottom: 16, color: '#595959' }}>{category}</Title>
                        <Row gutter={[16, 16]}>
                            {settingsCards
                                .filter(card => card.category === category)
                                .map((card) => (
                                    <Col xs={24} sm={12} md={8} lg={6} key={card.key}>
                                        <Card
                                            hoverable
                                            onClick={() => openDrawer(card.key)}
                                            style={{ height: '100%' }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                                <div>{card.icon}</div>
                                                <div style={{ flex: 1 }}>
                                                    <Text strong style={{ display: 'block', marginBottom: 4 }}>
                                                        {card.title}
                                                    </Text>
                                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                                        {card.description}
                                                    </Text>
                                                </div>
                                                <RightOutlined style={{ color: '#bfbfbf' }} />
                                            </div>
                                        </Card>
                                    </Col>
                                ))}
                        </Row>
                    </div>
                ))}
            </div>

            {/* Settings Drawer */}
            <Drawer
                title={settingsCards.find(c => c.key === currentDrawer)?.title || 'Settings'}
                placement="right"
                width={500}
                onClose={closeDrawer}
                open={drawerVisible}
            >
                {renderDrawerContent()}
            </Drawer>
        </div>
    );
};

export default Settings;