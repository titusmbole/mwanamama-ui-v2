import React, { useState, useMemo } from 'react';
import { 
    Typography, Card, Row, Col, Statistic, Tag, Table, Progress, Select, Input, Button, 
    Descriptions, Divider, Space // Added Descriptions, Divider, Button, Space
} from 'antd';
import { 
    BellOutlined, CalendarOutlined, DollarCircleOutlined, SyncOutlined, 
    CheckCircleOutlined, SearchOutlined, RiseOutlined, EyeOutlined, // Added EyeOutlined
    ArrowLeftOutlined, UserOutlined, PhoneOutlined, SolutionOutlined, HistoryOutlined
} from '@ant-design/icons';
import PageHeader from '../../components/common/Layout/PageHeader';

const { Title, Text } = Typography;
const { Option } = Select;

// ----------------------------------------------------
// 1. DATA STRUCTURES & MOCK DATA
// ----------------------------------------------------

interface DuesSummary {
    expectedToday: number;
    expectedThisWeek: number;
    collectedMTD: number;
    expectedMTD: number;
    branches: { id: number; name: string }[];
}

interface RepaymentDue {
    loanId: string;
    clientName: string;
    dueDate: string; // YYYY-MM-DD
    expectedAmount: number;
    branch: string;
    loanOfficer: string;
    status: 'Upcoming' | 'Past Due (0-3 days)' | 'Due Today';
    // Detailed fields for single view
    principalBalance: number;
    totalPaid: number;
    clientContact: string;
    originalLoanAmount: number;
    interestRate: number; // percentage
    loanPurpose: string;
}

// Mock Data
const mockSummary: DuesSummary = {
    expectedToday: 125000,
    expectedThisWeek: 650000,
    collectedMTD: 4850000,
    expectedMTD: 5500000,
    branches: [
        { id: 1, name: 'Central Market Hub' },
        { id: 2, name: 'East Side Business' },
        { id: 3, name: 'West Field Outreach' },
    ]
};

const mockDuesData: RepaymentDue[] = [
    { loanId: 'LN9010', clientName: 'George Omondi', dueDate: '2025-11-21', expectedAmount: 25000, branch: 'Central Market Hub', loanOfficer: 'Esther Kimani', status: 'Due Today', principalBalance: 150000, totalPaid: 50000, clientContact: '0712 345 678', originalLoanAmount: 200000, interestRate: 15.5, loanPurpose: 'Education Fees' },
    { loanId: 'LN9011', clientName: 'Hellen Wanjiku', dueDate: '2025-11-22', expectedAmount: 15000, branch: 'East Side Business', loanOfficer: 'David Mwangi', status: 'Upcoming', principalBalance: 85000, totalPaid: 15000, clientContact: '0722 987 654', originalLoanAmount: 100000, interestRate: 14.0, loanPurpose: 'Working Capital' },
    { loanId: 'LN9012', clientName: 'Isaac Kiprop', dueDate: '2025-11-20', expectedAmount: 8000, branch: 'West Field Outreach', loanOfficer: 'Fatima Aden', status: 'Past Due (0-3 days)', principalBalance: 40000, totalPaid: 60000, clientContact: '0733 112 233', originalLoanAmount: 100000, interestRate: 16.0, loanPurpose: 'Medical Expense' },
    { loanId: 'LN9013', clientName: 'Jane Aketch', dueDate: '2025-11-21', expectedAmount: 40000, branch: 'Central Market Hub', loanOfficer: 'Alex Johnson', status: 'Due Today', principalBalance: 300000, totalPaid: 200000, clientContact: '0744 556 677', originalLoanAmount: 500000, interestRate: 13.5, loanPurpose: 'Business Expansion' },
    { loanId: 'LN9014', clientName: 'Ken Obura', dueDate: '2025-11-23', expectedAmount: 12000, branch: 'East Side Business', loanOfficer: 'Ben Carter', status: 'Upcoming', principalBalance: 60000, totalPaid: 0, clientContact: '0755 889 900', originalLoanAmount: 60000, interestRate: 17.0, loanPurpose: 'Inventory Purchase' },
    { loanId: 'LN9015', clientName: 'Linda Moraa', dueDate: '2025-11-19', expectedAmount: 30000, branch: 'West Field Outreach', loanOfficer: 'Fatima Aden', status: 'Past Due (0-3 days)', principalBalance: 220000, totalPaid: 80000, clientContact: '0766 221 100', originalLoanAmount: 300000, interestRate: 14.5, loanPurpose: 'Home Renovation' },
];

// Utility functions
const formatCurrency = (amount: number) => `KSh ${amount.toLocaleString('en-KE')}`;
const getStatusTagProps = (status: string) => {
    switch (status) {
        case 'Due Today': return { color: 'green', icon: <CheckCircleOutlined /> };
        case 'Upcoming': return { color: 'blue', icon: <CalendarOutlined /> };
        case 'Past Due (0-3 days)': return { color: 'orange', icon: <SyncOutlined /> };
        default: return { color: 'default', icon: null };
    }
};

// ----------------------------------------------------
// 2. SUPPORT COMPONENT (Detail View)
// ----------------------------------------------------

const DueDetailView: React.FC<{ due: RepaymentDue, onBack: () => void }> = ({ due, onBack }) => {

    const repaymentProgress = ((due.totalPaid / due.originalLoanAmount) * 100).toFixed(1);

    return (
        <div className="page-container p-4 min-h-screen bg-gray-50">
            <Button 
                onClick={onBack} 
                icon={<ArrowLeftOutlined />} 
                type="dashed"
                className="mb-4"
            >
                Back to Dues Report
            </Button>
            
            <Title level={2} className="text-gray-800 flex items-center">
                <DollarCircleOutlined style={{ marginRight: 8, color: '#faad14' }} /> Loan Repayment: {due.loanId}
            </Title>
            <Text type="secondary" className="block mb-4">
                Client: <Tag color="geekblue" className="text-lg">{due.clientName}</Tag> | Officer: {due.loanOfficer}
            </Text>

            <Row gutter={[16, 16]} className="mt-4">
                {/* Section 1: Repayment Status */}
                <Col xs={24} lg={8}>
                    <Card title="Repayment Due Summary" className="h-full border-t-4 border-yellow-500 shadow-md">
                        <Statistic 
                            title="Expected Due Date" 
                            value={due.dueDate} 
                            prefix={<CalendarOutlined />} 
                        />
                        <Divider className="my-3" />
                        <Statistic 
                            title="Expected Amount (Today/Past Due)" 
                            value={due.expectedAmount} 
                            formatter={formatCurrency} 
                            valueStyle={{ color: '#faad14' }}
                            prefix={<DollarCircleOutlined />}
                        />
                        <Divider className="my-3" />
                        <Text strong>Current Status: </Text>
                        <Tag {...getStatusTagProps(due.status)} className="text-base">{due.status}</Tag>
                    </Card>
                </Col>

                {/* Section 2: Loan Financials */}
                <Col xs={24} lg={8}>
                    <Card title="Loan Financials" className="h-full border-t-4 border-blue-500 shadow-md">
                        <Descriptions column={1} bordered size="small">
                            <Descriptions.Item label="Original Amount">{formatCurrency(due.originalLoanAmount)}</Descriptions.Item>
                            <Descriptions.Item label="Principal Balance">{formatCurrency(due.principalBalance)}</Descriptions.Item>
                            <Descriptions.Item label="Total Paid to Date">{formatCurrency(due.totalPaid)}</Descriptions.Item>
                            <Descriptions.Item label="Interest Rate">{due.interestRate}% P.A.</Descriptions.Item>
                        </Descriptions>
                        <Text type="secondary" className="block mt-2 text-sm">
                            Repayment Progress: {repaymentProgress}%
                        </Text>
                        <Progress percent={parseFloat(repaymentProgress)} size="small" status="active" />
                    </Card>
                </Col>
                
                {/* Section 3: Contact & Officer */}
                <Col xs={24} lg={8}>
                    <Card title="Contact & Officer" className="h-full border-t-4 border-green-500 shadow-md">
                        <Descriptions column={1} bordered size="small">
                            <Descriptions.Item label="Client Name"><UserOutlined /> {due.clientName}</Descriptions.Item>
                            <Descriptions.Item label="Client Phone"><PhoneOutlined /> {due.clientContact}</Descriptions.Item>
                            <Descriptions.Item label="Loan Officer"><SolutionOutlined /> {due.loanOfficer}</Descriptions.Item>
                            <Descriptions.Item label="Branch"><HistoryOutlined /> {due.branch}</Descriptions.Item>
                            <Descriptions.Item label="Loan Purpose">{due.loanPurpose}</Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Col>
            </Row>
            
            <Card className="mt-4 shadow-md bg-white p-4">
                <Text type="secondary">
                    Note: This view is for monitoring collections. Use the "Contact Client" button (not implemented) to initiate contact.
                </Text>
            </Card>

        </div>
    );
};

// ----------------------------------------------------
// 3. MAIN COMPONENT
// ----------------------------------------------------

const DuesReport: React.FC = () => {
  const [selectedBranchId, setSelectedBranchId] = useState(0); // 0 for All Branches
  const [searchText, setSearchText] = useState('');
  // State for conditional rendering of the detail view
  const [selectedDue, setSelectedDue] = useState<RepaymentDue | null>(null);

  // Handler to show the detail view
  const handleViewDue = (record: RepaymentDue) => {
    setSelectedDue(record);
  };
  
  // Calculate Month-to-Date Collection Rate
  const collectionRateMTD = (mockSummary.collectedMTD / mockSummary.expectedMTD) * 100;
  
  // Memoize data to simulate filtering
  const filteredDuesData = useMemo(() => {
    let data = mockDuesData;

    // 1. Filter by Branch
    if (selectedBranchId !== 0) {
        const branchName = mockSummary.branches.find(b => b.id === selectedBranchId)?.name;
        data = data.filter(due => due.branch === branchName);
    }

    // 2. Filter by Search Text (Name or Loan ID)
    if (searchText) {
        const lowerCaseSearch = searchText.toLowerCase();
        data = data.filter(due =>
            due.clientName.toLowerCase().includes(lowerCaseSearch) ||
            due.loanId.toLowerCase().includes(lowerCaseSearch)
        );
    }

    return data;
  }, [selectedBranchId, searchText]);

  const duesColumns = [
    {
      title: 'Loan ID',
      dataIndex: 'loanId',
      key: 'loanId',
    },
    {
      title: 'Client Name',
      dataIndex: 'clientName',
      key: 'clientName',
      render: (text: string) => <Text strong>{text}</Text>
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      sorter: (a: RepaymentDue, b: RepaymentDue) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    },
    {
      title: 'Expected Amount',
      dataIndex: 'expectedAmount',
      key: 'expectedAmount',
      render: (amount: number) => <Text strong type="success">{formatCurrency(amount)}</Text>,
      sorter: (a: RepaymentDue, b: RepaymentDue) => a.expectedAmount - b.expectedAmount,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const props = getStatusTagProps(status);
        return <Tag color={props.color} icon={props.icon}>{status}</Tag>;
      },
      filters: [
        { text: 'Due Today', value: 'Due Today' },
        { text: 'Upcoming', value: 'Upcoming' },
        { text: 'Past Due (0-3 days)', value: 'Past Due (0-3 days)' },
      ],
      onFilter: (value: any, record: RepaymentDue) => record.status.indexOf(value as string) === 0,
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
    // NEW ACTION COLUMN
    {
        title: 'Action',
        key: 'action',
        render: (_: any, record: RepaymentDue) => (
            <Button 
                type="link" 
                onClick={() => handleViewDue(record)} 
                icon={<EyeOutlined />}
                className="p-0"
            >
                View
            </Button>
        ),
    },
  ];

  // Conditional Rendering: Show detail view if a loan is selected
  if (selectedDue) {
    return <DueDetailView due={selectedDue} onBack={() => setSelectedDue(null)} />;
  }

  // Main Report View
  return (
    <div>
      <PageHeader 
        title="Dues Report" 
        breadcrumbs={[
          { title: 'Dues Report' }
        ]} 
      />
      
      <div className="page-container p-4 min-h-screen bg-gray-50">
        <Title level={2} className="text-gray-800">
          🔔 Loans Due Report <BellOutlined style={{ color: '#faad14' }} />
        </Title>
        <Text type="secondary">
        Manage and view data for **upcoming loan repayments** and expected collections. This view guides daily collection activities.
      </Text>

      {/* Row 1: Key Metrics (Aligned perfectly) */}
      <Row gutter={[16, 16]} className="mt-4" align="stretch">
        {/* Metric Card 1: Expected Today */}
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className="shadow-md h-full border-t-4 border-yellow-500">
            <Statistic
              title="Expected Dues Today"
              value={mockSummary.expectedToday}
              formatter={formatCurrency}
              valueStyle={{ color: '#faad14' }}
              prefix={<DollarCircleOutlined />}
            />
            <Text type="secondary" className="text-xs block mt-2">Target amount for collection today.</Text>
          </Card>
        </Col>

        {/* Metric Card 2: Expected This Week */}
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className="shadow-md h-full border-t-4 border-blue-500">
            <Statistic
              title="Expected Dues This Week"
              value={mockSummary.expectedThisWeek}
              formatter={formatCurrency}
              prefix={<CalendarOutlined />}
            />
            <Text type="secondary" className="text-xs block mt-2">Forward-looking collection goal.</Text>
          </Card>
        </Col>

        {/* Metric Card 3: MTD Collection Progress */}
        <Col xs={24} sm={12} lg={12}>
          <Card title={<Title level={4} className="mb-0 text-gray-700"><RiseOutlined /> MTD Collection Progress</Title>} className="shadow-md h-full border-t-4 border-green-500">
            <Row gutter={16}>
                <Col span={10}>
                    <Statistic
                        title="Collected MTD"
                        value={mockSummary.collectedMTD}
                        formatter={formatCurrency}
                        valueStyle={{ color: '#3f8600' }}
                    />
                </Col>
                <Col span={14}>
                    <Statistic
                        title="Collection Rate"
                        value={collectionRateMTD}
                        precision={1}
                        suffix="%"
                        valueStyle={{ color: collectionRateMTD >= 90 ? '#3f8600' : '#faad14' }}
                    />
                    <Progress 
                        percent={parseFloat(collectionRateMTD.toFixed(1))} 
                        status={collectionRateMTD < 85 ? 'exception' : 'active'}
                        strokeColor="#52c41a"
                        className="mt-2"
                    />
                    <Text type="secondary" className="text-xs block">Expected: {formatCurrency(mockSummary.expectedMTD)}</Text>
                </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Row 2: Detailed Dues Table and Controls */}
      <Card title={<Title level={4} className="mb-0"><CalendarOutlined /> Upcoming Repayment Schedule</Title>} className="mt-4 shadow-lg border-t-4 border-gray-400">
        <Row gutter={[16, 16]} align="middle" className="mb-4">
            <Col xs={24} md={8}>
                <Input
                    placeholder="Search by Client Name or Loan ID"
                    prefix={<SearchOutlined />}
                    allowClear
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    size="large"
                />
            </Col>
            <Col xs={24} md={8}>
                <Select
                    value={selectedBranchId}
                    style={{ width: '100%' }}
                    onChange={setSelectedBranchId}
                    size="large"
                >
                    <Option value={0}>Filter by: All Branches</Option>
                    {mockSummary.branches.map(branch => (
                        <Option key={branch.id} value={branch.id}>{branch.name}</Option>
                    ))}
                </Select>
            </Col>
            <Col xs={24} md={8} className="text-right">
                <Text type="secondary">Showing {filteredDuesData.length} upcoming repayments.</Text>
            </Col>
        </Row>
        
        <Table 
            columns={duesColumns} 
            dataSource={filteredDuesData}
            rowKey="loanId"
            pagination={{ pageSize: 10 }}
            size="small"
        />
      </Card>
      </div>
    </div>
  );
};

export default DuesReport;