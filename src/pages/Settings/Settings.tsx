import React, { useState, useEffect } from 'react';
import { 
    Typography, Card, Form, Input, Select, Button, Switch, Divider, Row, Col, message, Avatar, Table, Tag, Tooltip, Modal, Alert
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
    UserOutlined, LockOutlined, BellOutlined, GlobalOutlined, DollarOutlined, 
    SafetyOutlined, HistoryOutlined, CreditCardOutlined, TeamOutlined, 
    SettingOutlined, RightOutlined, SaveOutlined, KeyOutlined, SecurityScanOutlined,
    MailOutlined, PhoneOutlined, EnvironmentOutlined, CalendarOutlined, LogoutOutlined, ArrowLeftOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import PageHeader from '../../components/common/Layout/PageHeader';
import { useAuth } from '../../context/AuthContext';
import http from '../../services/httpInterceptor';
import { APIS } from '../../services/APIS';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { Option } = Select;

interface SettingsCard {
    key: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    category: string;
}

interface LoginActivity {
    id: number;
    username: string;
    ipAddress: string;
    userAgent: string;
    deviceType: string;
    location: string | null;
    status: 'SUCCESS' | 'FAILED';
    failureReason: string | null;
    loginTime: string;
    logoutTime: string | null;
    sessionId: string;
}

const settingsCards: SettingsCard[] = [
    // Account Settings
    {
        key: 'profile',
        title: 'My Profile',
        description: 'View and update your personal information',
        icon: <UserOutlined style={{ fontSize: 24, color: '#ac202d', border: '2px solid #ac202d', borderRadius: '50%', padding: '8px' }} />,
        category: 'Account'
    },
    {
        key: 'password',
        title: 'Change Password',
        description: 'Update your account password',
        icon: <LockOutlined style={{ fontSize: 24, color: '#ac202d', border: '2px solid #ac202d', borderRadius: '50%', padding: '8px' }} />,
        category: 'Account'
    },
    {
        key: 'loginActivities',
        title: 'Login Activities',
        description: 'See all login activities and sessions',
        icon: <HistoryOutlined style={{ fontSize: 24, color: '#ac202d', border: '2px solid #ac202d', borderRadius: '50%', padding: '8px' }} />,
        category: 'Security'
    },
    {
        key: 'twoFactor',
        title: 'Two-Factor Authentication',
        description: 'Add extra security to your account',
        icon: <SafetyOutlined style={{ fontSize: 24, color: '#ac202d', border: '2px solid #ac202d', borderRadius: '50%', padding: '8px' }} />,
        category: 'Security'
    },
    
    // System Settings
    {
        key: 'general',
        title: 'General Settings',
        description: 'Platform identity and regional formats',
        icon: <GlobalOutlined style={{ fontSize: 24, color: '#ac202d', border: '2px solid #ac202d', borderRadius: '50%', padding: '8px' }} />,
        category: 'System'
    },
    {
        key: 'financial',
        title: 'Financial Defaults',
        description: 'Loan calculation and payment settings',
        icon: <DollarOutlined style={{ fontSize: 24, color: '#ac202d', border: '2px solid #ac202d', borderRadius: '50%', padding: '8px' }} />,
        category: 'System'
    },
    {
        key: 'notifications',
        title: 'Notifications',
        description: 'Email, SMS and alert preferences',
        icon: <BellOutlined style={{ fontSize: 24, color: '#ac202d', border: '2px solid #ac202d', borderRadius: '50%', padding: '8px' }} />,
        category: 'System'
    },
    
    // Preferences
    {
        key: 'language',
        title: 'Language & Region',
        description: 'Set your preferred language and timezone',
        icon: <EnvironmentOutlined style={{ fontSize: 24, color: '#ac202d', border: '2px solid #ac202d', borderRadius: '50%', padding: '8px' }} />,
        category: 'Preferences'
    },
    {
        key: 'appearance',
        title: 'Appearance',
        description: 'Customize theme and display options',
        icon: <SettingOutlined style={{ fontSize: 24, color: '#ac202d', border: '2px solid #ac202d', borderRadius: '50%', padding: '8px' }} />,
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
    defaultAnnualInterestRate: number;
    maximumLoanAmount: number;
    defaultLoanTermUnit: string;
    loanGracePeriodDays: number;
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
    defaultAnnualInterestRate: 15.0,
    maximumLoanAmount: 50000,
    defaultLoanTermUnit: 'Months',
    loanGracePeriodDays: 3,
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
    const [activeView, setActiveView] = useState<string | null>(null);
    
    // 2FA state
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [twoFactorModalVisible, setTwoFactorModalVisible] = useState(false);
    const [pendingTwoFactorStatus, setPendingTwoFactorStatus] = useState(false);
    
    // Login activities state
    const [loginActivities, setLoginActivities] = useState<LoginActivity[]>([]);
    const [loadingActivities, setLoadingActivities] = useState(false);
    const [activitiesPagination, setActivitiesPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    const openView = (key: string) => {
        setActiveView(key);
    };

    const goBackToSettings = () => {
        setActiveView(null);
    };

    const handle2FAToggle = (checked: boolean) => {
        setPendingTwoFactorStatus(checked);
        setTwoFactorModalVisible(true);
    };

    const confirm2FAChange = async () => {
        setIsLoading(true);
        try {
            await http.put(APIS.SET_2FA, { status: pendingTwoFactorStatus });
            setTwoFactorEnabled(pendingTwoFactorStatus);
            message.success(`Two-Factor Authentication ${pendingTwoFactorStatus ? 'enabled' : 'disabled'} successfully!`);
            setTwoFactorModalVisible(false);
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Failed to update 2FA settings.');
        } finally {
            setIsLoading(false);
        }
    };

    const fetch2FAStatus = async () => {
        try {
            const response = await http.get(APIS.TWO_FA_STATUS);
            setTwoFactorEnabled(response.data.status);
        } catch (error: any) {
            console.error('Failed to fetch 2FA status:', error);
        }
    };

    const fetchFinancialDefaults = async () => {
        try {
            const response = await http.get(APIS.FINANCIAL_DEFAULTS);
            const data = response.data;
            financialForm.setFieldsValue({
                defaultAnnualInterestRate: data.defaultAnnualInterestRate,
                maximumLoanAmount: data.maximumLoanAmount,
                defaultLoanTermUnit: data.defaultLoanTermUnit,
                loanGracePeriodDays: data.loanGracePeriodDays,
            });
        } catch (error: any) {
            console.error('Failed to fetch financial defaults:', error);
        }
    };

    const loadLoginActivities = async (page = 1, pageSize = 10) => {
        setLoadingActivities(true);
        try {
            const response = await http.get(APIS.LOGIN_ACTIVITIES, {
                params: {
                    page: page - 1,
                    size: pageSize,
                },
            });
            
            const responseData = response.data;
            if (responseData.content && Array.isArray(responseData.content)) {
                setLoginActivities(responseData.content);
                setActivitiesPagination({
                    current: page,
                    pageSize: pageSize,
                    total: responseData.totalElements || 0,
                });
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Failed to load login activities');
        } finally {
            setLoadingActivities(false);
        }
    };

    // Load login activities when view opens
    useEffect(() => {
        if (activeView === 'loginActivities') {
            loadLoginActivities();
        } else if (activeView === 'twoFactor') {
            fetch2FAStatus();
        } else if (activeView === 'financial') {
            fetchFinancialDefaults();
        }
    }, [activeView]);

    const onSaveGeneral = async (values: GeneralSettings) => {
        setIsLoading(true);
        try {
            // Mock API call to save general settings
            console.log('Saving General Settings:', values);
            await new Promise(resolve => setTimeout(resolve, 1000));
            message.success('General settings saved successfully!');
            goBackToSettings();
        } catch (error) {
            message.error('Failed to save general settings.');
        } finally {
            setIsLoading(false);
        }
    };

    const onSaveFinancial = async (values: FinancialSettings) => {
        setIsLoading(true);
        try {
            await http.put(APIS.FINANCIAL_DEFAULTS, {
                defaultAnnualInterestRate: values.defaultAnnualInterestRate,
                maximumLoanAmount: values.maximumLoanAmount,
                defaultLoanTermUnit: values.defaultLoanTermUnit,
                loanGracePeriodDays: values.loanGracePeriodDays,
            });
            message.success('Financial defaults updated successfully!');
            goBackToSettings();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Failed to update financial defaults.');
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
            goBackToSettings();
        } catch (error) {
            message.error('Failed to save notification settings.');
        } finally {
            setIsLoading(false);
        }
    };

    const onSaveProfile = async (values: any) => {
        setIsLoading(true);
        try {
            const payload = {
                name: values.name,
                phoneNumber: values.phone || '',
                location: values.location || ''
            };
            
            await http.put(APIS.UPDATE_PROFILE, payload);
            message.success('Profile updated successfully!');
            goBackToSettings();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Failed to update profile.');
        } finally {
            setIsLoading(false);
        }
    };

    const onSavePassword = async (values: any) => {
        setIsLoading(true);
        try {
            const payload = {
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
                confirmPassword: values.confirmPassword
            };
            
            await http.put(APIS.CHANGE_PASSWORD, payload);
            message.success('Password changed successfully!');
            passwordForm.resetFields();
            goBackToSettings();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Failed to change password.');
        } finally {
            setIsLoading(false);
        }
    };

    const renderDrawerContent = () => {
        switch (activeView) {
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
                                phone: user?.phoneNumber || '',
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
                const columns: ColumnsType<LoginActivity> = [
                    {
                        title: 'Login Time',
                        dataIndex: 'loginTime',
                        key: 'loginTime',
                        render: (time: string) => (
                            <Tooltip title={dayjs(time).format('DD/MM/YYYY HH:mm:ss')}>
                                <span>{dayjs(time).fromNow()}</span>
                            </Tooltip>
                        ),
                    },
                    {
                        title: 'Device',
                        dataIndex: 'deviceType',
                        key: 'deviceType',
                        render: (deviceType: string, record: LoginActivity) => (
                            <div>
                                <div><strong>{deviceType}</strong></div>
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                    {record.userAgent.length > 50 
                                        ? record.userAgent.substring(0, 50) + '...' 
                                        : record.userAgent
                                    }
                                </Text>
                            </div>
                        ),
                    },
                    {
                        title: 'IP Address',
                        dataIndex: 'ipAddress',
                        key: 'ipAddress',
                    },
                    {
                        title: 'Location',
                        dataIndex: 'location',
                        key: 'location',
                        render: (location: string | null) => location || '-',
                    },
                    {
                        title: 'Status',
                        dataIndex: 'status',
                        key: 'status',
                        render: (status: string) => (
                            <Tag color={status === 'SUCCESS' ? 'success' : 'error'}>
                                {status}
                            </Tag>
                        ),
                    },
                    {
                        title: 'Session',
                        key: 'session',
                        render: (_, record: LoginActivity) => (
                            record.logoutTime ? (
                                <Tooltip title={`Logged out: ${dayjs(record.logoutTime).format('DD/MM/YYYY HH:mm:ss')}`}>
                                    <Tag>Ended</Tag>
                                </Tooltip>
                            ) : (
                                <Tag color="green">Active</Tag>
                            )
                        ),
                    },
                ];

                return (
                    <div>
                        <Text type="secondary">Recent login activities and active sessions</Text>
                        <Divider />
                        <Table
                            dataSource={loginActivities}
                            columns={columns}
                            rowKey="id"
                            loading={loadingActivities}
                            pagination={{
                                current: activitiesPagination.current,
                                pageSize: activitiesPagination.pageSize,
                                total: activitiesPagination.total,
                                onChange: (page, pageSize) => loadLoginActivities(page, pageSize),
                                showSizeChanger: true,
                                showTotal: (total) => `Total ${total} activities`,
                                pageSizeOptions: ['10', '20', '50'],
                            }}
                        />
                    </div>
                );

            case 'twoFactor':
                return (
                    <div>
                        <Card style={{ backgroundColor: '#e6f7ff', border: '1px solid #91d5ff' }}>
                            <SafetyOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                            <Title level={4}>Two-Factor Authentication</Title>
                            <Text>Add an extra layer of security to your account by requiring a verification code in addition to your password.</Text>
                        </Card>
                        <Divider />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Switch 
                                checked={twoFactorEnabled} 
                                onChange={handle2FAToggle}
                            /> 
                            <Text strong>Enable 2FA</Text>
                        </div>
                        
                        <Modal
                            title={
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <ExclamationCircleOutlined style={{ color: '#faad14', fontSize: 24 }} />
                                    <span>{pendingTwoFactorStatus ? 'Enable' : 'Disable'} Two-Factor Authentication</span>
                                </div>
                            }
                            open={twoFactorModalVisible}
                            onOk={confirm2FAChange}
                            onCancel={() => setTwoFactorModalVisible(false)}
                            confirmLoading={isLoading}
                            okText="Confirm"
                            cancelText="Cancel"
                            okButtonProps={{ danger: !pendingTwoFactorStatus }}
                        >
                            <Alert
                                message={pendingTwoFactorStatus ? 'Enable Two-Factor Authentication' : 'Disable Two-Factor Authentication'}
                                description={
                                    <div>
                                        {pendingTwoFactorStatus ? (
                                            <>
                                                <p>You are about to enable Two-Factor Authentication for your account.</p>
                                                <p><strong>Email:</strong> {user?.email}</p>
                                                <p>Once enabled, you will receive a One-Time Password (OTP) at <strong>{user?.email}</strong> whenever you log in. You will need this OTP along with your password to access your account.</p>
                                                <p style={{ marginTop: 12, color: '#faad14' }}>
                                                    <strong>Important:</strong> Make sure you have access to this email address.
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <p>You are about to disable Two-Factor Authentication for your account.</p>
                                                <p style={{ marginTop: 12, color: '#ff4d4f' }}>
                                                    <strong>Warning:</strong> Disabling 2FA will reduce your account security. You will only need your password to log in.
                                                </p>
                                            </>
                                        )}
                                    </div>
                                }
                                type={pendingTwoFactorStatus ? 'info' : 'warning'}
                                showIcon
                                style={{ marginBottom: 16 }}
                            />
                            <p>Are you sure you want to {pendingTwoFactorStatus ? 'enable' : 'disable'} Two-Factor Authentication?</p>
                        </Modal>
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
                        <Form.Item name="defaultAnnualInterestRate" label="Default Annual Interest Rate (%)" rules={[{ required: true }]}>
                            <Input size="large" suffix="%" type="number" step="0.1" />
                        </Form.Item>
                        <Form.Item name="maximumLoanAmount" label="Maximum Loan Amount" rules={[{ required: true }]}>
                            <Input size="large" prefix="Ksh" type="number" />
                        </Form.Item>
                        <Form.Item name="defaultLoanTermUnit" label="Default Loan Term Unit" rules={[{ required: true }]}>
                            <Select size="large">
                                <Option value="Days">Days</Option>
                                <Option value="Weeks">Weeks</Option>
                                <Option value="Months">Months</Option>
                                <Option value="Years">Years</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item name="loanGracePeriodDays" label="Loan Grace Period (Days)" rules={[{ required: true }]}>
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
                title={activeView ? settingsCards.find(c => c.key === activeView)?.title || 'Settings' : 'Settings'}
                breadcrumbs={
                    activeView 
                        ? [
                            { title: 'Settings', path: '/settings' },
                            { title: settingsCards.find(c => c.key === activeView)?.title || '' }
                          ]
                        : [{ title: 'Settings' }]
                }
            />
            
            <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
                {!activeView ? (
                    <>
                        {/* User Info Card */}
                        <Card style={{ marginBottom: 24 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: '#ac202d' }} />
                                <div>
                                    <Title level={5} style={{ margin: 0 }}>{user?.name || '--'}</Title>
                                    <Text type="secondary">{user?.email || '--'}</Text>
                                    <br />
                                    <Text type="secondary">{user?.role || '--'} | {user?.branch?.name || 'Head Office'}</Text>
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
                                                    onClick={() => openView(card.key)}
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
                                                        <RightOutlined style={{ color: '#ac202d' }} />
                                                    </div>
                                                </Card>
                                            </Col>
                                        ))}
                                </Row>
                            </div>
                        ))}
                    </>
                ) : (
                    <Card>
                        <div style={{ marginBottom: 24 }}>
                            <Button 
                                icon={<ArrowLeftOutlined />} 
                                onClick={goBackToSettings}
                                style={{ marginBottom: 16 }}
                            >
                                Back to Settings
                            </Button>
                        </div>
                        {renderDrawerContent()}
                    </Card>
                )}
            </div>
        </div>
    );
};

export default Settings;