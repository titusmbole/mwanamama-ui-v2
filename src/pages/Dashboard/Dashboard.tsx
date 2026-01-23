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
  List, 
  Segmented,
  Badge,
  Flex,
  Drawer,
  Button
} from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  DollarOutlined,
  UserOutlined,
  WarningOutlined,
  RiseOutlined,
  TransactionOutlined,
  TeamOutlined,
  BellOutlined,
  CheckCircleOutlined,
  FilterOutlined
} from '@ant-design/icons';
import PageHeader from '../../components/common/Layout/PageHeader';

const { Title, Text } = Typography;

const ModernDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState('1M');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Modern Skeleton Components
  const StatCardSkeleton = () => (
    <Card 
      bordered={false}
      styles={{
        body: { padding: isMobile ? '16px' : '24px' }
      }}
    >
      <Skeleton active paragraph={{ rows: 2 }} />
    </Card>
  );

  const ActivitySkeleton = () => (
    <Card 
      bordered={false}
      title={<Skeleton.Input active size="small" style={{ width: 150 }} />}
    >
      <List
        itemLayout="horizontal"
        dataSource={[1, 2, 3, 4]}
        renderItem={() => (
          <List.Item>
            <Skeleton active avatar paragraph={{ rows: 1 }} />
          </List.Item>
        )}
      />
    </Card>
  );

  const ChartSkeleton = () => (
    <Card 
      bordered={false}
      title={<Skeleton.Input active size="small" style={{ width: 200 }} />}
    >
      <Skeleton active paragraph={{ rows: 6 }} />
    </Card>
  );

  // Activity Data
  const activityData = [
    {
      title: 'Loan Repayment Received',
      description: 'Client 101 • Payment ID: #LP-2847',
      time: '2m ago',
      icon: <DollarOutlined />,
      color: '#52c41a',
      status: 'success'
    },
    {
      title: 'New Loan Disbursed',
      description: 'Group 4 • Loan Amount: Ksh 50,000',
      time: '15m ago',
      icon: <TransactionOutlined />,
      color: '#1677ff',
      status: 'processing'
    },
    {
      title: 'Payment Overdue Alert',
      description: 'Client 245 • Due Date: Nov 20',
      time: '1h ago',
      icon: <WarningOutlined />,
      color: '#ff4d4f',
      status: 'error'
    },
    {
      title: 'New Client Onboarded',
      description: 'Individual Account • Client #1541',
      time: '3h ago',
      icon: <UserOutlined />,
      color: '#722ed1',
      status: 'default'
    }
  ];

  const quickInsights = [
    { label: 'Avg. Loan Size', value: 'Ksh 45.2K', trend: 'up' },
    { label: 'Default Rate', value: '1.5%', trend: 'down' },
    { label: 'Pending Reviews', value: '23', trend: 'neutral' },
    { label: 'This Month Revenue', value: '+Ksh 125K', trend: 'up' }
  ];

  const QuickInsightsContent = () => (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      {quickInsights.map((insight, index) => (
        <Flex key={index} justify="space-between" align="center">
          <Text type="secondary" style={{ fontSize: isMobile ? 13 : 14 }}>{insight.label}</Text>
          <Flex align="center" gap={8}>
            <Text strong style={{ fontSize: isMobile ? 14 : 16 }}>{insight.value}</Text>
            {insight.trend === 'up' && <ArrowUpOutlined style={{ color: '#52c41a', fontSize: 12 }} />}
            {insight.trend === 'down' && <ArrowDownOutlined style={{ color: '#52c41a', fontSize: 12 }} />}
          </Flex>
        </Flex>
      ))}
    </Space>
  );

  return (
    <div>
      <PageHeader 
        title="Dashboard" 
        breadcrumbs={[
          { title: 'Dashboard' }
        ]} 
      />
      
      <div style={{ 
        // minHeight: '100vh', 
        // background: 'linear-gradient(135deg, #f5f7fa 0%, #e8f0fe 100%)',
      }}>
        <div style={{ maxWidth: 1600, margin: '0 auto' }}>
       
        {/* Statistics Cards */}
        <Row gutter={[isMobile ? 12 : 16, isMobile ? 12 : 16]} style={{ marginBottom: isMobile ? 16 : 24 }}>
          <Col xs={24} sm={12} lg={6}>
            {loading ? <StatCardSkeleton /> : (
              <Badge.Ribbon text="+12.5%" color="green">
                <Card 
                  bordered={false}
                  hoverable
                  styles={{
                    body: { padding: isMobile ? '16px' : '24px', position: 'relative' }
                  }}
                >
                  <Statistic
                    title={<Text strong style={{ fontSize: isMobile ? 12 : 14 }}>Total Loan Portfolio</Text>}
                    value="1.2M"
                    prefix="Ksh"
                    valueStyle={{ color: '#1677ff', fontSize: isMobile ? 22 : 28 }}
                    suffix={<ArrowUpOutlined style={{ fontSize: isMobile ? 12 : 16 }} />}
                  />
                  <Avatar 
                    size={isMobile ? 40 : 48} 
                    icon={<DollarOutlined />} 
                    style={{ 
                      background: 'linear-gradient(135deg, #1677ff 0%, #40a9ff 100%)',
                      position: 'absolute',
                      top: isMobile ? 12 : 20,
                      right: isMobile ? 12 : 20
                    }} 
                  />
                </Card>
              </Badge.Ribbon>
            )}
          </Col>

          <Col xs={24} sm={12} lg={6}>
            {loading ? <StatCardSkeleton /> : (
              <Badge.Ribbon text="+2.3%" color="green">
                <Card 
                  bordered={false}
                  hoverable
                  styles={{
                    body: { padding: isMobile ? '16px' : '24px', position: 'relative' }
                  }}
                >
                  <Statistic
                    title={<Text strong style={{ fontSize: isMobile ? 12 : 14 }}>Collection Rate</Text>}
                    value={98.5}
                    precision={1}
                    suffix="%"
                    valueStyle={{ color: '#52c41a', fontSize: isMobile ? 22 : 28 }}
                    prefix={<RiseOutlined />}
                  />
                  <Avatar 
                    size={isMobile ? 40 : 48} 
                    icon={<RiseOutlined />} 
                    style={{ 
                      background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                      position: 'absolute',
                      top: isMobile ? 12 : 20,
                      right: isMobile ? 12 : 20
                    }} 
                  />
                </Card>
              </Badge.Ribbon>
            )}
          </Col>

          <Col xs={24} sm={12} lg={6}>
            {loading ? <StatCardSkeleton /> : (
              <Badge.Ribbon text="+8.2%" color="purple">
                <Card 
                  bordered={false}
                  hoverable
                  styles={{
                    body: { padding: isMobile ? '16px' : '24px', position: 'relative' }
                  }}
                >
                  <Statistic
                    title={<Text strong style={{ fontSize: isMobile ? 12 : 14 }}>Active Clients</Text>}
                    value={1540}
                    valueStyle={{ color: '#722ed1', fontSize: isMobile ? 22 : 28 }}
                    suffix={<TeamOutlined style={{ fontSize: isMobile ? 12 : 16 }} />}
                  />
                  <Avatar 
                    size={isMobile ? 40 : 48} 
                    icon={<TeamOutlined />} 
                    style={{ 
                      background: 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)',
                      position: 'absolute',
                      top: isMobile ? 12 : 20,
                      right: isMobile ? 12 : 20
                    }} 
                  />
                </Card>
              </Badge.Ribbon>
            )}
          </Col>

          <Col xs={24} sm={12} lg={6}>
            {loading ? <StatCardSkeleton /> : (
              <Badge.Ribbon text="-3.1%" color="green">
                <Card 
                  bordered={false}
                  hoverable
                  styles={{
                    body: { padding: isMobile ? '16px' : '24px', position: 'relative' }
                  }}
                >
                  <Statistic
                    title={<Text strong style={{ fontSize: isMobile ? 12 : 14 }}>Loans in Arrears</Text>}
                    value="5.2K"
                    prefix="Ksh"
                    valueStyle={{ color: '#ff4d4f', fontSize: isMobile ? 22 : 28 }}
                    suffix={<ArrowDownOutlined style={{ fontSize: isMobile ? 12 : 16 }} />}
                  />
                  <Avatar 
                    size={isMobile ? 40 : 48} 
                    icon={<WarningOutlined />} 
                    style={{ 
                      background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
                      position: 'absolute',
                      top: isMobile ? 12 : 20,
                      right: isMobile ? 12 : 20
                    }} 
                  />
                </Card>
              </Badge.Ribbon>
            )}
          </Col>
        </Row>

        {/* Mobile Quick Insights Button */}
        {isMobile && (
          <Button 
            type="primary" 
            icon={<FilterOutlined />} 
            onClick={() => setDrawerVisible(true)}
            style={{ marginBottom: 16, width: '100%' }}
          >
            View Quick Insights
          </Button>
        )}

        {/* Content Grid */}
        <Row gutter={[isMobile ? 12 : 16, isMobile ? 12 : 16]}>
          {/* Activity Feed */}
          <Col xs={24} lg={16}>
            {loading ? <ActivitySkeleton /> : (
              <Card 
                bordered={false}
                title={
                  <Flex justify="space-between" align="center" wrap="wrap" gap={8}>
                    <Space size={isMobile ? 8 : 12}>
                      <BellOutlined style={{ fontSize: isMobile ? 16 : 20, color: '#1677ff' }} />
                      <Title level={isMobile ? 5 : 4} style={{ margin: 0 }}>Recent Activity</Title>
                    </Space>
                    {!isMobile && (
                      <Text type="secondary" style={{ cursor: 'pointer', fontSize: 14 }}>
                        View All →
                      </Text>
                    )}
                  </Flex>
                }
                styles={{
                  body: { padding: isMobile ? '12px 16px' : '16px 24px' }
                }}
              >
                <List
                  itemLayout="horizontal"
                  dataSource={activityData}
                  renderItem={(item) => (
                    <List.Item 
                      style={{ 
                        padding: isMobile ? '12px 0' : '16px 0',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                      }}
                      className="activity-item"
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar 
                            size={isMobile ? 36 : 44} 
                            icon={item.icon}
                            style={{ 
                              background: `${item.color}15`,
                              color: item.color
                            }}
                          />
                        }
                        title={
                          <Flex justify="space-between" align="center" wrap="wrap" gap={8}>
                            <Text strong style={{ fontSize: isMobile ? 13 : 14 }}>{item.title}</Text>
                            <Text type="secondary" style={{ fontSize: isMobile ? 11 : 12 }}>
                              {item.time}
                            </Text>
                          </Flex>
                        }
                        description={
                          <Text type="secondary" style={{ fontSize: isMobile ? 12 : 13 }}>
                            {item.description}
                          </Text>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            )}
          </Col>

          {/* Quick Insights - Desktop Only */}
          {!isMobile && (
            <Col xs={24} lg={8}>
              {loading ? (
                <Card bordered={false}>
                  <Skeleton active paragraph={{ rows: 6 }} />
                </Card>
              ) : (
                <Card 
                  bordered={false}
                  title={
                    <Space>
                      <CheckCircleOutlined style={{ fontSize: 20, color: '#52c41a' }} />
                      <Title level={4} style={{ margin: 0 }}>Quick Insights</Title>
                    </Space>
                  }
                >
                  <QuickInsightsContent />
                </Card>
              )}
            </Col>
          )}
        </Row>

        {/* Chart Section */}
        <Row gutter={[isMobile ? 12 : 16, isMobile ? 12 : 16]} style={{ marginTop: isMobile ? 12 : 16 }}>
          <Col span={24}>
            {loading ? <ChartSkeleton /> : (
              <Card 
                bordered={false}
                title={
                  <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
                    <Title level={isMobile ? 5 : 4} style={{ margin: 0 }}>Loan Performance</Title>
                    <Segmented
                      options={isMobile ? ['1M', '3M', '1Y'] : ['7D', '1M', '3M', '6M', '1Y']}
                      value={timePeriod}
                      onChange={setTimePeriod}
                      size={isMobile ? 'small' : 'middle'}
                    />
                  </Flex>
                }
              >
                <div style={{
                  height: isMobile ? 240 : 320,
                  background: 'linear-gradient(135deg, #e6f4ff 0%, #f0e6ff 100%)',
                  borderRadius: 8,
                  border: '2px dashed #d9d9d9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: 12
                }}>
                  <RiseOutlined style={{ fontSize: isMobile ? 36 : 48, color: '#bfbfbf' }} />
                  <div style={{ textAlign: 'center', padding: '0 16px' }}>
                    <Text strong style={{ display: 'block', fontSize: isMobile ? 14 : 16, color: '#8c8c8c' }}>
                      Chart Component
                    </Text>
                    <Text type="secondary" style={{ fontSize: isMobile ? 12 : 13 }}>
                      Ready for integration
                    </Text>
                  </div>
                </div>
              </Card>
            )}
          </Col>
        </Row>

        {/* Mobile Drawer for Quick Insights */}
        <Drawer
          title={
            <Space>
              <CheckCircleOutlined style={{ fontSize: 20, color: '#52c41a' }} />
              <Text strong>Quick Insights</Text>
            </Space>
          }
          placement="bottom"
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          height="auto"
        >
          <QuickInsightsContent />
        </Drawer>
      </div>

      <style>{`
        .activity-item:hover {
          background: #f5f5f5;
          border-radius: 8px;
          padding-left: 12px !important;
          padding-right: 12px !important;
        }
        
        @media (max-width: 768px) {
          .ant-statistic-title {
            font-size: 12px !important;
          }
          .ant-card-head-title {
            font-size: 14px !important;
          }
        }
      `}</style>
      </div>
    </div>
  );
};

export default ModernDashboard;