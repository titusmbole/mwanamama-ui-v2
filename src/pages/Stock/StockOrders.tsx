import React, { useState, useRef, useEffect } from 'react';
import { 
    Typography, Button, Tag, message, Table, Form, Descriptions, Modal, Input, InputNumber
} from 'antd';
import { 
    PlusOutlined, EyeOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '../../components/common/Layout/PageHeader';
import PageCard from '../../components/common/PageCard/PageCard';
import DataTable from '../../components/common/DataTable/DataTable';
import FormDrawer from '../../components/common/FormDrawer/FormDrawer';
import dayjs from 'dayjs';
import { http, APIS } from '../../services/api';

const { Title, Text } = Typography;

interface Product {
    id: number;
    itemCode: string;
    itemName: string;
    unitPrice: number;
    currentStock: number;
}

// ----------------------------------------------------
// DATA STRUCTURES
// ----------------------------------------------------

interface OrderItem {
    productId: number;
    productName: string;
    productCode: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

interface StockOrder {
    id: number;
    orderNo: string;
    orderNumber?: string;
    supplier?: string;
    branch?: string;
    branchId?: number;
    branchName?: string;
    requestDate?: string;
    orderDate?: string;
    approvedDate?: string;
    supplierOrderDate?: string;
    supplierDeliveryDate?: string;
    dispatchDate?: string;
    receivedDate?: string;
    expectedDelivery?: string;
    items: OrderItem[];
    totalAmount?: number;
    status: 'ORDER' | 'requested' | 'approved' | 'ordered-from-supplier' | 'supplier-delivered' | 'dispatched-to-branch' | 'received' | 'completed' | 'cancelled';
    createdBy?: string;
    approvedBy?: string;
    rejectedItems?: { productId: number; quantity: number; reason: string; }[];
    notes?: string;
}

interface ApiOrderItem {
    id: number;
    productId: number;
    productName: string;
    quantity: number;
}

interface ApiStockOrder {
    id: number;
    orderNumber: string;
    notes: string;
    status: string;
    orderDate: string;
    branchId: number;
    branchName: string;
    items: ApiOrderItem[];
}

// ----------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------

const StockOrders: React.FC = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<StockOrder | null>(null);
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [refreshKey, setRefreshKey] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchedProducts, setSearchedProducts] = useState<Product[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [form] = Form.useForm();
    
    const searchInputRef = useRef<any>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);



    // Search products using API
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
            message.error(error?.response?.data?.message || 'Failed to search products');
            setSearchedProducts([]);
            setShowDropdown(false);
        } finally {
            setSearchLoading(false);
        }
    };

    // ----------------------------------------------------
    // TABLE COLUMNS
    // ----------------------------------------------------

    const columns: ColumnsType<ApiStockOrder> = [
        {
            title: 'Order No',
            dataIndex: 'orderNumber',
            key: 'orderNumber',
            sorter: true,
        },
        {
            title: 'Branch',
            dataIndex: 'branchName',
            key: 'branchName',
            sorter: true,
        },
        {
            title: 'Order Date',
            dataIndex: 'orderDate',
            key: 'orderDate',
            sorter: true,
            render: (date) => date ? dayjs(date).format('MMM DD, YYYY') : '-'
        },
        {
            title: 'Items',
            dataIndex: 'items',
            key: 'items',
            render: (items: ApiOrderItem[]) => <Tag color="blue">{items?.length || 0} items</Tag>
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            sorter: true,
            render: (status: string) => {
                const statusConfig: Record<string, { color: string; label: string }> = {
                    'ORDER': { color: 'orange', label: 'Order' },
                    'PENDING': { color: 'orange', label: 'Pending' },
                    'APPROVED': { color: 'blue', label: 'Approved' },
                    'COMPLETED': { color: 'green', label: 'Completed' },
                    'CANCELLED': { color: 'red', label: 'Cancelled' }
                };
                const config = statusConfig[status] || { color: 'default', label: status };
                return <Tag color={config.color}>{config.label}</Tag>;
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record: ApiStockOrder) => (
                <Button 
                    type="link" 
                    icon={<EyeOutlined />}
                    onClick={() => handleViewOrder(record)}
                />
            )
        }
    ];

    const itemColumns: ColumnsType<OrderItem> = [
        {
            title: 'Product',
            dataIndex: 'productName',
            key: 'productName',
            render: (text, record) => (
                <div>
                    <div className="font-medium">{text}</div>
                    <div className="text-xs text-gray-500">{record.productCode}</div>
                </div>
            )
        },
        {
            title: 'Quantity',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (quantity, record) => (
                <InputNumber
                    min={1}
                    value={quantity}
                    onChange={(value) => handleQuantityChange(record.productId, value || 1)}
                    style={{ width: 100 }}
                />
            )
        },
        {
            title: 'Unit Price',
            dataIndex: 'unitPrice',
            key: 'unitPrice',
            render: (price) => price ? `$${price.toFixed(2)}` : '-'
        },
        {
            title: 'Total',
            dataIndex: 'totalPrice',
            key: 'totalPrice',
            render: (price) => price ? <Text strong>${price.toFixed(2)}</Text> : <Text>-</Text>
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, _record, index) => (
                <Button 
                    type="link" 
                    danger 
                    size="small"
                    onClick={() => {
                        const newItems = orderItems.filter((_, i) => i !== index);
                        setOrderItems(newItems);
                    }}
                >
                    Remove
                </Button>
            )
        }
    ];

    // Columns for viewing order items (without edit/price info)
    const viewItemColumns: ColumnsType<ApiOrderItem> = [
        {
            title: 'Product',
            dataIndex: 'productName',
            key: 'productName',
        },
        {
            title: 'Quantity',
            dataIndex: 'quantity',
            key: 'quantity',
        }
    ];

    // ----------------------------------------------------
    // HANDLERS
    // ----------------------------------------------------

    const handleAddNew = () => {
        form.resetFields();
        setOrderItems([]);
        setSearchTerm('');
        setSearchedProducts([]);
        setShowDropdown(false);
        setIsModalVisible(true);
    };

    const handleViewOrder = (order: ApiStockOrder) => {
        setSelectedOrder(order as any);
        setIsViewModalVisible(true);
    };



    const handleSelectProduct = (product: Product) => {
        const existingItem = orderItems.find((item) => item.productId === product.id);
        if (existingItem) {
            message.warning(`${product.itemName} is already added.`);
            return;
        }

        const newItem: OrderItem = {
            productId: product.id,
            productName: product.itemName,
            productCode: product.itemCode,
            quantity: 1,
            unitPrice: product.unitPrice,
            totalPrice: product.unitPrice * 1
        };

        setOrderItems(prev => [...prev, newItem]);
        setSearchTerm('');
        setSearchedProducts([]);
        setShowDropdown(false);

        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    };

    const handleQuantityChange = (productId: number, quantity: number) => {
        setOrderItems(prev =>
            prev.map(item =>
                item.productId === productId ? { ...item, quantity: Math.max(1, quantity), totalPrice: item.unitPrice * Math.max(1, quantity) } : item
            )
        );
    };

    const handleFormSubmit = async (values: any) => {
        if (orderItems.length === 0) {
            message.error('Please add at least one product');
            return;
        }

        try {
            // Prepare API payload
            const payload = {
                notes: values.notes || '',
                items: orderItems.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity
                }))
            };

            // Call the API
            await http.post(APIS.CREATE_STOCK_ORDER, payload);
            
            // Refresh the table
            setRefreshKey(prev => prev + 1);
            
            setIsModalVisible(false);
            form.resetFields();
            setOrderItems([]);
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to create order');
            console.error('Error creating stock order:', error);
        }
    };

    // ----------------------------------------------------
    // RENDER
    // ----------------------------------------------------

    return (
        <>
            <div>
                <PageHeader 
                    title="Stock Orders" 
                    breadcrumbs={[
                        { title: 'Stock Management' },
                        { title: 'Stock Orders' }
                    ]}
                />

                <PageCard
                    extra={
                        <Button 
                            type="primary" 
                            icon={<PlusOutlined />}
                            onClick={handleAddNew}
                        >
                            New Request
                        </Button>
                    }
                >
                    <DataTable
                        key={refreshKey}
                        apiUrl={APIS.LIST_STOCK_ORDERS}
                        columns={columns}
                        searchPlaceholder="Search orders..."
                        scroll={{ x: 1200 }}
                    />
                </PageCard>
            </div>

            {/* Create Order Drawer */}
            <FormDrawer
                open={isModalVisible}
                title="New Stock Request to Head Office"
                onClose={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                    setOrderItems([]);
                }}
                onSubmit={handleFormSubmit}
                form={form}
                width={900}
            >
                <Form.Item
                    name="notes"
                    label="Request Notes"
                >
                    <Input.TextArea 
                        rows={3}
                        placeholder="e.g., Urgent stock needed" 
                    />
                </Form.Item>

                <div className="border-t pt-4 mt-4">
                    <Title level={5}>Search & Add Products</Title>
                    <div className="relative mb-4" ref={dropdownRef}>
                            <Input
                                ref={searchInputRef}
                                size="large"
                                placeholder="Search for products by name..."
                                prefix={<PlusOutlined />}
                                suffix={searchLoading ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div> : null}
                                value={searchTerm}
                                onChange={(e) => handleProductSearch(e.target.value)}
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
                                <div className="absolute z-10 w-full mt-1 bg-white rounded-lg border border-gray-200 shadow-lg max-h-64 overflow-y-auto">
                                    {searchedProducts.map((product, index) => (
                                        <button
                                            key={product.id}
                                            type="button"
                                            onClick={() => handleSelectProduct(product)}
                                            className={`w-full p-4 text-left hover:bg-blue-50 transition-colors flex items-center justify-between ${
                                                index !== searchedProducts.length - 1 ? 'border-b border-gray-100' : ''
                                            }`}
                                        >
                                            <div className="flex-1">
                                                <div className="font-medium text-gray-900">{product.itemName}</div>
                                                <div className="text-sm text-gray-500 mt-1">
                                                    Code: {product.itemCode} • Price: ${product.unitPrice} • Stock: {product.currentStock}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* No results message */}
                            {showDropdown && searchTerm.length >= 2 && searchedProducts.length === 0 && !searchLoading && (
                                <div className="absolute z-10 w-full mt-1 bg-white rounded-lg border border-gray-200 shadow-lg p-4">
                                    <div className="text-center text-gray-500">
                                        <p>No products found for "{searchTerm}"</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {orderItems.length > 0 && (
                            <div className="mt-4">
                                <Table
                                    columns={itemColumns}
                                    dataSource={orderItems}
                                    rowKey="productId"
                                    pagination={false}
                                    size="small"
                                    summary={() => (
                                        <Table.Summary fixed>
                                            <Table.Summary.Row>
                                                <Table.Summary.Cell index={0} colSpan={3}>
                                                    <Text strong>Total</Text>
                                                </Table.Summary.Cell>
                                                <Table.Summary.Cell index={1}>
                                                    <Text strong className="text-green-600">
                                                        ${orderItems.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)}
                                                    </Text>
                                                </Table.Summary.Cell>
                                                <Table.Summary.Cell index={2} />
                                            </Table.Summary.Row>
                                        </Table.Summary>
                                    )}
                                />
                            </div>
                        )}
                    </div>
            </FormDrawer>

            {/* View Order Modal */}
            <Modal
                open={isViewModalVisible}
                title="Order Details"
                onCancel={() => setIsViewModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setIsViewModalVisible(false)}>
                        Close
                    </Button>
                ]}
                width={800}
            >
                {selectedOrder && (
                    <div>
                        <Descriptions bordered column={2} size="small">
                            <Descriptions.Item label="Order No">{selectedOrder.orderNumber || selectedOrder.orderNo}</Descriptions.Item>
                            <Descriptions.Item label="Status">
                                <Tag color={
                                    selectedOrder.status === 'requested' ? 'orange' :
                                    selectedOrder.status === 'approved' ? 'blue' :
                                    selectedOrder.status === 'ordered-from-supplier' ? 'cyan' :
                                    selectedOrder.status === 'supplier-delivered' ? 'purple' :
                                    selectedOrder.status === 'dispatched-to-branch' ? 'geekblue' :
                                    selectedOrder.status === 'received' || selectedOrder.status === 'completed' ? 'green' : 'red'
                                }>
                                    {selectedOrder.status.replace(/-/g, ' ').toUpperCase()}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Branch">{selectedOrder.branchName || selectedOrder.branch}</Descriptions.Item>
                            <Descriptions.Item label="Order Date">
                                {dayjs(selectedOrder.orderDate || selectedOrder.requestDate).format('MMM DD, YYYY')}
                            </Descriptions.Item>
                            {selectedOrder.notes && (
                                <Descriptions.Item label="Notes" span={2}>
                                    {selectedOrder.notes}
                                </Descriptions.Item>
                            )}
                        </Descriptions>

                        <div className="mt-4">
                            <Title level={5}>Order Items</Title>
                            <Table
                                columns={viewItemColumns}
                                dataSource={selectedOrder.items}
                                rowKey="id"
                                pagination={false}
                                size="small"
                            />
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
};

export default StockOrders;
