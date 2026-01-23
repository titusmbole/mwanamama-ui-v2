import React, { useState, useMemo } from 'react';
import { 
    Typography, Card, Button, Upload, Table, Tag, Row, Col, Progress, message, Space, Statistic, Modal, Form, Select, InputNumber
} from 'antd';
import { 
    UploadOutlined, CheckCircleOutlined, CloseCircleOutlined, SendOutlined, LineChartOutlined, FileExcelOutlined, DollarCircleOutlined, DownloadOutlined, TeamOutlined // ADDED TeamOutlined
} from '@ant-design/icons';
import PageHeader from '../../components/common/Layout/PageHeader';

const { Title, Text } = Typography;
const { Option } = Select;

const CURRENCY = 'Ksh';

// ----------------------------------------------------
// 1. DATA STRUCTURES & MOCK DATA
// ----------------------------------------------------

// --- CSV TEMPLATE DATA (Unchanged) ---
const CSV_TEMPLATE_CONTENT = 
`clientId,clientName,requestedAmount,interestRate,termMonths
C01005,Jane Achieng,85000,12,18
C01006,Peter Okello,150000,10,24
C01007,Fatuma Omar,50000,15,6
C01008,Samwel Njuguna,25000,18,3
C01009,Esther Chebet,95000,12,12`;

// Simplified Group list (matching the previous context)
const mockGroups = [
    { id: 101, groupName: 'Truetana Investment Group', loanAccountNumber: 'LN001A' },
    { id: 102, groupName: 'Unity Sacco', loanAccountNumber: 'LN003C' },
    // Mock clients associated with a group for this disbursement modal
    { clientId: 'G010A', clientName: 'Member One', defaultAmount: 50000 },
    { clientId: 'G010B', clientName: 'Member Two', defaultAmount: 40000 },
    { clientId: 'G010C', clientName: 'Member Three', defaultAmount: 60000 },
];

interface BulkBatchItem {
    clientId: string;
    clientName: string;
    requestedAmount: number;
    interestRate: number;
    termMonths: number;
    validationStatus: 'Valid' | 'Invalid' | 'Ready';
    validationError: string;
    disbursementStatus: 'Pending' | 'Success' | 'Failed';
    disbursedAmount?: number;
}

const initialBatchResults: BulkBatchItem[] = [
    // ... initial mock data (kept for file upload simulation) ...
];

// ----------------------------------------------------
// 2. HELPER FUNCTIONS (Unchanged)
// ----------------------------------------------------

const formatCurrency = (amount: number) => {
    return `${CURRENCY} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
};

const handleDownloadTemplate = () => {
    // ... (download logic remains the same) ...
    const blob = new Blob([CSV_TEMPLATE_CONTENT], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "loan_bulk_disbursement_template.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success('Download initiated for the CSV template.');
};


// ----------------------------------------------------
// 3. DISBURSE BY GROUP MODAL
// ----------------------------------------------------

interface DisburseByGroupModalProps {
    visible: boolean;
    onClose: () => void;
    onDisburse: (groupName: string, batchData: BulkBatchItem[]) => void;
    setLoading: (loading: boolean) => void;
}

const DisburseByGroupModal: React.FC<DisburseByGroupModalProps> = ({ visible, onClose, onDisburse, setLoading }) => {
    const [form] = Form.useForm();
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

    // Mock client data for the selected group (static for simplicity)
    const mockGroupClients = [
        { clientId: 'G010A', clientName: 'Member One', defaultAmount: 50000 },
        { clientId: 'G010B', clientName: 'Member Two', defaultAmount: 40000 },
        { clientId: 'G010C', clientName: 'Member Three', defaultAmount: 60000 },
    ];

    const handleGenerateAndDisburse = (values: any) => {
        const groupName = values.groupName;
        setLoading(true);
        message.info(`Generating batch for ${groupName}...`);

        // 1. Generate Batch Data based on group members
        const generatedBatch: BulkBatchItem[] = mockGroupClients.map(client => ({
            clientId: client.clientId,
            clientName: client.clientName,
            requestedAmount: values[`amount_${client.clientId}`] || client.defaultAmount,
            interestRate: values.interestRate,
            termMonths: values.termMonths,
            validationStatus: 'Valid', // Assume valid for modal process
            validationError: '',
            disbursementStatus: 'Pending',
        }));

        // 2. Pass the data back to the main component for processing
        setTimeout(() => {
            onDisburse(groupName, generatedBatch);
            setLoading(false);
            onClose();
            form.resetFields();
        }, 1000);
    };

    return (
        <Modal
            title={<Title level={4}><TeamOutlined /> Disburse Loans by Group</Title>}
            open={visible}
            onCancel={onClose}
            okText="Generate & Disburse Batch"
            onOk={form.submit}
            width={800}
        >
            <Form form={form} layout="vertical" onFinish={handleGenerateAndDisburse}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="groupName"
                            label="Select Group"
                            rules={[{ required: true, message: 'Please select a group' }]}
                        >
                            <Select 
                                placeholder="Select the target group"
                                onChange={(value: string) => setSelectedGroup(value)}
                            >
                                {mockGroups.map(g => (
                                    <Option key={g.id} value={g.groupName}>
                                        {g.groupName} (Loan: {g.loanAccountNumber})
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                         <Form.Item
                            name="interestRate"
                            label="Interest Rate (%)"
                            initialValue={12}
                            rules={[{ required: true, message: 'Enter rate' }]}
                        >
                             <InputNumber min={5} max={30} step={0.5} style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                     <Col span={6}>
                         <Form.Item
                            name="termMonths"
                            label="Term (Months)"
                            initialValue={12}
                            rules={[{ required: true, message: 'Enter term' }]}
                        >
                            <InputNumber min={1} max={60} style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                </Row>

                {selectedGroup && (
                    <Card title="Individual Client Disbursements" className="mt-4 bg-gray-50">
                        <Text type="secondary" block className="mb-3">
                            Set the individual loan amounts for each group member.
                        </Text>
                        <Row gutter={16}>
                            {mockGroupClients.map(client => (
                                <Col span={8} key={client.clientId}>
                                    <Form.Item
                                        name={`amount_${client.clientId}`}
                                        label={client.clientName}
                                        initialValue={client.defaultAmount}
                                        rules={[{ required: true, message: 'Enter amount' }]}
                                    >
                                        <InputNumber 
                                            min={1000} 
                                            formatter={value => `${CURRENCY} ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={value => value ? value.replace(new RegExp(`^${CURRENCY}\\s?|\\s?${CURRENCY}|,`, 'g'), '') : 0}
                                            style={{ width: '100%' }}
                                        />
                                    </Form.Item>
                                </Col>
                            ))}
                        </Row>
                    </Card>
                )}
            </Form>
        </Modal>
    );
};


// ----------------------------------------------------
// 4. MAIN COMPONENT (Bulk Loans)
// ----------------------------------------------------

const BulkLoanDisbursementModule: React.FC = () => {
    const [batchData, setBatchData] = useState<BulkBatchItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0); 
    const [isModalVisible, setIsModalVisible] = useState(false); // New state for modal

    // --- Metrics (Unchanged) ---
    const totalCount = batchData.length;
    const validCount = batchData.filter(item => item.validationStatus === 'Valid').length;
    const readyToDisburseCount = batchData.filter(item => item.validationStatus === 'Valid' && item.disbursementStatus === 'Pending').length;
    const successCount = batchData.filter(item => item.disbursementStatus === 'Success').length;
    const totalDisbursementAmount = useMemo(() => 
        batchData.reduce((sum, item) => sum + (item.disbursedAmount || 0), 0), [batchData]
    );

    // --- Handlers ---

    // Handles simulation from the Upload button
    const handleFileUpload = (file: File) => {
        setLoading(true);
        message.info(`Simulating upload and validation of ${file.name}...`);
        setTimeout(() => {
            // Use initialBatchResults for file upload simulation
            setBatchData(initialBatchResults.length > 0 ? initialBatchResults : mockGroups.map(g => ({...g, requestedAmount: 50000, interestRate: 10, termMonths: 12, validationStatus: 'Valid', validationError: '', disbursementStatus: 'Pending'})));
            setCurrentStep(1); 
            message.success('File validated. Review the batch status below.');
            setLoading(false);
        }, 1500);
        return false;
    };
    
    // Handles disbursement from the modal
    const handleDisburseGroup = (groupName: string, generatedBatch: BulkBatchItem[]) => {
        // Set the batch data to the generated group batch
        setBatchData(generatedBatch);
        setCurrentStep(1); // Move to review step

        // Automatically start disbursement after a short delay (for flow continuity)
        setTimeout(() => {
             message.info(`Auto-starting disbursement for ${groupName}...`);
             handleDisburseBatch();
        }, 500);
    };

    const handleDisburseBatch = () => {
        if (readyToDisburseCount === 0) {
            message.warning('No valid loans ready for disbursement.');
            return;
        }

        setLoading(true);
        message.loading(`Initiating bulk disbursement for ${readyToDisburseCount} loans...`, 2);

        setTimeout(() => {
            setBatchData(prevData => prevData.map(item => {
                if (item.validationStatus === 'Valid' && item.disbursementStatus === 'Pending') {
                    const isSuccess = Math.random() > 0.1; 
                    return {
                        ...item,
                        disbursementStatus: isSuccess ? 'Success' as const : 'Failed' as const,
                        disbursedAmount: isSuccess ? item.requestedAmount : 0,
                    };
                }
                return item;
            }));

            setCurrentStep(2); 
            setLoading(false);
            message.success(`Disbursement batch complete. ${successCount} loans disbursed successfully.`);
        }, 3000);
    };

    const handleNewBatch = () => {
        setBatchData([]);
        setCurrentStep(0);
        message.info('Ready for new batch upload.');
    };

    // --- Table Configuration (Unchanged) ---
    const columns = [
        { title: 'Client ID', dataIndex: 'clientId', key: 'clientId', width: 100 },
        { title: 'Client Name', dataIndex: 'clientName', key: 'clientName' },
        { 
            title: 'Req. Amount', 
            dataIndex: 'requestedAmount', 
            key: 'requestedAmount',
            align: 'right' as const,
            render: (amount: number) => formatCurrency(amount)
        },
        { 
            title: 'Validation Status', 
            dataIndex: 'validationStatus', 
            key: 'validationStatus',
            align: 'center' as const,
            render: (status: BulkBatchItem['validationStatus'], record: BulkBatchItem) => {
                if (status === 'Invalid') {
                    return <Tag color="error" title={record.validationError}><CloseCircleOutlined /> Invalid</Tag>;
                } else if (status === 'Valid') {
                    return <Tag color="success"><CheckCircleOutlined /> Valid</Tag>;
                }
                return <Tag>{status}</Tag>;
            }
        },
        { 
            title: 'Disbursement Status', 
            dataIndex: 'disbursementStatus', 
            key: 'disbursementStatus',
            align: 'center' as const,
            render: (status: BulkBatchItem['disbursementStatus']) => {
                switch (status) {
                    case 'Success': return <Tag color="blue"><DollarCircleOutlined /> Success</Tag>;
                    case 'Failed': return <Tag color="red"><CloseCircleOutlined /> Failed</Tag>;
                    default: return <Tag color="default">Pending</Tag>;
                }
            }
        },
        { 
            title: 'Disbursed Amount', 
            dataIndex: 'disbursedAmount', 
            key: 'disbursedAmount',
            align: 'right' as const,
            render: (amount: number | undefined) => amount ? formatCurrency(amount) : '-'
        },
    ];

    // --- Render ---

    return (
        <div>
            <PageHeader 
                title="Loans" 
                breadcrumbs={[
                    { title: 'Loans' }
                ]} 
            />
            
            <div className="page-container p-4 min-h-screen bg-gray-50">
                <Title level={2} className="text-gray-800">
                    <LineChartOutlined style={{ marginRight: 10 }} /> Bulk Loan Disbursement
                </Title>
                <Text type="secondary">
                    Process multiple loans either by **File Upload** or **Direct Group Disbursement**.
                </Text>

            {/* --- Action Buttons --- */}
            <Row gutter={16} className="mt-4 mb-6">
                <Col xs={24} md={6}>
                    <Button 
                        type="primary" 
                        icon={<TeamOutlined />} 
                        onClick={() => setIsModalVisible(true)}
                        disabled={currentStep !== 0}
                        block
                    >
                        Disburse by Group
                    </Button>
                </Col>
            </Row>

            {/* --- Process Flow Cards --- */}
            <Row gutter={24} className="mt-6">
                <Col xs={24} lg={8}>
                    <Card 
                        title={<Text strong>1. Upload File</Text>} 
                        className={`shadow-md ${currentStep === 0 ? 'border-2 border-blue-500' : 'border-gray-200'}`}
                    >
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Upload 
                                beforeUpload={handleFileUpload} 
                                accept=".csv,.xlsx" 
                                maxCount={1}
                                showUploadList={currentStep === 0}
                            >
                                <Button 
                                    icon={<UploadOutlined />} 
                                    loading={loading} 
                                    disabled={currentStep !== 0}
                                    block
                                >
                                    Select Batch File (CSV/XLSX)
                                </Button>
                            </Upload>
                            
                            <Button 
                                icon={<DownloadOutlined />} 
                                onClick={handleDownloadTemplate} 
                                disabled={loading}
                                block
                            >
                                Download CSV Template
                            </Button>
                        </Space>
                    </Card>
                </Col>
                
                <Col xs={24} lg={8}>
                    <Card 
                        title={<Text strong>2. Review & Disburse</Text>}
                        className={`shadow-md ${currentStep === 1 ? 'border-2 border-blue-500' : 'border-gray-200'}`}
                    >
                        <Statistic 
                            title="Valid Loans Ready" 
                            value={readyToDisburseCount} 
                            valueStyle={{ color: '#52c41a' }}
                            suffix={`/ ${totalCount}`}
                        />
                        <Button 
                            type="primary" 
                            icon={<SendOutlined />} 
                            onClick={handleDisburseBatch} 
                            loading={loading}
                            disabled={currentStep !== 1 || readyToDisburseCount === 0}
                            block
                            className="mt-4"
                        >
                            Execute Disbursement
                        </Button>
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card 
                        title={<Text strong>3. Final Status</Text>}
                        className={`shadow-md ${currentStep === 2 ? 'border-2 border-green-500' : 'border-gray-200'}`}
                    >
                        <Statistic 
                            title="Total Disbursed Value" 
                            value={totalDisbursementAmount}
                            prefix={CURRENCY}
                            precision={2}
                            valueStyle={{ color: '#1890ff' }}
                        />
                        <Button 
                            type="default" 
                            icon={<FileExcelOutlined />} 
                            onClick={handleNewBatch}
                            disabled={currentStep === 0}
                            block
                            className="mt-4"
                        >
                            Start New Batch
                        </Button>
                    </Card>
                </Col>
            </Row>

            {/* --- Batch Results Table --- */}
            {batchData.length > 0 && (
                <Card title={<Title level={4} className="mt-4">Batch Processing Results ({totalCount} items)</Title>} className="shadow-lg mt-6">
                    <Table
                        columns={columns}
                        dataSource={batchData}
                        rowKey="clientId"
                        pagination={{ pageSize: 5 }}
                        size="middle"
                        bordered
                    />
                </Card>
            )}

            {batchData.length === 0 && currentStep === 0 && (
                 <Card style={{ marginTop: 20 }} className="text-center p-8 border-dashed border-2 border-gray-300">
                    <FileExcelOutlined style={{ fontSize: '48px', color: '#ccc' }} />
                    <Title level={4} type="secondary" className="mt-2">Select an action above to begin processing.</Title>
                    <Text type="secondary">Choose between bulk file upload or direct group disbursement.</Text>
                </Card>
            )}

            <DisburseByGroupModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                onDisburse={handleDisburseGroup}
                setLoading={setLoading}
            />            </div>        </div>
    );
};

export default BulkLoanDisbursementModule;