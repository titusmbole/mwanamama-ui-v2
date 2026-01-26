import React, { useState, useEffect, useRef } from 'react';
import { Button, Table, Modal, Select, Input, message, Tag, Tooltip, Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, EyeOutlined, BranchesOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import PageHeader from '../../components/common/Layout/PageHeader';
import PageCard from '../../components/common/PageCard/PageCard';
import { APIS } from '../../services/APIS';
import http from '../../services/httpInterceptor';

interface PurchaseItem {
  id?: number;
  productId: number;
  productName: string;
  productCode?: string;
  supplierId: number;
  supplierName: string;
  quantity: number;
  purchasePrice: number;
  buyingPricePerUnit?: number;
  totalPrice?: number;
}

interface Purchase {
  id: number;
  refNumber: string;
  supplierName: string;
  locationName: string;
  grandTotal: number;
  status: string;
  purchaseDate: string;
  items: PurchaseItem[];
}

interface Product {
  id: number;
  itemCode: string;
  itemName: string;
  unitPrice: number;
}

interface Supplier {
  id: number;
  name: string;
}

interface Branch {
  id: number;
  branchName: string;
  branchCode: string;
}

const Purchases: React.FC = () => {
  const [data, setData] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [searchText, setSearchText] = useState('');
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [allocateModalOpen, setAllocateModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [searchedProducts, setSearchedProducts] = useState<Product[]>([]);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [searchingProducts, setSearchingProducts] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const [purchaseForm, setPurchaseForm] = useState<{
    locationId: number;
    items: PurchaseItem[];
  }>({
    locationId: 0,
    items: [],
  });
  
  const [allocationForm, setAllocationForm] = useState<{ [itemId: number]: { [branchId: number]: number } }>({});

  useEffect(() => {
    loadData();
    loadSuppliers();
    loadBranches();
  }, []);

  const loadData = async (page = 1, pageSize = 10, search = '') => {
    try {
      setLoading(true);
      const params: any = { page: page - 1, size: pageSize };
      if (search) params.search = search;

      const response = await http.get(APIS.LIST_PURCHASES, { params });
      
      if (response.data.content) {
        setData(response.data.content);
        setPagination({ current: page, pageSize, total: response.data.totalElements || 0 });
      } else {
        setData(response.data);
        setPagination({ current: 1, pageSize: 10, total: response.data.length });
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to load purchases');
    } finally {
      setLoading(false);
    }
  };

  const loadSuppliers = async () => {
    try {
      const response = await http.get(APIS.LIST_SUPPLIERS_UNPAGINATED);
      setSuppliers(Array.isArray(response.data) ? response.data : response.data.results || []);
    } catch (error) {
      message.error('Failed to load suppliers');
    }
  };

  const loadBranches = async () => {
    try {
      const response = await http.get(APIS.LOAD_BRANCHES);
      const branchData = Array.isArray(response.data) ? response.data : response.data.content || [];
      setBranches(branchData);
    } catch (error) {
      message.error('Failed to load branches');
    }
  };

  const handleTableChange = (newPagination: any) => {
    loadData(newPagination.current, newPagination.pageSize, searchText);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    loadData(1, pagination.pageSize, value);
  };

  const handleProductSearch = async (query: string) => {
    setProductSearchTerm(query);
    if (query.length < 2) {
      setSearchedProducts([]);
      setShowProductDropdown(false);
      return;
    }

    setSearchingProducts(true);
    try {
      const response = await http.get(`${APIS.SEARCH_PRODUCT}?q=${encodeURIComponent(query)}`);
      setSearchedProducts(response.data || []);
      setShowProductDropdown(true);
    } catch (error) {
      message.error('Failed to search products');
      setSearchedProducts([]);
      setShowProductDropdown(false);
    } finally {
      setSearchingProducts(false);
    }
  };

  const handleSelectProduct = (product: Product) => {
    const existingItem = purchaseForm.items.find(item => item.productId === product.id);
    if (existingItem) {
      message.error(`${product.itemName} is already added`);
      setProductSearchTerm('');
      setSearchedProducts([]);
      setShowProductDropdown(false);
      return;
    }

    const newItem: PurchaseItem = {
      productId: product.id,
      productName: product.itemName,
      supplierId: 0,
      supplierName: '',
      quantity: 1,
      purchasePrice: product.unitPrice || 0,
    };

    setPurchaseForm(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));

    setProductSearchTerm('');
    setSearchedProducts([]);
    setShowProductDropdown(false);
  };

  const handleSubmitPurchase = async () => {
    if (purchaseForm.locationId === 0 || purchaseForm.items.length === 0) {
      message.error('Please select location and add at least one item');
      return;
    }

    const itemsWithoutSupplier = purchaseForm.items.filter(item => item.supplierId === 0);
    if (itemsWithoutSupplier.length > 0) {
      message.error('Please select a supplier for each item');
      return;
    }

    setSubmitting(true);
    try {
      await http.post(APIS.CREATE_PURCHASE, purchaseForm);
      message.success('Purchase created successfully!');
      setPurchaseForm({ locationId: 0, items: [] });
      setCreateModalOpen(false);
      loadData(pagination.current, pagination.pageSize, searchText);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to create purchase');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewPurchase = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setViewModalOpen(true);
  };

  const handleAllocateToBranches = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    
    const initialAllocations: { [itemId: number]: { [branchId: number]: number } } = {};
    purchase.items.forEach(item => {
      initialAllocations[item.id!] = {};
      branches.forEach(branch => {
        initialAllocations[item.id!][branch.id] = 0;
      });
    });
    
    setAllocationForm(initialAllocations);
    setAllocateModalOpen(true);
  };

  const handleAllocationSubmit = async () => {
    if (!selectedPurchase) return;

    setSubmitting(true);
    try {
      const payload = {
        purchaseId: selectedPurchase.id,
        allocations: allocationForm,
      };

      await http.post(APIS.PURCHASE_ALLOCATE, payload);
      message.success('Purchase allocated successfully!');
      setAllocateModalOpen(false);
      loadData(pagination.current, pagination.pageSize, searchText);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to allocate purchase');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setStatusModalOpen(true);
  };

  const handleStatusUpdateSubmit = async (newStatus: string) => {
    if (!selectedPurchase) return;

    setSubmitting(true);
    try {
      await http.put(`${APIS.PURCHASE_UPDATE_STATUS}${selectedPurchase.id}`, { status: newStatus });
      message.success(`Purchase status updated to ${newStatus}!`);
      setStatusModalOpen(false);
      loadData(pagination.current, pagination.pageSize, searchText);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `Ksh ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const columns: ColumnsType<Purchase> = [
    {
      title: 'Reference',
      dataIndex: 'refNumber',
      key: 'refNumber',
    },
    {
      title: 'Supplier',
      dataIndex: 'supplierName',
      key: 'supplierName',
    },
    {
      title: 'Location',
      dataIndex: 'locationName',
      key: 'locationName',
    },
    {
      title: 'Total',
      dataIndex: 'grandTotal',
      key: 'grandTotal',
      align: 'right',
      render: (amount) => formatCurrency(amount),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors: any = {
          PENDING: 'orange',
          RECEIVED: 'green',
          ORDERED: 'blue',
          APPROVED: 'green',
          ALLOCATED: 'blue',
        };
        return <Tag color={colors[status] || 'default'}>{status}</Tag>;
      },
    },
    {
      title: 'Date',
      dataIndex: 'purchaseDate',
      key: 'purchaseDate',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Action',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <div className="flex space-x-2">
          <Tooltip title="View Purchase">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => handleViewPurchase(record)}
            />
          </Tooltip>
          <Tooltip title="Allocate to Branches">
            <Button
              type="link"
              icon={<BranchesOutlined />}
              onClick={() => handleAllocateToBranches(record)}
              style={{ color: '#52c41a' }}
            />
          </Tooltip>
          <Tooltip title="Update Status">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleUpdateStatus(record)}
              style={{ color: '#fa8c16' }}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader 
        title="Purchases" 
        breadcrumbs={[
          { title: 'Purchases' }
        ]} 
      />

      <PageCard
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
            Add Purchase
          </Button>
        }
      >
        <Input.Search
          placeholder="Search purchases..."
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

      {/* Create Purchase Modal */}
      <Modal
        title="Create Purchase"
        open={createModalOpen}
        onCancel={() => {
          setCreateModalOpen(false);
          setPurchaseForm({ locationId: 0, items: [] });
          setProductSearchTerm('');
          setSearchedProducts([]);
          setShowProductDropdown(false);
        }}
        footer={[
          <Button key="cancel" onClick={() => setCreateModalOpen(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={submitting}
            onClick={handleSubmitPurchase}
          >
            Create Purchase
          </Button>,
        ]}
        width={900}
      >
        <div className="space-y-4">
          {/* Branch Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Branch</label>
            <Select
              value={purchaseForm.locationId || undefined}
              onChange={(value) => setPurchaseForm(prev => ({ ...prev, locationId: value }))}
              placeholder="--Select Location--"
              style={{ width: '100%' }}
            >
              {branches.map((b) => (
                <Select.Option key={b.id} value={b.id}>
                  {b.branchName}
                </Select.Option>
              ))}
            </Select>
          </div>

          {/* Product Search */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Search & Add Products</label>
            <div className="relative">
              <Input
                ref={searchInputRef}
                placeholder="Search for products by name..."
                value={productSearchTerm}
                onChange={(e) => handleProductSearch(e.target.value)}
                suffix={searchingProducts ? <Spin size="small" /> : null}
              />
              {showProductDropdown && searchedProducts.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white rounded border shadow-lg max-h-64 overflow-y-auto">
                  {searchedProducts.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleSelectProduct(product)}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b"
                    >
                      <div className="font-medium">{product.itemName}</div>
                      <div className="text-sm text-gray-500">Code: {product.itemCode}</div>
                    </div>
                  ))}
                </div>
              )}
              {showProductDropdown && productSearchTerm.length >= 2 && searchedProducts.length === 0 && !searchingProducts && (
                <div className="absolute z-10 w-full mt-1 bg-white rounded border shadow-lg p-4">
                  <div className="text-center text-gray-500">
                    No products found for "{productSearchTerm}"
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Selected Items Table */}
          {purchaseForm.items.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Selected Products ({purchaseForm.items.length} item{purchaseForm.items.length !== 1 ? 's' : ''})
              </label>
              <div className="border rounded overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold">Product</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold">Supplier</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold">Quantity</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold">Purchase Price</th>
                      <th className="px-4 py-2 text-center text-xs font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {purchaseForm.items.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-2">
                          <div className="font-medium">{item.productName}</div>
                        </td>
                        <td className="px-4 py-2">
                          <Select
                            value={item.supplierId || undefined}
                            onChange={(supplierId) => {
                              const selectedSupplier = suppliers.find(s => s.id === supplierId);
                              const newItems = [...purchaseForm.items];
                              newItems[index].supplierId = supplierId;
                              newItems[index].supplierName = selectedSupplier ? selectedSupplier.name : '';
                              setPurchaseForm(prev => ({ ...prev, items: newItems }));
                            }}
                            placeholder="--Select Supplier--"
                            style={{ width: '100%' }}
                            size="small"
                          >
                            {suppliers.map((s) => (
                              <Select.Option key={s.id} value={s.id}>
                                {s.name}
                              </Select.Option>
                            ))}
                          </Select>
                        </td>
                        <td className="px-4 py-2">
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              const newItems = [...purchaseForm.items];
                              newItems[index].quantity = isNaN(val) ? 0 : val;
                              setPurchaseForm(prev => ({ ...prev, items: newItems }));
                            }}
                            style={{ width: '80px' }}
                            size="small"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.purchasePrice}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              const newItems = [...purchaseForm.items];
                              newItems[index].purchasePrice = isNaN(val) ? 0 : val;
                              setPurchaseForm(prev => ({ ...prev, items: newItems }));
                            }}
                            style={{ width: '100px' }}
                            size="small"
                          />
                        </td>
                        <td className="px-4 py-2 text-center">
                          <Button
                            type="link"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => {
                              const newItems = purchaseForm.items.filter((_, i) => i !== index);
                              setPurchaseForm(prev => ({ ...prev, items: newItems }));
                            }}
                            size="small"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty State */}
          {purchaseForm.items.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Products Selected</h3>
              <p>Search and select products from the dropdown above to add them to your purchase.</p>
            </div>
          )}
        </div>
      </Modal>

      {/* View Purchase Modal */}
      <Modal
        title={`Purchase Details - ${selectedPurchase?.refNumber || ''}`}
        open={viewModalOpen}
        onCancel={() => {
          setViewModalOpen(false);
          setSelectedPurchase(null);
        }}
        footer={[
          <Button key="close" onClick={() => setViewModalOpen(false)}>
            Close
          </Button>,
        ]}
        width={800}
      >
        {selectedPurchase && (
          <div className="space-y-4">
            {/* Purchase Info */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
              <div>
                <label className="text-sm font-medium text-gray-600">Reference Number</label>
                <p className="text-lg font-semibold">{selectedPurchase.refNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <p className="text-lg font-semibold">{selectedPurchase.status}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Location</label>
                <p className="text-sm">{selectedPurchase.locationName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Total Items</label>
                <p className="text-sm">{selectedPurchase.items?.length || 0}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Total Amount</label>
                <p className="text-sm">Ksh {selectedPurchase.grandTotal.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Purchase Date</label>
                <p className="text-sm">{new Date(selectedPurchase.purchaseDate).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Items Table */}
            <div>
              <label className="block text-sm font-medium mb-2">Purchase Items</label>
              <div className="border rounded overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold">Product</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold">Supplier</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold">Code</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold">Quantity</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold">Buy Price</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold">Total Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {selectedPurchase.items.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium">{item.productName}</td>
                        <td className="px-4 py-2 text-sm">{item.supplierName || 'N/A'}</td>
                        <td className="px-4 py-2 text-xs font-mono bg-gray-100 rounded">{item.productCode}</td>
                        <td className="px-4 py-2">{item.quantity}</td>
                        <td className="px-4 py-2">Ksh {item.buyingPricePerUnit?.toLocaleString() || 0}</td>
                        <td className="px-4 py-2">Ksh {item.totalPrice?.toLocaleString() || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Allocate Modal */}
      <Modal
        title={`Bulk Allocate Purchase - ${selectedPurchase?.refNumber || ''}`}
        open={allocateModalOpen}
        onCancel={() => {
          setAllocateModalOpen(false);
          setSelectedPurchase(null);
          setAllocationForm({});
        }}
        footer={[
          <Button key="cancel" onClick={() => setAllocateModalOpen(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={submitting}
            onClick={handleAllocationSubmit}
            disabled={selectedPurchase?.items.some((item: any) => {
              const totalAllocated = Object.values(allocationForm[item.id] || {}).reduce((sum: number, qty: number) => sum + qty, 0);
              return totalAllocated > item.quantity;
            })}
          >
            Submit Allocation
          </Button>,
        ]}
        width={1200}
      >
        {selectedPurchase && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded">
              <p className="text-blue-800 mb-2">
                Allocate products from this purchase to different branches. Enter quantities for each product-branch combination.
              </p>
              <p className="text-sm text-blue-700">
                Total Purchase Amount: <strong>Ksh {selectedPurchase.grandTotal.toLocaleString()}</strong>
              </p>
            </div>

            <div className="border rounded overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold border-r">Product</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold border-r">Available Qty</th>
                    {branches.filter(branch => branch.id !== 1 && branch.branchCode !== '0001').map((branch) => (
                      <th key={branch.id} className="px-4 py-2 text-center text-xs font-semibold">
                        {branch.branchName}
                      </th>
                    ))}
                    <th className="px-4 py-2 text-center text-xs font-semibold bg-blue-100">Total Allocated</th>
                    <th className="px-4 py-2 text-center text-xs font-semibold bg-gray-100">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {selectedPurchase.items.map((item) => {
                    const totalAllocated = Object.values(allocationForm[item.id!] || {}).reduce((sum: number, qty: number) => sum + qty, 0);
                    const balance = item.quantity - totalAllocated;
                    const isOverAllocated = totalAllocated > item.quantity;

                    return (
                      <tr key={item.id} className={isOverAllocated ? 'bg-red-50' : 'hover:bg-gray-50'}>
                        <td className="px-4 py-2 border-r">
                          <div className="font-medium">{item.productName}</div>
                          <div className="text-xs text-gray-500">Code: {item.productCode}</div>
                        </td>
                        <td className="px-4 py-2 text-center border-r font-medium">{item.quantity}</td>
                        {branches.filter(branch => branch.id !== 1 && branch.branchCode !== '0001').map((branch) => (
                          <td key={branch.id} className="px-4 py-2 text-center border-r">
                            <Input
                              type="number"
                              min="0"
                              value={allocationForm[item.id!]?.[branch.id] || 0}
                              onChange={(e) => {
                                const val = Math.max(0, parseInt(e.target.value) || 0);
                                setAllocationForm(prev => ({
                                  ...prev,
                                  [item.id!]: {
                                    ...prev[item.id!],
                                    [branch.id]: val
                                  }
                                }));
                              }}
                              style={{ width: '80px' }}
                              size="small"
                            />
                          </td>
                        ))}
                        <td className="px-4 py-2 text-center bg-blue-50">
                          <span className={`font-medium ${totalAllocated > item.quantity ? 'text-red-600' : 'text-blue-600'}`}>
                            {totalAllocated}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-center bg-gray-100">
                          <span className={`font-medium ${balance < 0 ? 'text-red-600' : balance === 0 ? 'text-green-600' : 'text-gray-600'}`}>
                            {balance}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {selectedPurchase.items.some((item: any) => {
              const totalAllocated = Object.values(allocationForm[item.id] || {}).reduce((sum: number, qty: number) => sum + qty, 0);
              return totalAllocated > item.quantity;
            }) && (
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-red-800 text-sm">
                  ⚠️ Some products have over-allocated quantities. Please adjust the numbers.
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Update Status Modal */}
      <Modal
        title={`Update Status - ${selectedPurchase?.refNumber || ''}`}
        open={statusModalOpen}
        onCancel={() => {
          setStatusModalOpen(false);
          setSelectedPurchase(null);
        }}
        footer={null}
        width={500}
      >
        {selectedPurchase && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-gray-600 mb-4">Update the status of purchase</p>
              <p className="text-lg font-semibold">{selectedPurchase.refNumber}</p>
              <p className="text-sm text-gray-500">Current Status: <span className="font-medium">{selectedPurchase.status}</span></p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">New Status</label>
              <Select
                placeholder="Select new status"
                style={{ width: '100%' }}
                onChange={handleStatusUpdateSubmit}
              >
                <Select.Option value="PENDING">Pending</Select.Option>
                <Select.Option value="RECEIVED">Received</Select.Option>
                <Select.Option value="ORDERED">Ordered</Select.Option>
              </Select>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Purchases;
