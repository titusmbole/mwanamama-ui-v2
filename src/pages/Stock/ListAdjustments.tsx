import React, { useState } from 'react';
import { 
    Typography, Card, Button, Tag, Row, Col, message, Table, Space, Modal, Form, Input, Select, InputNumber, DatePicker
} from 'antd';
import { 
    PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, CloseCircleOutlined, UnorderedListOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '../../components/common/Layout/PageHeader';
import FormDrawer from '../../components/common/FormDrawer/FormDrawer';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;

// ----------------------------------------------------
// DATA STRUCTURES
// ----------------------------------------------------

interface StockAdjustment {
    id: number;
    referenceNo: string;
    product: string;
    productCode: string;
    adjustmentType: 'increase' | 'decrease' | 'recount';
    quantity: number;
    reason: string;
    branch: string;
    adjustedBy: string;
    date: string;
    status: 'pending' | 'approved' | 'rejected';
}

// ----------------------------------------------------
// DUMMY DATA
// ----------------------------------------------------

const dummyAdjustments: StockAdjustment[] = [
    {
        id: 1,
        referenceNo: 'ADJ-2026-001',
        product: 'Baby Formula - 400g',
        productCode: 'BF-400',
        adjustmentType: 'increase',
        quantity: 50,
        reason: 'Stock recount - found additional units',
        branch: 'Main Branch',
        adjustedBy: 'John Doe',
        date: '2026-01-20',
        status: 'approved'
    },
    {
        id: 2,
        referenceNo: 'ADJ-2026-002',
        product: 'Diapers Size M',
        productCode: 'DP-M',
        adjustmentType: 'decrease',
        quantity: 20,
        reason: 'Damaged goods',
        branch: 'Branch 2',
        adjustedBy: 'Jane Smith',
        date: '2026-01-21',
        status: 'approved'
    },
    {
        id: 3,
        referenceNo: 'ADJ-2026-003',
        product: 'Baby Wipes',
        productCode: 'BW-001',
        adjustmentType: 'recount',
        quantity: 15,
        reason: 'Physical count discrepancy',
        branch: 'Main Branch',
        adjustedBy: 'Alice Johnson',
        date: '2026-01-22',
        status: 'pending'
    },
    {
        id: 4,
        referenceNo: 'ADJ-2026-004',
        product: 'Baby Lotion 200ml',
        productCode: 'BL-200',
        adjustmentType: 'decrease',
        quantity: 10,
        reason: 'Expired products',
        branch: 'Branch 3',
        adjustedBy: 'Bob Wilson',
        date: '2026-01-23',
        status: 'pending'
    },
    {
        id: 5,
        referenceNo: 'ADJ-2026-005',
        product: 'Baby Shampoo',
        productCode: 'BS-300',
        adjustmentType: 'increase',
        quantity: 30,
        reason: 'Supplier bonus stock',
        branch: 'Branch 2',
        adjustedBy: 'Carol Brown',
        date: '2026-01-24',
        status: 'rejected'
    }
];

const dummyProducts = [
    { id: 1, code: 'BF-400', name: 'Baby Formula - 400g', currentStock: 150 },
    { id: 2, code: 'DP-M', name: 'Diapers Size M', currentStock: 200 },
    { id: 3, code: 'BW-001', name: 'Baby Wipes', currentStock: 180 },
    { id: 4, code: 'BL-200', name: 'Baby Lotion 200ml', currentStock: 95 },
    { id: 5, code: 'BS-300', name: 'Baby Shampoo', currentStock: 120 }
];

const dummyBranches = ['Main Branch', 'Branch 2', 'Branch 3', 'Branch 4'];

// ----------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------

const ListAdjustments: React.FC = () => {
    const [adjustments, setAdjustments] = useState<StockAdjustment[]>(dummyAdjustments);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingAdjustment, setEditingAdjustment] = useState<StockAdjustment | null>(null);
    const [form] = Form.useForm();

    // ----------------------------------------------------
    // TABLE COLUMNS
    // ----------------------------------------------------

    const columns: ColumnsType<StockAdjustment> = [
        {
            title: 'Reference No',
            dataIndex: 'referenceNo',
            key: 'referenceNo',
            fixed: 'left',
            width: 150,
        },
        {
            title: 'Product',
            dataIndex: 'product',
            key: 'product',
            width: 200,
            render: (text, record) => (
                <div>
                    <div className="font-medium">{text}</div>
                    <div className="text-xs text-gray-500">{record.productCode}</div>
                </div>
            )
        },
        {
            title: 'Adjustment Type',
            dataIndex: 'adjustmentType',
            key: 'adjustmentType',
            width: 150,
            render: (type: string) => {
                const colors = {
                    increase: 'green',
                    decrease: 'red',
                    recount: 'blue'
                };
                return <Tag color={colors[type as keyof typeof colors]}>{type.toUpperCase()}</Tag>;
            }
        },
        {
            title: 'Quantity',
            dataIndex: 'quantity',
            key: 'quantity',
            width: 100,
            render: (qty, record) => (
                <span className={record.adjustmentType === 'increase' ? 'text-green-600' : 'text-red-600'}>
                    {record.adjustmentType === 'increase' ? '+' : '-'}{qty}
                </span>
            )
        },
        {
            title: 'Reason',
            dataIndex: 'reason',
            key: 'reason',
            width: 250,
        },
        {
            title: 'Branch',
            dataIndex: 'branch',
            key: 'branch',
            width: 150,
        },
        {
            title: 'Adjusted By',
            dataIndex: 'adjustedBy',
            key: 'adjustedBy',
            width: 150,
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            width: 120,
            render: (date) => dayjs(date).format('MMM DD, YYYY')
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status: string) => {
                const colors = {
                    pending: 'orange',
                    approved: 'green',
                    rejected: 'red'
                };
                const icons = {
                    pending: <CloseCircleOutlined />,
                    approved: <CheckCircleOutlined />,
                    rejected: <CloseCircleOutlined />
                };
                return (
                    <Tag color={colors[status as keyof typeof colors]} icon={icons[status as keyof typeof icons]}>
                        {status.toUpperCase()}
                    </Tag>
                );
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            fixed: 'right',
            width: 200,
            render: (_, record) => (
                <Space size="small">
                    {record.status === 'pending' && (
                        <>
                            <Button 
                                type="link" 
                                size="small" 
                                icon={<CheckCircleOutlined />}
                                onClick={() => handleApprove(record.id)}
                            >
                                Approve
                            </Button>
                            <Button 
                                type="link" 
                                danger 
                                size="small" 
                                icon={<CloseCircleOutlined />}
                                onClick={() => handleReject(record.id)}
                            >
                                Reject
                            </Button>
                        </>
                    )}
                    <Button 
                        type="link" 
                        size="small" 
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                        disabled={record.status !== 'pending'}
                    >
                        Edit
                    </Button>
                    <Button 
                        type="link" 
                        danger 
                        size="small" 
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record.id)}
                        disabled={record.status === 'approved'}
                    >
                        Delete
                    </Button>
                </Space>
            )
        }
    ];

    // ----------------------------------------------------
    // HANDLERS
    // ----------------------------------------------------

    const handleAddNew = () => {
        setEditingAdjustment(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (record: StockAdjustment) => {
        setEditingAdjustment(record);
        form.setFieldsValue({
            ...record,
            date: dayjs(record.date)
        });
        setIsModalVisible(true);
    };

    const handleDelete = (id: number) => {
        Modal.confirm({
            title: 'Delete Adjustment',
            content: 'Are you sure you want to delete this adjustment?',
            okText: 'Yes, Delete',
            okType: 'danger',
            onOk: () => {
                setAdjustments(adjustments.filter(adj => adj.id !== id));
                message.success('Adjustment deleted successfully');
            }
        });
    };

    const handleApprove = (id: number) => {
        Modal.confirm({
            title: 'Approve Adjustment',
            content: 'Are you sure you want to approve this adjustment?',
            okText: 'Yes, Approve',
            onOk: () => {
                setAdjustments(adjustments.map(adj => 
                    adj.id === id ? { ...adj, status: 'approved' as const } : adj
                ));
                message.success('Adjustment approved successfully');
            }
        });
    };

    const handleReject = (id: number) => {
        Modal.confirm({
            title: 'Reject Adjustment',
            content: 'Are you sure you want to reject this adjustment?',
            okText: 'Yes, Reject',
            okType: 'danger',
            onOk: () => {
                setAdjustments(adjustments.map(adj => 
                    adj.id === id ? { ...adj, status: 'rejected' as const } : adj
                ));
                message.warning('Adjustment rejected');
            }
        });
    };

    const handleFormSubmit = async (values: any) => {
        try {
            const selectedProduct = dummyProducts.find(p => p.id === values.productId);
            
            if (editingAdjustment) {
                // Update existing
                setAdjustments(adjustments.map(adj => 
                    adj.id === editingAdjustment.id 
                        ? {
                            ...adj,
                            product: selectedProduct?.name || adj.product,
                            productCode: selectedProduct?.code || adj.productCode,
                            adjustmentType: values.adjustmentType,
                            quantity: values.quantity,
                            reason: values.reason,
                            branch: values.branch,
                            date: values.date.format('YYYY-MM-DD')
                        }
                        : adj
                ));
                message.success('Adjustment updated successfully');
            } else {
                // Create new
                const newAdjustment: StockAdjustment = {
                    id: adjustments.length + 1,
                    referenceNo: `ADJ-2026-${String(adjustments.length + 1).padStart(3, '0')}`,
                    product: selectedProduct?.name || '',
                    productCode: selectedProduct?.code || '',
                    adjustmentType: values.adjustmentType,
                    quantity: values.quantity,
                    reason: values.reason,
                    branch: values.branch,
                    adjustedBy: 'Current User',
                    date: values.date.format('YYYY-MM-DD'),
                    status: 'pending'
                };
                setAdjustments([newAdjustment, ...adjustments]);
                message.success('Adjustment created successfully');
            }
            setIsModalVisible(false);
            form.resetFields();
        } catch (error) {
            message.error('Failed to save adjustment');
        }
    };

    // ----------------------------------------------------
    // RENDER
    // ----------------------------------------------------

    return (
        <div className="p-6">
            <PageHeader 
                title="Stock Adjustments" 
                breadcrumbs={[
                    { title: 'Stock Management' },
                    { title: 'List Adjustments' }
                ]}
            />

            <Card className="mt-4">
                <Row justify="space-between" align="middle" className="mb-4">
                    <Col>
                        <Title level={4} className="flex items-center m-0">
                            <UnorderedListOutlined className="mr-2 text-blue-500" /> 
                            All Stock Adjustments
                        </Title>
                    </Col>
                    <Col>
                        <Button 
                            type="primary" 
                            icon={<PlusOutlined />}
                            onClick={handleAddNew}
                        >
                            New Adjustment
                        </Button>
                    </Col>
                </Row>

                <Table
                    columns={columns}
                    dataSource={adjustments}
                    rowKey="id"
                    scroll={{ x: 1500 }}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} adjustments`
                    }}
                />
            </Card>

            {/* Add/Edit Drawer */}
            <FormDrawer
                open={isModalVisible}
                title={editingAdjustment ? 'Edit Adjustment' : 'New Stock Adjustment'}
                onClose={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                }}
                onSubmit={handleFormSubmit}
                form={form}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                        date: dayjs(),
                        adjustmentType: 'increase'
                    }}
                >
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                name="productId"
                                label="Product"
                                rules={[{ required: true, message: 'Please select a product' }]}
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
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="adjustmentType"
                                label="Adjustment Type"
                                rules={[{ required: true, message: 'Please select adjustment type' }]}
                            >
                                <Select placeholder="Select type">
                                    <Option value="increase">Increase</Option>
                                    <Option value="decrease">Decrease</Option>
                                    <Option value="recount">Recount</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="quantity"
                                label="Quantity"
                                rules={[{ required: true, message: 'Please enter quantity' }]}
                            >
                                <InputNumber 
                                    min={1} 
                                    placeholder="Enter quantity"
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
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
                        <Col span={12}>
                            <Form.Item
                                name="date"
                                label="Date"
                                rules={[{ required: true, message: 'Please select date' }]}
                            >
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="reason"
                        label="Reason"
                        rules={[{ required: true, message: 'Please enter reason for adjustment' }]}
                    >
                        <Input.TextArea 
                            rows={4} 
                            placeholder="Enter reason for this adjustment"
                        />
                    </Form.Item>
                </Form>
            </FormDrawer>
        </div>
    );
};

export default ListAdjustments;
