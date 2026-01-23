import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Space, Tag, Modal, Card, Row, Col, Statistic, Select, DatePicker, message
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  EyeOutlined, ShoppingCartOutlined, DollarCircleOutlined, 
  CheckCircleOutlined, ClockCircleOutlined, DownloadOutlined
} from '@ant-design/icons';
import PageHeader from '../../components/common/Layout/PageHeader';
import PageCard from '../../components/common/PageCard/PageCard';
import http from '../../services/httpInterceptor';
import { APIS } from '../../services/APIS';
import dayjs, { Dayjs } from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

interface Sale {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  items: number;
  orderDate: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentMethod: string;
}

interface OrderItem {
  id: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

const Sales: React.FC = () => {
  const [data, setData] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0
  });

  useEffect(() => {
    fetchData();
    fetchStats();
  }, [pagination.current, pagination.pageSize, statusFilter, dateRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: pagination.current - 1,
        size: pagination.pageSize
      };
      
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (dateRange) {
        params.startDate = dateRange[0].format('YYYY-MM-DD');
        params.endDate = dateRange[1].format('YYYY-MM-DD');
      }

      const response = await http.get(APIS.LOAD_ONLINE_SALES, { params });
      setData(response.data.content || []);
      setPagination(prev => ({ ...prev, total: response.data.totalElements || 0 }));
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to load sales');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await http.get(APIS.ONLINE_SALES_STATS);
      setStats(response.data);
    } catch (error: any) {
      console.error('Failed to load stats');
    }
  };

  const handleView = async (sale: Sale) => {
    setSelectedSale(sale);
    setViewModalOpen(true);
    try {
      const response = await http.get(`${APIS.LOAD_ONLINE_SALES}/${sale.id}/items`);
      setOrderItems(response.data || []);
    } catch (error: any) {
      message.error('Failed to load order items');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'orange',
      PROCESSING: 'blue',
      SHIPPED: 'cyan',
      DELIVERED: 'green',
      CANCELLED: 'red'
    };
    return colors[status] || 'default';
  };

  const columns: ColumnsType<Sale> = [
    {
      title: 'Order #',
      dataIndex: 'orderNumber',
      key: 'orderNumber'
    },
    {
      title: 'Customer',
      dataIndex: 'customerName',
      key: 'customerName'
    },
    {
      title: 'Email',
      dataIndex: 'customerEmail',
      key: 'customerEmail'
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items'
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (value: number) => `KES ${value.toLocaleString()}`
    },
    {
      title: 'Order Date',
      dataIndex: 'orderDate',
      key: 'orderDate',
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status}
        </Tag>
      )
    },
    {
      title: 'Payment',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record: Sale) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleView(record)}
        />
      )
    }
  ];

  const itemColumns: ColumnsType<OrderItem> = [
    {
      title: 'Product',
      dataIndex: 'productName',
      key: 'productName'
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity'
    },
    {
      title: 'Unit Price',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (value: number) => `KES ${value.toLocaleString()}`
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (value: number) => `KES ${value.toLocaleString()}`
    }
  ];

  return (
    <div>
      <PageHeader 
        title="Online Sales" 
        breadcrumbs={[
          { title: 'Home', path: '/' },
          { title: 'Online Sales', path: '#' },
          { title: 'Sales' }
        ]} 
      />

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Sales"
              value={stats.totalSales}
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
              value={stats.totalOrders}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Pending Orders"
              value={stats.pendingOrders}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Completed Orders"
              value={stats.completedOrders}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <PageCard>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Filters */}
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Select
                style={{ width: '100%' }}
                placeholder="Filter by Status"
                value={statusFilter}
                onChange={setStatusFilter}
              >
                <Option value="ALL">All Status</Option>
                <Option value="PENDING">Pending</Option>
                <Option value="PROCESSING">Processing</Option>
                <Option value="SHIPPED">Shipped</Option>
                <Option value="DELIVERED">Delivered</Option>
                <Option value="CANCELLED">Cancelled</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={10}>
              <RangePicker
                style={{ width: '100%' }}
                value={dateRange}
                onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs] | null)}
              />
            </Col>
            <Col xs={24} sm={24} md={6}>
              <Button 
                icon={<DownloadOutlined />}
                block
              >
                Export
              </Button>
            </Col>
          </Row>

          {/* Table */}
          <Table
            columns={columns}
            dataSource={data}
            loading={loading}
            rowKey="id"
            pagination={{
              ...pagination,
              onChange: (page, pageSize) => setPagination({ ...pagination, current: page, pageSize })
            }}
            scroll={{ x: 1200 }}
          />
        </Space>
      </PageCard>

      {/* View Order Modal */}
      <Modal
        title={`Order Details - ${selectedSale?.orderNumber}`}
        open={viewModalOpen}
        onCancel={() => {
          setViewModalOpen(false);
          setOrderItems([]);
        }}
        footer={null}
        width={800}
      >
        {selectedSale && (
          <div>
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col span={12}><strong>Customer:</strong> {selectedSale.customerName}</Col>
              <Col span={12}><strong>Email:</strong> {selectedSale.customerEmail}</Col>
              <Col span={12}><strong>Order Date:</strong> {new Date(selectedSale.orderDate).toLocaleString()}</Col>
              <Col span={12}><strong>Payment Method:</strong> {selectedSale.paymentMethod}</Col>
              <Col span={12}>
                <strong>Status:</strong>{' '}
                <Tag color={getStatusColor(selectedSale.status)}>{selectedSale.status}</Tag>
              </Col>
              <Col span={12}><strong>Total Amount:</strong> KES {selectedSale.totalAmount.toLocaleString()}</Col>
            </Row>

            <h3>Order Items</h3>
            <Table
              columns={itemColumns}
              dataSource={orderItems}
              pagination={false}
              rowKey="id"
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Sales;
