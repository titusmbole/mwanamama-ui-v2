import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Form, Input, message, Popconfirm, Tag, Switch, Descriptions, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, EditOutlined, DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons';
import PageHeader from '../../components/common/Layout/PageHeader';
import PageCard from '../../components/common/PageCard/PageCard';
import { APIS } from '../../services/APIS';
import http from '../../services/httpInterceptor';

interface SubCategory {
  id: number;
  subCategoryName: string;
  slug: string;
  description?: string;
}

interface Category {
  id: number;
  categoryName: string;
  slug: string;
  active: boolean;
  subCategories: SubCategory[];
  categoryCode?: string;
  description?: string;
}

const Categories: React.FC = () => {
  const [data, setData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [searchText, setSearchText] = useState('');
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [subCategoryModalOpen, setSubCategoryModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  
  const [submitting, setSubmitting] = useState(false);
  
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [subCategoryForm] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (page = 1, pageSize = 10, search = '') => {
    try {
      setLoading(true);
      const params: any = { page: page - 1, size: pageSize }; // Backend uses 0-indexed pages
      const term = (search || '').trim();
      if (term.length > 0) params.search = term;

      const response = await http.get(APIS.LOAD_CATEGORIES, { params });
      
      if (response.data.content) {
        setData(response.data.content);
        setPagination({ current: page, pageSize, total: response.data.totalElements || 0 });
      } else {
        setData(response.data);
        setPagination({ current: 1, pageSize: 10, total: response.data.length });
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination: any) => {
    loadData(newPagination.current, newPagination.pageSize, searchText);
  };

  const handleSearch = (value: string) => {
    const term = (value || '').trim();
    setSearchText(term);
    loadData(1, pagination.pageSize, term);
  };

  const handleCreate = async (values: any) => {
    setSubmitting(true);
    try {
      await http.post(APIS.CREATE_CATEGORY, values);
      message.success('Category created successfully');
      setCreateModalOpen(false);
      createForm.resetFields();
      loadData(pagination.current, pagination.pageSize, searchText);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to create category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    editForm.setFieldsValue({
      categoryName: category.categoryName,
      slug: category.slug,
      active: category.active,
      categoryCode: category.categoryCode,
      description: category.description,
    });
    setEditModalOpen(true);
  };

  const handleUpdate = async (values: any) => {
    if (!selectedCategory) return;
    
    setSubmitting(true);
    try {
      await http.put(`${APIS.UPDATE_CATEGORY}/${selectedCategory.id}`, values);
      message.success('Category updated successfully');
      setEditModalOpen(false);
      editForm.resetFields();
      loadData(pagination.current, pagination.pageSize, searchText);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to update category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (categoryId: number) => {
    try {
      await http.delete(`${APIS.DELETE_CATEGORIES}/${categoryId}`);
      message.success('Category deleted successfully');
      loadData(pagination.current, pagination.pageSize, searchText);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to delete category');
    }
  };

  const handleToggleStatus = async (categoryId: number, currentStatus: boolean) => {
    try {
      await http.put(`${APIS.UPDATE_CATEGORY}/${categoryId}`, { active: !currentStatus });
      message.success(`Category ${!currentStatus ? 'activated' : 'deactivated'}`);
      loadData(pagination.current, pagination.pageSize, searchText);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleAddSubCategory = (category: Category) => {
    setSelectedCategory(category);
    setSubCategoryModalOpen(true);
  };

  const handleView = (category: Category) => {
    setSelectedCategory(category);
    setViewModalOpen(true);
  };

  const handleCreateSubCategory = async (values: any) => {
    if (!selectedCategory) return;
    
    setSubmitting(true);
    try {
      const names: string[] = Array.isArray(values.subCategoryNames)
        ? values.subCategoryNames
            .map((n: any) => String(n).trim())
            .filter((n: string) => n.length > 0)
        : [];

      const payload = {
        subCategoryNames: names,
        description: values.description || '',
        categoryId: selectedCategory.id,
      };

      await http.post(APIS.CREATE_SUBCATEGORY, payload);
      message.success('Subcategory created successfully');
      setSubCategoryModalOpen(false);
      subCategoryForm.resetFields();
      loadData(pagination.current, pagination.pageSize, searchText);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to create subcategory');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubCategory = async (subCategoryId: number) => {
    try {
      await http.delete(`${APIS.DELETE_SUBCATEGORIES}/${subCategoryId}`);
      message.success('Subcategory deleted successfully');
      loadData(pagination.current, pagination.pageSize, searchText);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to delete subcategory');
    }
  };

  const columns: ColumnsType<Category> = [
    {
      title: 'Category Name',
      dataIndex: 'categoryName',
      key: 'categoryName',
    },
    {
      title: 'Category Code',
      dataIndex: 'categoryCode',
      key: 'categoryCode',
      render: (code) => code || 'N/A',
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
    },
    {
      title: 'Status',
      dataIndex: 'active',
      key: 'active',
      align: 'center',
      render: (active, record) => (
        <Switch
          checked={active}
          onChange={() => handleToggleStatus(record.id, active)}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
        />
      ),
    },
    {
      title: 'Sub. Cats',
      dataIndex: 'subCategories',
      key: 'subCategories',
      align: 'center',
      render: (subs: SubCategory[], record) => (
        <Button type="link" onClick={() => handleAddSubCategory(record)}>
          {Array.isArray(subs) ? subs.length : 0}
        </Button>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 160,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button
            type="link"
            size="small"
            icon={<PlusCircleOutlined />}
            onClick={() => handleAddSubCategory(record)}
          >
            Sub
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button type="link" size="small" onClick={() => handleView(record)}>View</Button>
          <Popconfirm
            title="Delete category?"
            description="This will also delete all subcategories"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader 
        title="Categories" 
        breadcrumbs={[
          { title: 'Categories' }
        ]} 
      />

      <PageCard
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
            Add Category
          </Button>
        }
      >
        <Input.Search
          placeholder="Search categories..."
          onSearch={handleSearch}
          onChange={(e) => (e.target.value === '' ? handleSearch('') : undefined)}
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

      {/* Create Category Modal */}
      <Modal
        title="Add Category"
        open={createModalOpen}
        onCancel={() => { setCreateModalOpen(false); createForm.resetFields(); }}
        onOk={() => createForm.submit()}
        confirmLoading={submitting}
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="categoryName" label="Category Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="categoryCode" label="Category Code" rules={[{ required: true }]}> 
            <Input placeholder="e.g., CAT-001" />
          </Form.Item>
          <Form.Item name="slug" label="Slug" rules={[{ required: true }]}>
            <Input placeholder="e.g., electronics, clothing" />
          </Form.Item>
          <Form.Item name="description" label="Description"> 
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="active" label="Active" initialValue={true} valuePropName="checked">
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        title={`Edit: ${selectedCategory?.categoryName}`}
        open={editModalOpen}
        onCancel={() => { setEditModalOpen(false); editForm.resetFields(); }}
        onOk={() => editForm.submit()}
        confirmLoading={submitting}
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdate}>
          <Form.Item name="categoryName" label="Category Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="categoryCode" label="Category Code" rules={[{ required: true }]}> 
            <Input />
          </Form.Item>
          <Form.Item name="slug" label="Slug" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description"> 
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="active" label="Active" valuePropName="checked">
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Subcategory Modal */}
      <Modal
        title={`Add Subcategory to: ${selectedCategory?.categoryName}`}
        open={subCategoryModalOpen}
        onCancel={() => { setSubCategoryModalOpen(false); subCategoryForm.resetFields(); }}
        onOk={() => subCategoryForm.submit()}
        confirmLoading={submitting}
      >
        <Form form={subCategoryForm} layout="vertical" onFinish={handleCreateSubCategory}>
          <Form.Item
            name="subCategoryNames"
            label="Subcategory Names"
            rules={[{ required: true, message: 'Enter at least one subcategory name' }]}
          > 
            <Select
              mode="tags"
              tokenSeparators={[',']}
              placeholder="Type a name and press Enter to add multiple"
            />
          </Form.Item>
          <Form.Item name="description" label="Description"> 
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
        {selectedCategory && selectedCategory.subCategories.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <Table
              dataSource={selectedCategory.subCategories}
              rowKey="id"
              pagination={false}
              columns={[
                { title: 'Subcategory Name', dataIndex: 'subCategoryName', key: 'subCategoryName' },
                { title: 'Description', dataIndex: 'description', key: 'description', render: (text) => text || 'N/A' },
                {
                  title: 'Actions',
                  key: 'actions',
                  width: 100,
                  render: (_, sub) => (
                    <Popconfirm
                      title="Delete subcategory?"
                      onConfirm={() => handleDeleteSubCategory(sub.id)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button type="link" danger>Delete</Button>
                    </Popconfirm>
                  ),
                },
              ]}
            />
          </div>
        )}
      </Modal>

      {/* View Category Modal */}
      <Modal
        title={`Category: ${selectedCategory?.categoryName}`}
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        footer={null}
      >
        {selectedCategory && (
          <Descriptions bordered size="small" column={1}>
            <Descriptions.Item label="Name">{selectedCategory.categoryName}</Descriptions.Item>
            <Descriptions.Item label="Code">{selectedCategory.categoryCode || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Slug">{selectedCategory.slug}</Descriptions.Item>
            <Descriptions.Item label="Description">{selectedCategory.description || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Status">
              {selectedCategory.active ? <Tag color="green">Active</Tag> : <Tag>Inactive</Tag>}
            </Descriptions.Item>
            <Descriptions.Item label="Sub Categories Count">{selectedCategory.subCategories?.length || 0}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default Categories;
