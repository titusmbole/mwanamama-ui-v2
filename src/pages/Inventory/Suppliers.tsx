import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Form, Input, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Popconfirm } from 'antd';
import PageHeader from '../../components/common/Layout/PageHeader';
import PageCard from '../../components/common/PageCard/PageCard';
import { APIS } from '../../services/APIS';
import http from '../../services/httpInterceptor';

interface Supplier {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  contactPerson?: string;
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
      const params: any = { page, size: pageSize };
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
      message.success('Supplier created successfully');
      setCreateModalOpen(false);
      createForm.resetFields();
      loadData(pagination.current, pagination.pageSize, searchText);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to create supplier');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    editForm.setFieldsValue(supplier);
    setEditModalOpen(true);
  };

  const handleUpdate = async (values: any) => {
    if (!selectedSupplier) return;
    
    setSubmitting(true);
    try {
      await http.put(`${APIS.UPDATE_SUPPLIER}/${selectedSupplier.id}`, values);
      message.success('Supplier updated successfully');
      setEditModalOpen(false);
      editForm.resetFields();
      loadData(pagination.current, pagination.pageSize, searchText);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to update supplier');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (supplierId: number) => {
    try {
      await http.delete(`${APIS.DELETE_SUPPLIER}/${supplierId}`);
      message.success('Supplier deleted successfully');
      loadData(pagination.current, pagination.pageSize, searchText);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to delete supplier');
    }
  };

  const columns: ColumnsType<Supplier> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text) => text || 'N/A',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (text) => text || 'N/A',
    },
    {
      title: 'Contact Person',
      dataIndex: 'contactPerson',
      key: 'contactPerson',
      render: (text) => text || 'N/A',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm
            title="Delete supplier?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      ),
    },
  ];

  const formItems = (
    <>
      <Form.Item name="name" label="Supplier Name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="email" label="Email" rules={[{ type: 'email' }]}>
        <Input />
      </Form.Item>
      <Form.Item name="phone" label="Phone">
        <Input />
      </Form.Item>
      <Form.Item name="contactPerson" label="Contact Person">
        <Input />
      </Form.Item>
      <Form.Item name="address" label="Address">
        <Input.TextArea rows={3} />
      </Form.Item>
    </>
  );

  return (
    <div>
      <PageHeader 
        title="Suppliers" 
        breadcrumbs={[
          { title: 'Home', path: '/' },
          { title: 'Inventory', path: '#' },
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
        title="Add Supplier"
        open={createModalOpen}
        onCancel={() => { setCreateModalOpen(false); createForm.resetFields(); }}
        onOk={() => createForm.submit()}
        confirmLoading={submitting}
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreate}>
          {formItems}
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title={`Edit: ${selectedSupplier?.name}`}
        open={editModalOpen}
        onCancel={() => { setEditModalOpen(false); editForm.resetFields(); }}
        onOk={() => editForm.submit()}
        confirmLoading={submitting}
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdate}>
          {formItems}
        </Form>
      </Modal>
    </div>
  );
};

export default Suppliers;
