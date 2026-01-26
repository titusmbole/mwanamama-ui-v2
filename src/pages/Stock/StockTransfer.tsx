import React, { useState } from 'react';
import { 
    Typography, Card, Button, Tag, Row, Col, message, Table, Space, Form, Input, Select, InputNumber, DatePicker, Steps
} from 'antd';
import { 
    PlusOutlined, SwapOutlined, CheckCircleOutlined, CloseCircleOutlined, ArrowRightOutlined
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

interface TransferItem {
    productId: number;
    productName: string;
    productCode: string;
    quantity: number;
}

interface StockTransfer {
    id: number;
    transferNo: string;
    fromBranch: string;
    toBranch: string;
    items: TransferItem[];
    totalItems: number;
    transferDate: string;
    expectedArrival: string;
    status: 'pending' | 'in-transit' | 'received' | 'cancelled';
    initiatedBy: string;
    receivedBy?: string;
    notes?: string;
}

// ----------------------------------------------------
// DUMMY DATA
// ----------------------------------------------------

const dummyProducts = [
    { id: 1, code: 'BF-400', name: 'Baby Formula - 400g', currentStock: 150 },
    { id: 2, code: 'DP-M', name: 'Diapers Size M', currentStock: 200 },
    { id: 3, code: 'BW-001', name: 'Baby Wipes', currentStock: 180 },
    { id: 4, code: 'BL-200', name: 'Baby Lotion 200ml', currentStock: 95 },
    { id: 5, code: 'BS-300', name: 'Baby Shampoo', currentStock: 120 }
];

const dummyBranches = ['Main Branch', 'Branch 2', 'Branch 3', 'Branch 4'];

const dummyTransfers: StockTransfer[] = [
    {
        id: 1,
        transferNo: 'TRF-2026-001',
        fromBranch: 'Main Branch',
        toBranch: 'Branch 2',
        items: [
            { productId: 1, productName: 'Baby Formula - 400g', productCode: 'BF-400', quantity: 50 },
            { productId: 3, productName: 'Baby Wipes', productCode: 'BW-001', quantity: 30 }
        ],
        totalItems: 80,
        transferDate: '2026-01-20',
        expectedArrival: '2026-01-22',
        status: 'received',
        initiatedBy: 'John Doe',
        receivedBy: 'Jane Smith',
        notes: 'Regular stock transfer'
    },
    {
        id: 2,
        transferNo: 'TRF-2026-002',
        fromBranch: 'Branch 2',
        toBranch: 'Branch 3',
        items: [
            { productId: 2, productName: 'Diapers Size M', productCode: 'DP-M', quantity: 100 }
        ],
        totalItems: 100,
        transferDate: '2026-01-22',
        expectedArrival: '2026-01-24',
        status: 'in-transit',
        initiatedBy: 'Jane Smith',
        notes: 'Urgent transfer for stock shortage'
    },
    {
        id: 3,
        transferNo: 'TRF-2026-003',
        fromBranch: 'Main Branch',
        toBranch: 'Branch 4',
        items: [
            { productId: 4, productName: 'Baby Lotion 200ml', productCode: 'BL-200', quantity: 40 },
            { productId: 5, productName: 'Baby Shampoo', productCode: 'BS-300', quantity: 60 }
        ],
        totalItems: 100,
        transferDate: '2026-01-24',
        expectedArrival: '2026-01-26',
        status: 'pending',
        initiatedBy: 'Bob Wilson'
    },
    {
        id: 4,
        transferNo: 'TRF-2026-004',
        fromBranch: 'Branch 3',
        toBranch: 'Main Branch',
        items: [
            { productId: 1, productName: 'Baby Formula - 400g', productCode: 'BF-400', quantity: 25 }
        ],
        totalItems: 25,
        transferDate: '2026-01-23',
        expectedArrival: '2026-01-25',
        status: 'in-transit',
        initiatedBy: 'Alice Johnson'
    }
];

// ----------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------

const StockTransfer: React.FC = () => {
    const [transfers, setTransfers] = useState<StockTransfer[]>(dummyTransfers);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [transferItems, setTransferItems] = useState<TransferItem[]>([]);
    const [form] = Form.useForm();

    // ----------------------------------------------------
    // TABLE COLUMNS
    // ----------------------------------------------------

    const columns: ColumnsType<StockTransfer> = [
        {
            title: 'Transfer No',
            dataIndex: 'transferNo',
            key: 'transferNo',
            fixed: 'left',
            width: 150,
        },
        {
            title: 'From → To',
            key: 'branches',
            width: 250,
            render: (_, record) => (
                <div className="flex items-center gap-2">
                    <Tag color="blue">{record.fromBranch}</Tag>
                    <ArrowRightOutlined className="text-gray-400" />
                    <Tag color="green">{record.toBranch}</Tag>
                </div>
            )
        },
        {
            title: 'Items',
            dataIndex: 'items',
            key: 'items',
            width: 200,
            render: (items: TransferItem[]) => (
                <div>
                    <Tag color="blue">{items.length} products</Tag>
                    <Text type="secondary" className="ml-2">({items.reduce((sum, item) => sum + item.quantity, 0)} units)</Text>
                </div>
            )
        },
        {
            title: 'Transfer Date',
            dataIndex: 'transferDate',
            key: 'transferDate',
            width: 130,
            render: (date) => dayjs(date).format('MMM DD, YYYY')
        },
        {
            title: 'Expected Arrival',
            dataIndex: 'expectedArrival',
            key: 'expectedArrival',
            width: 150,
            render: (date) => dayjs(date).format('MMM DD, YYYY')
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 150,
            render: (status: string) => {
                const configs = {
                    pending: { color: 'orange', icon: <CloseCircleOutlined /> },
                    'in-transit': { color: 'blue', icon: <SwapOutlined /> },
                    received: { color: 'green', icon: <CheckCircleOutlined /> },
                    cancelled: { color: 'red', icon: <CloseCircleOutlined /> }
                };
                const config = configs[status as keyof typeof configs];
                return (
                    <Tag color={config.color} icon={config.icon}>
                        {status.toUpperCase().replace('-', ' ')}
                    </Tag>
                );
            }
        },
        {
            title: 'Initiated By',
            dataIndex: 'initiatedBy',
            key: 'initiatedBy',
            width: 150,
        },
        {
            title: 'Actions',
            key: 'actions',
            fixed: 'right',
            width: 250,
            render: (_, record) => (
                <Space size="small">
                    {record.status === 'pending' && (
                        <Button 
                            type="link" 
                            size="small" 
                            icon={<CheckCircleOutlined />}
                            onClick={() => handleDispatch(record.id)}
                        >
                            Dispatch
                        </Button>
                    )}
                    {record.status === 'in-transit' && (
                        <Button 
                            type="link" 
                            size="small" 
                            icon={<CheckCircleOutlined />}
                            onClick={() => handleReceive(record.id)}
                        >
                            Receive
                        </Button>
                    )}
                    <Button 
                        type="link" 
                        danger 
                        size="small" 
                        icon={<CloseCircleOutlined />}
                        onClick={() => handleCancel(record.id)}
                        disabled={record.status === 'received' || record.status === 'cancelled'}
                    >
                        Cancel
                    </Button>
                </Space>
            )
        }
    ];

    const itemColumns: ColumnsType<TransferItem> = [
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
            title: 'Action',
            key: 'action',
            render: (_, __, index) => (
                <Button 
                    type="link" 
                    danger 
                    size="small"
                    onClick={() => {
                        const newItems = transferItems.filter((_, i) => i !== index);
                        setTransferItems(newItems);
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
        setTransferItems([]);
        setIsModalVisible(true);
    };

    const handleDispatch = (id: number) => {
        setTransfers(transfers.map(transfer => 
            transfer.id === id ? { ...transfer, status: 'in-transit' as const } : transfer
        ));
        message.success('Transfer dispatched successfully');
    };

    const handleReceive = (id: number) => {
        setTransfers(transfers.map(transfer => 
            transfer.id === id ? { 
                ...transfer, 
                status: 'received' as const,
                receivedBy: 'Current User'
            } : transfer
        ));
        message.success('Transfer received successfully');
    };

    const handleCancel = (id: number) => {
        setTransfers(transfers.map(transfer => 
            transfer.id === id ? { ...transfer, status: 'cancelled' as const } : transfer
        ));
        message.warning('Transfer cancelled');
    };

    const handleAddProduct = () => {
        form.validateFields(['productId', 'quantity']).then((values) => {
            const product = dummyProducts.find(p => p.id === values.productId);
            if (!product) return;

            const existingIndex = transferItems.findIndex(item => item.productId === values.productId);
            if (existingIndex >= 0) {
                message.warning('Product already added. Update quantity in the table.');
                return;
            }

            if (values.quantity > product.currentStock) {
                message.error(`Only ${product.currentStock} units available in stock`);
                return;
            }

            const newItem: TransferItem = {
                productId: product.id,
                productName: product.name,
                productCode: product.code,
                quantity: values.quantity
            };

            setTransferItems([...transferItems, newItem]);
            form.setFieldsValue({ productId: undefined, quantity: 1 });
        });
    };

    const handleFormSubmit = async (values: any) => {
        if (transferItems.length === 0) {
            message.error('Please add at least one product');
            return;
        }

        if (values.fromBranch === values.toBranch) {
            message.error('Source and destination branches cannot be the same');
            return;
        }

        try {
            const totalItems = transferItems.reduce((sum, item) => sum + item.quantity, 0);
            const newTransfer: StockTransfer = {
                id: transfers.length + 1,
                transferNo: `TRF-2026-${String(transfers.length + 1).padStart(3, '0')}`,
                fromBranch: values.fromBranch,
                toBranch: values.toBranch,
                items: transferItems,
                totalItems,
                transferDate: values.transferDate.format('YYYY-MM-DD'),
                expectedArrival: values.expectedArrival.format('YYYY-MM-DD'),
                status: 'pending',
                initiatedBy: 'Current User',
                notes: values.notes
            };

            setTransfers([newTransfer, ...transfers]);
            message.success('Stock transfer created successfully');
            setIsModalVisible(false);
            form.resetFields();
            setTransferItems([]);
        } catch (error) {
            message.error('Failed to create transfer');
        }
    };

    // ----------------------------------------------------
    // STATUS STEPS
    // ----------------------------------------------------

    const getStatusStep = (status: string) => {
        const steps = ['pending', 'in-transit', 'received'];
        return steps.indexOf(status);
    };

    // ----------------------------------------------------
    // RENDER
    // ----------------------------------------------------

    return (
        <div className="p-6">
            <PageHeader 
                title="Stock Transfer" 
                breadcrumbs={[
                    { title: 'Stock Management' },
                    { title: 'Stock Transfer' }
                ]}
            />

            <Card className="mt-4">
                <Row justify="space-between" align="middle" className="mb-4">
                    <Col>
                        <Title level={4} className="flex items-center m-0">
                            <SwapOutlined className="mr-2 text-blue-500" /> 
                            Inter-Branch Transfers
                        </Title>
                    </Col>
                    <Col>
                        <Button 
                            type="primary" 
                            icon={<PlusOutlined />}
                            onClick={handleAddNew}
                        >
                            New Transfer
                        </Button>
                    </Col>
                </Row>

                <Table
                    columns={columns}
                    dataSource={transfers}
                    rowKey="id"
                    scroll={{ x: 1400 }}
                    pagination={{
                        pageSize: 10,
                        showTotal: (total) => `Total ${total} transfers`
                    }}
                    expandable={{
                        expandedRowRender: (record) => (
                            <div className="p-4 bg-gray-50">
                                <Steps
                                    current={getStatusStep(record.status)}
                                    items={[
                                        { title: 'Pending', description: dayjs(record.transferDate).format('MMM DD') },
                                        { title: 'In Transit', description: record.status !== 'pending' ? 'Dispatched' : 'Waiting' },
                                        { title: 'Received', description: record.status === 'received' ? `By ${record.receivedBy}` : dayjs(record.expectedArrival).format('MMM DD') }
                                    ]}
                                    className="mb-4"
                                />
                                <Title level={5}>Transfer Items</Title>
                                <Table
                                    columns={itemColumns.filter(col => col.key !== 'action')}
                                    dataSource={record.items}
                                    rowKey="productId"
                                    pagination={false}
                                    size="small"
                                />
                                {record.notes && (
                                    <div className="mt-3">
                                        <Text strong>Notes: </Text>
                                        <Text>{record.notes}</Text>
                                    </div>
                                )}
                            </div>
                        )
                    }}
                />
            </Card>

            {/* Create Transfer Drawer */}
            <FormDrawer
                open={isModalVisible}
                title="New Stock Transfer"
                onClose={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                    setTransferItems([]);
                }}
                onSubmit={handleFormSubmit}
                form={form}
                width={900}
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                        transferDate: dayjs(),
                        expectedArrival: dayjs().add(2, 'days'),
                        quantity: 1
                    }}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="fromBranch"
                                label="From Branch"
                                rules={[{ required: true, message: 'Please select source branch' }]}
                            >
                                <Select placeholder="Select source branch">
                                    {dummyBranches.map(branch => (
                                        <Option key={branch} value={branch}>{branch}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="toBranch"
                                label="To Branch"
                                rules={[{ required: true, message: 'Please select destination branch' }]}
                            >
                                <Select placeholder="Select destination branch">
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
                                name="transferDate"
                                label="Transfer Date"
                                rules={[{ required: true, message: 'Please select transfer date' }]}
                            >
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="expectedArrival"
                                label="Expected Arrival"
                                rules={[{ required: true, message: 'Please select expected arrival date' }]}
                            >
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <div className="border-t pt-4 mt-4">
                        <Title level={5}>Add Products to Transfer</Title>
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
                                                {product.name} ({product.code}) - Stock: {product.currentStock}
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

                        {transferItems.length > 0 && (
                            <div className="mt-4">
                                <Table
                                    columns={itemColumns}
                                    dataSource={transferItems}
                                    rowKey="productId"
                                    pagination={false}
                                    size="small"
                                    summary={() => (
                                        <Table.Summary fixed>
                                            <Table.Summary.Row>
                                                <Table.Summary.Cell index={0}>
                                                    <Text strong>Total Items</Text>
                                                </Table.Summary.Cell>
                                                <Table.Summary.Cell index={1}>
                                                    <Text strong className="text-blue-600">
                                                        {transferItems.reduce((sum, item) => sum + item.quantity, 0)} units
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

                    <Form.Item
                        name="notes"
                        label="Notes (Optional)"
                        className="mt-4"
                    >
                        <Input.TextArea 
                            rows={3} 
                            placeholder="Add any notes or special instructions for this transfer"
                        />
                    </Form.Item>
                </Form>
            </FormDrawer>
        </div>
    );
};

export default StockTransfer;
