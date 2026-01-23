import React, { useState, useMemo } from 'react';
import { 
    Typography, Card, Tabs, Form, Input, Select, Button, Table, Tag, Row, Col, Space, message, Statistic, Popconfirm, Modal, Tooltip
} from 'antd';
import { 
    CreditCardOutlined, UserOutlined,KeyOutlined, ClockCircleOutlined, DollarCircleOutlined, SwapOutlined, PlusOutlined, DeleteOutlined, FileTextOutlined, LineChartOutlined 
} from '@ant-design/icons';
import PageHeader from '../../components/common/Layout/PageHeader';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { Search, TextArea } = Input;

// ----------------------------------------------------
// 1. DATA STRUCTURES & MOCK DATA
// ----------------------------------------------------

interface SavingsAccount {
    id: number;
    clientName: string;
    clientId: string;
    accountNumber: string;
    balance: number;
    status: 'Active' | 'Dormant' | 'Closed';
    lastActivity: string; // Date
}

interface Transaction {
    id: number;
    accountNumber: string;
    type: 'Deposit' | 'Withdrawal';
    amount: number;
    date: string;
    channel: 'Cash' | 'Mobile Money' | 'Transfer';
    recordedBy: string;
}

// Mock Data
const initialAccounts: SavingsAccount[] = [
    {
        id: 1,
        clientName: 'Alice Johnson',
        clientId: 'C00101',
        accountNumber: 'DP00101A',
        balance: 5500.00,
        status: 'Active',
        lastActivity: '2025-11-20',
    },
    {
        id: 2,
        clientName: 'Bob Smith',
        clientId: 'C00102',
        accountNumber: 'DP00102B',
        balance: 12800.50,
        status: 'Active',
        lastActivity: '2025-11-22',
    },
    {
        id: 3,
        clientName: 'Charlie Brown',
        clientId: 'C00103',
        accountNumber: 'DP00103C',
        balance: 0.00,
        status: 'Dormant',
        lastActivity: '2024-05-15',
    },
];

const initialTransactions: Transaction[] = [
    { id: 101, accountNumber: 'DP00101A', type: 'Deposit', amount: 500.00, date: '2025-11-20', channel: 'Mobile Money', recordedBy: 'System' },
    { id: 102, accountNumber: 'DP00102B', type: 'Deposit', amount: 1000.00, date: '2025-11-22', channel: 'Cash', recordedBy: 'Agent 45' },
    { id: 103, accountNumber: 'DP00101A', type: 'Withdrawal', amount: 200.00, date: '2025-11-18', channel: 'Cash', recordedBy: 'Teller 12' },
];

const CURRENCY = 'Ksh'; // Using the currency from the user's previous context

// ----------------------------------------------------
// 2. OVERVIEW AND ACCOUNTS TAB
// ----------------------------------------------------

interface OverviewTabProps {
    accounts: SavingsAccount[];
    setAccounts: React.Dispatch<React.SetStateAction<SavingsAccount[]>>;
    onNewTransaction: (accountNumber: string, type: 'Deposit' | 'Withdrawal') => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ accounts, setAccounts, onNewTransaction }) => {
    const [searchText, setSearchText] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // --- Metrics ---
    const totalBalance = useMemo(() => 
        accounts.reduce((sum, account) => sum + account.balance, 0), [accounts]
    );

    const activeAccountsCount = useMemo(() => 
        accounts.filter(acc => acc.status === 'Active').length, [accounts]
    );

    // --- Table Logic ---
    const filteredAccounts = useMemo(() => {
        if (!searchText) return accounts;
        return accounts.filter(acc => 
            acc.clientName.toLowerCase().includes(searchText.toLowerCase()) ||
            acc.accountNumber.toLowerCase().includes(searchText.toLowerCase())
        );
    }, [accounts, searchText]);

    const handleDelete = (id: number) => {
        setAccounts(prev => prev.filter(acc => acc.id !== id));
        message.success(`Account ${id} closed successfully.`);
    };

    const columns = [
        {
            title: 'Client',
            dataIndex: 'clientName',
            key: 'clientName',
            render: (text: string, record: SavingsAccount) => (
                <Text strong className="flex items-center"><UserOutlined className="mr-1 text-blue-500" />{text} <Text type="secondary" className="ml-2 text-xs">({record.clientId})</Text></Text>
            ),
            sorter: (a: SavingsAccount, b: SavingsAccount) => a.clientName.localeCompare(b.clientName),
        },
        {
            title: 'Account No.',
            dataIndex: 'accountNumber',
            key: 'accountNumber',
            render: (text: string) => <Tag icon={<CreditCardOutlined />} color="processing">{text}</Tag>,
        },
        {
            title: 'Balance',
            dataIndex: 'balance',
            key: 'balance',
            align: 'right' as const,
            render: (balance: number) => <Text className="text-lg font-mono">{CURRENCY} {balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>,
            sorter: (a: SavingsAccount, b: SavingsAccount) => a.balance - b.balance,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            align: 'center' as const,
            render: (status: string) => (
                <Tag color={status === 'Active' ? 'green' : (status === 'Dormant' ? 'orange' : 'red')}>{status}</Tag>
            ),
        },
        {
            title: 'Last Activity',
            dataIndex: 'lastActivity',
            key: 'lastActivity',
            render: (date: string) => <Text type="secondary" className="whitespace-nowrap"><ClockCircleOutlined className="mr-1" />{date}</Text>,
        },
        {
            title: 'Action',
            key: 'action',
            align: 'center' as const,
            render: (_: any, record: SavingsAccount) => (
                <Space size="small">
                    <Tooltip title="Record Deposit">
                        <Button 
                            icon={<PlusOutlined />} 
                            size="small" 
                            onClick={() => onNewTransaction(record.accountNumber, 'Deposit')} 
                            type="primary" 
                            ghost 
                        />
                    </Tooltip>
                    <Tooltip title="Record Withdrawal">
                         <Button 
                            icon={<SwapOutlined />} 
                            size="small" 
                            onClick={() => onNewTransaction(record.accountNumber, 'Withdrawal')} 
                            danger 
                            ghost 
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Are you sure to close this account?"
                        description="Closing a savings account is irreversible."
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes, Close"
                        cancelText="No"
                    >
                        <Button icon={<DeleteOutlined />} size="small" danger />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <Card className="shadow-inner border-none">
            <Row gutter={16} className="mb-6">
                <Col xs={24} md={8}>
                    <Card bordered={false} className="bg-blue-50 hover:shadow-md transition-shadow">
                        <Statistic
                            title="Total Down Payment Funds"
                            value={totalBalance}
                            precision={2}
                            prefix={CURRENCY}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card bordered={false} className="bg-green-50 hover:shadow-md transition-shadow">
                        <Statistic
                            title="Active Accounts"
                            value={activeAccountsCount}
                            suffix="/ {accounts.length}"
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card bordered={false} className="bg-yellow-50 hover:shadow-md transition-shadow">
                        <Statistic
                            title="Average Savings"
                            value={accounts.length > 0 ? totalBalance / accounts.length : 0}
                            precision={2}
                            prefix={CURRENCY}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Title level={4} className="flex items-center"><FileTextOutlined className="mr-2 text-gray-700" /> Account List</Title>

            <Row justify="space-between" align="middle" className="mb-4">
                <Col span={12}>
                    <Search
                        placeholder="Search by client name or account number..."
                        allowClear
                        onSearch={setSearchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: 300 }}
                    />
                </Col>
                <Col>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
                        Open New Account
                    </Button>
                </Col>
            </Row>

            <Table 
                columns={columns} 
                dataSource={filteredAccounts}
                rowKey="id"
                pagination={{ pageSize: 5 }}
                size="middle"
                bordered
                className="rounded-lg overflow-hidden"
            />

            <Modal
                title="Open New Down Payment Account"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
            >
                <NewAccountForm setAccounts={setAccounts} closeModal={() => setIsModalOpen(false)} />
            </Modal>
        </Card>
    );
};

// ----------------------------------------------------
// 3. TRANSACTION FORM TAB
// ----------------------------------------------------

interface TransactionFormTabProps {
    accounts: SavingsAccount[];
    setAccounts: React.Dispatch<React.SetStateAction<SavingsAccount[]>>;
    defaultAccountNumber: string | undefined;
    defaultTransactionType: 'Deposit' | 'Withdrawal' | undefined;
    setTransactionDefaults: (accountNumber?: string, type?: 'Deposit' | 'Withdrawal') => void;
}

const TransactionFormTab: React.FC<TransactionFormTabProps> = ({ 
    accounts, 
    setAccounts, 
    defaultAccountNumber, 
    defaultTransactionType,
    setTransactionDefaults
}) => {
    const [form] = Form.useForm();
    
    // Set defaults when component mounts or defaults change
    React.useEffect(() => {
        if (defaultAccountNumber || defaultTransactionType) {
            form.setFieldsValue({
                accountNumber: defaultAccountNumber,
                transactionType: defaultTransactionType
            });
            // Clear defaults after setting
            setTransactionDefaults(undefined, undefined);
        }
    }, [defaultAccountNumber, defaultTransactionType, form, setTransactionDefaults]);


    const onFinish = (values: any) => {
        const { accountNumber, transactionType, amount } = values;
        const accountIndex = accounts.findIndex(acc => acc.accountNumber === accountNumber);

        if (accountIndex === -1) {
            message.error('Selected account not found.');
            return;
        }

        const currentAccount = accounts[accountIndex];
        let newBalance = currentAccount.balance;

        if (transactionType === 'Withdrawal' && amount > currentAccount.balance) {
            message.error(`Insufficient funds. Max withdrawal: ${CURRENCY} ${currentAccount.balance.toLocaleString('en-US')}`);
            return;
        }

        if (transactionType === 'Deposit') {
            newBalance += amount;
        } else {
            newBalance -= amount;
        }

        // Update Account
        setAccounts(prevAccounts => {
            const newAccounts = [...prevAccounts];
            newAccounts[accountIndex] = {
                ...currentAccount,
                balance: newBalance,
                lastActivity: new Date().toISOString().slice(0, 10),
                status: newBalance > 0 ? 'Active' : 'Dormant',
            };
            return newAccounts;
        });

        message.success(`${transactionType} of ${CURRENCY} ${amount.toLocaleString('en-US')} successful for account ${accountNumber}. New Balance: ${CURRENCY} ${newBalance.toLocaleString('en-US')}`);
        form.resetFields();
    };

    return (
        <Card className="shadow-inner border-none">
            <Title level={4} className="flex items-center"><DollarCircleOutlined className="mr-2 text-teal-600" /> Record Transaction</Title>
            <Text type="secondary" className="block mb-4">Manually log a deposit or withdrawal against a client's down payment account.</Text>
            
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{ transactionType: 'Deposit', channel: 'Cash' }}
            >
                <Row gutter={24}>
                    <Col xs={24} lg={12}>
                        <Form.Item
                            name="accountNumber"
                            label="Client Account"
                            rules={[{ required: true, message: 'Please select an account' }]}
                        >
                            <Select size="large" showSearch placeholder="Select client down payment account">
                                {accounts.map(acc => (
                                    <Option key={acc.accountNumber} value={acc.accountNumber}>
                                        {acc.clientName} - {acc.accountNumber} ({CURRENCY} {acc.balance.toLocaleString('en-US')})
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col xs={24} lg={12}>
                        <Form.Item
                            name="transactionType"
                            label="Transaction Type"
                            rules={[{ required: true, message: 'Please select type' }]}
                        >
                            <Select size="large" placeholder="Deposit or Withdrawal">
                                <Option value="Deposit">Deposit (Inflow)</Option>
                                <Option value="Withdrawal">Withdrawal (Outflow)</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={24}>
                    <Col xs={24} lg={12}>
                        <Form.Item
                            name="amount"
                            label={`Amount (${CURRENCY})`}
                            rules={[{ required: true, message: 'Please enter the amount' }, { type: 'number', min: 1, message: 'Must be a positive number' }]}
                        >
                            <Input size="large" type="number" step="0.01" placeholder="Enter amount" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} lg={12}>
                        <Form.Item
                            name="channel"
                            label="Channel"
                            rules={[{ required: true, message: 'Please select the channel' }]}
                        >
                            <Select size="large" placeholder="Method of payment">
                                <Option value="Cash">Cash</Option>
                                <Option value="Mobile Money">Mobile Money (M-Pesa, etc.)</Option>
                                <Option value="Transfer">Bank Transfer</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                
                <Form.Item
                    name="notes"
                    label="Internal Notes"
                >
                    <TextArea rows={2} placeholder="Add any relevant notes or reference numbers." />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" size="large" icon={<SwapOutlined />}>
                        Record Transaction
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};


// ----------------------------------------------------
// 4. NEW ACCOUNT FORM (Modal Content)
// ----------------------------------------------------

interface NewAccountFormProps {
    setAccounts: React.Dispatch<React.SetStateAction<SavingsAccount[]>>;
    closeModal: () => void;
}

const NewAccountForm: React.FC<NewAccountFormProps> = ({ setAccounts, closeModal }) => {
    const [form] = Form.useForm();

    const onFinish = (values: any) => {
        const newAccount: SavingsAccount = {
            id: Date.now(), // Simple unique ID
            clientName: values.clientName,
            clientId: values.clientId,
            accountNumber: `DP${Math.floor(Math.random() * 90000) + 10000}`, // Mock generated number
            balance: values.initialDeposit || 0,
            status: values.initialDeposit > 0 ? 'Active' : 'Dormant',
            lastActivity: new Date().toISOString().slice(0, 10),
        };

        setAccounts(prev => [...prev, newAccount]);
        message.success(`New Down Payment Account created for ${newAccount.clientName}!`);
        closeModal();
    };

    return (
        <Form form={form} layout="vertical" onFinish={onFinish} className="mt-4">
            <Form.Item
                name="clientName"
                label="Client Full Name"
                rules={[{ required: true, message: 'Please enter client name' }]}
            >
                <Input prefix={<UserOutlined />} size="large" placeholder="E.g., Fatuma Rumbe Mohammed" />
            </Form.Item>
            
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item
                        name="clientId"
                        label="Client ID / National ID"
                        rules={[{ required: true, message: 'Please enter client ID' }]}
                    >
                        <Input prefix={<KeyOutlined />} placeholder="e.g. 12345678" />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        name="initialDeposit"
                        label={`Initial Deposit (${CURRENCY})`}
                        initialValue={0}
                        rules={[{ type: 'number', min: 0, message: 'Must be a non-negative number' }]}
                    >
                        <Input type="number" step="0.01" placeholder="Initial deposit amount" />
                    </Form.Item>
                </Col>
            </Row>
            
            <Form.Item className="mt-4">
                <Button type="primary" htmlType="submit" size="large" block>
                    Create Account
                </Button>
            </Form.Item>
        </Form>
    );
};


// ----------------------------------------------------
// 5. ROOT COMPONENT
// ----------------------------------------------------

const DownPayments: React.FC = () => {
    const [accounts, setAccounts] = useState<SavingsAccount[]>(initialAccounts);
    const [activeTab, setActiveTab] = useState('overview');
    const [transactionDefaults, setTransactionDefaults] = useState<{ accountNumber?: string, type?: 'Deposit' | 'Withdrawal' }>({});

    const handleNewTransaction = (accountNumber: string, type: 'Deposit' | 'Withdrawal') => {
        setTransactionDefaults({ accountNumber, type });
        setActiveTab('transaction');
    };

    return (
        <div>
            <PageHeader 
                title="Down Payments" 
                breadcrumbs={[
                    { title: 'Down Payments' }
                ]} 
            />
            
            <div className="page-container p-4 min-h-screen bg-gray-50">
                <Title level={2} className="text-gray-800">
                    ⬇️ Down Payments & Client Savings <LineChartOutlined style={{ color: '#888' }} />
                </Title>
                <Text type="secondary">
                    Manage and monitor all **client down payments** or dedicated savings held as collateral or equity.
                </Text>

            <div className="mt-4">
                <Tabs 
                    defaultActiveKey="overview" 
                    type="card" 
                    size="large" 
                    activeKey={activeTab}
                    onChange={setActiveTab}
                >
                    <TabPane 
                        tab={<span className="flex items-center"><FileTextOutlined /> Overview & Accounts</span>} 
                        key="overview"
                    >
                        <OverviewTab 
                            accounts={accounts} 
                            setAccounts={setAccounts} 
                            onNewTransaction={handleNewTransaction}
                        />
                    </TabPane>
                    <TabPane 
                        tab={<span className="flex items-center"><SwapOutlined /> Record Transaction</span>} 
                        key="transaction"
                    >
                        <TransactionFormTab 
                            accounts={accounts} 
                            setAccounts={setAccounts} 
                            defaultAccountNumber={transactionDefaults.accountNumber}
                            defaultTransactionType={transactionDefaults.type}
                            setTransactionDefaults={(accNum, type) => setTransactionDefaults({ accountNumber: accNum, type })}
                        />
                    </TabPane>
                </Tabs>
            </div>
            </div>
        </div>
    );
};

export default DownPayments;