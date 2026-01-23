import React, { useState, useMemo } from 'react';
import { 
    Typography, Card, Row, Col, Statistic, Select, Tag, Table, Progress, Input, Space, Button, 
    Descriptions, Divider, Popconfirm // Added Descriptions, Divider, Button, Popconfirm
} from 'antd';
import { 
    TeamOutlined, SolutionOutlined, UserOutlined, SmileOutlined, 
    DollarCircleOutlined, PushpinOutlined, SearchOutlined, 
    BankOutlined, CrownOutlined, EyeOutlined, ArrowLeftOutlined, 
    MailOutlined, PhoneOutlined, HomeOutlined, HistoryOutlined, SyncOutlined, 
    CheckCircleOutlined, WarningOutlined, CalendarOutlined // Added icons for detail view
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

// ----------------------------------------------------
// 1. DATA STRUCTURES & MOCK DATA
// ----------------------------------------------------

interface ClientSummary {
    totalClients: number;
    activeBorrowers: number;
    clientRetentionRate: number; // %
    averageLoanSize: number;
    femaleClients: number; // % of total
    youngClients: number; // % of total (< 35)
}

interface LoanHistory {
    id: string;
    amount: number;
    disbursementDate: string;
    status: 'Active' | 'Closed' | 'Default';
    purpose: string;
}

interface TransactionRecord {
    date: string;
    type: 'Deposit' | 'Withdrawal' | 'Repayment';
    amount: number;
    description: string;
}

interface ClientRecord {
    clientId: string;
    name: string;
    branch: string;
    loanOfficer: string;
    age: number;
    gender: 'F' | 'M';
    activeLoans: number;
    savingsBalance: number;
    onboardDate: string;
    // Detailed fields for single view
    address?: string;
    phone?: string;
    email?: string;
    latestLoans?: LoanHistory[];
    transactionHistory?: TransactionRecord[];
}

interface DemographicData {
    category: string;
    label: string;
    value: number; // count or percentage
    color: string;
}

// Mock Data
const mockSummary: ClientSummary = {
    totalClients: 3680,
    activeBorrowers: 2950,
    clientRetentionRate: 94.5,
    averageLoanSize: 32000,
    femaleClients: 65,
    youngClients: 45,
};

// Merged mock data with detail fields
const mockClientData: ClientRecord[] = [
    { 
        clientId: 'C1001', name: 'Aisha Hassan', branch: 'Central Market Hub', loanOfficer: 'Esther Kimani', age: 34, gender: 'F', activeLoans: 2, savingsBalance: 12500, onboardDate: '2022-01-15',
        address: '14 Kijabe Street, Nairobi', phone: '0711 223 344', email: 'aisha.hassan@example.com',
        latestLoans: [
            { id: 'L45001', amount: 50000, disbursementDate: '2024-05-10', status: 'Active', purpose: 'Working Capital' },
            { id: 'L38921', amount: 20000, disbursementDate: '2023-08-01', status: 'Closed', purpose: 'Asset Purchase' },
        ],
        transactionHistory: [
            { date: '2025-11-20', type: 'Repayment', amount: 5000, description: 'Loan L45001 installment' },
            { date: '2025-11-15', type: 'Deposit', amount: 2000, description: 'Savings deposit' },
        ]
    },
    { 
        clientId: 'C1002', name: 'Ben Mwangi', branch: 'East Side Business', loanOfficer: 'David Mwangi', age: 51, gender: 'M', activeLoans: 1, savingsBalance: 8000, onboardDate: '2020-05-20',
        address: 'Runda Drive, Block B, Kisumu', phone: '0700 112 233', email: 'ben.mwa@example.com',
        latestLoans: [
            { id: 'L50005', amount: 150000, disbursementDate: '2025-01-20', status: 'Active', purpose: 'Business Expansion' },
        ],
        transactionHistory: [
            { date: '2025-11-18', type: 'Withdrawal', amount: 3000, description: 'Personal withdrawal' },
            { date: '2025-11-10', type: 'Repayment', amount: 10000, description: 'Loan L50005 installment' },
        ]
    },
    { clientId: 'C1003', name: 'Chari Ndungu', branch: 'West Field Outreach', loanOfficer: 'Fatima Aden', age: 28, gender: 'M', activeLoans: 3, savingsBalance: 25000, onboardDate: '2023-11-01', address: '45 River Road, Eldoret', phone: '0722 334 455', email: 'chari@example.com', latestLoans: [], transactionHistory: [] },
    { clientId: 'C1004', name: 'Doreen Chebet', branch: 'Central Market Hub', loanOfficer: 'Esther Kimani', age: 42, gender: 'F', activeLoans: 1, savingsBalance: 1500, onboardDate: '2021-08-10', address: 'P.O Box 10, Nakuru', phone: '0733 445 566', email: 'doreen@example.com', latestLoans: [], transactionHistory: [] },
    { clientId: 'C1005', name: 'Elias Juma', branch: 'East Side Business', loanOfficer: 'Ben Carter', age: 31, gender: 'M', activeLoans: 0, savingsBalance: 45000, onboardDate: '2024-03-05', address: 'Mombasa Road, Kilifi', phone: '0744 556 677', email: 'elias@example.com', latestLoans: [], transactionHistory: [] },
];

const mockGenderData: DemographicData[] = [
    { category: 'Gender', label: 'Female', value: mockSummary.femaleClients, color: '#ff7875' }, 
    { category: 'Gender', label: 'Male', value: 100 - mockSummary.femaleClients, color: '#1890ff' }, 
];

const mockAgeData: DemographicData[] = [
    { category: 'Age', label: '< 35 (Young)', value: mockSummary.youngClients, color: '#52c41a' }, 
    { category: 'Age', label: '35+ (Mature)', value: 100 - mockSummary.youngClients, color: '#faad14' }, 
];

// Utility functions
const formatCurrency = (amount: number) => `KSh ${amount.toLocaleString('en-KE')}`;

const getLoanStatusTagProps = (status: string) => {
    switch (status) {
        case 'Active': return { color: 'green', icon: <SyncOutlined spin /> };
        case 'Closed': return { color: 'default', icon: <CheckCircleOutlined /> };
        case 'Default': return { color: 'red', icon: <WarningOutlined /> };
        default: return { color: 'default', icon: null };
    }
};

const getTransactionTagProps = (type: string) => {
    switch (type) {
        case 'Deposit': return { color: 'blue' };
        case 'Repayment': return { color: 'green' };
        case 'Withdrawal': return { color: 'volcano' };
        default: return { color: 'default' };
    }
};

// ----------------------------------------------------
// 2. SUPPORT COMPONENTS (Demographic & Detail View)
// ----------------------------------------------------

// Component for Demographic Breakdown Visualization
const DemographicBreakdown: React.FC<{ title: string, data: DemographicData[], icon: React.ReactNode }> = ({ title, data, icon }) => {
    return (
        <Card title={<Title level={4} className="mb-0 text-gray-700">{icon} {title}</Title>} className="shadow-lg h-full">
            <Row gutter={[16, 16]}>
                {data.map((item, index) => (
                    <Col xs={24} sm={12} key={index}>
                        <div className="flex flex-col space-y-2">
                            <div className="flex justify-between items-center">
                                <Tag color={item.color} className="font-semibold">{item.label}</Tag>
                                <Text strong style={{ color: item.color }}>{item.value.toFixed(1)}%</Text>
                            </div>
                            <Progress 
                                percent={item.value}
                                strokeColor={item.color}
                                size="small"
                                showInfo={false}
                                strokeWidth={12}
                            />
                        </div>
                    </Col>
                ))}
            </Row>
            <Text type="secondary" className="text-xs mt-4 block">
                Total clients included: {mockSummary.totalClients.toLocaleString()}
            </Text>
        </Card>
    );
};

// Client Detail View Component
const ClientDetailView: React.FC<{ client: ClientRecord, onBack: () => void }> = ({ client, onBack }) => {
    
    // Ensure detail data is present (though it should be for the selected client)
    const latestLoans = client.latestLoans || [];
    const transactionHistory = client.transactionHistory || [];

    const loanColumns = [
        { title: 'Loan ID', dataIndex: 'id', key: 'id' },
        { title: 'Amount', dataIndex: 'amount', key: 'amount', render: (a: number) => formatCurrency(a) },
        { title: 'Date', dataIndex: 'disbursementDate', key: 'disbursementDate' },
        { title: 'Purpose', dataIndex: 'purpose', key: 'purpose' },
        { 
            title: 'Status', 
            dataIndex: 'status', 
            key: 'status', 
            render: (s: string) => {
                const props = getLoanStatusTagProps(s);
                return <Tag color={props.color} icon={props.icon}>{s}</Tag>;
            }
        },
    ];

    const transactionColumns = [
        { title: 'Date', dataIndex: 'date', key: 'date' },
        { 
            title: 'Type', 
            dataIndex: 'type', 
            key: 'type', 
            render: (t: string) => <Tag {...getTransactionTagProps(t)}>{t}</Tag>
        },
        { title: 'Amount', dataIndex: 'amount', key: 'amount', render: (a: number) => formatCurrency(a) },
        { title: 'Description', dataIndex: 'description', key: 'description' },
    ];

    return (
        <div className="page-container p-4 min-h-screen bg-gray-50">
            <Button 
                onClick={onBack} 
                icon={<ArrowLeftOutlined />} 
                type="dashed"
                className="mb-4"
            >
                Back to Client Report
            </Button>
            
            <Title level={2} className="text-gray-800 flex items-center">
                <UserOutlined style={{ marginRight: 8, color: '#1890ff' }} /> {client.name}
            </Title>
            <Text type="secondary" className="block mb-4">
                Client ID: <Tag color="geekblue" className="text-lg">{client.clientId}</Tag>
            </Text>

            <Row gutter={[16, 16]} className="mt-4">
                {/* Section 1: Key Financials */}
                <Col xs={24} lg={8}>
                    <Card title="Financial Snapshot" className="h-full border-t-4 border-green-500 shadow-md">
                        <Statistic title="Total Savings Balance" value={client.savingsBalance} formatter={formatCurrency} prefix={<BankOutlined />} valueStyle={{ color: '#3f8600' }} />
                        <Divider className="my-3" />
                        <Statistic title="Active Loans" value={client.activeLoans} prefix={<DollarCircleOutlined />} />
                        <Divider className="my-3" />
                        <Statistic title="Onboard Date" value={client.onboardDate} prefix={<CalendarOutlined />} />
                    </Card>
                </Col>

                {/* Section 2: Personal and Contact Information */}
                <Col xs={24} lg={16}>
                    <Card title="Personal & Contact Information" className="h-full border-t-4 border-blue-500 shadow-md">
                        <Descriptions column={{ xs: 1, sm: 2, lg: 3 }} bordered size="small">
                            <Descriptions.Item label="Age">{client.age}</Descriptions.Item>
                            <Descriptions.Item label="Gender">{client.gender === 'F' ? 'Female' : 'Male'}</Descriptions.Item>
                            <Descriptions.Item label="Branch">{client.branch}</Descriptions.Item>
                            <Descriptions.Item label="Loan Officer">{client.loanOfficer}</Descriptions.Item>
                            <Descriptions.Item label="Phone"><PhoneOutlined /> {client.phone || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="Email"><MailOutlined /> {client.email || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="Address" span={3}><HomeOutlined /> {client.address || 'N/A'}</Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Col>
            </Row>

            {/* Section 3: Loan History */}
            <Card title={<Title level={4} className="mb-0 mt-4"><DollarCircleOutlined /> Loan History ({latestLoans.length})</Title>} className="mt-4 shadow-lg border-t-4 border-orange-500">
                <Table 
                    columns={loanColumns} 
                    dataSource={latestLoans}
                    rowKey="id"
                    pagination={false}
                    size="small"
                />
            </Card>

            {/* Section 4: Transaction History */}
            <Card title={<Title level={4} className="mb-0 mt-4"><HistoryOutlined /> Recent Transactions ({transactionHistory.length})</Title>} className="mt-4 shadow-lg border-t-4 border-purple-500">
                <Table 
                    columns={transactionColumns} 
                    dataSource={transactionHistory}
                    rowKey="date" // Using date as key, assume unique for mock
                    pagination={{ pageSize: 5 }}
                    size="small"
                />
            </Card>
        </div>
    );
};

// ----------------------------------------------------
// 3. MAIN COMPONENT (ClientsReport)
// ----------------------------------------------------

const ClientsReport: React.FC = () => {
    const [searchText, setSearchText] = useState('');
    // State to hold the currently selected client for the detail view
    const [selectedClient, setSelectedClient] = useState<ClientRecord | null>(null); 

    const handleViewClient = (record: ClientRecord) => {
        // Find the full detailed record (in a real app, this would be an API call)
        const detailedClient = mockClientData.find(c => c.clientId === record.clientId);
        if (detailedClient) {
            // Set the state to the detailed client, which triggers the conditional render
            setSelectedClient(detailedClient);
        } else {
            console.error(`Client ${record.clientId} not found.`);
        }
    };

    const clientColumns = [
        {
            title: 'Client ID',
            dataIndex: 'clientId',
            key: 'clientId',
            sorter: (a: ClientRecord, b: ClientRecord) => a.clientId.localeCompare(b.clientId),
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => <Tag icon={<UserOutlined />}>{text}</Tag>,
            sorter: (a: ClientRecord, b: ClientRecord) => a.name.localeCompare(b.name),
        },
        {
            title: 'Gender',
            dataIndex: 'gender',
            key: 'gender',
            render: (gender: string) => (
                <Tag color={gender === 'F' ? 'volcano' : 'blue'}>
                    {gender}
                </Tag>
            ),
        },
        {
            title: 'Age',
            dataIndex: 'age',
            key: 'age',
            sorter: (a: ClientRecord, b: ClientRecord) => a.age - b.age,
        },
        {
            title: 'Active Loans',
            dataIndex: 'activeLoans',
            key: 'activeLoans',
            render: (count: number) => <Tag color={count > 0 ? 'green' : 'default'}>{count}</Tag>,
            sorter: (a: ClientRecord, b: ClientRecord) => a.activeLoans - b.activeLoans,
        },
        {
            title: 'Savings Balance',
            dataIndex: 'savingsBalance',
            key: 'savingsBalance',
            render: (balance: number) => formatCurrency(balance),
            sorter: (a: ClientRecord, b: ClientRecord) => a.savingsBalance - b.savingsBalance,
        },
        {
            title: 'Branch',
            dataIndex: 'branch',
            key: 'branch',
        },
        {
            title: 'Officer',
            dataIndex: 'loanOfficer',
            key: 'loanOfficer',
        },
        // ACTION COLUMN - Now correctly triggers state change
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: ClientRecord) => (
                <Button 
                    type="link" 
                    onClick={() => handleViewClient(record)} 
                    icon={<EyeOutlined />}
                    className="p-0"
                >
                    View
                </Button>
            ),
        },
    ];

    const filteredClientData = useMemo(() => {
        if (!searchText) return mockClientData;
        const lowerCaseSearch = searchText.toLowerCase();
        return mockClientData.filter(client =>
            client.name.toLowerCase().includes(lowerCaseSearch) ||
            client.clientId.toLowerCase().includes(lowerCaseSearch) ||
            client.loanOfficer.toLowerCase().includes(lowerCaseSearch)
        );
    }, [searchText]);
    
    // Conditionally render the detailed view or the main report
    if (selectedClient) {
        return <ClientDetailView client={selectedClient} onBack={() => setSelectedClient(null)} />;
    }

    // Main Report View
    return (
        <div className="page-container p-4 min-h-screen bg-gray-50">
            <Title level={2} className="text-gray-800">
                📋 Client Report <SolutionOutlined style={{ color: '#52c41a' }} />
            </Title>
            <Text type="secondary">
                Manage and view data for **client demographics** and account summaries, providing a comprehensive view of the customer base.
            </Text>

            {/* Row 1: Key Metrics (Aligned perfectly) */}
            <Row gutter={[16, 16]} className="mt-4" align="stretch">
                {/* Metric Card 1: Total Clients */}
                <Col xs={24} sm={12} lg={6}>
                <Card hoverable className="shadow-md h-full border-t-4 border-blue-500">
                    <Statistic
                    title="Total Registered Clients"
                    value={mockSummary.totalClients}
                    prefix={<TeamOutlined />}
                    />
                    <Text type="secondary" className="text-xs block mt-2">All clients in the system.</Text>
                </Card>
                </Col>

                {/* Metric Card 2: Active Borrowers */}
                <Col xs={24} sm={12} lg={6}>
                <Card hoverable className="shadow-md h-full border-t-4 border-green-500">
                    <Statistic
                    title="Active Borrowers"
                    value={mockSummary.activeBorrowers}
                    prefix={<DollarCircleOutlined />}
                    valueStyle={{ color: '#3f8600' }}
                    />
                    <Text type="secondary" className="text-xs block mt-2">Clients with an outstanding loan.</Text>
                </Card>
                </Col>

                {/* Metric Card 3: Client Retention Rate */}
                <Col xs={24} sm={12} lg={6}>
                <Card hoverable className="shadow-md h-full border-t-4 border-purple-500">
                    <Statistic
                    title="Retention Rate (YTD)"
                    value={mockSummary.clientRetentionRate}
                    precision={1}
                    prefix={<SmileOutlined />}
                    suffix="%"
                    />
                    <Text type="secondary" className="text-xs block mt-2">Client loyalty measure.</Text>
                </Card>
                </Col>

                {/* Metric Card 4: Average Loan Size */}
                <Col xs={24} sm={12} lg={6}>
                <Card hoverable className="shadow-md h-full border-t-4 border-orange-500">
                    <Statistic
                    title="Average Loan Size"
                    value={mockSummary.averageLoanSize}
                    formatter={formatCurrency}
                    prefix={<BankOutlined />}
                    />
                    <Text type="secondary" className="text-xs block mt-2">Average disbursement amount.</Text>
                </Card>
                </Col>
            </Row>

            {/* Row 2: Demographic Breakdown (Gender and Age) */}
            <Row gutter={[16, 16]} className="mt-4" align="stretch">
                {/* Gender Breakdown */}
                <Col xs={24} lg={12}>
                    <DemographicBreakdown 
                        title="Gender Distribution" 
                        data={mockGenderData} 
                        icon={<TeamOutlined style={{ color: '#ff7875' }} />}
                    />
                </Col>
                
                {/* Age Breakdown */}
                <Col xs={24} lg={12}>
                    <DemographicBreakdown 
                        title="Age Group Analysis" 
                        data={mockAgeData} 
                        icon={<CrownOutlined style={{ color: '#faad14' }} />}
                    />
                </Col>
            </Row>

            {/* Row 3: Detailed Client Table */}
            <Card title={<Title level={4} className="mb-0"><PushpinOutlined /> Detailed Client Register</Title>} className="mt-4 shadow-lg border-t-4 border-gray-400">
                <Space direction="vertical" className="w-full">
                    <Input
                        placeholder="Search by Name, ID, or Officer..."
                        prefix={<SearchOutlined />}
                        allowClear
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        className="max-w-md"
                        size="large"
                    />
                    <Text type="secondary" className="block mb-2">
                        Displaying {filteredClientData.length} of {mockClientData.length} total clients.
                    </Text>
                </Space>
                
                <Table 
                    columns={clientColumns} 
                    dataSource={filteredClientData}
                    rowKey="clientId"
                    pagination={{ pageSize: 10 }}
                    size="small"
                    className="mt-4"
                />
            </Card>
        </div>
    );
};

export default ClientsReport;