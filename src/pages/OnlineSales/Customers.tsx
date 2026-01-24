import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Space, Modal, Form, Input, Select, message, Row, Col
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  PlusOutlined, EyeOutlined, PhoneOutlined, MailOutlined
} from '@ant-design/icons';
import PageHeader from '../../components/common/Layout/PageHeader';
import PageCard from '../../components/common/PageCard/PageCard';
import FormDrawer from '../../components/common/FormDrawer/FormDrawer';
import http from '../../services/httpInterceptor';
import { APIS } from '../../services/APIS';

const { Option } = Select;

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  billingAddress: string;
  billingCity: string;
  billingPostalCode: string;
}

const Customers: React.FC = () => {
  const [data, setData] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  // Removed edit drawer state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [createForm] = Form.useForm();
  // Removed edit form
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  useEffect(() => {
    fetchData();
  }, [pagination.current, pagination.pageSize, refreshKey]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await http.get(APIS.GET_CUSTOMERS, {
        params: {
          page: pagination.current - 1,
          size: pagination.pageSize
        }
      });
      const content = response.data.content || [];
      setData(content);
      setPagination(prev => ({ ...prev, total: response.data.totalElements || content.length }));
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (values: any) => {
    setSubmitLoading(true);
    try {
      const response = await http.post(APIS.CREATE_CUSTOMER, values);
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

  // Removed update handler

  const handleView = (customer: Customer) => {
    setSelectedCustomer(customer);
    setViewModalOpen(true);
  };

  // Removed edit handler

  const columns: ColumnsType<Customer> = [
    {
      title: 'Full Name',
      key: 'fullName',
      render: (_, record) => (
        <span>{`${record.firstName || ''} ${record.lastName || ''}`.trim() || 'N/A'}</span>
      )
    },
    {
      title: 'Phone',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      render: (phone: string) => (
        <Space>
          <PhoneOutlined />
          {phone}
        </Space>
      )
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
      title: 'Address',
      dataIndex: 'billingAddress',
      key: 'billingAddress'
    },
    {
      title: 'P. Code',
      dataIndex: 'billingPostalCode',
      key: 'billingPostalCode'
    },
    {
      title: 'City',
      dataIndex: 'billingCity',
      key: 'billingCity'
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
        </Space>
      )
    }
  ];

  return (
    <div>
      <PageHeader 
        title="Online Customers" 
        breadcrumbs={[
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
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="firstName"
              label="First Name"
              rules={[{ required: true, message: 'First name is required' }]}
            >
              <Input placeholder="Enter first name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="lastName"
              label="Last Name"
              rules={[{ required: true, message: 'Last name is required' }]}
            >
              <Input placeholder="Enter last name" />
            </Form.Item>
          </Col>
        </Row>

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
              name="phoneNumber"
              label="Phone Number"
              rules={[{ required: true, message: 'Phone number is required' }]}
            >
              <Input placeholder="Enter phone number" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="billingAddress"
          label="Billing Address"
          rules={[{ required: true, message: 'Billing address is required' }]}
        >
          <Input placeholder="Enter billing address" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="billingCity"
              label="City"
              rules={[{ required: true, message: 'City is required' }]}
            >
              <Input placeholder="Enter city" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="billingPostalCode"
              label="Postal Code"
              rules={[{ required: true, message: 'Postal code is required' }]}
            >
              <Input placeholder="Enter postal code" />
            </Form.Item>
          </Col>
        </Row>

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

      {/* Edit drawer removed */}

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
              <Col span={24}><strong>Full Name:</strong> {`${selectedCustomer.firstName || ''} ${selectedCustomer.lastName || ''}`.trim() || 'N/A'}</Col>
              <Col span={12}><strong>Email:</strong> {selectedCustomer.email}</Col>
              <Col span={12}><strong>Phone:</strong> {selectedCustomer.phoneNumber}</Col>
              <Col span={24}><strong>Billing Address:</strong> {selectedCustomer.billingAddress}</Col>
              <Col span={12}><strong>City:</strong> {selectedCustomer.billingCity}</Col>
              <Col span={12}><strong>Postal Code:</strong> {selectedCustomer.billingPostalCode}</Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Customers;
