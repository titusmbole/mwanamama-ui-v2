import React, { useState, useEffect } from 'react';
import { Table, Modal, message, Tag, Button, Tooltip, Select, Form, Input, InputNumber } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EyeOutlined, EditOutlined, PlusCircleOutlined } from '@ant-design/icons';
import PageHeader from '../../components/common/Layout/PageHeader';
import PageCard from '../../components/common/PageCard/PageCard';
import { APIS } from '../../services/APIS';
import http from '../../services/httpInterceptor';
import { useAuth } from '../../context/AuthContext';

interface OrderItem {
  id: number;
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  groupName: string;
  price: number;
  status: string;
  hasLoan: boolean;
  items: OrderItem[];
  client?: {
    id: number;
    fullName: string;
    groupName: string;
    phoneNumber: string;
  };
  bookedBy?: {
    id: number;
    name: string;
  };
  createdAt: string;
}

const Orders: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [searchText, setSearchText] = useState('');
  
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [loanModalOpen, setLoanModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  const [submitting, setSubmitting] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (page = 1, pageSize = 10, search = '') => {
    try {
      setLoading(true);
      const params: any = { page: page - 1, size: pageSize }; // Backend uses 0-indexed pages
      if (search) params.search = search;

      const response = await http.get(APIS.LOAD_ORDERS, { params });
      
      if (response.data.content) {
        setData(response.data.content);
        setPagination({ current: page, pageSize, total: response.data.totalElements || 0 });
      } else {
        setData(response.data);
        setPagination({ current: 1, pageSize: 10, total: response.data.length });
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination: any) => {
    loadData(newPagination.current, newPagination.pageSize, searchText);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    loadData(1, pagination.pageSize, value);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;

    setSubmitting(true);
    try {
      await http.put(`${APIS.UPDATE_ORDER_STATUS}/${selectedOrder.id}`, { status: newStatus });
      message.success('Order status updated successfully');
      setStatusModalOpen(false);
      setNewStatus('');
      loadData(pagination.current, pagination.pageSize, searchText);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateLoan = async (values: any) => {
    if (!selectedOrder) return;

    setSubmitting(true);
    try {
      const payload = {
        orderId: selectedOrder.id,
        ...values,
      };

      await http.post(APIS.CREATE_LOAN_FROM_ORDER, payload);
      message.success('Loan created successfully');
      setLoanModalOpen(false);
      loadData(pagination.current, pagination.pageSize, searchText);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to create loan');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `Ksh ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const isAdmin = user?.role === 'ADMIN';

  const columns: ColumnsType<Order> = [
    {
      title: 'Order Number',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
    },
    {
      title: 'Customer',
      key: 'customerName',
      render: (_, record) => record.client?.fullName || record.customerName || 'N/A',
    },
    {
      title: 'Group',
      key: 'groupName',
      render: (_, record) => record.client?.groupName || record.groupName || 'N/A',
    },
    {
      title: 'Order Amount',
      dataIndex: 'price',
      key: 'price',
      align: 'right',
      render: (amount) => formatCurrency(amount),
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      render: (items: OrderItem[]) =>
        items && items.length > 0
          ? items.map((item) => `${item.productName} (${item.quantity})`).join(', ')
          : 'N/A',
    },
    {
      title: 'Officer',
      key: 'officer',
      render: (_, record) => record.bookedBy?.name || 'N/A',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors: any = {
          PENDING: 'orange',
          APPROVED: 'green',
          REJECTED: 'red',
        };
        return <Tag color={colors[status] || 'default'}>{status}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 140,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 8 }}>
          {isAdmin && ['PENDING', 'REJECTED'].includes(record.status) && (
            <Tooltip title="Update Status">
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => {
                  setSelectedOrder(record);
                  setStatusModalOpen(true);
                }}
              />
            </Tooltip>
          )}
          
          {record.status === 'APPROVED' && !record.hasLoan && (
            <Tooltip title="Create Loan">
              <Button
                type="link"
                icon={<PlusCircleOutlined />}
                onClick={() => {
                  setSelectedOrder(record);
                  setLoanModalOpen(true);
                }}
              />
            </Tooltip>
          )}
          
          <Tooltip title="View Order">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedOrder(record);
                setViewModalOpen(true);
              }}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader 
        title="Orders" 
        breadcrumbs={[
          { title: 'Orders' }
        ]} 
      />

      <PageCard>
        <Input.Search
          placeholder="Search orders..."
          onSearch={handleSearch}
          onChange={(e) => e.target.value === '' && handleSearch('')}
          style={{ marginBottom: 16, maxWidth: 400 }}
          allowClear
        />

        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
        />
      </PageCard>

      {/* View Order Modal */}
      <Modal
        title={`Order: ${selectedOrder?.orderNumber}`}
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        footer={null}
        width={700}
      >
        {selectedOrder && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div><strong>Customer:</strong> {selectedOrder.client?.fullName || 'N/A'}</div>
              <div><strong>Group:</strong> {selectedOrder.client?.groupName || 'N/A'}</div>
              <div><strong>Phone:</strong> {selectedOrder.client?.phoneNumber || 'N/A'}</div>
              <div><strong>Officer:</strong> {selectedOrder.bookedBy?.name || 'N/A'}</div>
              <div><strong>Status:</strong> <Tag color={selectedOrder.status === 'APPROVED' ? 'green' : 'orange'}>{selectedOrder.status}</Tag></div>
              <div><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleDateString()}</div>
            </div>

            <div style={{ marginTop: 16 }}>
              <strong>Order Items:</strong>
              <Table
                dataSource={selectedOrder.items}
                rowKey="id"
                pagination={false}
                size="small"
                style={{ marginTop: 8 }}
                columns={[
                  { title: 'Product', dataIndex: 'productName', key: 'productName' },
                  { title: 'Quantity', dataIndex: 'quantity', key: 'quantity', align: 'center' },
                  { title: 'Price', dataIndex: 'price', key: 'price', align: 'right', render: (val) => formatCurrency(val) },
                  { title: 'Total', key: 'total', align: 'right', render: (_, record) => formatCurrency(record.quantity * record.price) },
                ]}
              />
            </div>

            <div style={{ marginTop: 16, textAlign: 'right', fontSize: 18, fontWeight: 'bold' }}>
              Total: {formatCurrency(selectedOrder.price)}
            </div>
          </div>
        )}
      </Modal>

      {/* Update Status Modal */}
      <Modal
        title="Update Order Status"
        open={statusModalOpen}
        onCancel={() => { setStatusModalOpen(false); setNewStatus(''); }}
        onOk={handleUpdateStatus}
        confirmLoading={submitting}
      >
        <Select
          value={newStatus || undefined}
          onChange={setNewStatus}
          options={[
            { label: 'Approve', value: 'APPROVED' },
            { label: 'Reject', value: 'REJECTED' },
          ]}
          placeholder="Select status"
          style={{ width: '100%' }}
        />
      </Modal>

      {/* Create Loan Modal */}
      <Modal
        title="Create Loan from Order"
        open={loanModalOpen}
        onCancel={() => setLoanModalOpen(false)}
        footer={null}
        width={600}
      >
        {selectedOrder && (
          <Form layout="vertical" onFinish={handleCreateLoan}>
            <div style={{ marginBottom: 16 }}>
              <strong>Order Amount:</strong> {formatCurrency(selectedOrder.price)}
            </div>

            <Form.Item name="loanAmount" label="Loan Amount" rules={[{ required: true }]} initialValue={selectedOrder.price}>
              <InputNumber style={{ width: '100%' }} min={0} prefix="Ksh" />
            </Form.Item>

            <Form.Item name="interestRate" label="Interest Rate (%)" rules={[{ required: true }]} initialValue={10}>
              <InputNumber style={{ width: '100%' }} min={0} max={100} />
            </Form.Item>

            <Form.Item name="loanPeriod" label="Loan Period (months)" rules={[{ required: true }]} initialValue={12}>
              <InputNumber style={{ width: '100%' }} min={1} />
            </Form.Item>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button onClick={() => setLoanModalOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                Create Loan
              </Button>
            </div>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default Orders;
