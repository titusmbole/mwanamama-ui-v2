import React, { useState, useMemo } from 'react';
import { 
    Typography, Card, Row, Col, Statistic, Select, Tag, Table, Progress, Button, 
    Descriptions, Divider, Space // Added for Detail View
} from 'antd';
import { 
    DollarCircleOutlined, AlertOutlined, HistoryOutlined, TeamOutlined, RiseOutlined,
    CheckCircleOutlined, FireOutlined, BankOutlined, EyeOutlined, ArrowLeftOutlined,
    UserOutlined, PhoneOutlined, MailOutlined, SolutionOutlined, CalendarOutlined // Added icons for detail
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

// ----------------------------------------------------
// 1. DATA STRUCTURES & MOCK DATA
// ----------------------------------------------------

interface ArrearsSummary {
    totalOverdueAmount: number;
    delinquentLoansCount: number;
    collectionRate: number; // % collected this month
    par30Days: number; // Portfolio At Risk (>30 days)
    branches: { id: number; name: string }[];
}

interface LoanArrear {
    loanId: string;
    clientName: string;
    branch: string;
    overdueAmount: number;
    daysInArrears: number;
    loanOfficer: string;
    status: 'High Risk' | 'Medium Risk' | 'Watchlist';
    // Detailed fields for single view
    principalBalance: number;
    originalLoanAmount: number;
    totalPaid: number;
    clientContact: string; // Phone number
    clientEmail: string;
    loanPurpose: string;
    lastPaymentDate: string;
}

interface ArrearsAging {
    category: string;
    days: string;
    amount: number;
    color: string;
}

// Mock Data
const mockSummary: ArrearsSummary = {
    totalOverdueAmount: 850000,
    delinquentLoansCount: 145,
    collectionRate: 88.5,
    par30Days: 7.2,
    branches: [
        { id: 1, name: 'Central Market Hub' },
        { id: 2, name: 'East Side Business' },
        { id: 3, name: 'West Field Outreach' },
    ]
};

const mockAgingData: ArrearsAging[] = [
    { category: 'Watchlist', days: '1-30 Days', amount: 350000, color: '#fadb14' }, // Yellow/Orange
    { category: 'Medium Risk', days: '31-60 Days', amount: 250000, color: '#fa8c16' }, // Darker Orange
    { category: 'High Risk', days: '61-90 Days', amount: 150000, color: '#ff4d4f' }, // Red
    { category: 'Severe Risk', days: '> 90 Days', amount: 100000, color: '#cf1322' }, // Dark Red
];

// Updated mock data with detail fields
const mockLoanData: LoanArrear[] = [
    { loanId: 'LN9001', clientName: 'Alice Muthoni', branch: 'Central Market Hub', overdueAmount: 15000, daysInArrears: 35, loanOfficer: 'Esther Kimani', status: 'Medium Risk', principalBalance: 85000, originalLoanAmount: 100000, totalPaid: 5000, clientContact: '0711 223 344', clientEmail: 'alice.m@example.com', loanPurpose: 'Inventory Purchase', lastPaymentDate: '2025-10-15' },
    { loanId: 'LN9002', clientName: 'Ben Kipkemboi', branch: 'East Side Business', overdueAmount: 55000, daysInArrears: 95, loanOfficer: 'David Mwangi', status: 'High Risk', principalBalance: 200000, originalLoanAmount: 300000, totalPaid: 45000, clientContact: '0700 112 233', clientEmail: 'ben.k@example.com', loanPurpose: 'Business Expansion', lastPaymentDate: '2025-08-01' },
    { loanId: 'LN9003', clientName: 'Clara Njeri', branch: 'West Field Outreach', overdueAmount: 8000, daysInArrears: 12, loanOfficer: 'Fatima Aden', status: 'Watchlist', principalBalance: 42000, originalLoanAmount: 50000, totalPaid: 0, clientContact: '0722 334 455', clientEmail: 'clara.n@example.com', loanPurpose: 'Asset Purchase', lastPaymentDate: '2025-11-05' },
    { loanId: 'LN9004', clientName: 'Daniel Otieno', branch: 'Central Market Hub', overdueAmount: 120000, daysInArrears: 65, loanOfficer: 'Alex Johnson', status: 'High Risk', principalBalance: 700000, originalLoanAmount: 1000000, totalPaid: 180000, clientContact: '0733 445 566', clientEmail: 'daniel.o@example.com', loanPurpose: 'Property Development', lastPaymentDate: '2025-09-01' },
    { loanId: 'LN9005', clientName: 'Eva Adhiambo', branch: 'East Side Business', overdueAmount: 22000, daysInArrears: 25, loanOfficer: 'Ben Carter', status: 'Watchlist', principalBalance: 120000, originalLoanAmount: 150000, totalPaid: 8000, clientContact: '0744 556 677', clientEmail: 'eva.a@example.com', loanPurpose: 'Emergency Fund', lastPaymentDate: '2025-10-25' },
];

// Utility functions
const formatCurrency = (amount: number) => `KSh ${amount.toLocaleString('en-KE')}`;
const getStatusColor = (status: string) => {
    switch (status) {
        case 'High Risk': return 'red';
        case 'Medium Risk': return 'orange';
        case 'Watchlist': return 'gold';
        default: return 'default';
    }
};

// ----------------------------------------------------
// 2. SUPPORT COMPONENTS (Aging Chart & Detail View)
// ----------------------------------------------------

// Component for Arrears Aging Visualization
const ArrearsAgingChartPlaceholder: React.FC<{ data: ArrearsAging[], total: number }> = ({ data, total }) => {
    return (
        <Card title={<Title level={4} className="mb-0"><HistoryOutlined /> Arrears Aging Breakdown</Title>} className="shadow-lg h-full">
            <Row gutter={[16, 16]}>
                {data.map((item, index) => (
                    <Col xs={24} key={index} className="flex flex-col">
                        <div className="flex justify-between items-center mb-1">
                            <Tag color={item.color} className="font-semibold">{item.days}</Tag>
                            <Text strong>{formatCurrency(item.amount)}</Text>
                        </div>
                        <Progress 
                            percent={parseFloat(((item.amount / total) * 100).toFixed(1))}
                            strokeColor={item.color}
                            size="small"
                            showInfo={false}
                        />
                        <Text type="secondary" className="text-xs mt-1">{item.category}</Text>
                    </Col>
                ))}
            </Row>
        </Card>
    );
};


// Loan Detail View Component
const LoanDetailView: React.FC<{ loan: LoanArrear, onBack: () => void }> = ({ loan, onBack }) => {
    
    // Calculate Loan Repayment Progress
    const repaymentProgress = ((loan.totalPaid / loan.originalLoanAmount) * 100).toFixed(1);

    return (
        <div className="page-container p-4 min-h-screen bg-gray-50">
            <Button 
                onClick={onBack} 
                icon={<ArrowLeftOutlined />} 
                type="dashed"
                danger
                className="mb-4"
            >
                Back to Arrears Report
            </Button>
            
            <Title level={2} className="text-gray-800 flex items-center">
                <FireOutlined style={{ marginRight: 8, color: getStatusColor(loan.status) }} /> Delinquent Loan: {loan.loanId}
            </Title>
            <Text type="secondary" className="block mb-4">
                Client: <Tag color="geekblue" className="text-lg">{loan.clientName}</Tag> | Status: <Tag color={getStatusColor(loan.status)} className="text-lg">{loan.status}</Tag>
            </Text>

            <Row gutter={[16, 16]} className="mt-4">
                {/* Section 1: Arrears Status */}
                <Col xs={24} lg={8}>
                    <Card title="Arrears Status" className="h-full border-t-4 border-red-500 shadow-md">
                        <Statistic 
                            title="Overdue Amount" 
                            value={loan.overdueAmount} 
                            formatter={formatCurrency} 
                            valueStyle={{ color: '#cf1322' }}
                            prefix={<DollarCircleOutlined />}
                        />
                        <Divider className="my-3" />
                        <Statistic 
                            title="Days in Arrears" 
                            value={loan.daysInArrears} 
                            prefix={<CalendarOutlined />} 
                        />
                        <Divider className="my-3" />
                        <Statistic 
                            title="Last Payment" 
                            value={loan.lastPaymentDate} 
                            prefix={<HistoryOutlined />} 
                        />
                    </Card>
                </Col>

                {/* Section 2: Loan Financials & Progress */}
                <Col xs={24} lg={8}>
                    <Card title="Loan Financials" className="h-full border-t-4 border-orange-500 shadow-md">
                        <Descriptions column={1} bordered size="small">
                            <Descriptions.Item label="Original Amount">{formatCurrency(loan.originalLoanAmount)}</Descriptions.Item>
                            <Descriptions.Item label="Principal Balance">{formatCurrency(loan.principalBalance)}</Descriptions.Item>
                            <Descriptions.Item label="Total Paid to Date">{formatCurrency(loan.totalPaid)}</Descriptions.Item>
                            <Descriptions.Item label="Loan Purpose">{loan.loanPurpose}</Descriptions.Item>
                        </Descriptions>
                        <Text type="secondary" className="block mt-2 text-sm">
                            Repayment Progress: {repaymentProgress}%
                        </Text>
                        <Progress percent={parseFloat(repaymentProgress)} size="small" status="active" />
                    </Card>
                </Col>
                
                {/* Section 3: Contact & Officer */}
                <Col xs={24} lg={8}>
                    <Card title="Client & Officer Contact" className="h-full border-t-4 border-gold-500 shadow-md">
                        <Descriptions column={1} bordered size="small">
                            <Descriptions.Item label="Client Name"><UserOutlined /> {loan.clientName}</Descriptions.Item>
                            <Descriptions.Item label="Client Phone"><PhoneOutlined /> {loan.clientContact}</Descriptions.Item>
                            <Descriptions.Item label="Client Email"><MailOutlined /> {loan.clientEmail}</Descriptions.Item>
                            <Descriptions.Item label="Loan Officer"><SolutionOutlined /> {loan.loanOfficer}</Descriptions.Item>
                            <Descriptions.Item label="Branch">{loan.branch}</Descriptions.Item>
                        </Descriptions>
                        <Button type="primary" danger block className="mt-4">
                            Contact Client (Simulated Call)
                        </Button>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

// ----------------------------------------------------
// 3. MAIN COMPONENT
// ----------------------------------------------------

const ArrearsReport: React.FC = () => {
  const [selectedBranchId, setSelectedBranchId] = useState(0); // 0 for All Branches
  // State to hold the currently selected loan for the detail view
  const [selectedLoan, setSelectedLoan] = useState<LoanArrear | null>(null); 
  
  // Handler to show the detail view
  const handleViewLoan = (record: LoanArrear) => {
    setSelectedLoan(record);
  };
  
  // Memoize data to simulate filtering
  const filteredLoanData = useMemo(() => {
    if (selectedBranchId === 0) return mockLoanData;
    const branchName = mockSummary.branches.find(b => b.id === selectedBranchId)?.name;
    return mockLoanData.filter(loan => loan.branch === branchName);
  }, [selectedBranchId]);

  const loanColumns = [
    {
      title: 'Loan ID',
      dataIndex: 'loanId',
      key: 'loanId',
    },
    {
      title: 'Client Name',
      dataIndex: 'clientName',
      key: 'clientName',
      render: (text: string) => <Tag icon={<TeamOutlined />}>{text}</Tag>
    },
    {
      title: 'Branch',
      dataIndex: 'branch',
      key: 'branch',
    },
    {
      title: 'Overdue Amount',
      dataIndex: 'overdueAmount',
      key: 'overdueAmount',
      render: (amount: number) => <Text strong type="danger">{formatCurrency(amount)}</Text>,
      sorter: (a: LoanArrear, b: LoanArrear) => a.overdueAmount - b.overdueAmount,
    },
    {
      title: 'Days in Arrears',
      dataIndex: 'daysInArrears',
      key: 'daysInArrears',
      sorter: (a: LoanArrear, b: LoanArrear) => a.daysInArrears - b.daysInArrears,
    },
    {
      title: 'Risk Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)} icon={<FireOutlined />}>{status}</Tag>
      ),
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
        render: (_: any, record: LoanArrear) => (
            <Button 
                type="link" 
                onClick={() => handleViewLoan(record)} 
                icon={<EyeOutlined />}
                danger
                className="p-0"
            >
                View
            </Button>
        ),
    },
  ];

  // Conditional Rendering: Show detail view if a loan is selected
  if (selectedLoan) {
    return <LoanDetailView loan={selectedLoan} onBack={() => setSelectedLoan(null)} />;
  }

  // Main Report View
  return (
    <div className="page-container p-4 min-h-screen bg-gray-50">
      <Title level={2} className="text-gray-800">
        🔴 Loans in Arrears Report <AlertOutlined style={{ color: '#ff4d4f' }} />
      </Title>
      <Text type="secondary">
        Manage and view data for **delinquent loans** and overdue amounts. Prioritize collections efforts based on aging.
      </Text>

      {/* Branch Selector Card */}
      <Card className="mt-4 p-4 shadow-xl rounded-lg border-t-4 border-red-100">
        <Row gutter={16} align="middle">
            <Col xs={24} md={8} lg={6}>
                <Text strong>Filter by Branch:</Text>
                <Select
                    value={selectedBranchId}
                    style={{ width: '100%', marginTop: 8 }}
                    onChange={setSelectedBranchId}
                    size="large"
                >
                    <Option value={0}>All Branches (Aggregate)</Option>
                    {mockSummary.branches.map(branch => (
                        <Option key={branch.id} value={branch.id}>{branch.name}</Option>
                    ))}
                </Select>
            </Col>
            <Col xs={24} md={16} lg={18}>
                <Title level={3} className="mb-0 text-right text-gray-700 pt-4 md:pt-0">
                    Showing data for: {selectedBranchId === 0 ? 'All Branches' : mockSummary.branches.find(b => b.id === selectedBranchId)?.name}
                </Title>
            </Col>
        </Row>
      </Card>

      {/* Row 1: Key Metrics (Aligned perfectly) */}
      <Row gutter={[16, 16]} className="mt-4" align="stretch">
        {/* Metric Card 1: Total Overdue Amount */}
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className="shadow-md h-full border-t-4 border-red-600">
            <Statistic
              title="Total Overdue Amount"
              value={mockSummary.totalOverdueAmount}
              formatter={formatCurrency}
              valueStyle={{ color: '#cf1322' }}
              prefix={<DollarCircleOutlined />}
            />
            <Text type="secondary" className="text-xs block mt-2">Sum of all missed payments.</Text>
          </Card>
        </Col>

        {/* Metric Card 2: Delinquent Loan Count */}
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className="shadow-md h-full border-t-4 border-orange-500">
            <Statistic
              title="Delinquent Loans"
              value={mockSummary.delinquentLoansCount}
              prefix={<BankOutlined />}
            />
            <Text type="secondary" className="text-xs block mt-2">Number of loans with overdue payments.</Text>
          </Card>
        </Col>

        {/* Metric Card 3: PAR > 30 Days */}
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className="shadow-md h-full border-t-4 border-red-400">
            <Statistic
              title="PAR (> 30 Days)"
              value={mockSummary.par30Days}
              precision={1}
              valueStyle={{ color: '#cf1322' }}
              prefix={<FireOutlined />}
              suffix="%"
            />
            <Text type="secondary" className="text-xs block mt-2">Benchmark for portfolio quality.</Text>
          </Card>
        </Col>

        {/* Metric Card 4: Monthly Collection Rate */}
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className="shadow-md h-full border-t-4 border-green-500">
            <Statistic
              title="Collection Rate (MoM)"
              value={mockSummary.collectionRate}
              precision={1}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
              suffix="%"
            />
            <Text type="secondary" className="text-xs block mt-2">Percentage of expected payments collected.</Text>
          </Card>
        </Col>
      </Row>

      {/* Row 2: Arrears Aging Analysis */}
      <Row gutter={[16, 16]} className="mt-4" align="stretch">
        <Col xs={24} lg={12}>
            {/* The Arrears Aging Chart */}
            <ArrearsAgingChartPlaceholder data={mockAgingData} total={mockSummary.totalOverdueAmount} />
        </Col>
        
        {/* Placeholder for future Charts / Maps / Insights */}
        <Col xs={24} lg={12}>
            <Card title={<Title level={4} className="mb-0 text-gray-600"><RiseOutlined /> Collection Insights</Title>} className="shadow-lg h-full p-2 flex flex-col justify-between">
                <div>
                    <Text className="block mb-2">
                        Focus efforts on the **1-30 Days** category ({formatCurrency(mockAgingData[0].amount)}) to prevent further deterioration.
                    </Text>
                    <Progress percent={7.2} format={(percent) => `${percent}% PAR > 30 days`} status="exception" />
                    <Text className="block mt-4">
                        <Tag color="red">Action Required</Tag> Follow up immediately on the {mockAgingData.length} accounts in the severe risk category.
                    </Text>
                </div>
                <div className="mt-4">
                    <Text type="secondary" className="block text-sm">
                        *This section is reserved for machine-learning driven collection strategies and predicted recovery rates.*
                    </Text>
                </div>
            </Card>
        </Col>
      </Row>

      {/* Row 3: Detailed Delinquent Loan Table */}
      <Card title={<Title level={4} className="mb-0"><TeamOutlined /> Detailed Delinquent Loans</Title>} className="mt-4 shadow-lg border-t-4 border-red-400">
        <Text type="secondary" className="block mb-4">
            List of all loans in arrears for the selected region, sorted by Days in Arrears.
        </Text>
        <Table 
            columns={loanColumns} 
            dataSource={filteredLoanData}
            rowKey="loanId"
            pagination={{ pageSize: 10 }}
            size="small"
        />
      </Card>
    </div>
  );
};

export default ArrearsReport;