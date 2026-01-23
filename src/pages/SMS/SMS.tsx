import React, { useState, useMemo } from 'react';
import { 
    Typography, Card, Tabs, Form, Input, Select, Button, Table, Tag, Row, Col, Space, message, Popconfirm, Tooltip
} from 'antd';
import { 
    MessageOutlined, SendOutlined, EditOutlined, DeleteOutlined, HistoryOutlined, FileTextOutlined, UserOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, PlusOutlined, KeyOutlined 
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

// ----------------------------------------------------
// 1. DATA STRUCTURES & CONSTANTS
// ----------------------------------------------------

const MAX_SMS_LENGTH = 160; // Standard single SMS character limit

interface SmsTemplate {
    id: number;
    name: string;
    event: string;
    content: string; // Message content with placeholders
    status: 'Active' | 'Draft';
}

interface MessageLog {
    id: number;
    type: 'Transactional' | 'Promotional';
    recipient: string; // Phone number or group
    contentPreview: string;
    status: 'Sent' | 'Failed' | 'Scheduled';
    date: string;
}

// Mock Templates
const mockTemplates: SmsTemplate[] = [
    {
        id: 1,
        name: 'Loan Disbursement Confirmation',
        event: 'LOAN_DISBURSED',
        content: 'Dear {{client_name}}, your loan of {{amount}} {{currency}} has been successfully disbursed. Repayment due date: {{due_date}}.',
        status: 'Active',
    },
    {
        id: 2,
        name: 'Payment Due Reminder (7 Days)',
        event: 'PAYMENT_REMINDER',
        content: 'Reminder: Your loan payment of {{payment_amount}} is due in 7 days ({{due_date}}). Avoid penalties!',
        status: 'Active',
    },
    {
        id: 3,
        name: 'New Product Launch',
        event: 'PROMOTIONAL',
        content: 'Exciting news! We have launched a new savings product with 10% interest. Visit our website to learn more.',
        status: 'Draft',
    },
];

// Mock Logs
const mockLogs: MessageLog[] = [
    {
        id: 101,
        type: 'Transactional',
        recipient: '+1234567890 (John Doe)',
        contentPreview: 'Dear John Doe, your loan of 1000 USD has been...',
        status: 'Sent',
        date: '2025-11-23 10:30 AM',
    },
    {
        id: 102,
        type: 'Promotional',
        recipient: 'All Clients (Group)',
        contentPreview: 'Avoid long queues! Pay your loan installments online...',
        status: 'Scheduled',
        date: '2025-11-24 09:00 AM',
    },
    {
        id: 103,
        type: 'Transactional',
        recipient: '+1234567891 (Jane Smith)',
        contentPreview: 'Your recent payment of 250 USD was successfully posted...',
        status: 'Failed',
        date: '2025-11-23 09:45 AM',
    },
];

// ----------------------------------------------------
// 2. COMPOSE MESSAGE TAB
// ----------------------------------------------------

const ComposeMessageTab: React.FC = () => {
    const [form] = Form.useForm();
    const [messageLength, setMessageLength] = useState(0);

    const onFinish = (values: any) => {
        message.loading({ content: `Sending message to ${values.recipientType}...`, key: 'send' });
        
        // Simulate sending delay
        setTimeout(() => {
            message.success({ content: 'Message sent successfully!', key: 'send', duration: 2 });
            form.resetFields();
            setMessageLength(0);
        }, 1500);
    };

    return (
        <Card className="shadow-inner border-none">
            <Title level={4} className="flex items-center"><SendOutlined className="mr-2 text-blue-500" /> Send New Message</Title>
            <Text type="secondary" className="block mb-4">Send a promotional blast to client groups or a custom message to an individual.</Text>
            
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
            >
                <Row gutter={24}>
                    <Col xs={24} lg={12}>
                        <Form.Item
                            name="recipientType"
                            label="Recipient Type"
                            rules={[{ required: true, message: 'Please select recipients' }]}
                        >
                            <Select size="large" placeholder="Select target audience">
                                <Option value="individual">Individual Client/Phone Number</Option>
                                <Option value="all_active">All Active Clients</Option>
                                <Option value="loan_overdue">Clients with Overdue Loans</Option>
                                <Option value="no_loan">Clients without Active Loan</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col xs={24} lg={12}>
                        <Form.Item
                            name="individualTarget"
                            label="Individual Target (if applicable)"
                            dependencies={['recipientType']}
                        >
                            {({ getFieldValue }) =>
                                getFieldValue('recipientType') === 'individual' ? (
                                    <Input size="large" placeholder="Enter Phone Number or Client Name" />
                                ) : (
                                    <Input size="large" placeholder="Not applicable for group message" disabled />
                                )
                            }
                        </Form.Item>
                    </Col>
                </Row>
                
                <Form.Item
                    name="messageContent"
                    label="Message Content"
                    rules={[{ required: true, message: 'Message content cannot be empty' }]}
                    extra={`Characters: ${messageLength} / ${MAX_SMS_LENGTH}. (${Math.ceil(messageLength / MAX_SMS_LENGTH)} SMS part(s))`}
                >
                    <TextArea
                        rows={5}
                        maxLength={MAX_SMS_LENGTH * 3} // Allow up to 3 concatenated SMS parts
                        showCount={false}
                        onChange={(e) => setMessageLength(e.target.value.length)}
                        placeholder="Type your message here..."
                    />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" size="large" icon={<SendOutlined />}>
                        Send Message Now
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};


// ----------------------------------------------------
// 3. TEMPLATES TAB
// ----------------------------------------------------

const TemplatesTab: React.FC = () => {
    const [data, setData] = useState(mockTemplates);

    const handleDelete = (id: number) => {
        setData(data.filter(item => item.id !== id));
        message.success('Template deleted successfully.');
    };

    const handleEdit = (record: SmsTemplate) => {
        message.info(`Opening edit modal for template: ${record.name}`);
    };
    
    const handleAdd = () => {
        message.info('Opening new template creation modal.');
    };

    const templateColumns = [
        {
            title: 'Template Name',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => <Text strong>{text}</Text>,
        },
        {
            title: 'Trigger Event',
            dataIndex: 'event',
            key: 'event',
            render: (event: string) => (
                <Tag color={event === 'PROMOTIONAL' ? 'purple' : 'green'}>{event}</Tag>
            ),
        },
        {
            title: 'Content Preview (Placeholders)',
            dataIndex: 'content',
            key: 'content',
            ellipsis: true,
            render: (content: string) => (
                <Tooltip title={content}>
                    {content.length > 50 ? content.substring(0, 47) + '...' : content}
                </Tooltip>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            align: 'center' as const,
            render: (status: string) => (
                <Tag color={status === 'Active' ? 'blue' : 'default'}>{status}</Tag>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            align: 'center' as const,
            render: (_: any, record: SmsTemplate) => (
                <Space size="middle">
                    <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} type="primary" ghost>Edit</Button>
                    <Popconfirm
                        title="Are you sure to delete this template?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button icon={<DeleteOutlined />} size="small" danger>Delete</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <Card className="shadow-inner border-none">
            <Title level={4} className="flex items-center"><FileTextOutlined className="mr-2 text-green-500" /> Transactional Templates</Title>
            <Text type="secondary" className="block mb-4">
                These templates are automatically triggered by system events (e.g., loan approval, payment received). Note the available placeholders (e.g., <Tag color="orange">{'{{client_name}}'}</Tag>).
            </Text>
            
            <Row justify="end" className="mb-4">
                <Button type="dashed" onClick={handleAdd} icon={<PlusOutlined />}>Add New Template</Button>
            </Row>

            <Table 
                columns={templateColumns} 
                dataSource={data}
                rowKey="id"
                pagination={false}
                size="middle"
                bordered
            />
        </Card>
    );
};


// ----------------------------------------------------
// 4. LOGS TAB
// ----------------------------------------------------

const LogsTab: React.FC = () => {
    const [data] = useState(mockLogs);

    const logColumns = [
        {
            title: 'Date/Time',
            dataIndex: 'date',
            key: 'date',
            sorter: (a: MessageLog, b: MessageLog) => a.date.localeCompare(b.date),
            render: (date: string) => <Text type="secondary" className="whitespace-nowrap"><ClockCircleOutlined className="mr-1" />{date}</Text>,
        },
        {
            title: 'Message Type',
            dataIndex: 'type',
            key: 'type',
            render: (type: string) => (
                <Tag color={type === 'Transactional' ? 'geekblue' : 'volcano'}>{type}</Tag>
            ),
        },
        {
            title: 'Recipient',
            dataIndex: 'recipient',
            key: 'recipient',
            render: (recipient: string) => <Text className="flex items-center"><UserOutlined className="mr-1 text-gray-500" />{recipient}</Text>,
        },
        {
            title: 'Content Preview',
            dataIndex: 'contentPreview',
            key: 'contentPreview',
            ellipsis: true,
            width: '40%',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            align: 'center' as const,
            render: (status: string) => {
                let color;
                let icon;
                if (status === 'Sent') {
                    color = 'success';
                    icon = <CheckCircleOutlined />;
                } else if (status === 'Failed') {
                    color = 'error';
                    icon = <CloseCircleOutlined />;
                } else {
                    color = 'warning';
                    icon = <ClockCircleOutlined />;
                }
                return <Tag color={color} icon={icon}>{status}</Tag>;
            },
        },
    ];

    return (
        <Card className="shadow-inner border-none">
            <Title level={4} className="flex items-center"><HistoryOutlined className="mr-2 text-orange-500" /> Message History</Title>
            <Text type="secondary" className="block mb-4">A complete log of all outgoing SMS, including delivery status.</Text>
            
            <Table 
                columns={logColumns} 
                dataSource={data}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                size="middle"
                bordered
            />
        </Card>
    );
};


// ----------------------------------------------------
// 5. ROOT COMPONENT
// ----------------------------------------------------

const SMS: React.FC = () => {
    return (
        <div className="page-container p-4 min-h-screen bg-gray-50">
            <Title level={2} className="text-gray-800">
                📱 SMS & Notification Center <MessageOutlined style={{ color: '#888' }} />
            </Title>
            <Text type="secondary">
                Manage and monitor all **outgoing and incoming SMS** for promotional and transactional communications.
            </Text>

            <div className="mt-4">
                <Tabs defaultActiveKey="compose" type="card" size="large">
                    <TabPane 
                        tab={<span className="flex items-center"><SendOutlined /> Compose</span>} 
                        key="compose"
                    >
                        <ComposeMessageTab />
                    </TabPane>
                    <TabPane 
                        tab={<span className="flex items-center"><FileTextOutlined /> Templates</span>} 
                        key="templates"
                    >
                        <TemplatesTab />
                    </TabPane>
                    <TabPane 
                        tab={<span className="flex items-center"><HistoryOutlined /> Logs</span>} 
                        key="logs"
                    >
                        <LogsTab />
                    </TabPane>
                </Tabs>
            </div>
        </div>
    );
};

export default SMS;