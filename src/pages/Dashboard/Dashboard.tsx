import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Typography, 
  Skeleton, 
  Space, 
  Avatar, 
  Table,
  Progress,
  message,
  Flex,
  Badge,
  Alert,
  Button
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  DollarOutlined,
  UserOutlined,
  TeamOutlined,
  RiseOutlined,
  InboxOutlined,
  InfoCircleOutlined,
  SafetyOutlined,
  LockOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PageHeader from '../../components/common/Layout/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { APIS } from '../../services/APIS';
import http from '../../services/httpInterceptor';

const { Title, Text } = Typography;

interface DashboardData {
  clients: number;
  groups: number;
  olb: number;
  due: number;
  paid: number;
  savings: {
    january: number;
    february: number;
    march: number;
    april: number;
    may: number;
    june: number;
    july: number;
    august: number;
    september: number;
    october: number;
    november: number;
    december: number;
  };
  sheets: Array<{
    collectionSheetNumber: string;
    totalLoan: number;
    id: number;
    totalSavings: number;
    groupNumber: string;
    receiptNumber: string;
    totalRegistration: number;
  }>;
  stock: Array<{
    brandName: string;
    currentStock: number;
    categoryName: string;
    productName: string;
  }>;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [showV2Banner, setShowV2Banner] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await http.get(APIS.DASHBOARD);
      setDashboardData(response.data);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `Ksh ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Prepare chart data from savings
  const chartData = dashboardData ? [
    { month: 'Jan', amount: dashboardData.savings.january },
    { month: 'Feb', amount: dashboardData.savings.february },
    { month: 'Mar', amount: dashboardData.savings.march },
    { month: 'Apr', amount: dashboardData.savings.april },
    { month: 'May', amount: dashboardData.savings.may },
    { month: 'Jun', amount: dashboardData.savings.june },
    { month: 'Jul', amount: dashboardData.savings.july },
    { month: 'Aug', amount: dashboardData.savings.august },
    { month: 'Sep', amount: dashboardData.savings.september },
    { month: 'Oct', amount: dashboardData.savings.october },
    { month: 'Nov', amount: dashboardData.savings.november },
    { month: 'Dec', amount: dashboardData.savings.december },
  ] : [];

  // Collection percentage
  const collectionPercentage = dashboardData && dashboardData.due > 0 
    ? (dashboardData.paid / dashboardData.due) * 100 
    : 0;

  // Stock table columns
  const stockColumns: ColumnsType<any> = [
    {
      title: 'Product Name',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'Category',
      dataIndex: 'categoryName',
      key: 'categoryName',
    },
    {
      title: 'Brand',
      dataIndex: 'brandName',
      key: 'brandName',
    },
    {
      title: 'Current Stock',
      dataIndex: 'currentStock',
      key: 'currentStock',
      align: 'right',
    },
  ];

  // Collection sheets table columns
  const sheetsColumns: ColumnsType<any> = [
    {
      title: 'Collection Sheet Number',
      dataIndex: 'collectionSheetNumber',
      key: 'collectionSheetNumber',
    },
    {
      title: 'Group Number',
      dataIndex: 'groupNumber',
      key: 'groupNumber',
    },
    {
      title: 'Total Loan',
      dataIndex: 'totalLoan',
      key: 'totalLoan',
      align: 'right',
      render: (amount) => formatCurrency(amount),
    },
    {
      title: 'Total Savings',
      dataIndex: 'totalSavings',
      key: 'totalSavings',
      align: 'right',
      render: (amount) => formatCurrency(amount),
    },
    {
      title: 'Total Registration',
      dataIndex: 'totalRegistration',
      key: 'totalRegistration',
      align: 'right',
      render: (amount) => formatCurrency(amount),
    },
    {
      title: 'Receipt Number',
      dataIndex: 'receiptNumber',
      key: 'receiptNumber',
    },
  ];

  if (loading) {
    return (
      <div>
        <PageHeader 
          title="Dashboard" 
          breadcrumbs={[{ title: 'Dashboard' }]} 
        />
        
        {/* Welcome Card Skeleton */}
        <Card 
          bordered={false}
          style={{ marginBottom: 24, background: '#ac202d' }}
          styles={{ body: { padding: '24px' } }}
        >
          <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
            <Space direction="vertical" size={0}>
              <Skeleton.Input active size="large" style={{ width: 300, background: 'rgba(255,255,255,0.2)' }} />
              <Skeleton.Input active size="small" style={{ width: 200, background: 'rgba(255,255,255,0.15)', marginTop: 8 }} />
            </Space>
            <Skeleton.Avatar active size={64} />
          </Flex>
        </Card>

        {/* V2 Banner Skeleton */}
        <Card bordered={false} style={{ marginBottom: 24 }}>
          <Skeleton active paragraph={{ rows: 4 }} />
        </Card>

        {/* Metric Cards Skeleton */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {[1, 2, 3, 4].map(i => (
            <Col xs={24} sm={12} lg={6} key={i}>
              <Card bordered={false}>
                <Skeleton active paragraph={{ rows: 2 }} />
              </Card>
            </Col>
          ))}
        </Row>

        {/* Chart and Collections Skeleton */}
        <Row gutter={[16, 16]}>
          <Col xs={24} xl={14}>
            <Card bordered={false}>
              <Skeleton active paragraph={{ rows: 6 }} />
            </Card>
          </Col>
          <Col xs={24} xl={10}>
            <Card bordered={false}>
              <Flex vertical align="center" gap={16} style={{ padding: '24px 0' }}>
                <Skeleton.Avatar active size={200} shape="circle" />
                <Skeleton.Input active size="small" style={{ width: 300 }} />
                <Skeleton.Input active size="small" style={{ width: 250 }} />
              </Flex>
            </Card>
          </Col>
        </Row>

        {/* Tables Skeleton */}
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} xl={10}>
            <Card bordered={false}>
              <Skeleton active paragraph={{ rows: 5 }} />
            </Card>
          </Col>
          <Col xs={24} xl={14}>
            <Card bordered={false}>
              <Skeleton active paragraph={{ rows: 5 }} />
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

  return (
    <div>
      <PageHeader 
        title="Dashboard" 
        breadcrumbs={[{ title: 'Dashboard' }]} 
      />

      {/* Welcome Message */}
      <Card 
        bordered={false}
        style={{ 
          marginBottom: 24,
          background: '#ac202d',
        }}
        styles={{
          body: { padding: '24px' }
        }}
      >
        <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
          <Space direction="vertical" size={0}>
            <Title 
              level={3} 
              style={{ margin: 0, color: 'white' }}
            >
              {getGreeting()}, {user?.name || 'User'}! 👋
            </Title>
            <Text style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: 15 }}>
              Welcome back to your dashboard
            </Text>
          </Space>
          <Avatar 
            size={64} 
            icon={<UserOutlined />}
            style={{ 
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              fontSize: 28
            }}
          />
        </Flex>
      </Card>

      {/* Version 2 Announcement Banner */}
      {showV2Banner && (
        <Alert
          message={
            <Flex align="center" gap={8}>
              <InfoCircleOutlined style={{ fontSize: 20 }} />
              <Text strong style={{ fontSize: 16 }}>Welcome to Version 2.0!</Text>
            </Flex>
          }
          description={
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Text>
                We're excited to have you on our new and improved platform! Please note:
              </Text>
              <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                <li>
                  <Text>Some functionalities are still under development and will be fully available soon.</Text>
                </li>
                <li>
                  <Flex align="center" gap={8}>
                    <SafetyOutlined style={{ color: '#52c41a' }} />
                    <Text>
                      Your login credentials remain the same, but we strongly recommend updating your password.
                    </Text>
                  </Flex>
                </li>
                <li>
                  <Flex align="center" gap={8}>
                    <LockOutlined style={{ color: '#1677ff' }} />
                    <Text>
                      Navigate to <Text strong>Settings</Text> to configure Two-Factor Authentication (2FA) for enhanced account security.
                    </Text>
                  </Flex>
                </li>
                <li>
                  <Text>We're continuously working to bring you the best experience possible!</Text>
                </li>
              </ul>
              <Flex gap={12} wrap="wrap">
                <Button 
                  type="primary" 
                  icon={<SettingOutlined />}
                  onClick={() => navigate('/settings')}
                >
                  Go to Settings
                </Button>
                <Button 
                  icon={<LockOutlined />}
                  onClick={() => navigate('/settings')}
                >
                  Update Password
                </Button>
              </Flex>
            </Space>
          }
          type="info"
          closable
          onClose={() => setShowV2Banner(false)}
          style={{ marginBottom: 24 }}
          showIcon
        />
      )}

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* Groups Card */}
        <Col xs={24} sm={12} lg={6}>
          <Badge.Ribbon text={`${dashboardData?.clients || 0} Clients`} color="purple">
            <Card 
              bordered={false} 
              hoverable
              styles={{
                body: { padding: '24px', position: 'relative' }
              }}
            >
              <Statistic
                title={<Text strong style={{ fontSize: 14 }}>Groups</Text>}
                value={dashboardData?.groups || 0}
                valueStyle={{ color: '#722ed1', fontSize: 26 }}
                formatter={(value) => (value as number).toLocaleString()}
              />
              <Avatar 
                size={48} 
                icon={<TeamOutlined />} 
                style={{ 
                  background: 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)',
                  position: 'absolute',
                  top: 20,
                  right: 20
                }} 
              />
            </Card>
          </Badge.Ribbon>
        </Col>

        {/* Clients Card */}
        <Col xs={24} sm={12} lg={6}>
          <Badge.Ribbon text={`${dashboardData?.groups || 0} Groups`} color="blue">
            <Card 
              bordered={false} 
              hoverable
              styles={{
                body: { padding: '24px', position: 'relative' }
              }}
            >
              <Statistic
                title={<Text strong style={{ fontSize: 14 }}>Active Clients</Text>}
                value={dashboardData?.clients || 0}
                valueStyle={{ color: '#1677ff', fontSize: 26 }}
                formatter={(value) => (value as number).toLocaleString()}
              />
              <Avatar 
                size={48} 
                icon={<UserOutlined />} 
                style={{ 
                  background: 'linear-gradient(135deg, #1677ff 0%, #40a9ff 100%)',
                  position: 'absolute',
                  top: 20,
                  right: 20
                }} 
              />
            </Card>
          </Badge.Ribbon>
        </Col>

        {/* OLB Card */}
        <Col xs={24} sm={12} lg={6}>
          <Badge.Ribbon 
            text={dashboardData ? `${((dashboardData.olb / 10000000) * 100).toFixed(1)}%` : '0%'} 
            color="green"
          >
            <Card 
              bordered={false} 
              hoverable
              styles={{
                body: { padding: '24px', position: 'relative' }
              }}
            >
              <Statistic
                title={<Text strong style={{ fontSize: 14 }}>Total Loan Portfolio (OLB)</Text>}
                value={dashboardData?.olb || 0}
                prefix="Ksh"
                valueStyle={{ color: '#52c41a', fontSize: 26 }}
                formatter={(value) => (value as number).toLocaleString()}
              />
              <Avatar 
                size={48} 
                icon={<DollarOutlined />} 
                style={{ 
                  background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                  position: 'absolute',
                  top: 20,
                  right: 20
                }} 
              />
            </Card>
          </Badge.Ribbon>
        </Col>

        {/* Loan Due Card */}
        <Col xs={24} sm={12} lg={6}>
          <Badge.Ribbon 
            text={formatCurrency(dashboardData?.due || 0)} 
            color="orange"
          >
            <Card 
              bordered={false} 
              hoverable
              styles={{
                body: { padding: '24px', position: 'relative' }
              }}
            >
              <Statistic
                title={<Text strong style={{ fontSize: 14 }}>Loan Due</Text>}
                value={dashboardData?.due || 0}
                prefix="Ksh"
                valueStyle={{ color: '#ff4d4f', fontSize: 26 }}
                formatter={(value) => (value as number).toLocaleString()}
              />
              <Avatar 
                size={48} 
                icon={<RiseOutlined />} 
                style={{ 
                  background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
                  position: 'absolute',
                  top: 20,
                  right: 20
                }} 
              />
            </Card>
          </Badge.Ribbon>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Monthly Down Payment Performance Chart */}
        <Col xs={24} xl={14}>
          <Card 
            bordered={false}
            title={
              <Title level={4} style={{ margin: 0 }}>
                Monthly Down Payment Performance
              </Title>
            }
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value: any) => formatCurrency(value)}
                  contentStyle={{ borderRadius: 8 }}
                />
                <Bar dataKey="amount" fill="#ac202d" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Collections - Today Collections Metrics */}
        <Col xs={24} xl={10}>
          <Card 
            bordered={false}
            title={
              <div>
                <Title level={4} style={{ margin: 0 }}>
                  Collections
                </Title>
                <Text type="secondary">Today collections metrics</Text>
              </div>
            }
            styles={{ body: { textAlign: 'center' } }}
          >
            <Progress 
              type="circle" 
              percent={parseFloat(collectionPercentage.toFixed(2))}
              size={200}
              strokeColor="#ac202d"
              format={(percent) => (
                <div>
                  <div style={{ fontSize: 36, fontWeight: 600, color: '#1D2939' }}>
                    {percent}%
                  </div>
                  <div style={{ 
                    marginTop: 8,
                    padding: '4px 12px',
                    background: '#f6ffed',
                    color: '#52c41a',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 500
                  }}>
                    +{percent}%
                  </div>
                </div>
              )}
            />
            <div style={{ marginTop: 24 }}>
              <Text type="secondary" style={{ fontSize: 14 }}>
                Collected {formatCurrency(dashboardData?.paid || 0)} today, of {formatCurrency(dashboardData?.due || 0)} work!
              </Text>
            </div>
            <div style={{ 
              marginTop: 24,
              padding: '16px',
              background: '#fafafa',
              borderRadius: 8,
              display: 'flex',
              justifyContent: 'space-around'
            }}>
              <div>
                <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>Total Due</Text>
                <Text strong style={{ fontSize: 16 }}>{(dashboardData?.due || 0).toLocaleString()}</Text>
              </div>
              <div style={{ width: 1, background: '#d9d9d9' }} />
              <div>
                <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>Collected</Text>
                <Text strong style={{ fontSize: 16 }}>{(dashboardData?.paid || 0).toLocaleString()}</Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* Current Stock */}
        <Col xs={24} xl={10}>
          <Card 
            bordered={false}
            title={
              <Title level={4} style={{ margin: 0 }}>
                Current Stock
              </Title>
            }
          >
            <Table
              columns={stockColumns}
              dataSource={dashboardData?.stock || []}
              rowKey={(record, index) => `stock-${index}`}
              pagination={false}
              size="small"
              locale={{ emptyText: 'No stock data available' }}
            />
          </Card>
        </Col>

        {/* Recent Collection Sheets */}
        <Col xs={24} xl={14}>
          <Card 
            bordered={false}
            title={
              <Title level={4} style={{ margin: 0 }}>
                Recent Collection Sheets
              </Title>
            }
          >
            <Table
              columns={sheetsColumns}
              dataSource={dashboardData?.sheets || []}
              rowKey="id"
              pagination={false}
              size="small"
              scroll={{ x: 800 }}
              locale={{ emptyText: 'No recent collection sheets available' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
