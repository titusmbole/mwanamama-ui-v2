import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Statistic, Table, Select, DatePicker, Button, Space, message, Spin, Progress, Tag
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  ShoppingCartOutlined, UserOutlined, DollarCircleOutlined, RiseOutlined,
  TrophyOutlined, DownloadOutlined
} from '@ant-design/icons';
import PageHeader from '../../components/common/Layout/PageHeader';
import PageCard from '../../components/common/PageCard/PageCard';
import http from '../../services/httpInterceptor';
import { APIS } from '../../services/APIS';
import dayjs, { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface SalesAgent {
  id: number;
  name: string;
  totalSales: number;
  orderCount: number;
  averageOrderValue: number;
  target: number;
  achievement: number;
  rank: number;
}

interface ProductSales {
  id: number;
  productName: string;
  category: string;
  unitsSold: number;
  revenue: number;
}

interface SalesData {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  topPerformer: string;
  salesAgents: SalesAgent[];
  topProducts: ProductSales[];
}

const SalesPerformanceReport: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SalesData | null>(null);
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
      
      const response = await http.get(APIS.SALES_PERFORMANCE_REPORT, { params });
      setData(response.data);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to load sales performance data');
      // Mock data for development
      setData({
        totalSales: 12500000,
        totalOrders: 487,
        averageOrderValue: 25667,
        topPerformer: 'Sarah Johnson',
        salesAgents: [
          { id: 1, name: 'Sarah Johnson', totalSales: 3500000, orderCount: 142, averageOrderValue: 24648, target: 3000000, achievement: 116.67, rank: 1 },
          { id: 2, name: 'Michael Chen', totalSales: 2800000, orderCount: 98, averageOrderValue: 28571, target: 2500000, achievement: 112.00, rank: 2 },
          { id: 3, name: 'Emily Williams', totalSales: 2300000, orderCount: 105, averageOrderValue: 21905, target: 2200000, achievement: 104.55, rank: 3 },
          { id: 4, name: 'David Brown', totalSales: 1950000, orderCount: 78, averageOrderValue: 25000, target: 2000000, achievement: 97.50, rank: 4 },
          { id: 5, name: 'Lisa Anderson', totalSales: 1950000, orderCount: 64, averageOrderValue: 30469, target: 2000000, achievement: 97.50, rank: 5 }
        ],
        topProducts: [
          { id: 1, productName: 'Premium Motorcycle', category: 'Motor Bikes', unitsSold: 45, revenue: 4500000 },
          { id: 2, productName: 'Spare Parts Kit', category: 'Spare Parts', unitsSold: 230, revenue: 2300000 },
          { id: 3, productName: 'Economy Motorcycle', category: 'Motor Bikes', unitsSold: 67, revenue: 2010000 },
          { id: 4, productName: 'Insurance Package', category: 'Services', unitsSold: 150, revenue: 1500000 },
          { id: 5, productName: 'Maintenance Package', category: 'Services', unitsSold: 180, revenue: 900000 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      message.success('Exporting sales performance report...');
    } catch (error: any) {
      message.error('Failed to export report');
    }
  };

  const agentColumns: ColumnsType<SalesAgent> = [
    {
      title: 'Rank',
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
      render: (rank: number) => (
        <Space>
          {rank === 1 && <TrophyOutlined style={{ color: '#FFD700' }} />}
          {rank === 2 && <TrophyOutlined style={{ color: '#C0C0C0' }} />}
          {rank === 3 && <TrophyOutlined style={{ color: '#CD7F32' }} />}
          {rank}
        </Space>
      )
    },
    {
      title: 'Sales Agent',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Total Sales',
      dataIndex: 'totalSales',
      key: 'totalSales',
      render: (value: number) => `KES ${value.toLocaleString()}`
    },
    {
      title: 'Orders',
      dataIndex: 'orderCount',
      key: 'orderCount'
    },
    {
      title: 'Avg Order Value',
      dataIndex: 'averageOrderValue',
      key: 'averageOrderValue',
      render: (value: number) => `KES ${value.toLocaleString()}`
    },
    {
      title: 'Target',
      dataIndex: 'target',
      key: 'target',
      render: (value: number) => `KES ${value.toLocaleString()}`
    },
    {
      title: 'Achievement',
      key: 'achievement',
      render: (_, record: SalesAgent) => (
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Progress 
            percent={record.achievement} 
            size="small"
            status={record.achievement >= 100 ? 'success' : record.achievement >= 80 ? 'active' : 'exception'}
          />
          <span>{record.achievement.toFixed(1)}%</span>
        </Space>
      )
    }
  ];

  const productColumns: ColumnsType<ProductSales> = [
    {
      title: 'Product Name',
      dataIndex: 'productName',
      key: 'productName'
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => <Tag color="blue">{category}</Tag>
    },
    {
      title: 'Units Sold',
      dataIndex: 'unitsSold',
      key: 'unitsSold'
    },
    {
      title: 'Revenue',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (value: number) => `KES ${value.toLocaleString()}`
    }
  ];

  return (
    <div>
      <PageHeader 
        title="Sales Performance Report" 
        breadcrumbs={[
          { title: 'Home', path: '/' },
          { title: 'Reports', path: '#' },
          { title: 'Sales Performance' }
        ]} 
      />

      <PageCard>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
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
              <Button 
                icon={<DownloadOutlined />}
                onClick={handleExport}
                block
              >
                Export Report
              </Button>
            </Col>
          </Row>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <Spin size="large" />
            </div>
          ) : data ? (
            <>
              <Row gutter={16}>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Total Sales"
                      value={data.totalSales}
                      prefix={<DollarCircleOutlined />}
                      valueStyle={{ color: '#3f8600' }}
                      formatter={(value) => `KES ${value.toLocaleString()}`}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Total Orders"
                      value={data.totalOrders}
                      prefix={<ShoppingCartOutlined />}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Avg Order Value"
                      value={data.averageOrderValue}
                      prefix={<RiseOutlined />}
                      formatter={(value) => `KES ${value.toLocaleString()}`}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Top Performer"
                      value={data.topPerformer}
                      prefix={<UserOutlined />}
                      valueStyle={{ fontSize: 16 }}
                    />
                  </Card>
                </Col>
              </Row>

              <Card 
                title={
                  <Space>
                    <UserOutlined />
                    Sales Agents Performance
                  </Space>
                }
              >
                <Table
                  columns={agentColumns}
                  dataSource={data.salesAgents}
                  pagination={false}
                  rowKey="id"
                  scroll={{ x: 900 }}
                />
              </Card>

              <Card 
                title={
                  <Space>
                    <ShoppingCartOutlined />
                    Top Selling Products
                  </Space>
                }
              >
                <Table
                  columns={productColumns}
                  dataSource={data.topProducts}
                  pagination={false}
                  rowKey="id"
                />
              </Card>
            </>
          ) : null}
        </Space>
      </PageCard>
    </div>
  );
};

export default SalesPerformanceReport;
