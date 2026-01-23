import React, { useState } from 'react';
import { 
    Typography, Card, Form, Input, Select, Button, Switch, Divider, Tabs, Row, Col, message
} from 'antd';
import { 
    SettingOutlined, SaveOutlined,KeyOutlined, GlobalOutlined, DollarOutlined, BellOutlined, SecurityScanOutlined 
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

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
    appName: 'TrueTana Capital Ltd',
    organizationName: 'TrueTana Capital Ltd',
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
    const [generalForm] = Form.useForm<GeneralSettings>();
    const [financialForm] = Form.useForm<FinancialSettings>();
    const [notificationForm] = Form.useForm<NotificationSettings>();
    
    const [isLoading, setIsLoading] = useState(false);

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
            // Mock API call to save notification settings
            console.log('Saving Notification Settings:', values);
            await new Promise(resolve => setTimeout(resolve, 1000));
            message.success('Notification settings saved successfully!');
        } catch (error) {
            message.error('Failed to save notification settings.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="page-container p-4 min-h-screen bg-gray-50">
            <Title level={2} className="text-gray-800">
                ⚙️ Application Settings <SettingOutlined style={{ color: '#555' }} />
            </Title>
            <Text type="secondary">
                Manage **core system configurations** that affect all users and financial calculations.
            </Text>

            <Card className="mt-4 shadow-lg border-t-4 border-gray-400">
                <Tabs defaultActiveKey="general" type="line" size="large">
                    
                    {/* ----------------- 1. GENERAL SETTINGS ----------------- */}
                    <TabPane 
                        tab={<span className="flex items-center"><GlobalOutlined /> General</span>} 
                        key="general"
                    >
                        <Title level={4}>Platform Identity</Title>
                        <Text type="secondary" className="block mb-4">Set the core names, branding, and regional formats for the application.</Text>
                        <Divider className="my-2" />

                        <Form
                            form={generalForm}
                            layout="vertical"
                            initialValues={initialGeneralSettings}
                            onFinish={onSaveGeneral}
                        >
                            <Row gutter={16}>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        name="appName"
                                        label="Application Display Name"
                                        rules={[{ required: true, message: 'Please enter the application name' }]}
                                    >
                                        <Input size="large" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        name="organizationName"
                                        label="Organization/Company Name"
                                        rules={[{ required: true, message: 'Please enter the organization name' }]}
                                    >
                                        <Input size="large" />
                                    </Form.Item>
                                </Col>
                            </Row>
                            
                            <Row gutter={16}>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        name="defaultCurrency"
                                        label="Default System Currency"
                                        rules={[{ required: true, message: 'Please select a currency' }]}
                                    >
                                        <Select size="large" placeholder="Select currency">
                                            <Option value="USD">USD - US Dollar</Option>
                                            <Option value="EUR">EUR - Euro</Option>
                                            <Option value="KES">KES - Kenyan Shilling</Option>
                                            <Option value="GBP">GBP - British Pound</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        name="dateFormat"
                                        label="Default Date Format"
                                        rules={[{ required: true, message: 'Please select a date format' }]}
                                    >
                                        <Select size="large" placeholder="Select date format">
                                            <Option value="DD/MM/YYYY">DD/MM/YYYY (e.g., 25/12/2025)</Option>
                                            <Option value="MM/DD/YYYY">MM/DD/YYYY (e.g., 12/25/2025)</Option>
                                            <Option value="YYYY-MM-DD">YYYY-MM-DD (e.g., 2025-12-25)</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item>
                                <Button 
                                    type="primary" 
                                    htmlType="submit" 
                                    icon={<SaveOutlined />} 
                                    loading={isLoading}
                                    className="mt-4"
                                >
                                    Save General Settings
                                </Button>
                            </Form.Item>
                        </Form>
                    </TabPane>

                    {/* ----------------- 2. FINANCIAL DEFAULTS ----------------- */}
                    <TabPane 
                        tab={<span className="flex items-center"><DollarOutlined /> Financial Defaults</span>} 
                        key="financial"
                    >
                        <Title level={4}>Loan Calculation Settings</Title>
                        <Text type="secondary" className="block mb-4">These values are used as defaults for all new loan applications.</Text>
                        <Divider className="my-2" />

                        <Form
                            form={financialForm}
                            layout="vertical"
                            initialValues={initialFinancialSettings}
                            onFinish={onSaveFinancial}
                        >
                            <Row gutter={16}>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        name="defaultInterestRate"
                                        label="Default Annual Interest Rate (%)"
                                        rules={[{ required: true, type: 'number', min: 0, max: 100 }]}
                                    >
                                        <Input size="large" suffix="%" type="number" step="0.1" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        name="maxLoanAmount"
                                        label="Maximum Loan Amount (Default Currency)"
                                        rules={[{ required: true, type: 'number', min: 100 }]}
                                    >
                                        <Input size="large" prefix="Ksh" type="number" step="1000" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        name="loanTermUnit"
                                        label="Default Loan Term Unit"
                                        rules={[{ required: true }]}
                                    >
                                        <Select size="large" placeholder="Select time unit">
                                            <Option value="Days">Days</Option>
                                            <Option value="Weeks">Weeks</Option>
                                            <Option value="Months">Months</Option>
                                            <Option value="Years">Years</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        name="gracePeriodDays"
                                        label="Loan Grace Period (Days)"
                                        tooltip="Number of days before a loan is considered delinquent after the due date."
                                        rules={[{ required: true, type: 'number', min: 0, max: 365 }]}
                                    >
                                        <Input size="large" suffix="Days" type="number" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item>
                                <Button 
                                    type="primary" 
                                    htmlType="submit" 
                                    icon={<SaveOutlined />} 
                                    loading={isLoading}
                                    className="mt-4"
                                >
                                    Save Financial Defaults
                                </Button>
                            </Form.Item>
                        </Form>
                    </TabPane>

                    {/* ----------------- 3. NOTIFICATIONS ----------------- */}
                    <TabPane 
                        tab={<span className="flex items-center"><BellOutlined /> Notifications</span>} 
                        key="notifications"
                    >
                        <Title level={4}>System Alerts & Communication</Title>
                        <Text type="secondary" className="block mb-4">Configure how the system communicates with clients and administrators.</Text>
                        <Divider className="my-2" />

                        <Form
                            form={notificationForm}
                            layout="horizontal"
                            initialValues={initialNotificationSettings}
                            onFinish={onSaveNotification}
                            labelCol={{ span: 8 }}
                            wrapperCol={{ span: 16 }}
                        >
                            <Form.Item
                                name="enableEmail"
                                label="Enable Client Email Notifications"
                                valuePropName="checked"
                                tooltip="Send automated emails for due dates, payments, and approvals."
                            >
                                <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
                            </Form.Item>

                            <Form.Item
                                name="enableSMS"
                                label="Enable Client SMS Notifications"
                                valuePropName="checked"
                                tooltip="Send automated SMS alerts (Requires external SMS gateway setup)."
                            >
                                <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
                            </Form.Item>

                            <Form.Item
                                name="adminAlerts"
                                label="Send High-Priority Admin Alerts"
                                valuePropName="checked"
                                tooltip="Alert administrators immediately for security events or critical system failures."
                            >
                                <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
                            </Form.Item>

                            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                                <Button 
                                    type="primary" 
                                    htmlType="submit" 
                                    icon={<SaveOutlined />} 
                                    loading={isLoading}
                                    className="mt-4"
                                >
                                    Save Notification Settings
                                </Button>
                            </Form.Item>
                        </Form>
                    </TabPane>

                    {/* ----------------- 4. SECURITY (Placeholder) ----------------- */}
                    <TabPane 
                        tab={<span className="flex items-center"><SecurityScanOutlined /> Security</span>} 
                        key="security"
                    >
                        <Title level={4}>Advanced Security Configuration</Title>
                        <Text type="secondary" className="block mb-4">Manage advanced security policies and integration settings.</Text>
                        <Divider className="my-2" />

                        <Card bordered={false} className="bg-red-50 border-l-4 border-red-400">
                            <Text strong>Two-Factor Authentication (2FA)</Text>
                            <p>Enforce 2FA for all administrative roles to protect sensitive configurations and data access.</p>
                            <Switch defaultChecked checkedChildren="Enforced" unCheckedChildren="Disabled" />
                        </Card>
                        
                        <Card bordered={false} className="mt-4 bg-gray-100 border-l-4 border-gray-400">
                            <Text strong>API Key Management</Text>
                            <p>Manage keys for external services (e.g., Payment Gateways, SMS Providers). This should be handled in a dedicated secure modal.</p>
                            <Button type="dashed" icon={<KeyOutlined />}>Manage API Integrations</Button>
                        </Card>

                    </TabPane>
                </Tabs>
            </Card>
        </div>
    );
};

export default Settings;