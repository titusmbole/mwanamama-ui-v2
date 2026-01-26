import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Form, Input, message, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import PageHeader from '../../components/common/Layout/PageHeader';
import PageCard from '../../components/common/PageCard/PageCard';
import { APIS } from '../../services/APIS';
import http from '../../services/httpInterceptor';

interface Brand {
  id: number;
  brandName: string;
  createdBy?: string;
  createdAt?: string;
  active?: boolean;
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
      const params: any = { page: page - 1, size: pageSize }; // Backend uses 0-indexed pages
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
      message.success('Brand created successfully!');
      setCreateModalOpen(false);
      createForm.resetFields();
      loadData(pagination.current, pagination.pageSize, searchText);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to create brand.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (brand: Brand) => {
    setSelectedBrand(brand);
    editForm.setFieldsValue({ brandName: brand.brandName });
    setEditModalOpen(true);
  };

  const handleUpdate = async (values: any) => {
    if (!selectedBrand) return;
    
    setSubmitting(true);
    try {
      await http.put(`${APIS.UPDATE_BRANDS}/${selectedBrand.id}`, values);
      message.success('Brand updated successfully!');
      setEditModalOpen(false);
      editForm.resetFields();
      setSelectedBrand(null);
      loadData(pagination.current, pagination.pageSize, searchText);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to update brand.');
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ColumnsType<Brand> = [
    {
      title: 'Brand Name',
      dataIndex: 'brandName',
      key: 'brandName',
    },
    {
      title: 'Created By',
      dataIndex: 'createdBy',
      key: 'createdBy',
      render: (text) => text || 'N/A',
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

  return (
    <div>
      <PageHeader 
        title="Brands" 
        breadcrumbs={[
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
        title="Create Brand"
        open={createModalOpen}
        onCancel={() => { 
          setCreateModalOpen(false); 
          createForm.resetFields(); 
        }}
        onOk={() => createForm.submit()}
        confirmLoading={submitting}
        okText={submitting ? "Creating..." : "Create Brand"}
      >
        <Form 
          form={createForm} 
          layout="vertical" 
          onFinish={handleCreate}
        >
          <Form.Item 
            name="brandName" 
            label="Brand Name" 
            rules={[
              { required: true, message: 'Brand name is required' },
              { min: 2, message: 'Brand name must be at least 2 characters' },
              { max: 50, message: 'Brand name cannot exceed 50 characters' }
            ]}
          >
            <Input placeholder="Enter brand name" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title={`Edit Brand: ${selectedBrand?.brandName}`}
        open={editModalOpen}
        onCancel={() => { 
          setEditModalOpen(false); 
          editForm.resetFields();
          setSelectedBrand(null);
        }}
        onOk={() => editForm.submit()}
        confirmLoading={submitting}
        okText={submitting ? "Updating..." : "Update Brand"}
      >
        <Form 
          form={editForm} 
          layout="vertical" 
          onFinish={handleUpdate}
        >
          <Form.Item 
            name="brandName" 
            label="Brand Name" 
            rules={[
              { required: true, message: 'Brand name is required' },
              { min: 2, message: 'Brand name must be at least 2 characters' },
              { max: 50, message: 'Brand name cannot exceed 50 characters' }
            ]}
          >
            <Input placeholder="Enter brand name" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Brands;
