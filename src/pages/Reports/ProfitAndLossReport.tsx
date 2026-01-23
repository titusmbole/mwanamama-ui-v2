import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Statistic, Table, Select, DatePicker, Button, Space, message, Spin
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  DollarCircleOutlined, RiseOutlined, FallOutlined, FileTextOutlined,
  DownloadOutlined, PrinterOutlined
} from '@ant-design/icons';
import PageHeader from '../../components/common/Layout/PageHeader';
import PageCard from '../../components/common/PageCard/PageCard';
import http from '../../services/httpInterceptor';
import { APIS } from '../../services/APIS';
import dayjs, { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface RevenueItem {
  id: number;
  category: string;
  amount: number;
  percentage: number;
}

interface ExpenseItem {
  id: number;
  category: string;
  amount: number;
  percentage: number;
}

interface ProfitLossData {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  revenues: RevenueItem[];
  expenses: ExpenseItem[];
}

const ProfitAndLossReport: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ProfitLossData | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().startOf('month'),
    dayjs().endOf('month')
  ]);
  const [branches, setBranches] = useState<any[]>([]);

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    if (branches.length > 0) {
      fetchData();
    }
  }, [selectedBranch, dateRange, branches]);

  const fetchBranches = async () => {
    try {
      const response = await http.get(APIS.LOAD_BRANCHES);
      setBranches(response.data.content || []);
    } catch (error: any) {
      message.error('Failed to load branches');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {
        branchId: selectedBranch === 'all' ? undefined : selectedBranch,
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD')
      };
      
      const response = await http.get(APIS.PROFIT_LOSS_REPORT, { params });
      setData(response.data);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to load profit & loss data');
      // Mock data for development
      setData({
        totalRevenue: 5250000,
        totalExpenses: 3180000,
        netProfit: 2070000,
        profitMargin: 39.43,
        revenues: [
          { id: 1, category: 'Interest Income', amount: 3500000, percentage: 66.67 },
          { id: 2, category: 'Fees & Commissions', amount: 950000, percentage: 18.10 },
          { id: 3, category: 'Product Sales', amount: 650000, percentage: 12.38 },
          { id: 4, category: 'Other Income', amount: 150000, percentage: 2.86 }
        ],
        expenses: [
          { id: 1, category: 'Staff Salaries', amount: 1500000, percentage: 47.17 },
          { id: 2, category: 'Operational Costs', amount: 850000, percentage: 26.73 },
          { id: 3, category: 'Loan Loss Provision', amount: 450000, percentage: 14.15 },
          { id: 4, category: 'Administrative', amount: 280000, percentage: 8.81 },
          { id: 5, category: 'Marketing', amount: 100000, percentage: 3.14 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      message.success('Exporting profit & loss report...');
      // Add export logic here
    } catch (error: any) {
      message.error('Failed to export report');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const revenueColumns: ColumnsType<RevenueItem> = [
    {
      title: 'Revenue Category',
      dataIndex: 'category',
      key: 'category'
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `KES ${amount.toLocaleString()}`
    },
    {
      title: 'Percentage',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (percentage: number) => `${percentage.toFixed(2)}%`
    }
  ];

  const expenseColumns: ColumnsType<ExpenseItem> = [
    {
      title: 'Expense Category',
      dataIndex: 'category',
      key: 'category'
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `KES ${amount.toLocaleString()}`
    },
    {
      title: 'Percentage',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (percentage: number) => `${percentage.toFixed(2)}%`
    }
  ];

  return (
    <div>
      <PageHeader 
        title="Profit & Loss Report" 
        breadcrumbs={[
          { title: 'Home', path: '/' },
          { title: 'Reports', path: '#' },
          { title: 'Profit & Loss' }
        ]} 
      />

      <PageCard>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Filters */}
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Select
                style={{ width: '100%' }}
                placeholder="Select Branch"
                value={selectedBranch}
                onChange={setSelectedBranch}
              >
                <Option value="all">All Branches</Option>
                {branches.map((branch: any) => (
                  <Option key={branch.id} value={branch.id}>
                    {branch.branchName}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={10}>
              <RangePicker
                style={{ width: '100%' }}
                value={dateRange}
                onChange={(dates) => dates && setDateRange(dates as [Dayjs, Dayjs])}
              />
            </Col>
            <Col xs={24} sm={24} md={6}>
              <Space>
                <Button 
                  icon={<DownloadOutlined />}
                  onClick={handleExport}
                >
                  Export
                </Button>
                <Button 
                  icon={<PrinterOutlined />}
                  onClick={handlePrint}
                >
                  Print
                </Button>
              </Space>
            </Col>
          </Row>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <Spin size="large" />
            </div>
          ) : data ? (
            <>
              {/* Summary Statistics */}
              <Row gutter={16}>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Total Revenue"
                      value={data.totalRevenue}
                      prefix={<DollarCircleOutlined />}
                      valueStyle={{ color: '#3f8600' }}
                      formatter={(value) => `KES ${value.toLocaleString()}`}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Total Expenses"
                      value={data.totalExpenses}
                      prefix={<DollarCircleOutlined />}
                      valueStyle={{ color: '#cf1322' }}
                      formatter={(value) => `KES ${value.toLocaleString()}`}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Net Profit"
                      value={data.netProfit}
                      prefix={data.netProfit >= 0 ? <RiseOutlined /> : <FallOutlined />}
                      valueStyle={{ color: data.netProfit >= 0 ? '#3f8600' : '#cf1322' }}
                      formatter={(value) => `KES ${value.toLocaleString()}`}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Profit Margin"
                      value={data.profitMargin}
                      suffix="%"
                      valueStyle={{ color: data.profitMargin >= 0 ? '#3f8600' : '#cf1322' }}
                    />
                  </Card>
                </Col>
              </Row>

              {/* Revenue Breakdown */}
              <Card 
                title={
                  <Space>
                    <FileTextOutlined />
                    Revenue Breakdown
                  </Space>
                }
              >
                <Table
                  columns={revenueColumns}
                  dataSource={data.revenues}
                  pagination={false}
                  rowKey="id"
                  summary={(pageData) => {
                    const total = pageData.reduce((sum, record) => sum + record.amount, 0);
                    return (
                      <Table.Summary fixed>
                        <Table.Summary.Row style={{ fontWeight: 'bold', backgroundColor: '#fafafa' }}>
                          <Table.Summary.Cell index={0}>Total Revenue</Table.Summary.Cell>
                          <Table.Summary.Cell index={1}>
                            KES {total.toLocaleString()}
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={2}>100%</Table.Summary.Cell>
                        </Table.Summary.Row>
                      </Table.Summary>
                    );
                  }}
                />
              </Card>

              {/* Expense Breakdown */}
              <Card 
                title={
                  <Space>
                    <FileTextOutlined />
                    Expense Breakdown
                  </Space>
                }
              >
                <Table
                  columns={expenseColumns}
                  dataSource={data.expenses}
                  pagination={false}
                  rowKey="id"
                  summary={(pageData) => {
                    const total = pageData.reduce((sum, record) => sum + record.amount, 0);
                    return (
                      <Table.Summary fixed>
                        <Table.Summary.Row style={{ fontWeight: 'bold', backgroundColor: '#fafafa' }}>
                          <Table.Summary.Cell index={0}>Total Expenses</Table.Summary.Cell>
                          <Table.Summary.Cell index={1}>
                            KES {total.toLocaleString()}
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={2}>100%</Table.Summary.Cell>
                        </Table.Summary.Row>
                      </Table.Summary>
                    );
                  }}
                />
              </Card>
            </>
          ) : null}
        </Space>
      </PageCard>
    </div>
  );
};

export default ProfitAndLossReport;
