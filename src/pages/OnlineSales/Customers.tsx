import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Space, Tag, Modal, Form, Input, Select, message, Row, Col
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  PlusOutlined, EditOutlined, EyeOutlined, PhoneOutlined, MailOutlined
} from '@ant-design/icons';
import PageHeader from '../../components/common/Layout/PageHeader';
import PageCard from '../../components/common/PageCard/PageCard';
import FormDrawer from '../../components/common/FormDrawer/FormDrawer';
import http from '../../services/httpInterceptor';
import { APIS } from '../../services/APIS';

const { Option } = Select;

interface Customer {
  id: number;
  customerNumber: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  status: 'ACTIVE' | 'INACTIVE';
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
}

const Customers: React.FC = () => {
  const [data, setData] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  useEffect(() => {
    fetchData();
  }, [pagination.current, pagination.pageSize, refreshKey]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await http.get(APIS.LOAD_ONLINE_CUSTOMERS, {
        params: {
          page: pagination.current - 1,
          size: pagination.pageSize
        }
      });
      setData(response.data.content || []);
      setPagination(prev => ({ ...prev, total: response.data.totalElements || 0 }));
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (values: any) => {
    setSubmitLoading(true);
    try {
      const response = await http.post(APIS.CREATE_ONLINE_CUSTOMER, values);
      message.success(response.data.message || 'Customer created successfully');
      setCreateModalOpen(false);
      createForm.resetFields();
      setRefreshKey(prev => prev + 1);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to create customer');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleUpdate = async (values: any) => {
    if (!selectedCustomer) return;
    
    setSubmitLoading(true);
    try {
      const response = await http.put(`${APIS.UPDATE_ONLINE_CUSTOMER}/${selectedCustomer.id}`, values);
      message.success(response.data.message || 'Customer updated successfully');
      setEditModalOpen(false);
      editForm.resetFields();
      setRefreshKey(prev => prev + 1);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to update customer');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleView = (customer: Customer) => {
    setSelectedCustomer(customer);
    setViewModalOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    editForm.setFieldsValue(customer);
    setEditModalOpen(true);
  };

  const columns: ColumnsType<Customer> = [
    {
      title: 'Customer #',
      dataIndex: 'customerNumber',
      key: 'customerNumber'
    },
    {
      title: 'Full Name',
      dataIndex: 'fullName',
      key: 'fullName'
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email: string) => (
        <Space>
          <MailOutlined />
          {email}
        </Space>
      )
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string) => (
        <Space>
          <PhoneOutlined />
          {phone}
        </Space>
      )
    },
    {
      title: 'City',
      dataIndex: 'city',
      key: 'city'
    },
    {
      title: 'Total Orders',
      dataIndex: 'totalOrders',
      key: 'totalOrders'
    },
    {
      title: 'Total Spent',
      dataIndex: 'totalSpent',
      key: 'totalSpent',
      render: (value: number) => `KES ${value.toLocaleString()}`
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'ACTIVE' ? 'green' : 'red'}>
          {status}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record: Customer) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          />
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
        </Space>
      )
    }
  ];

  return (
    <div>
      <PageHeader 
        title="Online Customers" 
        breadcrumbs={[
          { title: 'Home', path: '/' },
          { title: 'Online Sales', path: '#' },
          { title: 'Customers' }
        ]} 
      />

      <PageCard
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalOpen(true)}
          >
            Add Customer
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="id"
          pagination={{
            ...pagination,
            onChange: (page, pageSize) => setPagination({ ...pagination, current: page, pageSize })
          }}
          scroll={{ x: 1000 }}
        />
      </PageCard>

      {/* Create Modal */}
      <FormDrawer
        title="Create Customer"
        open={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          createForm.resetFields();
        }}
        onSubmit={handleCreate}
        loading={submitLoading}
        form={createForm}
      >
        <Form.Item
          name="fullName"
          label="Full Name"
          rules={[{ required: true, message: 'Full name is required' }]}
        >
          <Input placeholder="Enter full name" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Email is required' },
                { type: 'email', message: 'Invalid email format' }
              ]}
            >
              <Input placeholder="Enter email" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="phone"
              label="Phone"
              rules={[{ required: true, message: 'Phone is required' }]}
            >
              <Input placeholder="Enter phone number" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="address"
          label="Address"
          rules={[{ required: true, message: 'Address is required' }]}
        >
          <Input placeholder="Enter address" />
        </Form.Item>

        <Form.Item
          name="city"
          label="City"
          rules={[{ required: true, message: 'City is required' }]}
        >
          <Input placeholder="Enter city" />
        </Form.Item>

        <Form.Item
          name="status"
          label="Status"
          initialValue="ACTIVE"
          rules={[{ required: true }]}
        >
          <Select>
            <Option value="ACTIVE">Active</Option>
            <Option value="INACTIVE">Inactive</Option>
          </Select>
        </Form.Item>
      </FormDrawer>

      {/* Edit Modal */}
      <FormDrawer
        title="Edit Customer"
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          editForm.resetFields();
        }}
        onSubmit={handleUpdate}
        loading={submitLoading}
        form={editForm}
      >
        <Form.Item
          name="fullName"
          label="Full Name"
          rules={[{ required: true, message: 'Full name is required' }]}
        >
          <Input placeholder="Enter full name" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Email is required' },
                { type: 'email', message: 'Invalid email format' }
              ]}
            >
              <Input placeholder="Enter email" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="phone"
              label="Phone"
              rules={[{ required: true, message: 'Phone is required' }]}
            >
              <Input placeholder="Enter phone number" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="address"
          label="Address"
          rules={[{ required: true, message: 'Address is required' }]}
        >
          <Input placeholder="Enter address" />
        </Form.Item>

        <Form.Item
          name="city"
          label="City"
          rules={[{ required: true, message: 'City is required' }]}
        >
          <Input placeholder="Enter city" />
        </Form.Item>

        <Form.Item
          name="status"
          label="Status"
          rules={[{ required: true }]}
        >
          <Select>
            <Option value="ACTIVE">Active</Option>
            <Option value="INACTIVE">Inactive</Option>
          </Select>
        </Form.Item>
      </FormDrawer>

      {/* View Modal */}
      <Modal
        title="Customer Details"
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        footer={null}
        width={600}
      >
        {selectedCustomer && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}><strong>Customer #:</strong> {selectedCustomer.customerNumber}</Col>
              <Col span={12}><strong>Status:</strong> <Tag color={selectedCustomer.status === 'ACTIVE' ? 'green' : 'red'}>{selectedCustomer.status}</Tag></Col>
              <Col span={24}><strong>Full Name:</strong> {selectedCustomer.fullName}</Col>
              <Col span={12}><strong>Email:</strong> {selectedCustomer.email}</Col>
              <Col span={12}><strong>Phone:</strong> {selectedCustomer.phone}</Col>
              <Col span={24}><strong>Address:</strong> {selectedCustomer.address}</Col>
              <Col span={12}><strong>City:</strong> {selectedCustomer.city}</Col>
              <Col span={12}><strong>Total Orders:</strong> {selectedCustomer.totalOrders}</Col>
              <Col span={12}><strong>Total Spent:</strong> KES {selectedCustomer.totalSpent.toLocaleString()}</Col>
              <Col span={12}><strong>Registered:</strong> {new Date(selectedCustomer.createdAt).toLocaleDateString()}</Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Customers;
