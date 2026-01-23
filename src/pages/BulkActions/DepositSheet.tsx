import React, { useState, useMemo } from 'react';
import { 
    Typography, Card, Button, Upload, Table, Tag, Row, Col, Statistic, message, Space, Alert, Progress 
} from 'antd';
import { 
    UploadOutlined, CheckCircleOutlined, CloseCircleOutlined, SendOutlined, WalletOutlined, FileExcelOutlined, DollarCircleOutlined
} from '@ant-design/icons';
import PageHeader from '../../components/common/Layout/PageHeader';

const { Title, Text } = Typography;

const CURRENCY = 'Ksh';

// ----------------------------------------------------
// 1. DATA STRUCTURES & MOCK DATA
// ----------------------------------------------------

interface BulkDepositItem {
    accountNumber: string;
    clientName: string;
    depositAmount: number;
    transactionRef: string;
    validationStatus: 'Valid' | 'Invalid' | 'Ready';
    validationError: string;
    depositStatus: 'Pending' | 'Success' | 'Failed';
}

// Mock data representing the results of a file upload and validation
const initialBatchResults: BulkDepositItem[] = [
    {
        accountNumber: 'DDA001', clientName: 'Alice Johnson', depositAmount: 10000, transactionRef: 'T001A',
        validationStatus: 'Valid', validationError: '', depositStatus: 'Pending',
    },
    {
        accountNumber: 'DDA002', clientName: 'Bob Smith', depositAmount: 5000, transactionRef: 'T002B',
        validationStatus: 'Valid', validationError: '', depositStatus: 'Pending',
    },
    {
        accountNumber: 'DDA003', clientName: 'Charlie Brown', depositAmount: 1200, transactionRef: 'T003C',
        validationStatus: 'Invalid', validationError: 'Account locked for debit', depositStatus: 'Pending',
    },
    {
        accountNumber: 'DDA004', clientName: 'Diana Prince', depositAmount: 25000, transactionRef: 'T004D',
        validationStatus: 'Valid', validationError: '', depositStatus: 'Pending',
    },
    {
        accountNumber: 'DDA099', clientName: 'Unknown Client', depositAmount: 1000, transactionRef: 'T005E',
        validationStatus: 'Invalid', validationError: 'Account number does not exist', depositStatus: 'Pending',
    },
];

// --- CSV TEMPLATE DATA ---
const CSV_TEMPLATE_CONTENT = 
`accountNumber,clientName,depositAmount,transactionRef
DDA010,Mary Kasich,15000,M001
DDA011,John Mwangi,25000,M002
DDA012,Sarah Nzioka,8000,M003
`;

// ----------------------------------------------------
// 2. HELPER FUNCTIONS
// ----------------------------------------------------

const formatCurrency = (amount: number) => {
    return `${CURRENCY} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
};

/**
 * Helper function to create a downloadable file from text content.
 */
const handleDownloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE_CONTENT], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "bulk_deposit_template.csv");
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success('Download initiated for the CSV template.');
};

// ----------------------------------------------------
// 3. MAIN COMPONENT
// ----------------------------------------------------

const BulkDepositSheet: React.FC = () => {
    const [batchData, setBatchData] = useState<BulkDepositItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0); // 0: Upload, 1: Validate, 2: Execute

    // --- Metrics ---
    const totalCount = batchData.length;
    const validCount = batchData.filter(item => item.validationStatus === 'Valid').length;
    const readyToDepositCount = batchData.filter(item => item.validationStatus === 'Valid' && item.depositStatus === 'Pending').length;
    const successCount = batchData.filter(item => item.depositStatus === 'Success').length;
    const totalDepositAmount = useMemo(() => 
        batchData.reduce((sum, item) => sum + (item.depositStatus === 'Success' ? item.depositAmount : 0), 0), [batchData]
    );

    // --- Handlers ---

    const handleFileUpload = (file: File) => {
        // In a real system: file would be sent to a backend API for processing.
        setLoading(true);
        message.info(`Simulating upload and validation of ${file.name}...`);

        setTimeout(() => {
            // Simulate successful validation and setting the batch data
            setBatchData(initialBatchResults);
            setCurrentStep(1); // Move to validation step
            message.success('File validated. Review the batch status below.');
            setLoading(false);
        }, 1500);
        return false; // Prevent default Antd upload action
    };

    const handleExecuteDeposit = () => {
        if (readyToDepositCount === 0) {
            message.warning('No valid deposits ready for execution.');
            return;
        }

        setLoading(true);
        message.loading(`Executing bulk deposit for ${readyToDepositCount} accounts...`, 2);

        setTimeout(() => {
            // Simulate deposit execution process
            setBatchData(prevData => prevData.map(item => {
                if (item.validationStatus === 'Valid' && item.depositStatus === 'Pending') {
                    // Simulate a small chance of failure
                    const isSuccess = Math.random() > 0.1; 
                    return {
                        ...item,
                        depositStatus: isSuccess ? 'Success' as const : 'Failed' as const,
                    };
                }
                return item;
            }));

            setCurrentStep(2); // Move to final status review
            setLoading(false);
            message.success(`Deposit batch complete. ${successCount} deposits successful.`);
        }, 3000);
    };

    const handleNewBatch = () => {
        setBatchData([]);
        setCurrentStep(0);
        message.info('Ready for new batch upload.');
    };

    // --- Table Configuration ---

    const columns = [
        { title: 'Account No.', dataIndex: 'accountNumber', key: 'accountNumber', width: 120 },
        { title: 'Client Name', dataIndex: 'clientName', key: 'clientName' },
        { 
            title: 'Deposit Amount', 
            dataIndex: 'depositAmount', 
            key: 'depositAmount',
            align: 'right' as const,
            render: (amount: number) => formatCurrency(amount)
        },
        { 
            title: 'Ref ID', 
            dataIndex: 'transactionRef', 
            key: 'transactionRef',
            width: 100
        },
        { 
            title: 'Validation Status', 
            dataIndex: 'validationStatus', 
            key: 'validationStatus',
            align: 'center' as const,
            render: (status: BulkDepositItem['validationStatus'], record: BulkDepositItem) => {
                if (status === 'Invalid') {
                    return <Tag color="error" title={record.validationError}><CloseCircleOutlined /> Invalid</Tag>;
                } else if (status === 'Valid') {
                    return <Tag color="success"><CheckCircleOutlined /> Valid</Tag>;
                }
                return <Tag>{status}</Tag>;
            }
        },
        { 
            title: 'Execution Status', 
            dataIndex: 'depositStatus', 
            key: 'depositStatus',
            align: 'center' as const,
            render: (status: BulkDepositItem['depositStatus']) => {
                switch (status) {
                    case 'Success': return <Tag color="blue"><DollarCircleOutlined /> Success</Tag>;
                    case 'Failed': return <Tag color="red"><CloseCircleOutlined /> Failed</Tag>;
                    default: return <Tag color="default">Pending</Tag>;
                }
            }
        },
    ];

    // --- Render ---

    return (
        <div>
            <PageHeader 
                title="Deposit Sheet" 
                breadcrumbs={[
                    { title: 'Deposit Sheet' }
                ]} 
            />
            
            <div className="page-container p-4 min-h-screen bg-gray-50">
                <Title level={2} className="text-gray-800">
                    <WalletOutlined style={{ marginRight: 10 }} /> Bulk Deposit Processing
                </Title>
                <Text type="secondary">
                    Upload a spreadsheet to process deposits to multiple client savings or current accounts.
                </Text>

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
                                icon={<FileExcelOutlined />} 
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
                        title={<Text strong>2. Review & Execute</Text>}
                        className={`shadow-md ${currentStep === 1 ? 'border-2 border-blue-500' : 'border-gray-200'}`}
                    >
                        <Statistic 
                            title="Valid Deposits Ready" 
                            value={readyToDepositCount} 
                            valueStyle={{ color: '#52c41a' }}
                            suffix={`/ ${totalCount}`}
                        />
                        <Button 
                            type="primary" 
                            icon={<SendOutlined />} 
                            onClick={handleExecuteDeposit} 
                            loading={loading}
                            disabled={currentStep !== 1 || readyToDepositCount === 0}
                            block
                            className="mt-4"
                        >
                            Execute Valid Deposits
                        </Button>
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card 
                        title={<Text strong>3. Final Status</Text>}
                        className={`shadow-md ${currentStep === 2 ? 'border-2 border-green-500' : 'border-gray-200'}`}
                    >
                        <Statistic 
                            title="Total Funds Deposited" 
                            value={totalDepositAmount}
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
                <Card title={<Title level={4} className="mt-4">Batch Execution Log ({totalCount} items)</Title>} className="shadow-lg mt-6">
                    <Table
                        columns={columns}
                        dataSource={batchData}
                        rowKey="accountNumber"
                        pagination={{ pageSize: 5 }}
                        size="middle"
                        bordered
                    />
                </Card>
            )}

            {batchData.length === 0 && currentStep === 0 && (
                 <Card style={{ marginTop: 20 }} className="text-center p-8 border-dashed border-2 border-gray-300">
                    <FileExcelOutlined style={{ fontSize: '48px', color: '#ccc' }} />
                    <Title level={4} type="secondary" className="mt-2">Upload a file to begin batch processing</Title>
                    <Text type="secondary">Use the template to ensure correct column mapping and account details.</Text>
                </Card>
            )}
            </div>
        </div>
    );
};

export default BulkDepositSheet;