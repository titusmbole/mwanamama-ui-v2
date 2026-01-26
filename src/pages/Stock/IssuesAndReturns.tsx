import React, { useState } from 'react';
import { 
    Typography, Card, Button, Tag, Row, Col, message, Table, Space, Form, Input, Select, InputNumber, DatePicker, Descriptions, Statistic
} from 'antd';
import { 
    PlusOutlined, RollbackOutlined, ExportOutlined, CheckCircleOutlined, CloseCircleOutlined, DollarOutlined, EyeOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '../../components/common/Layout/PageHeader';
import FormDrawer from '../../components/common/FormDrawer/FormDrawer';
import dayjs from 'dayjs';
import FormModal from '../../components/common/FormModal/FormModal';

const { Title, Text } = Typography;
const { Option } = Select;

// ----------------------------------------------------
// DATA STRUCTURES
// ----------------------------------------------------

interface IssueItem {
    productId: number;
    productName: string;
    productCode: string;
    issuedQty: number;
    soldQty: number;
    returnedQty: number;
}

interface Issue {
    id: number;
    referenceNo: string;
    officerName: string;
    branch: string;
    issueDate: string;
    returnDate?: string;
    items: IssueItem[];
    status: 'issued' | 'partial-return' | 'completed' | 'cancelled';
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

const dummyOfficers = ['John Doe', 'Jane Smith', 'Bob Wilson', 'Alice Johnson', 'Carol Brown'];
const dummyBranches = ['Main Branch', 'Branch 2', 'Branch 3', 'Branch 4'];

const dummyIssues: Issue[] = [
    {
        id: 1,
        referenceNo: 'ISS-2026-001',
        officerName: 'John Doe',
        branch: 'Main Branch',
        issueDate: '2026-01-24',
        returnDate: '2026-01-24',
        items: [
            { productId: 1, productName: 'Baby Formula - 400g', productCode: 'BF-400', issuedQty: 20, soldQty: 18, returnedQty: 2 },
            { productId: 3, productName: 'Baby Wipes', productCode: 'BW-001', issuedQty: 30, soldQty: 25, returnedQty: 5 }
        ],
        status: 'completed',
        notes: 'Field sales - residential area'
    },
    {
        id: 2,
        referenceNo: 'ISS-2026-002',
        officerName: 'Jane Smith',
        branch: 'Branch 2',
        issueDate: '2026-01-25',
        returnDate: '2026-01-25',
        items: [
            { productId: 2, productName: 'Diapers Size M', productCode: 'DP-M', issuedQty: 40, soldQty: 35, returnedQty: 5 },
            { productId: 4, productName: 'Baby Lotion 200ml', productCode: 'BL-200', issuedQty: 25, soldQty: 20, returnedQty: 5 }
        ],
        status: 'completed',
        notes: 'Market day sales'
    },
    {
        id: 3,
        referenceNo: 'ISS-2026-003',
        officerName: 'Bob Wilson',
        branch: 'Main Branch',
        issueDate: '2026-01-26',
        items: [
            { productId: 1, productName: 'Baby Formula - 400g', productCode: 'BF-400', issuedQty: 15, soldQty: 0, returnedQty: 0 },
            { productId: 5, productName: 'Baby Shampoo', productCode: 'BS-300', issuedQty: 20, soldQty: 0, returnedQty: 0 }
        ],
        status: 'issued',
        notes: 'Morning shift'
    },
    {
        id: 4,
        referenceNo: 'ISS-2026-004',
        officerName: 'Alice Johnson',
        branch: 'Branch 3',
        issueDate: '2026-01-26',
        items: [
            { productId: 3, productName: 'Baby Wipes', productCode: 'BW-001', issuedQty: 50, soldQty: 0, returnedQty: 0 }
        ],
        status: 'issued',
        notes: 'Door-to-door sales'
    }
];

// ----------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------

const IssuesAndReturns: React.FC = () => {
    const [issues, setIssues] = useState<Issue[]>(dummyIssues);
    const [isIssueModalVisible, setIsIssueModalVisible] = useState(false);
    const [isRecordSalesModalVisible, setIsRecordSalesModalVisible] = useState(false);
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);
    const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
    const [issueItems, setIssueItems] = useState<Omit<IssueItem, 'soldQty' | 'returnedQty'>[]>([]);
    const [form] = Form.useForm();
    const [salesForm] = Form.useForm();

    // ----------------------------------------------------
    // TABLE COLUMNS
    // ----------------------------------------------------

    const columns: ColumnsType<Issue> = [
        {
            title: 'Reference No',
            dataIndex: 'referenceNo',
            key: 'referenceNo',
            fixed: 'left',
            width: 140,
        },
        {
            title: 'Officer Name',
            dataIndex: 'officerName',
            key: 'officerName',
            width: 150,
        },
        {
            title: 'Branch',
            dataIndex: 'branch',
            key: 'branch',
            width: 130,
        },
        {
            title: 'Items',
            key: 'items',
            width: 100,
            render: (_, record) => <Tag color="blue">{record.items.length} items</Tag>
        },
        {
            title: 'Total Issued',
            key: 'totalIssued',
            width: 110,
            render: (_, record) => {
                const total = record.items.reduce((sum, item) => sum + item.issuedQty, 0);
                return <Text className="text-red-600 font-semibold">-{total}</Text>;
            }
        },
        {
            title: 'Total Sold',
            key: 'totalSold',
            width: 100,
            render: (_, record) => {
                const total = record.items.reduce((sum, item) => sum + item.soldQty, 0);
                return <Text className="text-green-600 font-semibold">{total}</Text>;
            }
        },
        {
            title: 'Total Returned',
            key: 'totalReturned',
            width: 120,
            render: (_, record) => {
                const total = record.items.reduce((sum, item) => sum + item.returnedQty, 0);
                return <Text className="text-blue-600 font-semibold">+{total}</Text>;
            }
        },
        {
            title: 'Issue Date',
            dataIndex: 'issueDate',
            key: 'issueDate',
            width: 110,
            render: (date) => dayjs(date).format('MMM DD')
        },
        {
            title: 'Return Date',
            dataIndex: 'returnDate',
            key: 'returnDate',
            width: 110,
            render: (date) => date ? dayjs(date).format('MMM DD') : '-'
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 130,
            render: (status: string) => {
                const configs = {
                    issued: { color: 'orange', text: 'ISSUED' },
                    'partial-return': { color: 'blue', text: 'PARTIAL' },
                    completed: { color: 'green', text: 'COMPLETED' },
                    cancelled: { color: 'red', text: 'CANCELLED' }
                };
                const config = configs[status as keyof typeof configs];
                return <Tag color={config.color}>{config.text}</Tag>;
            }
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
                        onClick={() => handleViewIssue(record)}
                    >
                        View
                    </Button>
                    {record.status === 'issued' && (
                        <Button 
                            type="link" 
                            size="small" 
                            icon={<DollarOutlined />}
                            onClick={() => handleRecordSales(record)}
                        >
                            Record Sales
                        </Button>
                    )}
                    <Button 
                        type="link" 
                        danger 
                        size="small" 
                        icon={<CloseCircleOutlined />}
                        onClick={() => handleCancel(record.id)}
                        disabled={record.status === 'completed' || record.status === 'cancelled'}
                    >
                        Cancel
                    </Button>
                </Space>
            )
        }
    ];

    const issueItemColumns: ColumnsType<Omit<IssueItem, 'soldQty' | 'returnedQty'>> = [
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
            dataIndex: 'issuedQty',
            key: 'issuedQty',
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
                        const newItems = issueItems.filter((_, i) => i !== index);
                        setIssueItems(newItems);
                    }}
                >
                    Remove
                </Button>
            )
        }
    ];

    const viewItemColumns: ColumnsType<IssueItem> = [
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
            title: 'Issued',
            dataIndex: 'issuedQty',
            key: 'issuedQty',
            render: (qty) => <Text className="text-red-600">-{qty}</Text>
        },
        {
            title: 'Sold',
            dataIndex: 'soldQty',
            key: 'soldQty',
            render: (qty) => <Text className="text-green-600">{qty}</Text>
        },
        {
            title: 'Returned',
            dataIndex: 'returnedQty',
            key: 'returnedQty',
            render: (qty) => <Text className="text-blue-600">+{qty}</Text>
        }
    ];

    // ----------------------------------------------------
    // HANDLERS
    // ----------------------------------------------------

    const handleAddNew = () => {
        form.resetFields();
        setIssueItems([]);
        setIsIssueModalVisible(true);
    };

    const handleViewIssue = (issue: Issue) => {
        setSelectedIssue(issue);
        setIsViewModalVisible(true);
    };

    const handleRecordSales = (issue: Issue) => {
        setSelectedIssue(issue);
        salesForm.resetFields();
        // Pre-fill form with item IDs for validation
        const initialValues: any = {};
        issue.items.forEach((item, index) => {
            initialValues[`sold_${index}`] = 0;
        });
        salesForm.setFieldsValue(initialValues);
        setIsRecordSalesModalVisible(true);
    };

    const handleCancel = (id: number) => {
        setIssues(issues.map(issue => 
            issue.id === id ? { ...issue, status: 'cancelled' as const } : issue
        ));
        message.warning('Issue cancelled');
    };

    const handleAddProduct = () => {
        form.validateFields(['productId', 'issuedQty']).then((values) => {
            const product = dummyProducts.find(p => p.id === values.productId);
            if (!product) return;

            const existingIndex = issueItems.findIndex(item => item.productId === values.productId);
            if (existingIndex >= 0) {
                message.warning('Product already added. Update quantity in the table.');
                return;
            }

            const newItem = {
                productId: product.id,
                productName: product.name,
                productCode: product.code,
                issuedQty: values.issuedQty
            };

            setIssueItems([...issueItems, newItem]);
            form.setFieldsValue({ productId: undefined, issuedQty: 1 });
        });
    };

    const handleFormSubmit = async (values: any) => {
        if (issueItems.length === 0) {
            message.error('Please add at least one product');
            return;
        }

        try {
            const newIssue: Issue = {
                id: issues.length + 1,
                referenceNo: `ISS-2026-${String(issues.length + 1).padStart(3, '0')}`,
                officerName: values.officerName,
                branch: values.branch,
                issueDate: values.issueDate.format('YYYY-MM-DD'),
                items: issueItems.map(item => ({
                    ...item,
                    soldQty: 0,
                    returnedQty: 0
                })),
                status: 'issued',
                notes: values.notes
            };

            setIssues([newIssue, ...issues]);
            message.success('Items issued successfully');
            setIsIssueModalVisible(false);
            form.resetFields();
            setIssueItems([]);
        } catch (error) {
            message.error('Failed to create issue');
        }
    };

    const handleSalesFormSubmit = async (values: any) => {
        if (!selectedIssue) return;

        try {
            const updatedItems = selectedIssue.items.map((item, index) => {
                const soldQty = values[`sold_${index}`] || 0;
                const returnedQty = item.issuedQty - soldQty;
                
                if (soldQty > item.issuedQty) {
                    throw new Error(`Sold quantity cannot exceed issued quantity for ${item.productName}`);
                }

                return {
                    ...item,
                    soldQty,
                    returnedQty
                };
            });

            const totalSold = updatedItems.reduce((sum, item) => sum + item.soldQty, 0);
            const newStatus: Issue['status'] = totalSold === 0 ? 'cancelled' : 'completed';

            setIssues(issues.map(issue => 
                issue.id === selectedIssue.id 
                    ? { 
                        ...issue, 
                        items: updatedItems,
                        returnDate: dayjs().format('YYYY-MM-DD'),
                        status: newStatus
                    } 
                    : issue
            ));
            
            message.success('Sales recorded and returns processed successfully');
            setIsRecordSalesModalVisible(false);
            salesForm.resetFields();
            setSelectedIssue(null);
        } catch (error: any) {
            message.error(error.message || 'Failed to record sales');
        }
    };

    // ----------------------------------------------------
    // RENDER
    // ----------------------------------------------------

    return (
        <div className="p-6">
            <PageHeader 
                title="Issues & Returns" 
                breadcrumbs={[
                    { title: 'Stock Management' },
                    { title: 'Issues & Returns' }
                ]}
            />

            <Card className="mt-4">
                <Row justify="space-between" align="middle" className="mb-4">
                    <Col>
                        <Title level={4} className="flex items-center m-0">
                            <ExportOutlined className="mr-2 text-blue-500" /> 
                            Field Officer Issues
                        </Title>
                        <Text type="secondary" className="text-sm">
                            Track items issued to field officers for sales
                        </Text>
                    </Col>
                    <Col>
                        <Button 
                            type="primary" 
                            icon={<PlusOutlined />}
                            onClick={handleAddNew}
                        >
                            Issue Items
                        </Button>
                    </Col>
                </Row>

                <Table
                    columns={columns}
                    dataSource={issues}
                    rowKey="id"
                    scroll={{ x: 1600 }}
                    pagination={{
                        pageSize: 10,
                        showTotal: (total) => `Total ${total} issues`
                    }}
                />
            </Card>

            {/* Issue Items Drawer */}
            <FormDrawer
                open={isIssueModalVisible}
                title="Issue Items to Field Officer"
                onClose={() => {
                    setIsIssueModalVisible(false);
                    form.resetFields();
                    setIssueItems([]);
                }}
                onSubmit={handleFormSubmit}
                form={form}
                width={900}
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                        issueDate: dayjs(),
                        issuedQty: 1
                    }}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="officerName"
                                label="Field Officer"
                                rules={[{ required: true, message: 'Please select an officer' }]}
                            >
                                <Select placeholder="Select officer">
                                    {dummyOfficers.map(officer => (
                                        <Option key={officer} value={officer}>{officer}</Option>
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
                                name="issueDate"
                                label="Issue Date"
                                rules={[{ required: true, message: 'Please select date' }]}
                            >
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <div className="border-t pt-4 mt-4">
                        <Title level={5}>Add Products to Issue</Title>
                        <Row gutter={16} align="bottom">
                            <Col span={14}>
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
                            <Col span={6}>
                                <Form.Item
                                    name="issuedQty"
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

                        {issueItems.length > 0 && (
                            <div className="mt-4">
                                <Table
                                    columns={issueItemColumns}
                                    dataSource={issueItems}
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
                                                    <Text strong className="text-red-600">
                                                        {issueItems.reduce((sum, item) => sum + item.issuedQty, 0)} units
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
                            rows={2} 
                            placeholder="Add any notes or instructions"
                        />
                    </Form.Item>
                </Form>
            </FormDrawer>

            {/* Record Sales Drawer */}
            <FormDrawer
                open={isRecordSalesModalVisible}
                title="Record Sales & Process Returns"
                onClose={() => {
                    setIsRecordSalesModalVisible(false);
                    salesForm.resetFields();
                    setSelectedIssue(null);
                }}
                onSubmit={handleSalesFormSubmit}
                form={salesForm}
                width={700}
            >
                {selectedIssue && (
                    <>
                        <Descriptions bordered column={2} size="small" className="mb-4">
                            <Descriptions.Item label="Reference">{selectedIssue.referenceNo}</Descriptions.Item>
                            <Descriptions.Item label="Officer">{selectedIssue.officerName}</Descriptions.Item>
                            <Descriptions.Item label="Branch">{selectedIssue.branch}</Descriptions.Item>
                            <Descriptions.Item label="Issue Date">
                                {dayjs(selectedIssue.issueDate).format('MMM DD, YYYY')}
                            </Descriptions.Item>
                        </Descriptions>

                        <Form
                            form={salesForm}
                            layout="vertical"
                        >
                            <Title level={5}>Enter Sold Quantities</Title>
                            <Text type="secondary" className="block mb-4">
                                Unsold items will be automatically returned to stock
                            </Text>

                            {selectedIssue.items.map((item, index) => (
                                <Card key={item.productId} size="small" className="mb-3">
                                    <Row gutter={16} align="middle">
                                        <Col span={12}>
                                            <div>
                                                <Text strong>{item.productName}</Text>
                                                <div className="text-xs text-gray-500">{item.productCode}</div>
                                                <div className="text-sm mt-1">
                                                    <Text type="secondary">Issued: </Text>
                                                    <Text className="text-red-600 font-semibold">{item.issuedQty} units</Text>
                                                </div>
                                            </div>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item
                                                name={`sold_${index}`}
                                                label="Sold Quantity"
                                                rules={[
                                                    { required: true, message: 'Required' },
                                                    {
                                                        validator: (_, value) => {
                                                            if (value > item.issuedQty) {
                                                                return Promise.reject(`Cannot exceed ${item.issuedQty}`);
                                                            }
                                                            return Promise.resolve();
                                                        }
                                                    }
                                                ]}
                                                className="mb-0"
                                            >
                                                <InputNumber 
                                                    min={0}
                                                    max={item.issuedQty}
                                                    placeholder="Enter sold quantity"
                                                    style={{ width: '100%' }}
                                                />
                                            </Form.Item>
                                            <Form.Item noStyle shouldUpdate>
                                                {() => {
                                                    const soldQty = salesForm.getFieldValue(`sold_${index}`) || 0;
                                                    const returnQty = item.issuedQty - soldQty;
                                                    return (
                                                        <div className="text-sm mt-1">
                                                            <Text type="secondary">Will return: </Text>
                                                            <Text className="text-blue-600 font-semibold">{returnQty} units</Text>
                                                        </div>
                                                    );
                                                }}
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Card>
                            ))}
                        </Form>
                    </>
                )}
            </FormDrawer>

            {/* View Issue Modal */}
            <FormModal
                open={isViewModalVisible}
                title="Issue Details"
                onCancel={() => {
                    setIsViewModalVisible(false);
                    setSelectedIssue(null);
                }}
                footer={[
                    <Button key="close" onClick={() => setIsViewModalVisible(false)}>
                        Close
                    </Button>
                ]}
                width={800}
            >
                {selectedIssue && (
                    <div>
                        <Descriptions bordered column={2} className="mb-4">
                            <Descriptions.Item label="Reference No">{selectedIssue.referenceNo}</Descriptions.Item>
                            <Descriptions.Item label="Status">
                                <Tag color={
                                    selectedIssue.status === 'issued' ? 'orange' :
                                    selectedIssue.status === 'completed' ? 'green' : 'red'
                                }>
                                    {selectedIssue.status.toUpperCase()}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Officer">{selectedIssue.officerName}</Descriptions.Item>
                            <Descriptions.Item label="Branch">{selectedIssue.branch}</Descriptions.Item>
                            <Descriptions.Item label="Issue Date">
                                {dayjs(selectedIssue.issueDate).format('MMM DD, YYYY')}
                            </Descriptions.Item>
                            <Descriptions.Item label="Return Date">
                                {selectedIssue.returnDate ? dayjs(selectedIssue.returnDate).format('MMM DD, YYYY') : '-'}
                            </Descriptions.Item>
                        </Descriptions>

                        {selectedIssue.notes && (
                            <div className="mb-4">
                                <Text strong>Notes: </Text>
                                <Text>{selectedIssue.notes}</Text>
                            </div>
                        )}

                        <Row gutter={16} className="mb-4">
                            <Col span={8}>
                                <Statistic 
                                    title="Total Issued" 
                                    value={selectedIssue.items.reduce((sum, item) => sum + item.issuedQty, 0)}
                                    valueStyle={{ color: '#cf1322' }}
                                    prefix="-"
                                />
                            </Col>
                            <Col span={8}>
                                <Statistic 
                                    title="Total Sold" 
                                    value={selectedIssue.items.reduce((sum, item) => sum + item.soldQty, 0)}
                                    valueStyle={{ color: '#3f8600' }}
                                />
                            </Col>
                            <Col span={8}>
                                <Statistic 
                                    title="Total Returned" 
                                    value={selectedIssue.items.reduce((sum, item) => sum + item.returnedQty, 0)}
                                    valueStyle={{ color: '#1890ff' }}
                                    prefix="+"
                                />
                            </Col>
                        </Row>

                        <div className="mt-4">
                            <Title level={5}>Items Details</Title>
                            <Table
                                columns={viewItemColumns}
                                dataSource={selectedIssue.items}
                                rowKey="productId"
                                pagination={false}
                                size="small"
                            />
                        </div>
                    </div>
                )}
            </FormModal>
        </div>
    );
};

export default IssuesAndReturns;
