import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Form, Input, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Popconfirm } from 'antd';
import PageHeader from '../../components/common/Layout/PageHeader';
import PageCard from '../../components/common/PageCard/PageCard';
import { APIS } from '../../services/APIS';
import http from '../../services/httpInterceptor';

interface Brand {
  id: number;
  brandName: string;
  description?: string;
}

const Brands: React.FC = () => {
  const [data, setData] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [searchText, setSearchText] = useState('');
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  
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

      const response = await http.get(APIS.LIST_BRANDS, { params });
      
      if (response.data.content) {
        setData(response.data.content);
        setPagination({ current: page, pageSize, total: response.data.totalElements || 0 });
      } else {
        setData(response.data);
        setPagination({ current: 1, pageSize: 10, total: response.data.length });
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to load brands');
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
      await http.post(APIS.CREATE_BRANDS, values);
      message.success('Brand created successfully');
      setCreateModalOpen(false);
      createForm.resetFields();
      loadData(pagination.current, pagination.pageSize, searchText);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to create brand');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (brand: Brand) => {
    setSelectedBrand(brand);
    editForm.setFieldsValue(brand);
    setEditModalOpen(true);
  };

  const handleUpdate = async (values: any) => {
    if (!selectedBrand) return;
    
    setSubmitting(true);
    try {
      await http.put(`${APIS.UPDATE_BRANDS}/${selectedBrand.id}`, values);
      message.success('Brand updated successfully');
      setEditModalOpen(false);
      editForm.resetFields();
      loadData(pagination.current, pagination.pageSize, searchText);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to update brand');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (brandId: number) => {
    try {
      await http.delete(`${APIS.DELETE_BRANDS}/${brandId}`);
      message.success('Brand deleted successfully');
      loadData(pagination.current, pagination.pageSize, searchText);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to delete brand');
    }
  };

  const columns: ColumnsType<Brand> = [
    {
      title: 'Brand Name',
      dataIndex: 'brandName',
      key: 'brandName',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
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
            title="Delete brand?"
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

  return (
    <div>
      <PageHeader 
        title="Brands" 
        breadcrumbs={[
          { title: 'Home', path: '/' },
          { title: 'Inventory', path: '#' },
          { title: 'Brands' }
        ]} 
      />

      <PageCard
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
            Add Brand
          </Button>
        }
      >
        <Input.Search
          placeholder="Search brands..."
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
        title="Add Brand"
        open={createModalOpen}
        onCancel={() => { setCreateModalOpen(false); createForm.resetFields(); }}
        onOk={() => createForm.submit()}
        confirmLoading={submitting}
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="brandName" label="Brand Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title={`Edit: ${selectedBrand?.brandName}`}
        open={editModalOpen}
        onCancel={() => { setEditModalOpen(false); editForm.resetFields(); }}
        onOk={() => editForm.submit()}
        confirmLoading={submitting}
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdate}>
          <Form.Item name="brandName" label="Brand Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Brands;
