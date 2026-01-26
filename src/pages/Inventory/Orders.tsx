import React, { useState, useEffect } from 'react';
import { Table, Modal, message, Tag, Button, Tooltip, Select, Input } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EyeOutlined, EditOutlined, PlusCircleOutlined, UserOutlined, PhoneOutlined, TeamOutlined, MailOutlined, ShoppingCartOutlined, FileOutlined, TagOutlined, DollarCircleOutlined } from '@ant-design/icons';
import PageHeader from '../../components/common/Layout/PageHeader';
import PageCard from '../../components/common/PageCard/PageCard';
import { APIS } from '../../services/APIS';
import http from '../../services/httpInterceptor';
import { useAuth } from '../../context/AuthContext';

interface OrderItem {
  id: number;
  productName: string;
  code: string;
  quantity: number;
  price: number;
  imageUrl?: string;
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
    phone: string;
  };
  bookedBy?: {
    id: number;
    name: string;
    email: string;
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (page = 1, pageSize = 10, search = '') => {
    try {
      setLoading(true);
      const params: any = { page: page - 1, size: pageSize };
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

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedOrder) return;

    setSubmitting(true);
    try {
      await http.put(`${APIS.UPDATE_ORDER_STATUS}/${selectedOrder.id}`, { status: newStatus });
      message.success('Order status updated successfully!');
      setStatusModalOpen(false);
      loadData(pagination.current, pagination.pageSize, searchText);
    } catch (error: any) {
      if (error.response?.status === 403) {
        message.error('Not authorized to perform this action!');
      } else {
        message.error(error.response?.data?.message || 'Failed to update status');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetLoan = async () => {
    if (!selectedOrder) return;

    setSubmitting(true);
    try {
      await http.post(`${APIS.SET_ORDER_LOAN}/${selectedOrder.id}`);
      message.success('Order marked for loan creation!');
      setLoanModalOpen(false);
      loadData(pagination.current, pagination.pageSize, searchText);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to set loan');
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
      render: (_, record) => record.client?.fullName || record.customerName || '-',
    },
    {
      title: 'Group',
      key: 'groupName',
      render: (_, record) => record.client?.groupName || record.groupName || '-',
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
          : '--',
    },
    {
      title: 'Officer',
      key: 'officer',
      render: (_, record) => record.bookedBy?.name || '-',
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
      width: 150,
      render: (_, record) => (
        <div className="flex space-x-2">
          {isAdmin && ['PENDING', 'REJECTED'].includes(record.status) && (
            <Tooltip title="Update Status">
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => {
                  setSelectedOrder(record);
                  setStatusModalOpen(true);
                }}
                className="text-blue-600"
              />
            </Tooltip>
          )}
          
          {record.status === 'APPROVED' && !record.hasLoan && (
            <Tooltip title="Make Loan">
              <Button
                type="link"
                icon={<PlusCircleOutlined />}
                onClick={() => {
                  setSelectedOrder(record);
                  setLoanModalOpen(true);
                }}
                className="text-green-600"
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
              className="text-gray-600"
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
        title="Order Details"
        open={viewModalOpen}
        onCancel={() => {
          setViewModalOpen(false);
          setSelectedOrder(null);
        }}
        footer={[
          <Button key="close" onClick={() => setViewModalOpen(false)}>
            Close
          </Button>,
        ]}
        width={800}
      >
        {selectedOrder && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center space-x-2 text-gray-700">
                <TagOutlined className="text-blue-500 text-xl" />
                <div>
                  <span className="font-medium">Order Number:</span> {selectedOrder.orderNumber}
                </div>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <DollarCircleOutlined className="text-green-500 text-xl" />
                <div>
                  <span className="font-medium">Order Amount:</span> {formatCurrency(selectedOrder.price)}
                </div>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <TagOutlined className="text-purple-500 text-xl" />
                <div>
                  <span className="font-medium">Status:</span>{' '}
                  <Tag color={
                    selectedOrder.status === 'PENDING' ? 'orange' :
                    selectedOrder.status === 'APPROVED' ? 'green' :
                    selectedOrder.status === 'REJECTED' ? 'red' : 'default'
                  }>
                    {selectedOrder.status}
                  </Tag>
                </div>
              </div>
            </div>

            {selectedOrder.client && (
              <div className="bg-white p-4 rounded-lg shadow mb-6">
                <h4 className="font-bold text-lg text-gray-800 mb-3 flex items-center space-x-2">
                  <UserOutlined className="text-indigo-600" />
                  <span>Customer Details</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-600">
                  <p className="flex items-center space-x-2">
                    <UserOutlined /> <strong>Name:</strong> {selectedOrder.client.fullName}
                  </p>
                  <p className="flex items-center space-x-2">
                    <PhoneOutlined /> <strong>Phone:</strong> {selectedOrder.client.phone}
                  </p>
                  <p className="flex items-center space-x-2">
                    <TeamOutlined /> <strong>Group:</strong> {selectedOrder.client.groupName}
                  </p>
                </div>
              </div>
            )}

            {selectedOrder.bookedBy && (
              <div className="bg-white p-4 rounded-lg shadow mb-6">
                <h4 className="font-bold text-lg text-gray-800 mb-3 flex items-center space-x-2">
                  <UserOutlined className="text-teal-600" />
                  <span>Officer Details</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-600">
                  <p className="flex items-center space-x-2">
                    <UserOutlined /> <strong>Name:</strong> {selectedOrder.bookedBy.name}
                  </p>
                  <p className="flex items-center space-x-2">
                    <MailOutlined /> <strong>Email:</strong> {selectedOrder.bookedBy.email}
                  </p>
                </div>
              </div>
            )}

            {selectedOrder.items && selectedOrder.items.length > 0 && (
              <div className="bg-white p-4 rounded-lg shadow">
                <h4 className="font-bold text-lg text-gray-800 mb-3 flex items-center space-x-2">
                  <ShoppingCartOutlined className="text-orange-600" />
                  <span>Order Items</span>
                </h4>
                <ul className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <li
                      key={index}
                      className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-gray-100 rounded-md shadow-sm"
                    >
                      <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.productName}
                            className="w-12 h-12 object-cover rounded-md border border-gray-300"
                          />
                        ) : (
                          <FileOutlined className="text-gray-500 text-3xl p-2 border border-gray-300 rounded-md bg-gray-200" />
                        )}
                        <div>
                          <span className="font-medium text-gray-800">{item.productName}</span>
                          <p className="text-sm text-gray-500">Code: {item.code}</p>
                        </div>
                      </div>
                      <div className="text-gray-700 text-sm sm:text-base">
                        <span className="font-medium">Qty:</span> {item.quantity} |{' '}
                        <span className="font-medium">Price:</span> {formatCurrency(item.price)}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Update Status Modal */}
      <Modal
        title="Update Order Status"
        open={statusModalOpen}
        onCancel={() => {
          setStatusModalOpen(false);
          setSelectedOrder(null);
        }}
        footer={null}
        width={500}
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <Select
                placeholder="Select new status"
                style={{ width: '100%' }}
                onChange={handleUpdateStatus}
              >
                <Select.Option value="APPROVED">APPROVE</Select.Option>
                <Select.Option value="REJECTED">REJECT</Select.Option>
              </Select>
            </div>
          </div>
        )}
      </Modal>

      {/* Make Loan Modal */}
      <Modal
        title="Create Loan from Order"
        open={loanModalOpen}
        onCancel={() => {
          setLoanModalOpen(false);
          setSelectedOrder(null);
        }}
        footer={[
          <Button key="cancel" onClick={() => setLoanModalOpen(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={submitting}
            onClick={handleSetLoan}
          >
            Create Loan
          </Button>,
        ]}
        width={600}
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded">
              <p className="text-blue-800 mb-2">
                This will mark the order for loan creation. The loan can then be processed through the loans module.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <strong>Order Number:</strong> {selectedOrder.orderNumber}
                </div>
                <div>
                  <strong>Customer:</strong> {selectedOrder.client?.fullName}
                </div>
                <div>
                  <strong>Amount:</strong> {formatCurrency(selectedOrder.price)}
                </div>
                <div>
                  <strong>Items:</strong> {selectedOrder.items.length}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Orders;
