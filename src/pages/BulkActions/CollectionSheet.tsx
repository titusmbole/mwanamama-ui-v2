import React, { useState, useMemo } from 'react';
import { 
    Typography, Card, Button, Upload, Table, Tag, Row, Col, Statistic, message, Space, Alert
} from 'antd';
import { 
    UploadOutlined, CheckCircleOutlined, CloseCircleOutlined, SendOutlined, MoneyCollectOutlined, FileExcelOutlined, DollarCircleOutlined
} from '@ant-design/icons';
import PageHeader from '../../components/common/Layout/PageHeader';

const { Title, Text } = Typography;

const CURRENCY = 'Ksh';

// ----------------------------------------------------
// 1. DATA STRUCTURES & MOCK DATA
// ----------------------------------------------------

interface BulkCollectionItem {
    loanAccountNumber: string;
    clientName: string;
    collectionAmount: number;
    receiptRef: string;
    validationStatus: 'Valid' | 'Invalid' | 'Ready';
    validationError: string;
    collectionStatus: 'Pending' | 'Success' | 'Failed';
}

// Mock data representing the results of a file upload and validation
const initialBatchResults: BulkCollectionItem[] = [
    {
        loanAccountNumber: 'LN001A', clientName: 'Alice Johnson (Truetana)', collectionAmount: 4000, receiptRef: 'R001',
        validationStatus: 'Valid', validationError: '', collectionStatus: 'Pending',
    },
    {
        loanAccountNumber: 'LN002B', clientName: 'Bob Smith', collectionAmount: 2500, receiptRef: 'R002',
        validationStatus: 'Valid', validationError: '', collectionStatus: 'Pending',
    },
    {
        loanAccountNumber: 'LN003C', clientName: 'Charlie Brown (Unity Sacco)', collectionAmount: 1500, receiptRef: 'R003',
        validationStatus: 'Invalid', validationError: 'Payment amount is less than the minimum required EMI', collectionStatus: 'Pending',
    },
    {
        loanAccountNumber: 'LN004D', clientName: 'Diana Prince', collectionAmount: 8000, receiptRef: 'R004',
        validationStatus: 'Valid', validationError: '', collectionStatus: 'Pending',
    },
    {
        loanAccountNumber: 'LN099Z', clientName: 'Unknown Loan', collectionAmount: 1000, receiptRef: 'R005',
        validationStatus: 'Invalid', validationError: 'Loan account number not found in system', collectionStatus: 'Pending',
    },
];

// --- CSV TEMPLATE DATA ---
const CSV_TEMPLATE_CONTENT = 
`loanAccountNumber,clientName,collectionAmount,receiptRef
LN010A,Mary Kasich,15000,C010
LN011B,John Mwangi,25000,C011
LN012C,Sarah Nzioka,8000,C012
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
    link.setAttribute("download", "bulk_collection_template.csv");
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success('Download initiated for the CSV template.');
};

// ----------------------------------------------------
// 3. MAIN COMPONENT
// ----------------------------------------------------

const CollectionSheet: React.FC = () => {
    const [batchData, setBatchData] = useState<BulkCollectionItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0); // 0: Upload, 1: Validate, 2: Execute

    // --- Metrics ---
    const totalCount = batchData.length;
    const validCount = batchData.filter(item => item.validationStatus === 'Valid').length;
    const readyToCollectCount = batchData.filter(item => item.validationStatus === 'Valid' && item.collectionStatus === 'Pending').length;
    const successCount = batchData.filter(item => item.collectionStatus === 'Success').length;
    const totalCollectedAmount = useMemo(() => 
        batchData.reduce((sum, item) => sum + (item.collectionStatus === 'Success' ? item.collectionAmount : 0), 0), [batchData]
    );

    // --- Handlers ---

    const handleFileUpload = (file: File) => {
        // Simulates file upload and backend validation
        setLoading(true);
        message.info(`Simulating upload and validation of ${file.name}...`);

        setTimeout(() => {
            // Simulate setting the batch data after validation
            setBatchData(initialBatchResults);
            setCurrentStep(1); // Move to validation step
            message.success('File validated. Review the batch status below.');
            setLoading(false);
        }, 1500);
        return false; // Prevent default Antd upload action
    };

    const handleExecuteCollection = () => {
        if (readyToCollectCount === 0) {
            message.warning('No valid collections ready for execution.');
            return;
        }

        setLoading(true);
        message.loading(`Executing bulk collection for ${readyToCollectCount} loan payments...`, 2);

        setTimeout(() => {
            // Simulate collection execution process
            setBatchData(prevData => prevData.map(item => {
                if (item.validationStatus === 'Valid' && item.collectionStatus === 'Pending') {
                    // Simulate a small chance of failure (e.g., system error)
                    const isSuccess = Math.random() > 0.1; 
                    return {
                        ...item,
                        collectionStatus: isSuccess ? 'Success' as const : 'Failed' as const,
                    };
                }
                return item;
            }));

            setCurrentStep(2); // Move to final status review
            setLoading(false);
            message.success(`Collection batch complete. ${successCount} payments processed successfully.`);
        }, 3000);
    };

    const handleNewBatch = () => {
        setBatchData([]);
        setCurrentStep(0);
        message.info('Ready for new batch upload.');
    };

    // --- Table Configuration ---

    const columns = [
        { title: 'Loan Account', dataIndex: 'loanAccountNumber', key: 'loanAccountNumber', width: 120 },
        { title: 'Client Name', dataIndex: 'clientName', key: 'clientName' },
        { 
            title: 'Collection Amount', 
            dataIndex: 'collectionAmount', 
            key: 'collectionAmount',
            align: 'right' as const,
            render: (amount: number) => formatCurrency(amount)
        },
        { 
            title: 'Ref ID', 
            dataIndex: 'receiptRef', 
            key: 'receiptRef',
            width: 100
        },
        { 
            title: 'Validation Status', 
            dataIndex: 'validationStatus', 
            key: 'validationStatus',
            align: 'center' as const,
            render: (status: BulkCollectionItem['validationStatus'], record: BulkCollectionItem) => {
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
            dataIndex: 'collectionStatus', 
            key: 'collectionStatus',
            align: 'center' as const,
            render: (status: BulkCollectionItem['collectionStatus']) => {
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
                title="Collection Sheet" 
                breadcrumbs={[
                    { title: 'Collection Sheet' }
                ]} 
            />
            
            <div className="page-container p-4 min-h-screen bg-gray-50">
                <Title level={2} className="text-gray-800">
                    <MoneyCollectOutlined style={{ marginRight: 10 }} /> Bulk Loan Collection
                </Title>
                <Text type="secondary">
                    Upload a spreadsheet containing loan payments for processing across multiple borrower accounts.
                </Text>

            {/* --- Process Flow Cards --- */}
            <Row gutter={24} className="mt-6">
                <Col xs={24} lg={8}>
                    <Card 
                        title={<Text strong>1. Upload Collection File</Text>} 
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
                                    Select Collection File (CSV/XLSX)
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
                            title="Valid Payments Ready" 
                            value={readyToCollectCount} 
                            valueStyle={{ color: '#52c41a' }}
                            suffix={`/ ${totalCount}`}
                        />
                        <Button 
                            type="primary" 
                            icon={<SendOutlined />} 
                            onClick={handleExecuteCollection} 
                            loading={loading}
                            disabled={currentStep !== 1 || readyToCollectCount === 0}
                            block
                            className="mt-4"
                        >
                            Execute Valid Payments
                        </Button>
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card 
                        title={<Text strong>3. Final Status</Text>}
                        className={`shadow-md ${currentStep === 2 ? 'border-2 border-green-500' : 'border-gray-200'}`}
                    >
                        <Statistic 
                            title="Total Funds Collected" 
                            value={totalCollectedAmount}
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
                        rowKey="loanAccountNumber"
                        pagination={{ pageSize: 5 }}
                        size="middle"
                        bordered
                    />
                </Card>
            )}

            {batchData.length === 0 && currentStep === 0 && (
                 <Card style={{ marginTop: 20 }} className="text-center p-8 border-dashed border-2 border-gray-300">
                    <FileExcelOutlined style={{ fontSize: '48px', color: '#ccc' }} />
                    <Title level={4} type="secondary" className="mt-2">Upload a file to begin bulk processing</Title>
                    <Text type="secondary">Use the template to map payments to the correct loan accounts.</Text>
                </Card>
            )}
            </div>
        </div>
    );
};

export default CollectionSheet;