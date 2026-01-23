import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Form, Select, InputNumber, message, Tag, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, EyeOutlined, BranchesOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import PageHeader from '../../components/common/Layout/PageHeader';
import PageCard from '../../components/common/PageCard/PageCard';
import { APIS } from '../../services/APIS';
import http from '../../services/httpInterceptor';

interface PurchaseItem {
  id: number;
  productId: number;
  productName: string;
  productCode: string;
  supplierId: number;
  supplierName: string;
  quantity: number;
  purchasePrice: number;
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

interface PurchaseFormData {
  locationId: number;
  items: {
    productId: number;
    productName: string;
    supplierId: number;
    quantity: number;
    purchasePrice: number;
  }[];
}

const Purchases: React.FC = () => {
  const [data, setData] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [allocateModalOpen, setAllocateModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  
  const [purchaseForm, setPurchaseForm] = useState<PurchaseFormData>({
    locationId: 0,
    items: [],
  });
  
  const [allocationForm, setAllocationForm] = useState<{ [itemId: number]: { [branchId: number]: number } }>({});
  const [newStatus, setNewStatus] = useState<string>('');
  
  const [createForm] = Form.useForm();

  useEffect(() => {
    loadData();
    loadSuppliers();
    loadBranches();
  }, []);

  const loadData = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      const response = await http.get(APIS.LIST_PURCHASES, { params: { page: page - 1, size: pageSize } }); // Backend uses 0-indexed pages
      
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

  const loadProducts = async (query: string) => {
    try {
      const response = await http.get(`${APIS.SEARCH_PRODUCT}?q=${encodeURIComponent(query)}`);
      setProducts(response.data || []);
    } catch (error) {
      message.error('Failed to search products');
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
    loadData(newPagination.current, newPagination.pageSize);
  };

  const handleAddProduct = (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existing = purchaseForm.items.find(item => item.productId === productId);
    if (existing) {
      message.error(`${product.itemName} is already added`);
      return;
    }

    setPurchaseForm({
      ...purchaseForm,
      items: [...purchaseForm.items, {
        productId: product.id,
        productName: product.itemName,
        supplierId: 0,
        quantity: 1,
        purchasePrice: product.unitPrice || 0,
      }],
    });

    createForm.setFieldValue('productSearch', '');
  };

  const handleUpdateItem = (productId: number, field: string, value: any) => {
    setPurchaseForm({
      ...purchaseForm,
      items: purchaseForm.items.map(item =>
        item.productId === productId ? { ...item, [field]: value } : item
      ),
    });
  };

  const handleRemoveItem = (productId: number) => {
    setPurchaseForm({
      ...purchaseForm,
      items: purchaseForm.items.filter(item => item.productId !== productId),
    });
  };

  const handleCreatePurchase = async () => {
    if (!purchaseForm.locationId || purchaseForm.items.length === 0) {
      message.error('Please select location and add at least one item');
      return;
    }

    const itemsWithoutSupplier = purchaseForm.items.filter(item => !item.supplierId);
    if (itemsWithoutSupplier.length > 0) {
      message.error('Please select supplier for all items');
      return;
    }

    setSubmitting(true);
    try {
      await http.post(APIS.CREATE_PURCHASE, purchaseForm);
      message.success('Purchase created successfully');
      setCreateModalOpen(false);
      setPurchaseForm({ locationId: 0, items: [] });
      createForm.resetFields();
      loadData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to create purchase');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAllocate = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    
    const initialAllocations: { [itemId: number]: { [branchId: number]: number } } = {};
    purchase.items.forEach(item => {
      initialAllocations[item.id] = {};
      branches.forEach(branch => {
        initialAllocations[item.id][branch.id] = 0;
      });
    });
    
    setAllocationForm(initialAllocations);
    setAllocateModalOpen(true);
  };

  const handleSubmitAllocation = async () => {
    if (!selectedPurchase) return;

    setSubmitting(true);
    try {
      const payload = {
        purchaseId: selectedPurchase.id,
        allocations: allocationForm,
      };

      await http.post(APIS.PURCHASE_ALLOCATE, payload);
      message.success('Purchase allocated successfully');
      setAllocateModalOpen(false);
      loadData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to allocate purchase');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedPurchase || !newStatus) return;

    setSubmitting(true);
    try {
      await http.put(`${APIS.PURCHASE_UPDATE_STATUS}${selectedPurchase.id}`, { status: newStatus });
      message.success('Status updated successfully');
      setStatusModalOpen(false);
      setNewStatus('');
      loadData();
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
          APPROVED: 'green',
          ALLOCATED: 'blue',
          REJECTED: 'red',
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
      title: 'Actions',
      key: 'actions',
      width: 140,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Tooltip title="View">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => { setSelectedPurchase(record); setViewModalOpen(true); }}
            />
          </Tooltip>
          <Tooltip title="Allocate">
            <Button
              type="link"
              icon={<BranchesOutlined />}
              onClick={() => handleAllocate(record)}
            />
          </Tooltip>
          <Tooltip title="Update Status">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => { setSelectedPurchase(record); setStatusModalOpen(true); }}
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
          createForm.resetFields();
        }}
        onOk={handleCreatePurchase}
        confirmLoading={submitting}
        width={1000}
      >
        <Form form={createForm} layout="vertical">
          <Form.Item label="Location" required>
            <Select
              value={purchaseForm.locationId || undefined}
              onChange={(val) => setPurchaseForm({ ...purchaseForm, locationId: val })}
              options={branches.map(b => ({ label: b.branchName, value: b.id }))}
              placeholder="Select location"
            />
          </Form.Item>

          <Form.Item name="productSearch" label="Search Product">
            <Select
              showSearch
              placeholder="Type to search products"
              onSearch={loadProducts}
              onChange={handleAddProduct}
              options={products.map(p => ({ label: p.itemName, value: p.id }))}
              filterOption={false}
            />
          </Form.Item>

          {purchaseForm.items.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <strong>Purchase Items:</strong>
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {purchaseForm.items.map((item) => (
                  <div
                    key={item.productId}
                    style={{
                      padding: 12,
                      border: '1px solid #d9d9d9',
                      borderRadius: 4,
                      display: 'grid',
                      gridTemplateColumns: '2fr 2fr 1fr 1fr auto',
                      gap: 12,
                      alignItems: 'center',
                    }}
                  >
                    <div><strong>{item.productName}</strong></div>
                    <Select
                      value={item.supplierId || undefined}
                      onChange={(val) => handleUpdateItem(item.productId, 'supplierId', val)}
                      options={suppliers.map(s => ({ label: s.name, value: s.id }))}
                      placeholder="Select supplier"
                      style={{ width: '100%' }}
                    />
                    <InputNumber
                      min={1}
                      value={item.quantity}
                      onChange={(val) => handleUpdateItem(item.productId, 'quantity', val || 1)}
                      style={{ width: '100%' }}
                      placeholder="Qty"
                    />
                    <InputNumber
                      min={0}
                      value={item.purchasePrice}
                      onChange={(val) => handleUpdateItem(item.productId, 'purchasePrice', val || 0)}
                      style={{ width: '100%' }}
                      placeholder="Price"
                      prefix="Ksh"
                    />
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveItem(item.productId)}
                    />
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12, textAlign: 'right', fontSize: 16, fontWeight: 'bold' }}>
                Total: {formatCurrency(purchaseForm.items.reduce((sum, item) => sum + (item.quantity * item.purchasePrice), 0))}
              </div>
            </div>
          )}
        </Form>
      </Modal>

      {/* View Purchase Modal */}
      <Modal
        title={`Purchase: ${selectedPurchase?.refNumber}`}
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        footer={null}
        width={800}
      >
        {selectedPurchase && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div><strong>Supplier:</strong> {selectedPurchase.supplierName}</div>
              <div><strong>Location:</strong> {selectedPurchase.locationName}</div>
              <div><strong>Status:</strong> <Tag color="green">{selectedPurchase.status}</Tag></div>
              <div><strong>Date:</strong> {new Date(selectedPurchase.purchaseDate).toLocaleDateString()}</div>
            </div>

            <Table
              dataSource={selectedPurchase.items}
              rowKey="id"
              pagination={false}
              columns={[
                { title: 'Product', dataIndex: 'productName', key: 'productName' },
                { title: 'Supplier', dataIndex: 'supplierName', key: 'supplierName' },
                { title: 'Qty', dataIndex: 'quantity', key: 'quantity', align: 'center' },
                { title: 'Price', dataIndex: 'purchasePrice', key: 'purchasePrice', align: 'right', render: (val) => formatCurrency(val) },
                { title: 'Total', key: 'total', align: 'right', render: (_, record) => formatCurrency(record.quantity * record.purchasePrice) },
              ]}
            />

            <div style={{ marginTop: 16, textAlign: 'right', fontSize: 18, fontWeight: 'bold' }}>
              Grand Total: {formatCurrency(selectedPurchase.grandTotal)}
            </div>
          </div>
        )}
      </Modal>

      {/* Allocate Modal */}
      <Modal
        title="Allocate to Branches"
        open={allocateModalOpen}
        onCancel={() => setAllocateModalOpen(false)}
        onOk={handleSubmitAllocation}
        confirmLoading={submitting}
        width={900}
      >
        {selectedPurchase && (
          <div>
            {selectedPurchase.items.map((item) => (
              <div key={item.id} style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 'bold', marginBottom: 8 }}>
                  {item.productName} (Available: {item.quantity})
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {branches.filter(b => b.branchCode !== '0001').map((branch) => (
                    <div key={branch.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ flex: 1, fontSize: 12 }}>{branch.branchName}:</span>
                      <InputNumber
                        min={0}
                        max={item.quantity}
                        value={allocationForm[item.id]?.[branch.id] || 0}
                        onChange={(val) => {
                          setAllocationForm({
                            ...allocationForm,
                            [item.id]: {
                              ...allocationForm[item.id],
                              [branch.id]: val || 0,
                            },
                          });
                        }}
                        size="small"
                        style={{ width: 80 }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Update Status Modal */}
      <Modal
        title="Update Purchase Status"
        open={statusModalOpen}
        onCancel={() => { setStatusModalOpen(false); setNewStatus(''); }}
        onOk={handleUpdateStatus}
        confirmLoading={submitting}
      >
        <Select
          value={newStatus || undefined}
          onChange={setNewStatus}
          options={[
            { label: 'Pending', value: 'PENDING' },
            { label: 'Approved', value: 'APPROVED' },
            { label: 'Allocated', value: 'ALLOCATED' },
            { label: 'Rejected', value: 'REJECTED' },
          ]}
          placeholder="Select new status"
          style={{ width: '100%' }}
        />
      </Modal>
    </div>
  );
};

export default Purchases;
