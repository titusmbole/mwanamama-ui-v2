import React, { useState, useMemo } from 'react';
import { 
    Typography, Card, Form, Input, Select, Button, Table, Tag, Row, Col, Statistic, message
} from 'antd';
import { 
    TeamOutlined, DollarCircleOutlined, CheckCircleOutlined, HistoryOutlined, WalletOutlined, QrcodeOutlined 
} from '@ant-design/icons';
import PageHeader from '../../components/common/Layout/PageHeader';

const { Title, Text } = Typography;
const { Option } = Select;

const CURRENCY = 'Ksh';

// ----------------------------------------------------
// 1. DATA STRUCTURES & MOCK DATA (Group Specific)
// ----------------------------------------------------

// Simplified LoanAccount for reference in payments
interface LoanAccountRef {
    accountNumber: string;
    clientName: string;
}

interface Group {
    id: number;
    groupName: string;
    loanAccountNumber: string; // The loan this group is paying towards
    currentBalance: number; // The total DDA balance held by the group
    status: 'Active' | 'Inactive';
}

interface GroupPayment {
    id: number;
    groupName: string;
    amount: number;
    date: string;
    status: 'Processed'; // Payments are now immediately processed upon receipt
    description: string;
    transactionId: string; // New field to simulate M-Pesa transaction
}

// Mock Data
const mockLoanAccounts: LoanAccountRef[] = [
    { accountNumber: 'LN001A', clientName: 'Alice Johnson (Group Lead)' },
    { accountNumber: 'LN003C', clientName: 'Charlie Brown (Group Lead)' },
];

const initialGroups: Group[] = [
    { 
        id: 101, 
        groupName: 'Truetana Investment Group', 
        loanAccountNumber: 'LN001A', 
        currentBalance: 15000.00, 
        status: 'Active' 
    },
    { 
        id: 102, 
        groupName: 'Unity Sacco', 
        loanAccountNumber: 'LN003C', 
        currentBalance: 500.00, 
        status: 'Active' 
    },
];

const initialGroupPayments: GroupPayment[] = [
    { id: 1, groupName: 'Truetana Investment Group', amount: 10000, date: '2025-11-20', status: 'Processed', description: 'Monthly collection', transactionId: 'RDT5J9A' },
    { id: 2, groupName: 'Unity Sacco', amount: 500, date: '2025-11-15', status: 'Processed', description: 'Weekly contribution', transactionId: 'SFA8B2Q' },
];

// ----------------------------------------------------
// 2. HELPER FUNCTIONS
// ----------------------------------------------------

const formatCurrency = (amount: number) => {
    return `${CURRENCY} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
};

const getPaymentStatusTag = (status: GroupPayment['status']) => {
    // Only "Processed" exists now
    return <Tag color="green" icon={<CheckCircleOutlined />}>{status}</Tag>;
};

// Simple mock for M-Pesa transaction ID
const generateMockMpesaId = () => {
    return 'MPESA' + Math.random().toString(36).substring(2, 8).toUpperCase();
};

// ----------------------------------------------------
// 3. MAIN COMPONENT (Group Payments)
// ----------------------------------------------------

const GroupPaymentModule: React.FC = () => {
    const [groups, setGroups] = useState<Group[]>(initialGroups);
    const [payments, setPayments] = useState<GroupPayment[]>(initialGroupPayments);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    /**
     * Simulates an automatic M-Pesa/Paybill deposit being recorded and processed.
     */
    const handleSimulateAutoPayment = (values: { groupName: string, amount: number, description: string }) => {
        setLoading(true);
        const group = groups.find(g => g.groupName === values.groupName);

        if (!group) {
            message.error('Group not found.');
            setLoading(false);
            return;
        }

        setTimeout(() => {
            const newPayment: GroupPayment = {
                id: payments.length + 1,
                groupName: values.groupName,
                amount: values.amount,
                date: new Date().toISOString().slice(0, 10),
                status: 'Processed', // Payment is immediately processed (funds received)
                description: values.description || 'Auto M-Pesa Deposit',
                transactionId: generateMockMpesaId(),
            };

            setPayments(prev => [newPayment, ...prev]);

            // Funds are automatically added to the Group's DDA balance
            setGroups(prevGroups => prevGroups.map(g => 
                g.id === group.id ? { ...g, currentBalance: g.currentBalance + values.amount } : g
            ));

            message.success(`AUTO-PROCESSED: ${formatCurrency(values.amount)} received for ${values.groupName}. Funds added to DDA.`);
            form.resetFields();
            setLoading(false);
        }, 1000);
    };
    
    // --- Table Columns ---

    const paymentColumns = [
        {
            title: 'Group Name',
            dataIndex: 'groupName',
            key: 'groupName',
            render: (text: string) => <Text strong>{text}</Text>,
        },
        {
            title: 'M-Pesa ID',
            dataIndex: 'transactionId',
            key: 'transactionId',
            render: (text: string) => <Tag color="blue">{text}</Tag>
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            align: 'right' as const,
            render: (amount: number) => <Text className="text-green-600 font-mono">{formatCurrency(amount)}</Text>,
            sorter: (a: GroupPayment, b: GroupPayment) => a.amount - b.amount,
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            align: 'center' as const,
            render: getPaymentStatusTag,
        },
    ];

    const groupColumns = [
        { title: 'Group Name', dataIndex: 'groupName', key: 'groupName' },
        { title: 'Loan Account', dataIndex: 'loanAccountNumber', key: 'loanAccountNumber', render: (text: string) => <Tag color="processing">{text}</Tag> },
        { title: 'DDA Balance', dataIndex: 'currentBalance', key: 'currentBalance', align: 'right' as const, render: (balance: number) => <Text strong>{formatCurrency(balance)}</Text> },
        { title: 'Status', dataIndex: 'status', key: 'status', render: (status: Group['status']) => <Tag color={status === 'Active' ? 'blue' : 'default'}>{status}</Tag> },
    ];


    return (
        <div>
            <PageHeader 
                title="All Payments" 
                breadcrumbs={[
                    { title: 'All Payments' }
                ]} 
            />
            
            <div className="page-container p-4 min-h-screen bg-gray-50">
                <Title level={2} className="text-gray-800">
                    <TeamOutlined style={{ marginRight: 10 }} /> Group Collections (Automated)
                </Title>
                <Text type="secondary">
                    Simulates automatic receipt and processing of funds via M-Pesa/Paybill integration. Funds are immediately reflected in the Group's DDA balance.
                </Text>

            <Row gutter={24} className="mt-6">
                
                {/* --- Left Column: Simulate Auto Payment --- */}
                <Col xs={24} lg={8}>
                    <Card 
                        title={<Title level={4}><QrcodeOutlined /> Simulate M-Pesa Deposit</Title>} 
                        className="shadow-md border-green-300 border-2"
                    >
                        <Text type="warning" strong block className="mb-3">
                            This simulates a successful deposit via the integrated Paybill number.
                        </Text>
                        <Form 
                            form={form} 
                            layout="vertical" 
                            onFinish={handleSimulateAutoPayment}
                        >
                            <Form.Item
                                name="groupName"
                                label="Receiving Group"
                                rules={[{ required: true, message: 'Please select a group' }]}
                            >
                                <Select showSearch placeholder="Select group matching the customer's phone number">
                                    {groups.map(g => (
                                        <Option key={g.id} value={g.groupName}>
                                            {g.groupName} (Loan: {g.loanAccountNumber})
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item
                                name="amount"
                                label={`Amount Deposited (${CURRENCY})`}
                                rules={[{ required: true, message: 'Enter amount' }, { type: 'number', min: 1, message: 'Must be a positive number' }]}
                                getValueProps={(value) => ({ value: value })}
                                getValueFromEvent={(e) => {
                                    const parsed = parseFloat(e.target.value);
                                    return isNaN(parsed) ? e.target.value : parsed;
                                }}
                            >
                                <Input type="number" prefix={CURRENCY} />
                            </Form.Item>
                            <Form.Item name="description" label="Payment Source/Description">
                                <Input.TextArea rows={2} placeholder="e.g., Jane Doe, M-Pesa transfer" />
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit" loading={loading} block icon={<WalletOutlined />} className="bg-green-500 hover:bg-green-600 border-none">
                                    Simulate Successful Deposit
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>

                {/* --- Right Column: Group Balances --- */}
                <Col xs={24} lg={16}>
                    <Card title={<Title level={4}><DollarCircleOutlined /> Group DDA Balances</Title>} className="shadow-md h-full">
                        <Table
                            columns={groupColumns}
                            dataSource={groups}
                            rowKey="id"
                            pagination={false}
                            size="small"
                        />
                    </Card>
                </Col>
            </Row>

            {/* --- Payments History Table --- */}
            <Card title={<Title level={4} className="mt-4"><HistoryOutlined /> Automated Payments Log</Title>} className="shadow-md mt-6">
                <Table
                    columns={paymentColumns}
                    dataSource={payments}
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                    size="middle"
                    bordered
                />
            </Card>
            </div>
        </div>
    );
};

export default GroupPaymentModule;