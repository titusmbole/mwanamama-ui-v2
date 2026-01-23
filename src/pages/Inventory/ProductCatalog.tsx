import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Form, Input, InputNumber, Select, message, Upload, Image, Popconfirm, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';
import { PlusOutlined, EditOutlined, EyeOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import PageHeader from '../../components/common/Layout/PageHeader';
import PageCard from '../../components/common/PageCard/PageCard';
import { APIS } from '../../services/APIS';
import http from '../../services/httpInterceptor';

interface Product {
  id: number;
  itemCode: string;
  itemName: string;
  description: string;
  unitPrice: number;
  buyingPrice?: number;
  sellingPrice?: number;
  currentStock: number;
  reservedStock: number;
  totalSold: number;
  imageUrl?: string;
  categoryName?: string;
  subCategoryName?: string;
  brandName?: string;
  taxed?: boolean;
  category: { id: number; categoryName: string };
  subCategory?: { id: number; subCategoryName: string };
}

interface Category {
  id: number;
  categoryName: string;
  subCategories: SubCategory[];
}

interface SubCategory {
  id: number;
  subCategoryName: string;
}

interface Brand {
  id: number;
  brandName: string;
}

interface Supplier {
  id: number;
  name: string;
}

const ProductCatalog: React.FC = () => {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [searchText, setSearchText] = useState('');
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  
  const [submitting, setSubmitting] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  useEffect(() => {
    loadData();
    loadCategories();
    loadBrands();
    loadSuppliers();
  }, []);

  const loadData = async (page = 1, pageSize = 10, search = '') => {
    try {
      setLoading(true);
      const params: any = { page, size: pageSize };
      if (search) params.search = search;

      const response = await http.get(APIS.LOAD_PRODUCTS, { params });
      
      if (response.data.content) {
        setData(response.data.content);
        setPagination({ current: page, pageSize, total: response.data.totalElements || 0 });
      } else {
        setData(response.data);
        setPagination({ current: 1, pageSize: 10, total: response.data.length });
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await http.get(APIS.LOAD_CATEGORIES_UNPAGINATED);
      setCategories(response.data);
    } catch (error) {
      message.error('Failed to load categories');
    }
  };

  const loadBrands = async () => {
    try {
      const response = await http.get(APIS.LIST_BRANDS_UNPAGINATED);
      setBrands(response.data);
    } catch (error) {
      message.error('Failed to load brands');
    }
  };

  const loadSuppliers = async () => {
    try {
      const response = await http.get(APIS.LIST_SUPPLIERS_UNPAGINATED);
      setSuppliers(response.data);
    } catch (error) {
      message.error('Failed to load suppliers');
    }
  };

  const handleTableChange = (newPagination: any) => {
    loadData(newPagination.current, newPagination.pageSize, searchText);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    loadData(1, pagination.pageSize, value);
  };

  const handleCategoryChange = (categoryId: number, isEdit = false) => {
    const category = categories.find(c => c.id === categoryId);
    const subs = category?.subCategories || [];
    setSubCategories(subs);
    
    if (isEdit) {
      editForm.setFieldsValue({ subCategoryId: undefined });
    } else {
      createForm.setFieldsValue({ subCategoryId: undefined });
    }
  };

  const handleCreate = async (values: any) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.keys(values).forEach(key => {
        if (values[key] !== null && values[key] !== undefined) {
          formData.append(key, values[key]);
        }
      });
      
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('image', fileList[0].originFileObj);
      }

      await http.post(APIS.CREATE_PRODUCTS, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      message.success('Product created successfully');
      setCreateModalOpen(false);
      createForm.resetFields();
      setFileList([]);
      loadData(pagination.current, pagination.pageSize, searchText);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    editForm.setFieldsValue({
      itemName: product.itemName,
      description: product.description,
      unitPrice: product.unitPrice,
      buyingPrice: product.buyingPrice,
      sellingPrice: product.sellingPrice,
      currentStock: product.currentStock,
      reservedStock: product.reservedStock,
      categoryId: product.category.id,
      subCategoryId: product.subCategory?.id,
      brandId: product.brandName,
    });
    handleCategoryChange(product.category.id, true);
    setEditModalOpen(true);
  };

  const handleUpdate = async (values: any) => {
    if (!selectedProduct) return;
    
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.keys(values).forEach(key => {
        if (values[key] !== null && values[key] !== undefined) {
          formData.append(key, values[key]);
        }
      });
      
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('image', fileList[0].originFileObj);
      }

      await http.put(`${APIS.UPDATE_PRODUCTS}/${selectedProduct.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      message.success('Product updated successfully');
      setEditModalOpen(false);
      editForm.resetFields();
      setFileList([]);
      loadData(pagination.current, pagination.pageSize, searchText);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to update product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (productId: number) => {
    try {
      await http.delete(`${APIS.DELETE_PRODUCTS}/${productId}`);
      message.success('Product deleted successfully');
      loadData(pagination.current, pagination.pageSize, searchText);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to delete product');
    }
  };

  const formatCurrency = (amount: number) => {
    return `Ksh ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const columns: ColumnsType<Product> = [
    {
      title: 'Image',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 80,
      render: (url) => url ? (
        <Image src={url} width={50} height={50} style={{ objectFit: 'cover', borderRadius: 4 }} />
      ) : (
        <div style={{ width: 50, height: 50, backgroundColor: '#f0f0f0', borderRadius: 4 }} />
      ),
    },
    {
      title: 'Code',
      dataIndex: 'itemCode',
      key: 'itemCode',
      width: 120,
    },
    {
      title: 'Product Name',
      dataIndex: 'itemName',
      key: 'itemName',
    },
    {
      title: 'Subcategory',
      dataIndex: 'subCategoryName',
      key: 'subCategoryName',
      render: (text) => text || 'N/A',
    },
    {
      title: 'Brand',
      dataIndex: 'brandName',
      key: 'brandName',
      render: (text) => text || 'N/A',
    },
    {
      title: 'Buying Price',
      dataIndex: 'buyingPrice',
      key: 'buyingPrice',
      align: 'right',
      render: (amount) => formatCurrency(amount || 0),
    },
    {
      title: 'Selling Price',
      dataIndex: 'sellingPrice',
      key: 'sellingPrice',
      align: 'right',
      render: (amount) => formatCurrency(amount || 0),
    },
    {
      title: 'Stock',
      dataIndex: 'currentStock',
      key: 'currentStock',
      align: 'center',
      render: (stock) => (
        <Tag color={stock > 0 ? 'green' : 'red'}>{stock}</Tag>
      ),
    },
    {
      title: 'Taxed',
      dataIndex: 'taxed',
      key: 'taxed',
      align: 'center',
      render: (taxed) => (
        <Tag color={taxed ? 'green' : 'default'}>{taxed ? 'Yes' : 'No'}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button type="link" icon={<EyeOutlined />} onClick={() => { setSelectedProduct(record); setViewModalOpen(true); }} />
          <Popconfirm
            title="Delete product?"
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

  const formItems = (isEdit = false) => (
    <>
      <Form.Item name="itemName" label="Product Name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="description" label="Description" rules={[{ required: true }]}>
        <Input.TextArea rows={3} />
      </Form.Item>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Form.Item name="buyingPrice" label="Buying Price" rules={[{ required: true }]}>
          <InputNumber style={{ width: '100%' }} min={0} prefix="Ksh" />
        </Form.Item>
        <Form.Item name="sellingPrice" label="Selling Price" rules={[{ required: true }]}>
          <InputNumber style={{ width: '100%' }} min={0} prefix="Ksh" />
        </Form.Item>
        <Form.Item name="currentStock" label="Current Stock" rules={[{ required: true }]}>
          <InputNumber style={{ width: '100%' }} min={0} />
        </Form.Item>
        <Form.Item name="reservedStock" label="Reserved Stock" rules={[{ required: true }]}>
          <InputNumber style={{ width: '100%' }} min={0} />
        </Form.Item>
        <Form.Item name="categoryId" label="Category" rules={[{ required: true }]}>
          <Select
            options={categories.map(c => ({ label: c.categoryName, value: c.id }))}
            onChange={(val) => handleCategoryChange(val, isEdit)}
          />
        </Form.Item>
        <Form.Item name="subCategoryId" label="Subcategory">
          <Select
            options={subCategories.map(s => ({ label: s.subCategoryName, value: s.id }))}
            disabled={subCategories.length === 0}
          />
        </Form.Item>
        <Form.Item name="brandId" label="Brand" rules={[{ required: true }]}>
          <Select options={brands.map(b => ({ label: b.brandName, value: b.id }))} />
        </Form.Item>
        <Form.Item name="supplierId" label="Supplier" rules={[{ required: true }]}>
          <Select options={suppliers.map(s => ({ label: s.name, value: s.id }))} />
        </Form.Item>
      </div>
      <Form.Item label="Product Image">
        <Upload
          listType="picture-card"
          fileList={fileList}
          beforeUpload={() => false}
          onChange={({ fileList }) => setFileList(fileList)}
          maxCount={1}
        >
          {fileList.length === 0 && (
            <div>
              <UploadOutlined />
              <div style={{ marginTop: 8 }}>Upload</div>
            </div>
          )}
        </Upload>
      </Form.Item>
    </>
  );

  return (
    <div>
      <PageHeader 
        title="Product Catalog" 
        breadcrumbs={[
          { title: 'Home', path: '/' },
          { title: 'Inventory', path: '#' },
          { title: 'Products' }
        ]} 
      />

      <PageCard
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
            Add Product
          </Button>
        }
      >
        <Input.Search
          placeholder="Search products..."
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
          scroll={{ x: 1200 }}
        />
      </PageCard>

      {/* Create Modal */}
      <Modal
        title="Add Product"
        open={createModalOpen}
        onCancel={() => { setCreateModalOpen(false); createForm.resetFields(); setFileList([]); }}
        onOk={() => createForm.submit()}
        confirmLoading={submitting}
        width={800}
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreate}>
          {formItems()}
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title={`Edit: ${selectedProduct?.itemName}`}
        open={editModalOpen}
        onCancel={() => { setEditModalOpen(false); editForm.resetFields(); setFileList([]); }}
        onOk={() => editForm.submit()}
        confirmLoading={submitting}
        width={800}
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdate}>
          {formItems(true)}
        </Form>
      </Modal>

      {/* View Modal */}
      <Modal
        title={selectedProduct?.itemName}
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        footer={null}
        width={700}
      >
        {selectedProduct && (
          <div style={{ display: 'grid', gap: 16 }}>
            {selectedProduct.imageUrl && (
              <Image src={selectedProduct.imageUrl} width={200} />
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><strong>Code:</strong> {selectedProduct.itemCode}</div>
              <div><strong>Stock:</strong> {selectedProduct.currentStock}</div>
              <div><strong>Category:</strong> {selectedProduct.categoryName}</div>
              <div><strong>Subcategory:</strong> {selectedProduct.subCategoryName || 'N/A'}</div>
              <div><strong>Buying Price:</strong> {formatCurrency(selectedProduct.buyingPrice || 0)}</div>
              <div><strong>Selling Price:</strong> {formatCurrency(selectedProduct.sellingPrice || 0)}</div>
            </div>
            <div>
              <strong>Description:</strong>
              <p>{selectedProduct.description}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProductCatalog;
