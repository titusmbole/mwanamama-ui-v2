import React, { useState, useEffect } from 'react';
import { 
    Typography, Card, Tabs, Form, Input, Select, Button, Table, Tag, Row, Col, Space, message, Popconfirm, Tooltip, Radio, Spin
} from 'antd';
import { 
    MessageOutlined, SendOutlined, EditOutlined, DeleteOutlined, HistoryOutlined, FileTextOutlined, UserOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, PlusOutlined, KeyOutlined 
} from '@ant-design/icons';
import PageHeader from '../../components/common/Layout/PageHeader';
import DataTable from '../../components/common/DataTable/DataTable';
import { APIS } from '../../services/APIS';
import http from '../../services/httpInterceptor';

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

    // v1-like compose state
    const [recipientType, setRecipientType] = useState<'custom' | 'group' | 'all'>('custom');
    const [groups, setGroups] = useState<any[]>([]);
    const [loadingGroups, setLoadingGroups] = useState(false);
    const [selectedGroupId, setSelectedGroupId] = useState<number | undefined>(undefined);
    const [selectedGroupMembers, setSelectedGroupMembers] = useState<Array<{ id: number; fullName?: string; phone: string }>>([]);
    const [customMobiles, setCustomMobiles] = useState<string[]>(['']);
    const [loadingAllClients, setLoadingAllClients] = useState(false);

    // Load groups when switching to group mode
    useEffect(() => {
        const fetchGroups = async () => {
            setLoadingGroups(true);
            try {
                const response = await http.get(APIS.LOAD_GROUPS_UNPAGINATED);
                setGroups(response.data || []);
            } catch (error) {
                message.error('Failed to load groups.');
                setGroups([]);
            } finally {
                setLoadingGroups(false);
            }
        };
        if (recipientType === 'group') {
            fetchGroups();
        }
    }, [recipientType]);

    // Load all clients when switching to all mode
    useEffect(() => {
        const fetchAllClients = async () => {
            setLoadingAllClients(true);
            try {
                const response = await http.get(APIS.LOAD_UNPAGINATED_CUSTOMERS);
                const clients = (response.data || []).map((c: any) => ({ id: c.id, fullName: c.fullName, phone: c.phone }));
                setSelectedGroupMembers(clients);
            } catch (error) {
                message.error('Failed to load clients.');
                setSelectedGroupMembers([]);
            } finally {
                setLoadingAllClients(false);
            }
        };
        if (recipientType === 'all') {
            fetchAllClients();
        } else {
            // clear when not all
            if (recipientType !== 'group') setSelectedGroupMembers([]);
        }
    }, [recipientType]);

    // When a group is selected, try to use embedded clients; fallback to fetch members
    useEffect(() => {
        const fetchGroupMembers = async (groupId: number) => {
            try {
                const response = await http.get(APIS.LOAD_GROUP_MEMBERS, { params: { groupId } });
                const members = (response.data || []).map((m: any) => ({ id: m.id, fullName: m.fullName, phone: m.phone }));
                setSelectedGroupMembers(members);
            } catch (error) {
                message.error('Failed to load group members.');
                setSelectedGroupMembers([]);
            }
        };

        if (recipientType === 'group' && selectedGroupId) {
            const group = groups.find((g) => g.id === selectedGroupId);
            if (group && Array.isArray(group.clients) && group.clients.length > 0) {
                const members = group.clients.map((m: any) => ({ id: m.id, fullName: m.fullName, phone: m.phone }));
                setSelectedGroupMembers(members);
            } else {
                fetchGroupMembers(selectedGroupId);
            }
        }
    }, [recipientType, selectedGroupId, groups]);

    const onFinish = async (values: any) => {
        const { messageContent } = values;
        let mobilesToSend: string[] = [];

        if (recipientType === 'custom') {
            mobilesToSend = customMobiles.map((m) => m.trim()).filter((m) => !!m);
            if (mobilesToSend.length === 0) {
                message.error('Please enter at least one mobile number.');
                return;
            }
        } else if (recipientType === 'group') {
            mobilesToSend = selectedGroupMembers.map((m) => m.phone).filter(Boolean);
            if (!selectedGroupId) {
                message.error('Please select a group.');
                return;
            }
            if (mobilesToSend.length === 0) {
                message.error('No group members found.');
                return;
            }
        } else if (recipientType === 'all') {
            mobilesToSend = selectedGroupMembers.map((m) => m.phone).filter(Boolean);
            if (mobilesToSend.length === 0) {
                message.error('No clients found to send SMS.');
                return;
            }
        }

        try {
            message.loading({ content: 'Sending message...', key: 'send' });
            await http.post(APIS.SEND_SMS, { mobiles: mobilesToSend, msg: messageContent });
            message.success({ content: 'SMS sent successfully!', key: 'send', duration: 2 });
            form.resetFields();
            setMessageLength(0);
            setSelectedGroupMembers([]);
            setCustomMobiles(['']);
            setSelectedGroupId(undefined);
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to send SMS.');
            message.destroy('send');
        }
    };

    return (
        <Card className="shadow-inner border-none">
            <Title level={4} className="flex items-center"><SendOutlined className="mr-2 text-blue-500" /> Send New Message</Title>
            <Text type="secondary" className="block mb-4">Send a promotional blast to client groups or a custom message to an individual.</Text>
            
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Row gutter={24}>
                    <Col xs={24} lg={12}>
                        <Form.Item label="Send To">
                            <Radio.Group
                                value={recipientType}
                                onChange={(e) => {
                                    setRecipientType(e.target.value);
                                    setSelectedGroupId(undefined);
                                    setSelectedGroupMembers([]);
                                    setCustomMobiles(['']);
                                }}
                            >
                                <Radio value="custom">Custom Numbers</Radio>
                                <Radio value="group">Group Members</Radio>
                                <Radio value="all">All Members</Radio>
                            </Radio.Group>
                        </Form.Item>
                    </Col>
                </Row>

                {recipientType === 'custom' && (
                    <div>
                        <Row gutter={12}>
                            {customMobiles.map((mobile, index) => (
                                <Col xs={24} md={12} key={index}>
                                    <Form.Item label={`Mobile #${index + 1}`}>
                                        <Input
                                            value={mobile}
                                            onChange={(e) => {
                                                const newMobiles = [...customMobiles];
                                                newMobiles[index] = e.target.value;
                                                setCustomMobiles(newMobiles);
                                            }}
                                            placeholder="Enter mobile number"
                                        />
                                    </Form.Item>
                                    {customMobiles.length > 1 && (
                                        <Button danger size="small" onClick={() => {
                                            const newMobiles = customMobiles.filter((_, i) => i !== index);
                                            setCustomMobiles(newMobiles);
                                        }}>Remove</Button>
                                    )}
                                </Col>
                            ))}
                        </Row>
                        <Button type="dashed" icon={<PlusOutlined />} onClick={() => setCustomMobiles([...customMobiles, ''])}>
                            Add Another Number
                        </Button>
                    </div>
                )}

                {recipientType === 'group' && (
                    <div>
                        <Form.Item label="Select Group" required>
                            <Select
                                showSearch
                                placeholder={loadingGroups ? 'Loading groups...' : 'Select a group'}
                                value={selectedGroupId}
                                onChange={(val) => setSelectedGroupId(val)}
                                loading={loadingGroups}
                                filterOption={(input, option) => String(option?.children).toLowerCase().includes(input.toLowerCase())}
                            >
                                {groups.map((group: any) => (
                                    <Option key={group.id} value={group.id}>
                                        {group.groupName} ({group.memberCount} members)
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        {(selectedGroupMembers.length > 0 || loadingAllClients) && (
                            <div className="mt-2">
                                <Text>Selected Members ({selectedGroupMembers.length})</Text>
                                <div className="flex flex-wrap gap-2 mt-2 p-2 border rounded-md bg-gray-50">
                                    {selectedGroupMembers.map((member) => (
                                        <Tag
                                            key={member.id}
                                            closable
                                            onClose={() => setSelectedGroupMembers(selectedGroupMembers.filter((m) => m.id !== member.id))}
                                            className="bg-blue-100 text-blue-800 border-blue-300"
                                        >
                                            {member.fullName || 'Member'} ({member.phone})
                                        </Tag>
                                    ))}
                                    {loadingAllClients && <Spin size="small" className="ml-2" />}
                                </div>
                            </div>
                        )}
                    </div>
                )}
                
                <Form.Item
                    name="messageContent"
                    label="Message"
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
    const columns = [
        {
            title: 'Receiver Phone',
            dataIndex: 'mobile',
            key: 'mobile',
            render: (mobile: string) => <Text className="flex items-center"><UserOutlined className="mr-1 text-gray-500" />{mobile}</Text>,
        },
        {
            title: 'Message',
            dataIndex: 'message',
            key: 'message',
            ellipsis: true,
        },
        {
            title: 'Date Sent',
            dataIndex: 'requestTime',
            key: 'requestTime',
            render: (value: string) => (
                <Text type="secondary" className="whitespace-nowrap">
                    <ClockCircleOutlined className="mr-1" />
                    {value ? new Date(value).toLocaleString() : ''}
                </Text>
            ),
        },
    ];

    return (
        <Card className=" border-none">
            <Title level={4} className="flex items-center"><HistoryOutlined className="mr-2 text-orange-500" /> Message History</Title>
            <Text type="secondary" className="block mb-4">A complete log of all outgoing SMS, including delivery status.</Text>

            <DataTable
                apiUrl={APIS.LOAD_SMS}
                columns={columns}
                searchPlaceholder="Search messages..."
            />
        </Card>
    );
};


// ----------------------------------------------------
// 5. ROOT COMPONENT
// ----------------------------------------------------

const SMS: React.FC = () => {
    return (
        <div>
            <PageHeader 
                title="SMS" 
                breadcrumbs={[
                    { title: 'SMS' }
                ]} 
            />
            
            <div className="page-container p-4 min-h-screen bg-gray-50">
            <div className="mt-4">
                {/* Use CollectionSheet tab design: plain Tabs with activeKey state */}
                <Tabs defaultActiveKey="logs">
                    <Tabs.TabPane tab="Logs" key="logs">
                        <LogsTab />
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="Compose" key="compose">
                        <ComposeMessageTab />
                    </Tabs.TabPane>
                </Tabs>
            </div>
            </div>
        </div>
    );
};

export default SMS;