import React, { useState, useEffect, useMemo } from 'react';
import { Typography, Card, Row, Col, Statistic, Select, Tag, Table, Progress } from 'antd';
import { 
    DollarCircleOutlined, TeamOutlined, RiseOutlined, FireOutlined, 
    BankOutlined, LoadingOutlined, UserOutlined, 
    PushpinOutlined, 
    CalendarOutlined 
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

// ----------------------------------------------------
// 1. DATA STRUCTURES & MOCK DATA
// ----------------------------------------------------

interface BranchPerformance {
  id: number;
  branchName: string;
  manager: string;
  totalClients: number;
  loanPortfolio: number; // Outstanding loan balance
  savingsMobilized: number;
  portfolioAtRisk: number; // PAR in percentage (e.g., 5.5 for 5.5%)
  activeGroups: number;
  efficiencyRatio: number; // Operational efficiency ratio (e.g., 85 for 85%)
  recentGrowthRate: number; // % change MoM
  // New: Trend Data (Simulated for visualization)
  parTrend: number[]; // Last 6 months PAR history
}

interface OfficerPerformance {
    officerName: string;
    loansIssued: number;
    par30: number; // Portfolio at Risk (30 days)
    clientRetention: number; // %
    groupCount: number;
}

interface FinancialTarget {
    goalName: string;
    currentValue: number;
    targetValue: number;
    unit: string; // 'currency' or 'percent' or 'count' or 'risk_percent'
    color: string;
}

// Mock Data
const mockBranchData: BranchPerformance[] = [
    { id: 1, branchName: 'Central Market Hub', manager: 'Esther Kimani', totalClients: 1250, loanPortfolio: 25000000, savingsMobilized: 18000000, portfolioAtRisk: 4.8, activeGroups: 75, efficiencyRatio: 92, recentGrowthRate: 1.5, parTrend: [5.2, 5.0, 4.9, 4.8, 4.8, 4.8] },
    { id: 2, branchName: 'East Side Business', manager: 'David Mwangi', totalClients: 890, loanPortfolio: 18500000, savingsMobilized: 12500000, portfolioAtRisk: 8.1, activeGroups: 55, efficiencyRatio: 85, recentGrowthRate: -0.5, parTrend: [7.5, 7.8, 7.9, 8.0, 8.1, 8.1] },
    { id: 3, branchName: 'West Field Outreach', manager: 'Fatima Aden', totalClients: 1540, loanPortfolio: 32000000, savingsMobilized: 24500000, portfolioAtRisk: 3.2, activeGroups: 95, efficiencyRatio: 95, recentGrowthRate: 2.8, parTrend: [3.5, 3.4, 3.3, 3.2, 3.2, 3.2] },
    // Aggregate placeholder
    { id: 0, branchName: 'All Branches (Aggregate)', manager: 'N/A', totalClients: 3680, loanPortfolio: 75500000, savingsMobilized: 55000000, portfolioAtRisk: 5.4, activeGroups: 225, efficiencyRatio: 90.6, recentGrowthRate: 1.2, parTrend: [5.7, 5.5, 5.4, 5.4, 5.4, 5.4] },
];

const mockOfficerData: OfficerPerformance[] = [
    { officerName: 'Alex Johnson', loansIssued: 50, par30: 3.5, clientRetention: 98, groupCount: 10 },
    { officerName: 'Ben Carter', loansIssued: 45, par30: 6.2, clientRetention: 95, groupCount: 9 },
    { officerName: 'Clara Davis', loansIssued: 60, par30: 2.1, clientRetention: 99, groupCount: 12 },
    { officerName: 'Grace Muli', loansIssued: 35, par30: 7.9, clientRetention: 90, groupCount: 7 },
    { officerName: 'Tom Kiprop', loansIssued: 55, par30: 4.0, clientRetention: 97, groupCount: 11 },
];

const mockTargets: FinancialTarget[] = [
    { goalName: 'Monthly Loan Disbursement', currentValue: 12000000, targetValue: 15000000, unit: 'currency', color: '#1890ff' },
    { goalName: 'New Clients Onboarded', currentValue: 150, targetValue: 200, unit: 'count', color: '#52c41a' },
    { goalName: 'Max PAR 30 Days', currentValue: 5.4, targetValue: 5.0, unit: 'risk_percent', color: '#faad14' },
    { goalName: 'Client Savings Growth', currentValue: 12, targetValue: 10, unit: 'percent', color: '#722ed1' },
];

// Utility functions
const formatCurrency = (amount: number) => `KSh ${amount.toLocaleString('en-KE')}`;
const getParColor = (par: number) => {
    if (par > 8) return 'red'; // High Risk
    if (par > 5) return 'volcano'; // Elevated Risk
    if (par > 3) return 'orange'; // Moderate Risk
    return 'green'; // Low Risk
};

// ----------------------------------------------------
// 2. SUPPORT COMPONENTS
// ----------------------------------------------------

// Component to track progress against a target
const GoalProgressCard: React.FC<{ target: FinancialTarget }> = ({ target }) => {
    const isRiskMetric = target.unit === 'risk_percent';
    // For risk, goal is met if current <= target (lower is better)
    const isMet = isRiskMetric ? target.currentValue <= target.targetValue : target.currentValue >= target.targetValue;
    
    let percent = 0;
    if (isRiskMetric) {
        // If below target, show 100% success. If above target, show ratio progress towards target.
        percent = target.currentValue <= target.targetValue ? 100 : Math.min(100, (target.targetValue / target.currentValue) * 100);
    } else if (target.unit === 'currency' || target.unit === 'count') {
        percent = Math.min(100, (target.currentValue / target.targetValue) * 100);
    } else { // Percent
        percent = Math.min(100, target.currentValue);
    }

    const valueDisplay = target.unit === 'currency' 
        ? formatCurrency(target.currentValue) 
        : (target.unit === 'risk_percent' || target.unit === 'percent' 
            ? `${target.currentValue.toFixed(1)}%` 
            : target.currentValue.toLocaleString());
    
    const targetDisplay = target.unit === 'currency' 
        ? formatCurrency(target.targetValue) 
        : (target.unit === 'risk_percent' || target.unit === 'percent' 
            ? `${target.targetValue.toFixed(1)}%` 
            : target.targetValue.toLocaleString());

    return (
        <Card size="small" className="shadow-sm h-full" hoverable>
            <Text strong className="block text-sm text-gray-700 mb-1">{target.goalName}</Text>
            <Progress 
                percent={percent} 
                // Green for met, Red for unmet (adjusted for risk)
                strokeColor={isMet ? '#52c41a' : '#f5222d'}
                status={isMet ? 'success' : 'exception'}
                showInfo={false}
                size="small"
            />
            <Row justify="space-between" align="middle" className="mt-2">
                <Col>
                    <Text type="secondary" className="text-xs block">
                        <PushpinOutlined className="mr-1" style={{ color: target.color }} /> Target: {targetDisplay}
                    </Text>
                </Col>
                <Col>
                    <Text strong style={{ color: isMet ? '#52c41a' : '#f5222d' }}>
                        {valueDisplay}
                    </Text>
                </Col>
            </Row>
        </Card>
    );
};

// Component to simulate a trend line visualization (Reverted from Recharts for stability)
const ParTrendChartPlaceholder: React.FC<{ data: number[] }> = ({ data }) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const targetPar = 5.0; // Benchmark PAR target
    const targetColor = '#1890ff';

    // Find the range of the data for normalization
    const allValues = [...data, targetPar];
    const minVal = Math.min(...allValues);
    const maxVal = Math.max(...allValues);
    const range = maxVal - minVal;

    // Normalize value to a height percentage (30% to 90%)
    const normalize = (value: number) => {
        if (range === 0) return 60; // Default height if all values are the same
        return 30 + (value - minVal) / range * 60; 
    };

    // Calculate the position of the target line relative to the max bar height (90%)
    const targetHeightPercentage = normalize(targetPar);

    return (
        <Card title={<Title level={4} className="mb-0"><CalendarOutlined /> PAR Trend (Last 6M)</Title>} className="shadow-lg h-full">
            <div className="h-64 flex items-end justify-between relative px-2">
                
                {/* Visual Target Line (Dashed) */}
                <div 
                    className="absolute w-full border-b-2 border-dashed top-0 left-0" 
                    style={{ 
                        bottom: `calc(${targetHeightPercentage}% - 14px)`, // Adjust position to align with bar tops
                        borderColor: targetColor, 
                        opacity: 0.8,
                        zIndex: 10,
                        
                    }}>
                    <div className="absolute left-0 -top-3 px-1 bg-white text-xs font-semibold text-blue-600">
                        Target {targetPar.toFixed(1)}%
                    </div>
                </div>

                {data.map((value, index) => {
                    const barHeight = normalize(value);
                    const parColor = getParColor(value);
                    
                    return (
                        <div key={index} className="flex flex-col items-center h-full justify-end w-1/6 px-1 z-20">
                            {/* Value Label */}
                            <Text className="text-xs mb-1 font-semibold" style={{ color: parColor }}>
                                {value.toFixed(1)}%
                            </Text>
                            {/* Bar Visualization */}
                            <div 
                                className="w-5/6 rounded-t-lg transition-all duration-500 hover:opacity-100 cursor-pointer" 
                                style={{ 
                                    height: `${barHeight}%`, 
                                    backgroundColor: parColor === 'green' ? '#52c41a' : (parColor === 'red' ? '#cf1322' : '#faad14'), 
                                    opacity: 0.9,
                                    boxShadow: `0 0 10px ${parColor === 'green' ? '#52c41a' : '#cf1322'}50`,
                                }}
                                title={`${months[index]}: ${value}%`}
                            ></div>
                            {/* Month Label */}
                            <Text type="secondary" className="text-xs mt-1">{months[index]}</Text>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
};


// ----------------------------------------------------
// 3. MAIN COMPONENT
// ----------------------------------------------------

const BranchPerformanceReport: React.FC = () => {
  const [selectedBranchId, setSelectedBranchId] = useState(0); // 0 for All Branches
  const [loading, setLoading] = useState(false);
  
  // Simulated data fetching on branch change
  useEffect(() => {
    setLoading(true);
    // Simulate API call delay
    const timer = setTimeout(() => {
        setLoading(false);
    }, 500); 
    return () => clearTimeout(timer);
  }, [selectedBranchId]);

  const currentBranchData = useMemo(() => {
    return mockBranchData.find(b => b.id === selectedBranchId) || mockBranchData[3]; // Fallback to aggregate
  }, [selectedBranchId]);

  const performanceColumns = [
    {
      title: 'Credit Officer',
      dataIndex: 'officerName',
      key: 'officerName',
      render: (text: string) => <Tag icon={<UserOutlined />}>{text}</Tag>
    },
    {
      title: 'Loans Issued',
      dataIndex: 'loansIssued',
      key: 'loansIssued',
      sorter: (a: OfficerPerformance, b: OfficerPerformance) => a.loansIssued - b.loansIssued,
    },
    {
      title: 'Groups Managed',
      dataIndex: 'groupCount',
      key: 'groupCount',
      sorter: (a: OfficerPerformance, b: OfficerPerformance) => a.groupCount - b.groupCount,
    },
    {
      title: 'PAR (30 Days)',
      dataIndex: 'par30',
      key: 'par30',
      render: (par: number) => (
        // Ensure PAR is displayed correctly here
        <Tag color={getParColor(par)}>{par.toFixed(1)}%</Tag>
      ),
      sorter: (a: OfficerPerformance, b: OfficerPerformance) => a.par30 - b.par30,
    },
    {
      title: 'Client Retention',
      dataIndex: 'clientRetention',
      key: 'clientRetention',
      render: (retention: number) => (
        <Progress percent={retention} size="small" status={retention < 90 ? 'exception' : 'success'} />
      ),
      sorter: (a: OfficerPerformance, b: OfficerPerformance) => a.clientRetention - b.clientRetention,
    },
  ];


  return (
    <div className="page-container p-4 min-h-screen bg-gray-50">
      <Title level={2} className="text-gray-800">
        🏆 Branch Performance Report <BankOutlined style={{ color: '#1890ff' }} />
      </Title>
      <Text type="secondary">
        Manage and view data for **branch-wise metrics** and operational efficiency.
      </Text>

      {/* Branch Selector and Title */}
      <Card className="mt-4 p-4 shadow-xl rounded-lg border-t-4 border-blue-100">
        <Row gutter={16} align="middle">
            <Col xs={24} md={8} lg={6}>
                <Text strong>Select Branch:</Text>
                <Select
                    value={selectedBranchId}
                    style={{ width: '100%', marginTop: 8 }}
                    onChange={setSelectedBranchId}
                    disabled={loading}
                    size="large"
                >
                    <Option value={0}>All Branches (Aggregate)</Option>
                    <Option value={1}>Central Market Hub</Option>
                    <Option value={2}>East Side Business</Option>
                    <Option value={3}>West Field Outreach</Option>
                </Select>
            </Col>
            <Col xs={24} md={16} lg={18}>
                <div className="flex items-center justify-end pt-4 md:pt-0">
                    {loading ? (
                        <Text type="secondary" className="flex items-center text-lg"><LoadingOutlined className="mr-2" /> Loading data...</Text>
                    ) : (
                        <Title level={3} className="mb-0 text-right text-gray-700">
                            {currentBranchData.branchName}
                        </Title>
                    )}
                </div>
            </Col>
        </Row>
      </Card>

      {/* Row 1: Key Metrics (Ensuring h-full for alignment) */}
      <Row gutter={[16, 16]} className="mt-4" align="stretch">
        {/* Metric Card 1: Portfolio at Risk (PAR) - Checked and confirmed display */}
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className="shadow-md h-full border-t-4 border-red-500">
            <Statistic
              title="Portfolio at Risk (PAR > 30)"
              value={currentBranchData.portfolioAtRisk}
              precision={1}
              valueStyle={{ color: getParColor(currentBranchData.portfolioAtRisk) === 'green' ? '#3f8600' : '#cf1322' }}
              prefix={<FireOutlined />}
              suffix="%"
              loading={loading}
            />
            <Text type="secondary" className="text-xs block mt-2">Target: &lt; 5.0%</Text>
          </Card>
        </Col>

        {/* Metric Card 2: Loan Portfolio */}
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className="shadow-md h-full border-t-4 border-blue-500">
            <Statistic
              title="Total Loan Portfolio"
              value={currentBranchData.loanPortfolio}
              formatter={formatCurrency}
              prefix={<DollarCircleOutlined />}
              loading={loading}
            />
            <Text type="secondary" className="text-xs block mt-2">Outstanding Balance</Text>
          </Card>
        </Col>

        {/* Metric Card 3: Savings Mobilized */}
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className="shadow-md h-full border-t-4 border-green-500">
            <Statistic
              title="Savings Mobilized"
              value={currentBranchData.savingsMobilized}
              formatter={formatCurrency}
              prefix={<BankOutlined />}
              loading={loading}
            />
            <Text type="secondary" className="text-xs block mt-2">Client deposits to date</Text>
          </Card>
        </Col>

        {/* Metric Card 4: Client & Group Count */}
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className="shadow-md h-full border-t-4 border-purple-500">
            <Row gutter={8}>
                <Col span={12}>
                    <Statistic
                        title="Total Clients"
                        value={currentBranchData.totalClients}
                        prefix={<TeamOutlined />}
                        loading={loading}
                    />
                </Col>
                <Col span={12}>
                    <Statistic
                        title="Active Groups"
                        value={currentBranchData.activeGroups}
                        prefix={<TeamOutlined />}
                        loading={loading}
                    />
                </Col>
            </Row>
            <Text type="secondary" className="text-xs block mt-2">Efficiency: {currentBranchData.efficiencyRatio}%</Text>
          </Card>
        </Col>
      </Row>

      {/* Row 2: Goals and Trends (Ensuring h-full for alignment) */}
      <Row gutter={[16, 16]} className="mt-4" align="stretch">
        {/* Goals Tracking (4 Goals) */}
        <Col xs={24} lg={12}>
            <Card title={<Title level={4} className="mb-0 text-blue-600"><PushpinOutlined /> Monthly Goal Tracking</Title>} className="shadow-lg h-full p-2">
                <Row gutter={[16, 16]}>
                    {mockTargets.map((target, index) => (
                        <Col xs={24} sm={12} key={index}>
                            <GoalProgressCard target={target} />
                        </Col>
                    ))}
                </Row>
            </Card>
        </Col>

        {/* PAR Trend Visualization (Now a clear, custom graph) */}
        <Col xs={24} lg={12}>
            <ParTrendChartPlaceholder data={currentBranchData.parTrend} />
        </Col>
      </Row>
      
      {/* Row 3: Detailed Officer Performance Table */}
      <Card title={<Title level={4} className="mb-0"><RiseOutlined /> Credit Officer Performance</Title>} className="mt-4 shadow-lg border-t-4 border-gray-400">
        <Text type="secondary" className="block mb-4">
            Detailed performance breakdown for credit officers operating within the selected region.
        </Text>
        <Table 
            columns={performanceColumns} 
            dataSource={mockOfficerData} // In a real app, this would be filtered by branch
            rowKey="officerName"
            pagination={{ pageSize: 5 }}
            size="small"
            loading={loading}
        />
      </Card>
    </div>
  );
};

export default BranchPerformanceReport;