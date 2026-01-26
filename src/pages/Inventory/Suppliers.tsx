import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Form, Input, message, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import PageHeader from '../../components/common/Layout/PageHeader';
import PageCard from '../../components/common/PageCard/PageCard';
import { APIS } from '../../services/APIS';
import http from '../../services/httpInterceptor';

interface Supplier {
  id: number;
  name: string;
  contact: string;
  contactPerson: string;
  address: string;
  createdAt?: string;
  active?: boolean;
}

const Suppliers: React.FC = () => {
  const [data, setData] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [searchText, setSearchText] = useState('');
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (page = 1, pageSize = 10, search = '') => {
    try {
      setLoading(true);
      const params: any = { page: page - 1, size: pageSize };
      if (search) params.search = search;

      const response = await http.get(APIS.LIST_SUPPLIERS, { params });
      
      if (response.data.content) {
        setData(response.data.content);
        setPagination({ current: page, pageSize, total: response.data.totalElements || 0 });
      } else {
        setData(response.data);
        setPagination({ current: 1, pageSize: 10, total: response.data.length });
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to load suppliers');
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

  const handleCreate = async (values: any) => {
    setSubmitting(true);
    try {
      await http.post(APIS.CREATE_SUPPLIER, values);
      message.success('Supplier created successfully!');
      setCreateModalOpen(false);
      createForm.resetFields();
      loadData(pagination.current, pagination.pageSize, searchText);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to create supplier.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    editForm.setFieldsValue({
      name: supplier.name,
      contact: supplier.contact,
      contactPerson: supplier.contactPerson,
      address: supplier.address,
    });
    setEditModalOpen(true);
  };

  const handleUpdate = async (values: any) => {
    if (!selectedSupplier) return;
    
    setSubmitting(true);
    try {
      await http.put(`${APIS.UPDATE_SUPPLIER}/${selectedSupplier.id}`, values);
      message.success('Supplier updated successfully!');
      setEditModalOpen(false);
      editForm.resetFields();
      setSelectedSupplier(null);
      loadData(pagination.current, pagination.pageSize, searchText);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to update supplier.');
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ColumnsType<Supplier> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Contact',
      dataIndex: 'contact',
      key: 'contact',
    },
    {
      title: 'Contact Person',
      dataIndex: 'contactPerson',
      key: 'contactPerson',
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Date Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => text ? new Date(text).toLocaleDateString() : 'N/A',
    },
    {
      title: 'Is Active',
      dataIndex: 'active',
      key: 'active',
      render: (active: boolean) => (
        active ? (
          <Tag color="green">Active</Tag>
        ) : (
          <Tag color="red">Inactive</Tag>
        )
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Button 
          type="link" 
          icon={<EditOutlined />} 
          onClick={() => handleEdit(record)}
        >
          Edit
        </Button>
      ),
    },
  ];

  const formItems = (
    <>
      <Form.Item 
        name="name" 
        label="Supplier Name" 
        rules={[
          { required: true, message: 'Name is required' },
          { min: 2, message: 'Name must be at least 2 characters' },
          { max: 100, message: 'Name cannot exceed 100 characters' }
        ]}
      >
        <Input placeholder="Enter supplier name" />
      </Form.Item>
      <Form.Item 
        name="contact" 
        label="Contact" 
        rules={[
          { required: true, message: 'Contact is required' },
          { pattern: /^\d{10}$/, message: 'Contact must be a 10-digit number' }
        ]}
      >
        <Input placeholder="Enter contact number" />
      </Form.Item>
      <Form.Item 
        name="contactPerson" 
        label="Contact Person"
        rules={[
          { required: true, message: 'Contact person is required' },
          { min: 2, message: 'Contact person must be at least 2 characters' },
          { max: 100, message: 'Contact person cannot exceed 100 characters' }
        ]}
      >
        <Input placeholder="Enter contact person name" />
      </Form.Item>
      <Form.Item 
        name="address" 
        label="Address"
        rules={[
          { required: true, message: 'Address is required' },
          { min: 5, message: 'Address must be at least 5 characters' },
          { max: 200, message: 'Address cannot exceed 200 characters' }
        ]}
      >
        <Input.TextArea rows={3} placeholder="Enter supplier address" />
      </Form.Item>
    </>
  );

  return (
    <div>
      <PageHeader 
        title="Suppliers" 
        breadcrumbs={[
          { title: 'Suppliers' }
        ]} 
      />

      <PageCard
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
            Add Supplier
          </Button>
        }
      >
        <Input.Search
          placeholder="Search suppliers..."
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

      {/* Create Modal */}
      <Modal
        title="Create Supplier"
        open={createModalOpen}
        onCancel={() => { 
          setCreateModalOpen(false); 
          createForm.resetFields(); 
        }}
        onOk={() => createForm.submit()}
        confirmLoading={submitting}
        okText={submitting ? "Creating..." : "Create Supplier"}
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreate}>
          {formItems}
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title={`Edit Supplier: ${selectedSupplier?.name}`}
        open={editModalOpen}
        onCancel={() => { 
          setEditModalOpen(false); 
          editForm.resetFields();
          setSelectedSupplier(null);
        }}
        onOk={() => editForm.submit()}
        confirmLoading={submitting}
        okText={submitting ? "Updating..." : "Update Supplier"}
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdate}>
          {formItems}
        </Form>
      </Modal>
    </div>
  );
};

export default Suppliers;
