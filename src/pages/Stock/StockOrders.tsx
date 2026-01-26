import React, { useState } from 'react';
import { 
    Typography, Card, Button, Tag, Row, Col, message, Table, Space, Form, Select, InputNumber, DatePicker, Descriptions, Modal
} from 'antd';
import { 
    PlusOutlined, ShoppingCartOutlined, CheckCircleOutlined, CloseCircleOutlined, EyeOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '../../components/common/Layout/PageHeader';
import FormDrawer from '../../components/common/FormDrawer/FormDrawer';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

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
    supplier: string;
    branch: string;
    orderDate: string;
    expectedDelivery: string;
    items: OrderItem[];
    totalAmount: number;
    status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
    createdBy: string;
}

// ----------------------------------------------------
// DUMMY DATA
// ----------------------------------------------------

const dummyProducts = [
    { id: 1, code: 'BF-400', name: 'Baby Formula - 400g', unitPrice: 25.00, currentStock: 150 },
    { id: 2, code: 'DP-M', name: 'Diapers Size M', unitPrice: 15.00, currentStock: 200 },
    { id: 3, code: 'BW-001', name: 'Baby Wipes', unitPrice: 8.50, currentStock: 180 },
    { id: 4, code: 'BL-200', name: 'Baby Lotion 200ml', unitPrice: 12.00, currentStock: 95 },
    { id: 5, code: 'BS-300', name: 'Baby Shampoo', unitPrice: 10.00, currentStock: 120 }
];

const dummySuppliers = ['ABC Suppliers Ltd', 'XYZ Distributors', 'Global Baby Products', 'Local Supplies Inc'];
const dummyBranches = ['Main Branch', 'Branch 2', 'Branch 3', 'Branch 4'];

const dummyOrders: StockOrder[] = [
    {
        id: 1,
        orderNo: 'ORD-2026-001',
        supplier: 'ABC Suppliers Ltd',
        branch: 'Main Branch',
        orderDate: '2026-01-20',
        expectedDelivery: '2026-01-27',
        items: [
            { productId: 1, productName: 'Baby Formula - 400g', productCode: 'BF-400', quantity: 100, unitPrice: 25.00, totalPrice: 2500.00 },
            { productId: 2, productName: 'Diapers Size M', productCode: 'DP-M', quantity: 150, unitPrice: 15.00, totalPrice: 2250.00 }
        ],
        totalAmount: 4750.00,
        status: 'confirmed',
        createdBy: 'John Doe'
    },
    {
        id: 2,
        orderNo: 'ORD-2026-002',
        supplier: 'XYZ Distributors',
        branch: 'Branch 2',
        orderDate: '2026-01-22',
        expectedDelivery: '2026-01-29',
        items: [
            { productId: 3, productName: 'Baby Wipes', productCode: 'BW-001', quantity: 200, unitPrice: 8.50, totalPrice: 1700.00 }
        ],
        totalAmount: 1700.00,
        status: 'pending',
        createdBy: 'Jane Smith'
    },
    {
        id: 3,
        orderNo: 'ORD-2026-003',
        supplier: 'Global Baby Products',
        branch: 'Main Branch',
        orderDate: '2026-01-18',
        expectedDelivery: '2026-01-25',
        items: [
            { productId: 4, productName: 'Baby Lotion 200ml', productCode: 'BL-200', quantity: 80, unitPrice: 12.00, totalPrice: 960.00 },
            { productId: 5, productName: 'Baby Shampoo', productCode: 'BS-300', quantity: 100, unitPrice: 10.00, totalPrice: 1000.00 }
        ],
        totalAmount: 1960.00,
        status: 'delivered',
        createdBy: 'Bob Wilson'
    },
    {
        id: 4,
        orderNo: 'ORD-2026-004',
        supplier: 'Local Supplies Inc',
        branch: 'Branch 3',
        orderDate: '2026-01-24',
        expectedDelivery: '2026-01-31',
        items: [
            { productId: 1, productName: 'Baby Formula - 400g', productCode: 'BF-400', quantity: 50, unitPrice: 25.00, totalPrice: 1250.00 }
        ],
        totalAmount: 1250.00,
        status: 'pending',
        createdBy: 'Alice Johnson'
    }
];

// ----------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------

const StockOrders: React.FC = () => {
    const [orders, setOrders] = useState<StockOrder[]>(dummyOrders);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<StockOrder | null>(null);
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [form] = Form.useForm();

    // ----------------------------------------------------
    // TABLE COLUMNS
    // ----------------------------------------------------

    const columns: ColumnsType<StockOrder> = [
        {
            title: 'Order No',
            dataIndex: 'orderNo',
            key: 'orderNo',
            fixed: 'left',
            width: 150,
        },
        {
            title: 'Supplier',
            dataIndex: 'supplier',
            key: 'supplier',
            width: 200,
        },
        {
            title: 'Branch',
            dataIndex: 'branch',
            key: 'branch',
            width: 150,
        },
        {
            title: 'Order Date',
            dataIndex: 'orderDate',
            key: 'orderDate',
            width: 120,
            render: (date) => dayjs(date).format('MMM DD, YYYY')
        },
        {
            title: 'Expected Delivery',
            dataIndex: 'expectedDelivery',
            key: 'expectedDelivery',
            width: 150,
            render: (date) => dayjs(date).format('MMM DD, YYYY')
        },
        {
            title: 'Items',
            dataIndex: 'items',
            key: 'items',
            width: 100,
            render: (items: OrderItem[]) => <Tag color="blue">{items.length} items</Tag>
        },
        {
            title: 'Total Amount',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            width: 150,
            render: (amount) => <Text strong className="text-green-600">${amount.toFixed(2)}</Text>
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status: string) => {
                const colors = {
                    pending: 'orange',
                    confirmed: 'blue',
                    delivered: 'green',
                    cancelled: 'red'
                };
                return <Tag color={colors[status as keyof typeof colors]}>{status.toUpperCase()}</Tag>;
            }
        },
        {
            title: 'Created By',
            dataIndex: 'createdBy',
            key: 'createdBy',
            width: 150,
        },
        {
            title: 'Actions',
            key: 'actions',
            fixed: 'right',
            width: 250,
            render: (_, record) => (
                <Space size="small">
                    <Button 
                        type="link" 
                        size="small" 
                        icon={<EyeOutlined />}
                        onClick={() => handleViewOrder(record)}
                    >
                        View
                    </Button>
                    {record.status === 'pending' && (
                        <Button 
                            type="link" 
                            size="small" 
                            icon={<CheckCircleOutlined />}
                            onClick={() => handleConfirm(record.id)}
                        >
                            Confirm
                        </Button>
                    )}
                    {record.status === 'confirmed' && (
                        <Button 
                            type="link" 
                            size="small" 
                            icon={<CheckCircleOutlined />}
                            onClick={() => handleDeliver(record.id)}
                        >
                            Mark Delivered
                        </Button>
                    )}
                    <Button 
                        type="link" 
                        danger 
                        size="small" 
                        icon={<CloseCircleOutlined />}
                        onClick={() => handleCancel(record.id)}
                        disabled={record.status === 'delivered' || record.status === 'cancelled'}
                    >
                        Cancel
                    </Button>
                </Space>
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
        },
        {
            title: 'Unit Price',
            dataIndex: 'unitPrice',
            key: 'unitPrice',
            render: (price) => `$${price.toFixed(2)}`
        },
        {
            title: 'Total',
            dataIndex: 'totalPrice',
            key: 'totalPrice',
            render: (price) => <Text strong>${price.toFixed(2)}</Text>
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

    // ----------------------------------------------------
    // HANDLERS
    // ----------------------------------------------------

    const handleAddNew = () => {
        form.resetFields();
        setOrderItems([]);
        setIsModalVisible(true);
    };

    const handleViewOrder = (order: StockOrder) => {
        setSelectedOrder(order);
        setIsViewModalVisible(true);
    };

    const handleConfirm = (id: number) => {
        setOrders(orders.map(order => 
            order.id === id ? { ...order, status: 'confirmed' as const } : order
        ));
        message.success('Order confirmed successfully');
    };

    const handleDeliver = (id: number) => {
        setOrders(orders.map(order => 
            order.id === id ? { ...order, status: 'delivered' as const } : order
        ));
        message.success('Order marked as delivered');
    };

    const handleCancel = (id: number) => {
        setOrders(orders.map(order => 
            order.id === id ? { ...order, status: 'cancelled' as const } : order
        ));
        message.warning('Order cancelled');
    };

    const handleAddProduct = () => {
        form.validateFields(['productId', 'quantity']).then((values) => {
            const product = dummyProducts.find(p => p.id === values.productId);
            if (!product) return;

            const existingIndex = orderItems.findIndex(item => item.productId === values.productId);
            if (existingIndex >= 0) {
                message.warning('Product already added. Update quantity in the table.');
                return;
            }

            const newItem: OrderItem = {
                productId: product.id,
                productName: product.name,
                productCode: product.code,
                quantity: values.quantity,
                unitPrice: product.unitPrice,
                totalPrice: product.unitPrice * values.quantity
            };

            setOrderItems([...orderItems, newItem]);
            form.setFieldsValue({ productId: undefined, quantity: 1 });
        });
    };

    const handleFormSubmit = async (values: any) => {
        if (orderItems.length === 0) {
            message.error('Please add at least one product');
            return;
        }

        try {
            const totalAmount = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
            const newOrder: StockOrder = {
                id: orders.length + 1,
                orderNo: `ORD-2026-${String(orders.length + 1).padStart(3, '0')}`,
                supplier: values.supplier,
                branch: values.branch,
                orderDate: values.orderDate.format('YYYY-MM-DD'),
                expectedDelivery: values.expectedDelivery.format('YYYY-MM-DD'),
                items: orderItems,
                totalAmount,
                status: 'pending',
                createdBy: 'Current User'
            };

            setOrders([newOrder, ...orders]);
            message.success('Order created successfully');
            setIsModalVisible(false);
            form.resetFields();
            setOrderItems([]);
        } catch (error) {
            message.error('Failed to create order');
        }
    };

    // ----------------------------------------------------
    // RENDER
    // ----------------------------------------------------

    return (
        <>
            <div className="p-6">
                <PageHeader 
                    title="Stock Orders" 
                    breadcrumbs={[
                        { title: 'Stock Management' },
                        { title: 'Stock Orders' }
                    ]}
                />

                <Card className="mt-4">
                    <Row justify="space-between" align="middle" className="mb-4">
                        <Col>
                            <Title level={4} className="flex items-center m-0">
                                <ShoppingCartOutlined className="mr-2 text-blue-500" /> 
                                Purchase Orders
                            </Title>
                        </Col>
                        <Col>
                            <Button 
                                type="primary" 
                                icon={<PlusOutlined />}
                                onClick={handleAddNew}
                            >
                                New Order
                            </Button>
                        </Col>
                    </Row>

                    <Table
                        columns={columns}
                        dataSource={orders}
                        rowKey="id"
                        scroll={{ x: 1500 }}
                        pagination={{
                            pageSize: 10,
                            showTotal: (total) => `Total ${total} orders`
                        }}
                    />
                </Card>
            </div>

            {/* Create Order Drawer */}
            <FormDrawer
                open={isModalVisible}
                title="New Stock Order"
                onClose={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                    setOrderItems([]);
                }}
                onSubmit={handleFormSubmit}
                form={form}
                width={900}
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                        orderDate: dayjs(),
                        expectedDelivery: dayjs().add(7, 'days'),
                        quantity: 1
                    }}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="supplier"
                                label="Supplier"
                                rules={[{ required: true, message: 'Please select a supplier' }]}
                            >
                                <Select placeholder="Select supplier">
                                    {dummySuppliers.map(supplier => (
                                        <Option key={supplier} value={supplier}>{supplier}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="branch"
                                label="Branch"
                                rules={[{ required: true, message: 'Please select a branch' }]}
                            >
                                <Select placeholder="Select branch">
                                    {dummyBranches.map(branch => (
                                        <Option key={branch} value={branch}>{branch}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="orderDate"
                                label="Order Date"
                                rules={[{ required: true, message: 'Please select order date' }]}
                            >
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="expectedDelivery"
                                label="Expected Delivery"
                                rules={[{ required: true, message: 'Please select expected delivery date' }]}
                            >
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <div className="border-t pt-4 mt-4">
                        <Title level={5}>Add Products</Title>
                        <Row gutter={16} align="bottom">
                            <Col span={12}>
                                <Form.Item
                                    name="productId"
                                    label="Product"
                                >
                                    <Select 
                                        placeholder="Select product"
                                        showSearch
                                        optionFilterProp="children"
                                    >
                                        {dummyProducts.map(product => (
                                            <Option key={product.id} value={product.id}>
                                                {product.name} ({product.code}) - ${product.unitPrice}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    name="quantity"
                                    label="Quantity"
                                >
                                    <InputNumber 
                                        min={1} 
                                        placeholder="Qty"
                                        style={{ width: '100%' }}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={4}>
                                <Form.Item label=" ">
                                    <Button 
                                        type="dashed" 
                                        icon={<PlusOutlined />}
                                        onClick={handleAddProduct}
                                        block
                                    >
                                        Add
                                    </Button>
                                </Form.Item>
                            </Col>
                        </Row>

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
                </Form>
            </FormDrawer>

            
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
                        <Descriptions bordered column={2}>
                            <Descriptions.Item label="Order No">{selectedOrder.orderNo}</Descriptions.Item>
                            <Descriptions.Item label="Status">
                                <Tag color={
                                    selectedOrder.status === 'pending' ? 'orange' :
                                    selectedOrder.status === 'confirmed' ? 'blue' :
                                    selectedOrder.status === 'delivered' ? 'green' : 'red'
                                }>
                                    {selectedOrder.status.toUpperCase()}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Supplier">{selectedOrder.supplier}</Descriptions.Item>
                            <Descriptions.Item label="Branch">{selectedOrder.branch}</Descriptions.Item>
                            <Descriptions.Item label="Order Date">
                                {dayjs(selectedOrder.orderDate).format('MMM DD, YYYY')}
                            </Descriptions.Item>
                            <Descriptions.Item label="Expected Delivery">
                                {dayjs(selectedOrder.expectedDelivery).format('MMM DD, YYYY')}
                            </Descriptions.Item>
                            <Descriptions.Item label="Created By">{selectedOrder.createdBy}</Descriptions.Item>
                            <Descriptions.Item label="Total Amount">
                                <Text strong className="text-green-600">${selectedOrder.totalAmount.toFixed(2)}</Text>
                            </Descriptions.Item>
                        </Descriptions>

                        <div className="mt-4">
                            <Title level={5}>Order Items</Title>
                            <Table
                                columns={itemColumns.filter(col => col.key !== 'action')}
                                dataSource={selectedOrder.items}
                                rowKey="productId"
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
