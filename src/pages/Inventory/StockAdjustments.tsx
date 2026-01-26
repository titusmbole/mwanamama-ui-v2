import React, { useState, useEffect, useRef } from 'react';
import { Table, Button, Modal, message, Tag, Input, Tooltip, Tabs, Select, InputNumber } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusCircleOutlined, SearchOutlined, CloseOutlined, DeleteOutlined, CheckCircleOutlined, AlertOutlined, InboxOutlined, UserOutlined, TruckOutlined, ShoppingCartOutlined, RollbackOutlined, DownOutlined } from '@ant-design/icons';
import PageHeader from '../../components/common/Layout/PageHeader';
import PageCard from '../../components/common/PageCard/PageCard';
import { APIS } from '../../services/APIS';
import http from '../../services/httpInterceptor';

enum StockType {
  IN = 'IN',
  ISSUE = 'ISSUE',
  SOLD = 'SOLD',
  RETURN = 'RETURN',
}

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
  itemCode: string;
  itemName: string;
  unitPrice: number;
  currentStock: number;
}

interface User {
  id: number;
  username: string;
  name?: string;
  email?: string;
  role?: {
    roleName: string;
  };
}

interface StockItem extends Product {
  quantity: number;
}

const StockAdjustments: React.FC = () => {
  const [data, setData] = useState<StockRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<StockType>(StockType.IN);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [operationType, setOperationType] = useState<StockType>(StockType.ISSUE);
  const [officers, setOfficers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchedProducts, setSearchedProducts] = useState<Product[]>([]);
  const [selectedItems, setSelectedItems] = useState<StockItem[]>([]);
  const [selectedOfficer, setSelectedOfficer] = useState<number | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData(activeTab);
  }, [activeTab]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const loadOfficers = async () => {
    try {
      const response = await http.get(APIS.LOAD_USERS_UNPAGINATED);
      const allUsers = Array.isArray(response.data?.content)
        ? response.data.content
        : Array.isArray(response.data)
        ? response.data
        : [];
      
      const fieldOfficers = allUsers.filter((user: any) => user.role?.roleName === 'STAFF');
      
      setOfficers(fieldOfficers.map((user: any) => ({
        id: user.id,
        username: user.username,
        name: user.name || user.username || `Officer ${user.id}`,
        email: user.email,
        role: user.role,
      })));
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to load officers');
    }
  };

  const handleProductSearch = async (query: string) => {
    setSearchTerm(query);

    if (query.length < 2) {
      setSearchedProducts([]);
      setShowDropdown(false);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await http.get(`${APIS.SEARCH_PRODUCT}?q=${encodeURIComponent(query)}`);
      setSearchedProducts(response.data || []);
      setShowDropdown(true);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to search products');
      setSearchedProducts([]);
      setShowDropdown(false);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectProduct = (product: Product) => {
    const existingItem = selectedItems.find((item) => item.id === product.id);
    if (existingItem) {
      message.error(`${product.itemName} is already added.`);
      return;
    }

    const newItem: StockItem = {
      ...product,
      quantity: 1,
    };

    setSelectedItems(prev => [...prev, newItem]);
    setSearchTerm('');
    setSearchedProducts([]);
    setShowDropdown(false);

    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleQuantityChange = (productId: number, quantity: number) => {
    setSelectedItems(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };

  const handleRemoveItem = (productId: number) => {
    setSelectedItems(prev => prev.filter(item => item.id !== productId));
  };

  const handleSubmit = () => {
    if (selectedItems.length === 0) {
      message.error('Please add at least one product line.');
      return;
    }

    const isValid = selectedItems.every(
      (item) => item.quantity !== undefined && item.quantity > 0
    );

    if (!isValid) {
      message.error('Please ensure all selected products have a valid quantity.');
      return;
    }

    if (operationType !== StockType.IN && !selectedOfficer) {
      message.error('Please select an officer for this operation.');
      return;
    }

    setShowConfirmation(true);
  };

  const confirmSubmit = async () => {
    setShowConfirmation(false);
    setSubmitting(true);

    try {
      const payload: {
        items: { productId: number; quantity: number }[];
        stockType: string;
        agentId?: number;
      } = {
        items: selectedItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        stockType: operationType.toUpperCase(),
      };

      if (operationType !== StockType.IN) {
        payload.agentId = selectedOfficer!;
      }

      await http.post(APIS.CREATE_STOCK, payload);
      message.success('Stock successfully updated!');
      handleModalClose();
      loadData(activeTab);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to submit stock update.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleModalClose = () => {
    if (!submitting) {
      setSelectedOfficer(null);
      setOperationType(StockType.ISSUE);
      setSearchTerm('');
      setSearchedProducts([]);
      setSelectedItems([]);
      setShowDropdown(false);
      setShowConfirmation(false);
      setModalOpen(false);
    }
  };

  const handleOpenModal = () => {
    setModalOpen(true);
    loadOfficers();
    setOperationType(StockType.ISSUE);
    setSelectedOfficer(null);
    setSearchTerm('');
    setSearchedProducts([]);
    setSelectedItems([]);
  };

  const getColumns = (stockType: StockType): ColumnsType<StockRecord> => {
    if (stockType === StockType.ISSUE) {
      return [
        {
          title: 'Officer',
          dataIndex: 'agentName',
          key: 'agentName',
        },
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
          title: 'Date Created',
          dataIndex: 'createdAt',
          key: 'createdAt',
          render: (date) => new Date(date).toLocaleDateString(),
        },
      ];
    }

    const columns: ColumnsType<StockRecord> = [];

    if (stockType !== StockType.IN) {
      columns.push({
        title: 'Officer',
        dataIndex: 'agentName',
        key: 'agentName',
      });
    }

    columns.push(
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
      {
        title: 'Stock Type',
        dataIndex: 'stockType',
        key: 'stockType',
        render: (type) => <Tag color="blue">{type}</Tag>,
      },
      {
        title: 'Ref Number',
        dataIndex: 'ref',
        key: 'ref',
      },
      {
        title: 'Date Created',
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (date) => new Date(date).toLocaleDateString(),
      }
    );

    return columns;
  };

  const getOperationTypeConfig = (type: StockType) => {
    const configs = {
      [StockType.IN]: {
        label: 'New Stock',
        icon: <InboxOutlined />,
        color: 'blue',
        description: 'Increase inventory with new stock',
      },
      [StockType.ISSUE]: {
        label: 'Issue',
        icon: <TruckOutlined />,
        color: 'blue',
        description: 'Issue stock to field officers',
      },
      [StockType.SOLD]: {
        label: 'Sold',
        icon: <ShoppingCartOutlined />,
        color: 'blue',
        description: 'Record sales transactions',
      },
      [StockType.RETURN]: {
        label: 'Return',
        icon: <RollbackOutlined />,
        color: 'blue',
        description: 'Process returned items',
      },
    };
    return configs[type];
  };

  return (
    <div>
      <PageHeader 
        title="Stock Adjustment" 
        breadcrumbs={[
          { title: 'Stock' }
        ]} 
      />

      <PageCard
        extra={
          <Button
            type="primary"
            icon={<PlusCircleOutlined />}
            onClick={handleOpenModal}
            className="flex items-center gap-2"
          >
            Add Stock
          </Button>
        }
      >
        <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key as StockType)}>
          <Tabs.TabPane 
            tab={<span className="flex items-center gap-2"><InboxOutlined /> Stock In</span>} 
            key={StockType.IN}
          >
            <Table
              columns={getColumns(StockType.IN)}
              dataSource={data}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Tabs.TabPane>
          <Tabs.TabPane 
            tab={<span className="flex items-center gap-2"><TruckOutlined /> Stock Issue</span>} 
            key={StockType.ISSUE}
          >
            <Table
              columns={getColumns(StockType.ISSUE)}
              dataSource={data}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Tabs.TabPane>
          <Tabs.TabPane 
            tab={<span className="flex items-center gap-2"><ShoppingCartOutlined /> Stock Sold</span>} 
            key={StockType.SOLD}
          >
            <Table
              columns={getColumns(StockType.SOLD)}
              dataSource={data}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Tabs.TabPane>
          <Tabs.TabPane 
            tab={<span className="flex items-center gap-2"><RollbackOutlined /> Stock Return</span>} 
            key={StockType.RETURN}
          >
            <Table
              columns={getColumns(StockType.RETURN)}
              dataSource={data}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Tabs.TabPane>
        </Tabs>
      </PageCard>

      {/* Bulk Stock Modal */}
      <Modal
        title="Add Stock"
        open={modalOpen}
        onCancel={handleModalClose}
        footer={null}
        width={1200}
        maskClosable={!submitting}
      >
        <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Operation Type Selection */}
          <div className="mb-8">
            <label className="block text-base font-semibold text-gray-800 mb-4">Stock Operation Type</label>
            <div className="grid grid-cols-4 gap-4">
              {Object.values(StockType).map((type) => {
                const config = getOperationTypeConfig(type);
                return (
                  <button
                    key={type}
                    onClick={() => setOperationType(type)}
                    disabled={submitting}
                    className={`relative p-5 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-3 ${
                      operationType === type
                        ? 'border-primary bg-primary/10 text-primary shadow-lg ring-2 ring-primary/20'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {operationType === type && (
                      <div className="absolute -top-2 -right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <CheckCircleOutlined className="text-white text-xs" />
                      </div>
                    )}
                    <span className="text-2xl">{config.icon}</span>
                    <span className="text-base font-semibold">{config.label}</span>
                    <span className="text-xs text-gray-500 text-center leading-tight">{config.description}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Operation Indicator */}
            <div className="mt-5 p-4 bg-primary/5 rounded-xl border border-primary/20">
              {(() => {
                const activeConfig = getOperationTypeConfig(operationType);
                const labels = {
                  [StockType.IN]: 'New Stock Addition',
                  [StockType.ISSUE]: 'Issuing Stock',
                  [StockType.SOLD]: 'Sales Transaction',
                  [StockType.RETURN]: 'Processing Return',
                };
                const descriptions = {
                  [StockType.IN]: 'Adding new inventory to the warehouse',
                  [StockType.ISSUE]: 'Distributing stock to selected field officer',
                  [StockType.SOLD]: 'Recording sales from field officer',
                  [StockType.RETURN]: 'Handling returned items from field officer',
                };
                return (
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 p-3 bg-primary/10 rounded-xl text-primary text-2xl">
                      {activeConfig.icon}
                    </div>
                    <div>
                      <div className="font-semibold text-base text-gray-900">{labels[operationType]}</div>
                      <div className="text-sm text-gray-600 mt-1">{descriptions[operationType]}</div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Officer Selection */}
          {operationType !== StockType.IN && (
            <div className="mb-8">
              <label className="block text-base font-semibold text-gray-800 mb-4">Select Field Officer</label>
              <Select
                value={selectedOfficer}
                onChange={setSelectedOfficer}
                placeholder="Choose an officer"
                disabled={submitting}
                size="large"
                style={{ width: '100%' }}
                suffixIcon={<UserOutlined />}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={officers.map((officer) => ({
                  label: `${officer.name} - (${officer.email})`,
                  value: officer.id,
                }))}
                notFoundContent={officers.length === 0 ? "No officers found" : "No matching officer"}
              />
            </div>
          )}

          {/* Product Search with Dropdown */}
          <div className="mb-8">
            <label className="block text-base font-semibold text-gray-800 mb-4">Search & Add Products</label>
            <div className="relative" ref={dropdownRef}>
              <Input
                ref={searchInputRef}
                size="large"
                placeholder="Search for products by name..."
                prefix={<SearchOutlined />}
                suffix={searchLoading ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div> : null}
                value={searchTerm}
                onChange={(e) => handleProductSearch(e.target.value)}
                disabled={submitting}
                allowClear
                onFocus={() => {
                  if (searchedProducts.length > 0) {
                    setShowDropdown(true);
                  }
                }}
                onClear={() => {
                  setSearchTerm('');
                  setSearchedProducts([]);
                  setShowDropdown(false);
                }}
              />

              {/* Dropdown with Search Results */}
              {showDropdown && searchedProducts.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white rounded-xl border border-gray-200 shadow-lg max-h-64 overflow-y-auto">
                  {searchedProducts.map((product, index) => (
                    <button
                      key={product.id}
                      onClick={() => handleSelectProduct(product)}
                      className={`w-full p-4 text-left hover:bg-primary/5 transition-colors flex items-center justify-between ${
                        index !== searchedProducts.length - 1 ? 'border-b border-gray-100' : ''
                      }`}
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{product.itemName}</div>
                        <div className="text-sm text-gray-500 mt-1">
                          Code: {product.itemCode} • Price: Ksh {product.unitPrice} • Stock: {product.currentStock}
                        </div>
                      </div>
                      <DownOutlined className="text-gray-400 transform -rotate-90" />
                    </button>
                  ))}
                </div>
              )}

              {/* No results message */}
              {showDropdown && searchTerm.length >= 2 && searchedProducts.length === 0 && !searchLoading && (
                <div className="absolute z-10 w-full mt-1 bg-white rounded-xl border border-gray-200 shadow-lg p-4">
                  <div className="text-center text-gray-500">
                    <InboxOutlined className="text-4xl text-gray-300 mb-2" />
                    <p>No products found for "{searchTerm}"</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Selected Items Table */}
          {selectedItems.length > 0 && (
            <div className="mb-8">
              <label className="block text-base font-semibold text-gray-800 mb-4">
                Selected Products ({selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''})
              </label>
              <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Product Name</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Item Code</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Current Stock</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Quantity</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {selectedItems.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">{item.itemName}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-mono text-gray-600 bg-gray-200 px-2 py-1 rounded">
                              {item.itemCode}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600">{item.currentStock}</td>
                          <td className="px-6 py-4">
                            <InputNumber
                              min={1}
                              value={item.quantity}
                              onChange={(value) => handleQuantityChange(item.id, value || 1)}
                              disabled={submitting}
                              style={{ width: 120 }}
                            />
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Button
                              danger
                              type="text"
                              icon={<DeleteOutlined />}
                              onClick={() => handleRemoveItem(item.id)}
                              disabled={submitting}
                              title="Remove item"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {selectedItems.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <InboxOutlined className="text-6xl text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Products Selected</h3>
              <p>Search and select products from the dropdown above to add them to your stock operation.</p>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
            <Button onClick={handleModalClose} disabled={submitting} size="large">
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={handleSubmit}
              disabled={submitting || selectedItems.length === 0 || (operationType !== StockType.IN && !selectedOfficer)}
              loading={submitting}
              icon={<CheckCircleOutlined />}
              size="large"
            >
              Submit Stock Update
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1001]">
          <div className="bg-white rounded-xl p-6 mx-4 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <AlertOutlined className="text-2xl text-amber-500" />
              <h3 className="text-lg font-semibold text-gray-900">
                Confirm {(() => {
                  const labels = {
                    [StockType.IN]: 'New Stock Addition',
                    [StockType.ISSUE]: 'Stock Issue',
                    [StockType.SOLD]: 'Sales Transaction',
                    [StockType.RETURN]: 'Return Processing',
                  };
                  return labels[operationType];
                })()}
              </h3>
            </div>

            <div className="space-y-3 mb-6">
              <div className="text-sm text-gray-600">
                <div className="font-medium mb-2">Operation Details:</div>
                <ul className="space-y-1 text-xs">
                  <li>• Operation Type: <strong>{(() => {
                    const labels = {
                      [StockType.IN]: 'Add New Stock',
                      [StockType.ISSUE]: 'Issue Stock',
                      [StockType.SOLD]: 'Record Sale',
                      [StockType.RETURN]: 'Process Return',
                    };
                    return labels[operationType];
                  })()}</strong></li>
                  {selectedOfficer && operationType !== StockType.IN && (
                    <li>• Officer: <strong>{officers.find(o => o.id === selectedOfficer)?.name}</strong></li>
                  )}
                  <li>• Total Products: <strong>{selectedItems.length}</strong></li>
                  <li>• Total Quantity: <strong>{selectedItems.reduce((sum, item) => sum + item.quantity, 0)}</strong></li>
                </ul>
              </div>

              <div className="text-sm text-gray-600">
                <div className="font-medium mb-2">Selected Products:</div>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {selectedItems.map(item => (
                    <div key={item.id} className="flex justify-between items-center text-xs py-1 px-2 bg-gray-50 rounded">
                      <span>{item.itemName}</span>
                      <span className="font-mono">: {item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertOutlined className="text-red-500 mt-0.5" />
                  <div className="text-sm text-red-700">
                    <strong>Warning:</strong> This action will {(() => {
                      switch (operationType) {
                        case StockType.IN:
                          return 'increase the inventory levels';
                        case StockType.ISSUE:
                          return 'decrease inventory and assign to officer';
                        case StockType.SOLD:
                          return 'record sales and decrease inventory';
                        case StockType.RETURN:
                          return 'restore inventory from returned items';
                        default:
                          return 'modify stock levels';
                      }
                    })()} for the selected products. This cannot be undone.
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button onClick={() => setShowConfirmation(false)} size="large">
                Cancel
              </Button>
              <Button type="primary" onClick={confirmSubmit} size="large">
                Confirm & Proceed
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockAdjustments;
