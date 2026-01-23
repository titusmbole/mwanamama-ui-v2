import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Form, Select, InputNumber, message, Tabs, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import PageHeader from '../../components/common/Layout/PageHeader';
import PageCard from '../../components/common/PageCard/PageCard';
import { APIS } from '../../services/APIS';
import http from '../../services/httpInterceptor';

const StockType = {
  IN: 'IN',
  ISSUE: 'ISSUE',
  SOLD: 'SOLD',
  RETURN: 'RETURN',
} as const;

type StockType = typeof StockType[keyof typeof StockType];

interface StockRecord {
  id: number;
  itemName: string;
  agentName?: string;
  quantity: number;
  totalSold?: number;
  totalReturned?: number;
  status?: string;
  stockType: string;
  ref: string;
  createdAt: string;
}

interface Product {
  id: number;
  itemName: string;
  currentStock: number;
}

interface User {
  id: number;
  username: string;
  name: string;
}

interface StockItem {
  productId: number;
  productName: string;
  quantity: number;
}

const StockAdjustments: React.FC = () => {
  const [data, setData] = useState<StockRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<StockType>(StockType.IN);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedItems, setSelectedItems] = useState<StockItem[]>([]);
  const [selectedOfficer, setSelectedOfficer] = useState<number | null>(null);
  
  const [form] = Form.useForm();

  useEffect(() => {
    loadData(activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (modalOpen) {
      loadProducts();
      if (activeTab !== StockType.IN) {
        loadUsers();
      }
    }
  }, [modalOpen, activeTab]);

  const loadData = async (stockType: StockType) => {
    try {
      setLoading(true);
      const response = await http.get(`${APIS.LOAD_STOCK}?stockType=${stockType}`);
      setData(Array.isArray(response.data) ? response.data : response.data.content || []);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to load stock data');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await http.get(APIS.LOAD_PRODUCTS);
      setProducts(response.data);
    } catch (error) {
      message.error('Failed to load products');
    }
  };

  const loadUsers = async () => {
    try {
      const response = await http.get(APIS.LOAD_USERS_UNPAGINATED);
      const allUsers = Array.isArray(response.data) ? response.data : response.data.content || [];
      const fieldOfficers = allUsers.filter((user: any) => user.role?.roleName === 'STAFF');
      setUsers(fieldOfficers);
    } catch (error) {
      message.error('Failed to load users');
    }
  };

  const handleAddItem = (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existing = selectedItems.find(item => item.productId === productId);
    if (existing) {
      message.error(`${product.itemName} is already added`);
      return;
    }

    setSelectedItems([...selectedItems, {
      productId: product.id,
      productName: product.itemName,
      quantity: 1,
    }]);
    
    form.setFieldValue('productId', undefined);
  };

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    setSelectedItems(selectedItems.map(item =>
      item.productId === productId ? { ...item, quantity } : item
    ));
  };

  const handleRemoveItem = (productId: number) => {
    setSelectedItems(selectedItems.filter(item => item.productId !== productId));
  };

  const handleSubmit = async () => {
    if (selectedItems.length === 0) {
      message.error('Please add at least one item');
      return;
    }

    if (activeTab !== StockType.IN && !selectedOfficer) {
      message.error('Please select an officer');
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        stockType: activeTab,
        items: selectedItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      if (activeTab !== StockType.IN && selectedOfficer) {
        payload.officerId = selectedOfficer;
      }

      await http.post(APIS.CREATE_STOCK, payload);
      message.success('Stock adjustment submitted successfully');
      setModalOpen(false);
      setSelectedItems([]);
      setSelectedOfficer(null);
      form.resetFields();
      loadData(activeTab);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to submit stock adjustment');
    } finally {
      setSubmitting(false);
    }
  };

  const getColumns = (stockType: StockType): ColumnsType<StockRecord> => {
    const baseColumns: ColumnsType<StockRecord> = [
      {
        title: 'Product Name',
        dataIndex: 'itemName',
        key: 'itemName',
      },
      {
        title: 'Quantity',
        dataIndex: 'quantity',
        key: 'quantity',
        align: 'right',
      },
    ];

    if (stockType === StockType.ISSUE) {
      return [
        {
          title: 'Officer',
          dataIndex: 'agentName',
          key: 'agentName',
        },
        ...baseColumns,
        {
          title: 'Sold',
          dataIndex: 'totalSold',
          key: 'totalSold',
          align: 'right',
        },
        {
          title: 'Returned',
          dataIndex: 'totalReturned',
          key: 'totalReturned',
          align: 'right',
        },
        {
          title: 'Status',
          dataIndex: 'status',
          key: 'status',
          render: (status) => (
            <Tag color={status === 'ACTIVE' ? 'green' : 'default'}>{status}</Tag>
          ),
        },
        {
          title: 'Date',
          dataIndex: 'createdAt',
          key: 'createdAt',
          render: (date) => new Date(date).toLocaleDateString(),
        },
      ];
    }

    const columns: ColumnsType<StockRecord> = [...baseColumns];

    if (stockType !== StockType.IN) {
      columns.unshift({
        title: 'Officer',
        dataIndex: 'agentName',
        key: 'agentName',
      });
    }

    columns.push(
      {
        title: 'Stock Type',
        dataIndex: 'stockType',
        key: 'stockType',
        render: (type) => <Tag>{type}</Tag>,
      },
      {
        title: 'Ref Number',
        dataIndex: 'ref',
        key: 'ref',
      },
      {
        title: 'Date',
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (date) => new Date(date).toLocaleDateString(),
      }
    );

    return columns;
  };

  return (
    <div>
      <PageHeader 
        title="Stock Adjustments" 
        breadcrumbs={[
          { title: 'Stock' }
        ]} 
      />

      <PageCard
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            Add Stock
          </Button>
        }
      >
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as StockType)}
          items={[
            { key: StockType.IN, label: 'Stock In' },
            { key: StockType.ISSUE, label: 'Stock Issue' },
            { key: StockType.SOLD, label: 'Stock Sold' },
            { key: StockType.RETURN, label: 'Stock Return' },
          ]}
        />

        <Table
          columns={getColumns(activeTab)}
          dataSource={data}
          rowKey="id"
          loading={loading}
          style={{ marginTop: 16 }}
        />
      </PageCard>

      {/* Stock Adjustment Modal */}
      <Modal
        title={`Add ${activeTab} Stock`}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setSelectedItems([]);
          setSelectedOfficer(null);
          form.resetFields();
        }}
        onOk={handleSubmit}
        confirmLoading={submitting}
        width={800}
      >
        <Form form={form} layout="vertical">
          {activeTab !== StockType.IN && (
            <Form.Item label="Select Officer" required>
              <Select
                value={selectedOfficer}
                onChange={setSelectedOfficer}
                options={users.map(u => ({ label: u.name || u.username, value: u.id }))}
                placeholder="Select an officer"
              />
            </Form.Item>
          )}

          <Form.Item name="productId" label="Add Product">
            <Select
              showSearch
              placeholder="Search and select product"
              options={products.map(p => ({
                label: `${p.itemName} (Stock: ${p.currentStock})`,
                value: p.id,
              }))}
              onChange={handleAddItem}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>

          {selectedItems.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <strong>Selected Items:</strong>
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selectedItems.map((item) => (
                  <div
                    key={item.productId}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: 12,
                      border: '1px solid #d9d9d9',
                      borderRadius: 4,
                    }}
                  >
                    <span>{item.productName}</span>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <InputNumber
                        min={1}
                        value={item.quantity}
                        onChange={(val) => handleUpdateQuantity(item.productId, val || 1)}
                        style={{ width: 100 }}
                      />
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveItem(item.productId)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default StockAdjustments;
