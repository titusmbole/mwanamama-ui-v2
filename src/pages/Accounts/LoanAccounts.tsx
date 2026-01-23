import React, { useState, useMemo } from 'react';
import { 
    Typography, Card, Tabs, Form, Input, Select, Button, Table, Tag, Row, Col, Space, message, Statistic, Modal, Tooltip, Progress, Popconfirm
} from 'antd';
import { 
    DollarCircleOutlined, UserOutlined, ClockCircleOutlined, SwapOutlined, SearchOutlined, LineChartOutlined, CheckCircleOutlined, CloseCircleOutlined, HistoryOutlined, SendOutlined, WalletOutlined
} from '@ant-design/icons';
import PageHeader from '../../components/common/Layout/PageHeader';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { Search } = Input;

const CURRENCY = 'Ksh';

// ----------------------------------------------------
// 1. DATA STRUCTURES & MOCK DATA
// ----------------------------------------------------

interface LoanAccount {
    id: number;
    clientName: string;
    accountNumber: string;
    clientId: string;
    principal: number;
    interestRate: number;
    termMonths: number;
    disbursementDate: string;
    nextRepaymentDate: string;
    outstandingBalance: number;
    status: 'Active' | 'Closed' | 'Defaulted' | 'Arrears';
    ddaBalance: number; // Drawdown Account Balance
    group: 'Grace Group' | 'Amani Group' | 'Individual'; // ADDED: Group field for filtering
}

interface RepaymentScheduleItem {
    id: number;
    loanAccountNumber: string;
    dueDate: string;
    principalDue: number;
    interestDue: number;
    installmentDue: number;
    status: 'Paid' | 'Pending' | 'Overdue';
}

// Mock Data updated with the 'group' field
const initialLoanAccounts: LoanAccount[] = [
    {
        id: 1, clientName: 'Alice Johnson', accountNumber: 'LN001A', clientId: 'C00101',
        principal: 100000.00, interestRate: 15, termMonths: 12, disbursementDate: '2025-01-01',
        nextRepaymentDate: '2025-12-01', outstandingBalance: 35000.00, status: 'Active', ddaBalance: 15000.00,
        group: 'Grace Group' // MOCK DATA: Assigned Group
    },
    {
        id: 2, clientName: 'Bob Smith', accountNumber: 'LN002B', clientId: 'C00102',
        principal: 50000.00, interestRate: 12, termMonths: 6, disbursementDate: '2025-06-15',
        nextRepaymentDate: '2025-12-15', outstandingBalance: 5000.00, status: 'Arrears', ddaBalance: 0.00,
        group: 'Amani Group' // MOCK DATA: Assigned Group
    },
    {
        id: 3, clientName: 'Charlie Brown', accountNumber: 'LN003C', clientId: 'C00103',
        principal: 200000.00, interestRate: 10, termMonths: 24, disbursementDate: '2024-03-01',
        nextRepaymentDate: '2025-12-01', outstandingBalance: 110000.00, status: 'Active', ddaBalance: 500.00,
        group: 'Grace Group' // MOCK DATA: Assigned Group
    },
    {
        id: 4, clientName: 'Diana Prince', accountNumber: 'LN004D', clientId: 'C00104',
        principal: 20000.00, interestRate: 18, termMonths: 3, disbursementDate: '2025-08-01',
        nextRepaymentDate: '2025-11-01', outstandingBalance: 0.00, status: 'Closed', ddaBalance: 0.00,
        group: 'Individual' // MOCK DATA: Assigned Group
    },
];

const initialRepaymentSchedule: RepaymentScheduleItem[] = [
    { id: 1, loanAccountNumber: 'LN001A', dueDate: '2025-10-01', principalDue: 7500, interestDue: 2500, installmentDue: 10000, status: 'Paid' },
    { id: 2, loanAccountNumber: 'LN001A', dueDate: '2025-11-01', principalDue: 8000, interestDue: 2000, installmentDue: 10000, status: 'Paid' },
    { id: 3, loanAccountNumber: 'LN001A', dueDate: '2025-12-01', principalDue: 8500, interestDue: 1500, installmentDue: 10000, status: 'Pending' },
    
    { id: 4, loanAccountNumber: 'LN002B', dueDate: '2025-10-15', principalDue: 4000, interestDue: 1000, installmentDue: 5000, status: 'Overdue' },
    { id: 5, loanAccountNumber: 'LN002B', dueDate: '2025-11-15', principalDue: 4000, interestDue: 1000, installmentDue: 5000, status: 'Pending' },
];

// ----------------------------------------------------
// GLOBAL HELPER FUNCTION
// ----------------------------------------------------

/**
 * Renders an Ant Design Tag based on the loan status.
 */
const getStatusTag = (status: LoanAccount['status']) => {
    switch (status) {
        case 'Active': return <Tag color="blue" icon={<CheckCircleOutlined />}>{status}</Tag>;
        case 'Closed': return <Tag color="default">{status}</Tag>;
        case 'Arrears': return <Tag color="warning" icon={<ClockCircleOutlined />}>{status}</Tag>;
        case 'Defaulted': return <Tag color="error" icon={<CloseCircleOutlined />}>{status}</Tag>;
        default: return <Tag>{status}</Tag>;
    }
};

const formatCurrency = (amount: number) => {
    return `${CURRENCY} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
};

// ----------------------------------------------------
// 2. OVERVIEW TAB
// ----------------------------------------------------

interface OverviewTabProps {
    accounts: LoanAccount[];
    setActiveTab: (key: string) => void;
    setSelectedLoanAccount: (accountNumber: string) => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ accounts, setActiveTab, setSelectedLoanAccount }) => {
    const [searchText, setSearchText] = useState('');
    // RENAMED state to groupFilter for clarity, as it controls the group selection
    const [groupFilter, setGroupFilter] = useState<string | undefined>(undefined); 

    // --- Metrics ---
    const activeLoans = accounts.filter(acc => acc.status === 'Active' || acc.status === 'Arrears');
    const totalPortfolioValue = useMemo(() => 
        accounts.reduce((sum, acc) => sum + acc.outstandingBalance, 0), [accounts]
    );

    const arrearsLoans = accounts.filter(acc => acc.status === 'Arrears' || acc.status === 'Defaulted');
    // Calculate default rate based on active loans only
    const defaultRate = (arrearsLoans.length / activeLoans.length) * 100 || 0;

    // --- Table Logic ---
    const filteredAccounts = useMemo(() => {
        let list = accounts;
        
        // 1. Filter by Search Text
        if (searchText) {
            list = list.filter(acc => 
                acc.clientName.toLowerCase().includes(searchText.toLowerCase()) ||
                acc.accountNumber.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        // 2. Filter by Group (CORRECTED LOGIC)
        if (groupFilter && groupFilter !== 'All' && groupFilter !== 'Choose Group') {
            list = list.filter(acc => acc.group === groupFilter);
        }

        return list;
    }, [accounts, searchText, groupFilter]);

    const columns = [
        {
            title: 'Client',
            dataIndex: 'clientName',
            key: 'clientName',
            render: (text: string, record: LoanAccount) => (
                <Text strong className="flex items-center"><UserOutlined className="mr-1 text-blue-500" />{text}</Text>
            ),
            sorter: (a: LoanAccount, b: LoanAccount) => a.clientName.localeCompare(b.clientName),
        },
        {
            title: 'Account No.',
            dataIndex: 'accountNumber',
            key: 'accountNumber',
            render: (text: string) => <Tag color="processing">{text}</Tag>,
        },
        {
            title: 'Outstanding Balance',
            dataIndex: 'outstandingBalance',
            key: 'outstandingBalance',
            align: 'right' as const,
            render: (balance: number) => <Text className="font-mono">{formatCurrency(balance)}</Text>,
            sorter: (a: LoanAccount, b: LoanAccount) => a.outstandingBalance - b.outstandingBalance,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            align: 'center' as const,
            render: getStatusTag,
        },
        {
            title: 'Group', // ADDED: Display Group column
            dataIndex: 'group',
            key: 'group',
            align: 'center' as const,
            render: (group: LoanAccount['group']) => <Tag color="volcano">{group}</Tag>,
        },
        {
            title: 'Next Repayment',
            dataIndex: 'nextRepaymentDate',
            key: 'nextRepaymentDate',
            render: (date: string) => <Text type="secondary" className="whitespace-nowrap"><ClockCircleOutlined className="mr-1" />{date}</Text>,
        },
        {
            title: 'DDA Balance',
            dataIndex: 'ddaBalance',
            key: 'ddaBalance',
            align: 'right' as const,
            render: (ddaBalance: number) => <Text className="text-green-600 font-mono">{formatCurrency(ddaBalance)}</Text>,
        },
        {
            title: 'Action',
            key: 'action',
            align: 'center' as const,
            render: (_: any, record: LoanAccount) => (
                <Tooltip title="View Schedule & DDA Status">
                    <Button 
                        icon={<HistoryOutlined />} 
                        size="small" 
                        onClick={() => {
                            setSelectedLoanAccount(record.accountNumber);
                            setActiveTab('repayments');
                        }} 
                        type="default"
                    >
                        View
                    </Button>
                </Tooltip>
            ),
        },
    ];

    return (
        <Card className="shadow-inner border-none">
            <Row gutter={16} className="mb-6">
                <Col xs={24} md={8}>
                    <Card bordered={false} className="bg-blue-50 hover:shadow-md transition-shadow">
                        <Statistic
                            title="Total Outstanding Portfolio"
                            value={totalPortfolioValue}
                            precision={2}
                            prefix={CURRENCY}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card bordered={false} className="bg-green-50 hover:shadow-md transition-shadow">
                        <Statistic
                            title="Active Loans"
                            value={activeLoans.length}
                            suffix={`/ ${accounts.length}`}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card bordered={false} className={`hover:shadow-md transition-shadow ${defaultRate > 5 ? 'bg-red-50' : 'bg-yellow-50'}`}>
                        <Statistic
                            title="Default/Arrears Rate"
                            value={defaultRate}
                            precision={2}
                            suffix="%"
                            valueStyle={{ color: defaultRate > 5 ? '#f5222d' : '#faad14' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Title level={4} className="flex items-center"><HistoryOutlined className="mr-2 text-gray-700" /> Loan Account List</Title>

            <Row gutter={16} align="middle" className="mb-4">
                <Col xs={24} md={10}>
                    <Search
                        placeholder="Search by client name or account number..."
                        allowClear
                        onSearch={setSearchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: '100%' }}
                    />
                </Col>
                <Col xs={24} md={6}>
                     <Select
                        placeholder="Filter by Group" // Updated Placeholder
                        allowClear
                        style={{ width: '100%' }}
                        onChange={setGroupFilter} // Updated Setter
                        defaultValue="All"
                    >
                        <Option value="All">All Groups</Option>
                        <Option value="Grace Group">Grace Group</Option>
                        <Option value="Amani Group">Amani Group</Option>
                        <Option value="Individual">Individual Loans</Option> {/* Added for completeness */}
                    </Select>
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
        </Card>
    );
};

// ----------------------------------------------------
// 3. REPAYMENT STATUS & DDA TAB
// ----------------------------------------------------

interface RepaymentTabProps {
    accounts: LoanAccount[];
    schedules: RepaymentScheduleItem[];
    selectedLoanAccount: string | undefined;
    setSelectedLoanAccount: (accountNumber: string) => void;
    setAccounts: React.Dispatch<React.SetStateAction<LoanAccount[]>>;
    setSchedules: React.Dispatch<React.SetStateAction<RepaymentScheduleItem[]>>;
}

// 3.1 Repayment Processing Modal
interface RepaymentModalProps {
    visible: boolean;
    onClose: () => void;
    currentLoan: LoanAccount;
    nextInstallment: RepaymentScheduleItem;
    setAccounts: React.Dispatch<React.SetStateAction<LoanAccount[]>>;
    setSchedules: React.Dispatch<React.SetStateAction<RepaymentScheduleItem[]>>;
}

const RepaymentProcessingModal: React.FC<RepaymentModalProps> = ({ 
    visible, onClose, currentLoan, nextInstallment, setAccounts, setSchedules
}) => {
    const [loading, setLoading] = useState(false);
    const repaymentAmount = nextInstallment.installmentDue;
    const ddaBalance = currentLoan.ddaBalance;
    const isReadyForDeduction = ddaBalance >= repaymentAmount;

    const handleProcessPayment = () => {
        if (!isReadyForDeduction) {
            message.error('Insufficient DDA balance to cover the full installment.');
            return;
        }

        setLoading(true);

        // Simulate API call delay
        setTimeout(() => {
            // 1. Update Loan Account (DDA Balance & Outstanding Balance)
            setAccounts(prevAccounts => prevAccounts.map(acc => {
                if (acc.accountNumber === currentLoan.accountNumber) {
                    const newDdaBalance = acc.ddaBalance - repaymentAmount;
                    const newOutstandingBalance = acc.outstandingBalance - nextInstallment.principalDue;
                    
                    // Simple check if loan is paid off (in a real system, status change logic is complex)
                    const newStatus: LoanAccount['status'] = newOutstandingBalance <= 0.01 ? 'Closed' : acc.status;

                    return {
                        ...acc,
                        ddaBalance: newDdaBalance,
                        outstandingBalance: newOutstandingBalance,
                        status: newStatus,
                    };
                }
                return acc;
            }));

            // 2. Update Repayment Schedule
            setSchedules(prevSchedules => prevSchedules.map(item => {
                if (item.id === nextInstallment.id) {
                    return { ...item, status: 'Paid' as const };
                }
                return item;
            }));

            message.success(`Successfully processed repayment of ${formatCurrency(repaymentAmount)} for ${currentLoan.accountNumber}.`);
            setLoading(false);
            onClose();
        }, 1500);
    };

    return (
        <Modal
            title={<Title level={4}><WalletOutlined /> Process Repayment</Title>}
            open={visible}
            onCancel={onClose}
            footer={[
                <Button key="back" onClick={onClose}>Cancel</Button>,
                <Button 
                    key="submit" 
                    type="primary" 
                    icon={<SendOutlined />}
                    loading={loading}
                    onClick={handleProcessPayment}
                    disabled={!isReadyForDeduction}
                >
                    Confirm Deduction
                </Button>,
            ]}
        >
            <p className="mb-4">
                You are about to deduct a repayment installment from the client's Drawdown Account (DDA).
            </p>
            <Card className="bg-blue-50 border-blue-200">
                <Row gutter={[16, 16]}>
                    <Col span={12}>
                        <Statistic title="Current DDA Balance" value={ddaBalance} prefix={CURRENCY} valueStyle={{ color: '#1890ff' }} />
                    </Col>
                    <Col span={12}>
                        <Statistic title="Installment Amount Due" value={repaymentAmount} prefix={CURRENCY} valueStyle={{ color: '#faad14' }} />
                    </Col>
                </Row>
                <div className="mt-4">
                    <Text strong>Remaining DDA Balance:</Text> {formatCurrency(ddaBalance - repaymentAmount)}
                </div>
            </Card>
            <p className="mt-4 text-sm text-red-600">
                Note: This action is irreversible. The loan's outstanding balance will be reduced by the principal amount.
            </p>
        </Modal>
    );
};


const RepaymentStatusTab: React.FC<RepaymentTabProps> = ({ 
    accounts, 
    schedules, 
    selectedLoanAccount,
    setSelectedLoanAccount,
    setAccounts,
    setSchedules,
}) => {
    const [searchForm] = Form.useForm();
    const [localSelectedAccount, setLocalSelectedAccount] = useState<string | undefined>(selectedLoanAccount);
    const [isModalVisible, setIsModalVisible] = useState(false);
    
    // Sync state when prop changes (e.g., from overview tab action)
    React.useEffect(() => {
        setLocalSelectedAccount(selectedLoanAccount);
        if (selectedLoanAccount) {
            searchForm.setFieldsValue({ accountNumber: selectedLoanAccount });
        }
    }, [selectedLoanAccount, searchForm]);

    const currentLoan = useMemo(() => 
        accounts.find(acc => acc.accountNumber === localSelectedAccount), 
        [accounts, localSelectedAccount]
    );

    const loanSchedule = useMemo(() => 
        schedules.filter(item => item.loanAccountNumber === localSelectedAccount),
        [schedules, localSelectedAccount]
    );

    // Find the NEXT pending or overdue installment
    const nextInstallment = useMemo(() => 
        loanSchedule.find(item => item.status === 'Pending' || item.status === 'Overdue'),
        [loanSchedule]
    );

    const nextInstallmentAmount = nextInstallment?.installmentDue || 0;
    const ddaBalance = currentLoan?.ddaBalance || 0;
    const ddaProgress = ddaBalance > 0 ? Math.min(100, (ddaBalance / nextInstallmentAmount) * 100) : 0;
    const isReadyForDeduction = ddaBalance >= nextInstallmentAmount && nextInstallment;


    const columns = [
        { title: 'Due Date', dataIndex: 'dueDate', key: 'dueDate', width: 120 },
        { 
            title: 'Installment Due', 
            dataIndex: 'installmentDue', 
            key: 'installmentDue',
            align: 'right' as const,
            render: (amount: number) => <Text strong>{formatCurrency(amount)}</Text>
        },
        { 
            title: 'Principal', 
            dataIndex: 'principalDue', 
            key: 'principalDue',
            align: 'right' as const,
            render: (amount: number) => <Text type="secondary">{amount.toLocaleString()}</Text>
        },
        { 
            title: 'Interest', 
            dataIndex: 'interestDue', 
            key: 'interestDue',
            align: 'right' as const,
            render: (amount: number) => <Text type="secondary">{amount.toLocaleString()}</Text>
        },
        { 
            title: 'Status', 
            dataIndex: 'status', 
            key: 'status',
            align: 'center' as const,
            render: (status: RepaymentScheduleItem['status']) => {
                let color = status === 'Paid' ? 'green' : (status === 'Overdue' ? 'red' : 'orange');
                return <Tag color={color}>{status}</Tag>;
            }
        },
    ];

    const handleSearch = (values: any) => {
        setLocalSelectedAccount(values.accountNumber);
        setSelectedLoanAccount(values.accountNumber);
    };

    return (
        <Card className="shadow-inner border-none">
            {currentLoan && nextInstallment && (
                <RepaymentProcessingModal
                    visible={isModalVisible}
                    onClose={() => setIsModalVisible(false)}
                    currentLoan={currentLoan}
                    nextInstallment={nextInstallment}
                    setAccounts={setAccounts}
                    setSchedules={setSchedules}
                />
            )}

            <Title level={4} className="flex items-center text-indigo-700"><SearchOutlined className="mr-2" /> Search Loan & Repayment Status</Title>

            <Form form={searchForm} layout="inline" onFinish={handleSearch} className="mb-6">
                <Form.Item
                    name="accountNumber"
                    label="Loan Account"
                    rules={[{ required: true, message: 'Select account' }]}
                    className="flex-grow"
                >
                    <Select showSearch placeholder="Select loan account number">
                        {accounts.map(acc => (
                            <Option key={acc.accountNumber} value={acc.accountNumber}>
                                {acc.accountNumber} - {acc.clientName}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                        Check Status
                    </Button>
                </Form.Item>
            </Form>

            {currentLoan && (
                <Row gutter={24} className="mt-6">
                    <Col xs={24} lg={10}>
                        <Card title={<Text strong>Client & Loan Details</Text>} className="bg-gray-50 border-gray-200">
                            <p><strong>Client:</strong> {currentLoan.clientName} ({currentLoan.clientId})</p>
                            <p><strong>Group:</strong> <Tag color="volcano">{currentLoan.group}</Tag></p> {/* Display Group */}
                            <p><strong>Status:</strong> {getStatusTag(currentLoan.status)}</p>
                            <p><strong>Principal:</strong> {formatCurrency(currentLoan.principal)}</p>
                            <p><strong>Outstanding:</strong> {formatCurrency(currentLoan.outstandingBalance)}</p>
                            <p><strong>Term:</strong> {currentLoan.termMonths} Months @ {currentLoan.interestRate}% Interest</p>
                        </Card>
                    </Col>

                    <Col xs={24} lg={14}>
                        <Card 
                            title={<Text strong className="text-xl">Drawdown Account (DDA) Status</Text>} 
                            className={`border-2 ${isReadyForDeduction ? 'border-green-500' : 'border-red-500'}`}
                            extra={nextInstallment && (
                                <Button 
                                    type="primary" 
                                    icon={<SendOutlined />} 
                                    disabled={!isReadyForDeduction || currentLoan.status === 'Closed'}
                                    onClick={() => setIsModalVisible(true)}
                                >
                                    Process Repayment
                                </Button>
                            )}
                        >
                            <Row gutter={16} align="middle">
                                <Col span={10}>
                                    <Statistic title="DDA Balance (Deposits Held)" value={ddaBalance} prefix={CURRENCY} valueStyle={{ color: '#108ee9' }} />
                                </Col>
                                <Col span={14}>
                                    {nextInstallment ? (
                                        <>
                                            <p className="mb-1"><strong>Next Installment Due:</strong> {formatCurrency(nextInstallmentAmount)} on {nextInstallment.dueDate}</p>
                                            <Tooltip title={`Progress towards the next installment of ${formatCurrency(nextInstallmentAmount)}`}>
                                                <Progress 
                                                    percent={ddaProgress} 
                                                    size="small"
                                                    status={isReadyForDeduction ? 'success' : (ddaProgress > 0 ? 'active' : 'exception')}
                                                    strokeColor={isReadyForDeduction ? '#52c41a' : '#faad14'}
                                                    format={(percent) => `${percent?.toFixed(1)}% Funded`}
                                                />
                                            </Tooltip>
                                            <p className="mt-2 text-sm text-gray-600">
                                                {isReadyForDeduction 
                                                    ? <Text type="success" strong>System is ready for automatic deduction.</Text>
                                                    : <Text type="warning" strong>Underpayment Alert: {formatCurrency(nextInstallmentAmount - ddaBalance)} required.</Text>
                                                }
                                            </p>
                                        </>
                                    ) : (
                                        <p className="text-gray-500">No pending installments found or loan is closed.</p>
                                    )}
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>
            )}

            {currentLoan && loanSchedule.length > 0 && (
                <div className="mt-6">
                    <Title level={5} className="mt-6 mb-3">Full Repayment Schedule</Title>
                    <Table 
                        columns={columns} 
                        dataSource={loanSchedule} 
                        rowKey="id" 
                        pagination={false} 
                        size="small"
                        bordered
                    />
                </div>
            )}

            {localSelectedAccount && !currentLoan && (
                <div className="text-center p-8 bg-white border rounded-lg mt-6">
                    <CloseCircleOutlined style={{ fontSize: '48px', color: '#f5222d' }} />
                    <Title level={4} type="danger" className="mt-2">Loan Account Not Found</Title>
                    <Text>Please check the account number and try again.</Text>
                </div>
            )}
        </Card>
    );
};

// ----------------------------------------------------
// 4. ROOT COMPONENT
// ----------------------------------------------------

const LoanAccounts: React.FC = () => {
    // State management for mock data, now using state setters
    const [accounts, setAccounts] = useState<LoanAccount[]>(initialLoanAccounts);
    const [schedules, setSchedules] = useState<RepaymentScheduleItem[]>(initialRepaymentSchedule);
    
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedLoanAccount, setSelectedLoanAccount] = useState<string | undefined>(undefined);

    return (
        <div>
            <PageHeader 
                title="Loan Accounts" 
                breadcrumbs={[
                    { title: 'Loan Accounts' }
                ]} 
            />
            
            <div className="page-container p-4 min-h-screen bg-gray-50">
                <Title level={2} className="text-gray-800">
                    💼 Loan Accounts Overview <LineChartOutlined style={{ color: '#888' }} />
                </Title>
                <Text type="secondary">
                    Manage and view data for **all active and closed loan accounts**, focusing on repayment tracking and Drawdown Account (DDA) monitoring.
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
                        tab={<span className="flex items-center"><DollarCircleOutlined /> Portfolio Overview</span>} 
                        key="overview"
                    >
                        <OverviewTab 
                            accounts={accounts} 
                            setActiveTab={setActiveTab}
                            setSelectedLoanAccount={setSelectedLoanAccount}
                        />
                    </TabPane>
                    <TabPane 
                        tab={<span className="flex items-center"><SwapOutlined /> Repayment Status & DDA</span>} 
                        key="repayments"
                    >
                        <RepaymentStatusTab 
                            accounts={accounts} 
                            schedules={schedules}
                            selectedLoanAccount={selectedLoanAccount}
                            setSelectedLoanAccount={setSelectedLoanAccount}
                            setAccounts={setAccounts} // Passed down
                            setSchedules={setSchedules} // Passed down
                        />
                    </TabPane>
                </Tabs>
            </div>
            </div>
        </div>
    );
};

export default LoanAccounts;