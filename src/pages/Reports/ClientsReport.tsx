import React, { useState, useMemo, useEffect } from 'react';
import { 
    Typography, Card, Row, Col, Statistic, Select, Tag, Table, Progress, Input, Space, Button, 
    Descriptions, Divider, Spin, message
} from 'antd';
import { 
    TeamOutlined, SolutionOutlined, UserOutlined, SmileOutlined, 
    DollarCircleOutlined, PushpinOutlined, SearchOutlined, 
    BankOutlined, CrownOutlined, EyeOutlined, ArrowLeftOutlined, 
    MailOutlined, PhoneOutlined, HomeOutlined, HistoryOutlined, SyncOutlined, 
    CheckCircleOutlined, WarningOutlined, CalendarOutlined, LoadingOutlined
} from '@ant-design/icons';
import PageHeader from '../../components/common/Layout/PageHeader';
import http from '../../services/httpInterceptor';
import { APIS } from '../../services/APIS';

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
    phone: string;
    idNumber: string;
    gender: 'F' | 'M';
    creditOfficer: string;
    groupName: string;
    status: 'Active' | 'Inactive' | 'Suspended';
    branch: string;
    age: number;
    activeLoans: number;
    savingsBalance: number;
    onboardDate: string;
    // Detailed fields for single view
    address?: string;
    email?: string;
    latestLoans?: LoanHistory[];
    transactionHistory?: TransactionRecord[];
}

// API Response Interface
interface ApiClientRecord {
    id: number;
    fullName: string;
    phone: string;
    idNumber: string;
    gender: string;
    creditOfficerName: string;
    groupName: string;
    status: string;
    branchName: string;
    clientNumber: string;
    location: string;
    dob: string;
    saving: number;
    loan: number;
    kinName?: string;
    kinId?: string;
    kinPhone?: string;
    payment?: {
        savingDue: number;
        loanDue: number;
    };
}

interface DemographicData {
    category: string;
    label: string;
    value: number;
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
        clientId: 'C1001', name: 'Aisha Hassan', phone: '0711 223 344', idNumber: '12345678', gender: 'F', 
        creditOfficer: 'Esther Kimani', groupName: 'Mama Traders Group', status: 'Active', branch: 'Central Market Hub',
        age: 34, activeLoans: 2, savingsBalance: 12500, onboardDate: '2022-01-15',
        address: '14 Kijabe Street, Nairobi', email: 'aisha.hassan@example.com',
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
        clientId: 'C1002', name: 'Ben Mwangi', phone: '0700 112 233', idNumber: '23456789', gender: 'M',
        creditOfficer: 'David Mwangi', groupName: 'Business Achievers', status: 'Active', branch: 'East Side Business',
        age: 51, activeLoans: 1, savingsBalance: 8000, onboardDate: '2020-05-20',
        address: 'Runda Drive, Block B, Kisumu', email: 'ben.mwa@example.com',
        latestLoans: [
            { id: 'L50005', amount: 150000, disbursementDate: '2025-01-20', status: 'Active', purpose: 'Business Expansion' },
        ],
        transactionHistory: [
            { date: '2025-11-18', type: 'Withdrawal', amount: 3000, description: 'Personal withdrawal' },
            { date: '2025-11-10', type: 'Repayment', amount: 10000, description: 'Loan L50005 installment' },
        ]
    },
    { 
        clientId: 'C1003', name: 'Chari Ndungu', phone: '0722 334 455', idNumber: '34567890', gender: 'M',
        creditOfficer: 'Fatima Aden', groupName: 'Youth Entrepreneurs', status: 'Active', branch: 'West Field Outreach',
        age: 28, activeLoans: 3, savingsBalance: 25000, onboardDate: '2023-11-01', 
        address: '45 River Road, Eldoret', email: 'chari@example.com', latestLoans: [], transactionHistory: [] 
    },
    { 
        clientId: 'C1004', name: 'Doreen Chebet', phone: '0733 445 566', idNumber: '45678901', gender: 'F',
        creditOfficer: 'Esther Kimani', groupName: 'Mama Traders Group', status: 'Active', branch: 'Central Market Hub',
        age: 42, activeLoans: 1, savingsBalance: 1500, onboardDate: '2021-08-10', 
        address: 'P.O Box 10, Nakuru', email: 'doreen@example.com', latestLoans: [], transactionHistory: [] 
    },
    { 
        clientId: 'C1005', name: 'Elias Juma', phone: '0744 556 677', idNumber: '56789012', gender: 'M',
        creditOfficer: 'Ben Carter', groupName: 'Business Achievers', status: 'Inactive', branch: 'East Side Business',
        age: 31, activeLoans: 0, savingsBalance: 45000, onboardDate: '2024-03-05', 
        address: 'Mombasa Road, Kilifi', email: 'elias@example.com', latestLoans: [], transactionHistory: [] 
    },
    { 
        clientId: 'C1006', name: 'Faith Wambui', phone: '0755 667 788', idNumber: '67890123', gender: 'F',
        creditOfficer: 'John Kamau', groupName: 'Women Empowerment', status: 'Active', branch: 'Nairobi West',
        age: 39, activeLoans: 2, savingsBalance: 18000, onboardDate: '2021-03-12', 
        address: 'Langata Road, Nairobi', email: 'faith.w@example.com', latestLoans: [], transactionHistory: [] 
    },
    { 
        clientId: 'C1007', name: 'Grace Muthoni', phone: '0766 778 899', idNumber: '78901234', gender: 'F',
        creditOfficer: 'Sarah Njeri', groupName: 'Mama Traders Group', status: 'Active', branch: 'Central Market Hub',
        age: 45, activeLoans: 1, savingsBalance: 9500, onboardDate: '2020-07-22', 
        address: 'Thika Road, Ruiru', email: 'grace.m@example.com', latestLoans: [], transactionHistory: [] 
    },
    { 
        clientId: 'C1008', name: 'Henry Ochieng', phone: '0777 889 900', idNumber: '89012345', gender: 'M',
        creditOfficer: 'David Mwangi', groupName: 'Business Achievers', status: 'Suspended', branch: 'East Side Business',
        age: 52, activeLoans: 0, savingsBalance: 2000, onboardDate: '2019-11-30', 
        address: 'Kisumu Town, Central', email: 'henry.o@example.com', latestLoans: [], transactionHistory: [] 
    },
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
                            <Descriptions.Item label="Credit Officer">{client.creditOfficer}</Descriptions.Item>
                            <Descriptions.Item label="Group">{client.groupName}</Descriptions.Item>
                            <Descriptions.Item label="ID Number">{client.idNumber}</Descriptions.Item>
                            <Descriptions.Item label="Status">
                                <Tag color={client.status === 'Active' ? 'green' : client.status === 'Inactive' ? 'default' : 'red'}>
                                    {client.status}
                                </Tag>
                            </Descriptions.Item>
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
    const [selectedGroup, setSelectedGroup] = useState<string>('all');
    const [selectedClient, setSelectedClient] = useState<ClientRecord | null>(null);
    const [clientData, setClientData] = useState<ClientRecord[]>([]);
    const [loading, setLoading] = useState(false);

    // Fetch clients data from API
    useEffect(() => {
        const fetchClients = async () => {
            setLoading(true);
            try {
                const response = await http.get(APIS.CLIENTS_REPORT);
                // API returns paginated data with content array
                const apiClients: ApiClientRecord[] = response.data.content || [];
                
                // Transform API data to match ClientRecord interface
                const transformedClients: ClientRecord[] = apiClients.map((client: ApiClientRecord) => ({
                    clientId: client.clientNumber,
                    name: client.fullName,
                    phone: client.phone,
                    idNumber: client.idNumber,
                    gender: client.gender === 'MALE' ? 'M' : 'F',
                    creditOfficer: client.creditOfficerName,
                    groupName: client.groupName,
                    status: client.status as 'Active' | 'Inactive' | 'Suspended',
                    branch: client.branchName,
                    age: client.dob ? new Date().getFullYear() - new Date(client.dob).getFullYear() : 0,
                    activeLoans: client.loan > 0 ? 1 : 0,
                    savingsBalance: client.saving,
                    onboardDate: client.dob || '',
                }));
                
                setClientData(transformedClients);
            } catch (error: any) {
                message.error('Failed to load clients data');
                console.error('Error fetching clients:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchClients();
    }, []);

    // Get unique groups for filter
    const uniqueGroups = useMemo(() => {
        const groups = Array.from(new Set(clientData.map(client => client.groupName)));
        return groups.sort();
    }, [clientData]);

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
            render: (text: string) => <Tag icon={<UserOutlined />} color="blue">{text}</Tag>,
            sorter: (a: ClientRecord, b: ClientRecord) => a.name.localeCompare(b.name),
        },
        {
            title: 'Phone Number',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: 'ID Number',
            dataIndex: 'idNumber',
            key: 'idNumber',
        },
        {
            title: 'Gender',
            dataIndex: 'gender',
            key: 'gender',
            render: (gender: string) => (
                <Tag color={gender === 'F' ? 'volcano' : 'geekblue'}>
                    {gender === 'F' ? 'Female' : 'Male'}
                </Tag>
            ),
        },
        {
            title: 'Credit Officer',
            dataIndex: 'creditOfficer',
            key: 'creditOfficer',
        },
        {
            title: 'Group Name',
            dataIndex: 'groupName',
            key: 'groupName',
            render: (text: string) => <Tag color="green">{text}</Tag>,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                const color = status === 'Active' ? 'green' : status === 'Inactive' ? 'default' : 'red';
                return <Tag color={color}>{status}</Tag>;
            },
        },
        {
            title: 'Branch',
            dataIndex: 'branch',
            key: 'branch',
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
                    View Details
                </Button>
            ),
        },
    ];

    const filteredClientData = useMemo(() => {
        let filtered = clientData;
        
        // Filter by group
        if (selectedGroup !== 'all') {
            filtered = filtered.filter(client => client.groupName === selectedGroup);
        }
        
        // Filter by search text
        if (searchText) {
            const lowerCaseSearch = searchText.toLowerCase();
            filtered = filtered.filter(client =>
                client.name.toLowerCase().includes(lowerCaseSearch) ||
                client.clientId.toLowerCase().includes(lowerCaseSearch) ||
                client.phone.toLowerCase().includes(lowerCaseSearch) ||
                client.idNumber.toLowerCase().includes(lowerCaseSearch) ||
                client.creditOfficer.toLowerCase().includes(lowerCaseSearch)
            );
        }
        
        return filtered;
    }, [searchText, selectedGroup, clientData]);
    
    // Conditionally render the detailed view or the main report
    if (selectedClient) {
        return <ClientDetailView client={selectedClient} onBack={() => setSelectedClient(null)} />;
    }

    // Main Report View
    return (
        <div>
            <PageHeader 
                title="Clients Report" 
                breadcrumbs={[
                    { title: 'Clients Report' }
                ]} 
            />
            
            <div className="page-container min-h-screen">

            <Row gutter={[16, 16]} className='mb-4' align="stretch">
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
            
            <Card title={<Title level={4} className="mb-0"><PushpinOutlined /> Clients Folder</Title>} className="mt-4 shadow-lg border-t-4 border-gray-400">
                <Space direction="vertical" className="w-full">
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Input
                                placeholder="Search by Name, ID, Phone, ID Number, or Officer..."
                                prefix={<SearchOutlined />}
                                allowClear
                                value={searchText}
                                onChange={e => setSearchText(e.target.value)}
                                size="large"
                            />
                        </Col>
                        <Col xs={24} md={12}>
                            <Select
                                placeholder="Filter by Group"
                                value={selectedGroup}
                                onChange={(value) => setSelectedGroup(value)}
                                size="large"
                                style={{ width: '100%' }}
                            >
                                <Option value="all">All Groups</Option>
                                {uniqueGroups.map(group => (
                                    <Option key={group} value={group}>{group}</Option>
                                ))}
                            </Select>
                        </Col>
                    </Row>
                    <Text type="secondary" className="block mb-2">
                        Displaying {filteredClientData.length} of {clientData.length} total clients.
                    </Text>
                </Space>
                
                <Spin spinning={loading} tip="Loading clients..." indicator={<LoadingOutlined spin />}>
                    <Table 
                        columns={clientColumns} 
                        dataSource={filteredClientData}
                        rowKey="clientId"
                        pagination={{ pageSize: 10 }}
                        size="small"
                        className="mt-4"
                    />
                </Spin>
            </Card>
            </div>
        </div>
    );
};

export default ClientsReport;