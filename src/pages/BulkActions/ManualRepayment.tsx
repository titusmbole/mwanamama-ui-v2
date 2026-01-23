import React, { useState } from 'react';
import { 
    Typography, Card, Form, Input, Select, Button, Table, Tag, Row, Col, message, DatePicker, InputNumber
} from 'antd';
import { 
    FileTextOutlined, SendOutlined, DollarCircleOutlined, HistoryOutlined, SearchOutlined 
} from '@ant-design/icons';
import moment from 'moment';
import PageHeader from '../../components/common/Layout/PageHeader';

const { Title, Text } = Typography;
const { Option } = Select;

const CURRENCY = 'Ksh';

// ----------------------------------------------------
// 1. DATA STRUCTURES & MOCK DATA
// ----------------------------------------------------

interface LoanAccount {
    accountNumber: string;
    clientName: string;
    currentBalance: number;
    status: 'Active' | 'Default' | 'Closed';
}

interface ManualPayment {
    id: number;
    loanAccountNumber: string;
    clientName: string;
    amount: number;
    date: string;
    paymentMethod: string;
    reference: string;
    enteredBy: string;
}

// Mock Data
const mockLoanAccounts: LoanAccount[] = [
    { accountNumber: 'LN001A', clientName: 'Alice Johnson', currentBalance: 85000.00, status: 'Active' },
    { accountNumber: 'LN002B', clientName: 'Bob Smith', currentBalance: 12000.50, status: 'Active' },
    { accountNumber: 'LN003C', clientName: 'Charlie Brown', currentBalance: 30000.00, status: 'Default' },
    { accountNumber: 'LN004D', clientName: 'Diana Prince', currentBalance: 0.00, status: 'Closed' },
];

const initialManualPayments: ManualPayment[] = [
    { id: 1, loanAccountNumber: 'LN001A', clientName: 'Alice Johnson', amount: 5000, date: '2025-11-22', paymentMethod: 'Cash Deposit', reference: 'Teller: JKL789', enteredBy: 'Admin' },
    { id: 2, loanAccountNumber: 'LN002B', clientName: 'Bob Smith', amount: 12000, date: '2025-11-20', paymentMethod: 'Bank Transfer', reference: 'RTGS: MNOP12', enteredBy: 'Manager' },
];

// ----------------------------------------------------
// 2. HELPER FUNCTIONS
// ----------------------------------------------------

const formatCurrency = (amount: number) => {
    return `${CURRENCY} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
};

// ----------------------------------------------------
// 3. MAIN COMPONENT
// ----------------------------------------------------

const ManualRepayment: React.FC = () => {
    const [payments, setPayments] = useState<ManualPayment[]>(initialManualPayments);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<LoanAccount | null>(null);

    /**
     * Handles selection of a loan account from the dropdown.
     */
    const handleAccountSelect = (accountNumber: string) => {
        const account = mockLoanAccounts.find(acc => acc.accountNumber === accountNumber) || null;
        setSelectedAccount(account);
        if (account?.status !== 'Active') {
            message.warning(`Warning: Account ${accountNumber} status is ${account?.status}. Manual repayment requires verification.`);
        }
    };

    /**
     * Simulates the manual posting of a repayment to the loan account.
     */
    const handleRepaymentEntry = (values: any) => {
        setLoading(true);
        const account = mockLoanAccounts.find(acc => acc.accountNumber === values.loanAccountNumber);

        if (!account) {
            message.error('Selected loan account is invalid.');
            setLoading(false);
            return;
        }

        setTimeout(() => {
            const newPayment: ManualPayment = {
                id: payments.length + 1,
                loanAccountNumber: values.loanAccountNumber,
                clientName: account.clientName,
                amount: values.amount,
                date: moment(values.date).format('YYYY-MM-DD'),
                paymentMethod: values.paymentMethod,
                reference: values.reference,
                enteredBy: 'Current User', // Replace with dynamic user context
            };

            setPayments(prev => [newPayment, ...prev]);

            // NOTE: In a real system, an API call would update the actual loan balance here.
            message.success(`${formatCurrency(values.amount)} successfully posted to ${account.clientName}'s loan (${values.loanAccountNumber}).`);
            form.resetFields();
            setSelectedAccount(null);
            setLoading(false);
        }, 1500);
    };

    // --- Table Columns ---

    const paymentColumns = [
        {
            title: 'Account No.',
            dataIndex: 'loanAccountNumber',
            key: 'loanAccountNumber',
            render: (text: string) => <Tag color="processing">{text}</Tag>,
        },
        {
            title: 'Client Name',
            dataIndex: 'clientName',
            key: 'clientName',
            render: (text: string) => <Text strong>{text}</Text>,
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            align: 'right' as const,
            render: (amount: number) => <Text className="text-green-600 font-mono">{formatCurrency(amount)}</Text>,
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
        },
        {
            title: 'Method',
            dataIndex: 'paymentMethod',
            key: 'paymentMethod',
            render: (text: string) => <Tag color="geekblue">{text}</Tag>,
        },
        {
            title: 'Reference',
            dataIndex: 'reference',
            key: 'reference',
            width: 150,
        },
        {
            title: 'Entered By',
            dataIndex: 'enteredBy',
            key: 'enteredBy',
            width: 100,
        },
    ];

    // --- Render ---

    return (
        <div>
            <PageHeader 
                title="Manual Repayment" 
                breadcrumbs={[
                    { title: 'Manual Repayment' }
                ]} 
            />
            
            <div className="page-container p-4 min-h-screen bg-gray-50">
                <Title level={2} className="text-gray-800">
                    <FileTextOutlined style={{ marginRight: 10 }} /> Manual Repayment Entry
                </Title>
                <Text type="secondary">
                    Use this module to manually post cash, cheque, or direct transfer payments to a specific client's loan account.
                </Text>

            <Row gutter={24} className="mt-6">
                
                {/* --- Left Column: Repayment Form --- */}
                <Col xs={24} lg={8}>
                    <Card title={<Title level={4}><DollarCircleOutlined /> Enter Payment Details</Title>} className="shadow-md">
                        <Form 
                            form={form} 
                            layout="vertical" 
                            onFinish={handleRepaymentEntry}
                        >
                            <Form.Item
                                name="loanAccountNumber"
                                label="Loan Account Number"
                                rules={[{ required: true, message: 'Select or type account number' }]}
                            >
                                <Select 
                                    showSearch 
                                    placeholder="Search account number or client name"
                                    onSelect={handleAccountSelect}
                                    filterOption={(input, option) =>
                                        (option?.children as string)?.toLowerCase().includes(input.toLowerCase())
                                    }
                                >
                                    {mockLoanAccounts.map(acc => (
                                        <Option key={acc.accountNumber} value={acc.accountNumber}>
                                            {acc.accountNumber} - {acc.clientName}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            
                            {selectedAccount && (
                                <Alert
                                    message={`Balance: ${formatCurrency(selectedAccount.currentBalance)} | Status: ${selectedAccount.status}`}
                                    type={selectedAccount.status === 'Active' ? 'success' : 'warning'}
                                    showIcon
                                    className="mb-4"
                                />
                            )}

                            <Form.Item
                                name="amount"
                                label={`Payment Amount (${CURRENCY})`}
                                rules={[{ required: true, message: 'Enter amount' }, { type: 'number', min: 1, message: 'Must be a positive amount' }]}
                            >
                                <InputNumber 
                                    prefix={CURRENCY} 
                                    min={1} 
                                    step={100} 
                                    style={{ width: '100%' }}
                                    size="large"
                                />
                            </Form.Item>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="date"
                                        label="Payment Date"
                                        rules={[{ required: true, message: 'Select date' }]}
                                        initialValue={moment()}
                                    >
                                        <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="paymentMethod"
                                        label="Payment Method"
                                        rules={[{ required: true, message: 'Select method' }]}
                                    >
                                        <Select placeholder="Select method">
                                            <Option value="Cash Deposit">Cash Deposit</Option>
                                            <Option value="Bank Transfer">Bank Transfer</Option>
                                            <Option value="Cheque">Cheque</Option>
                                            <Option value="Correction">Correction Entry</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item name="reference" label="Reference/Teller ID/Notes">
                                <Input.TextArea rows={2} placeholder="e.g., Teller 101, Cheque #4567, Client correction" />
                            </Form.Item>
                            
                            <Form.Item>
                                <Button type="primary" htmlType="submit" loading={loading} block icon={<SendOutlined />} size="large">
                                    Post Repayment
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>

                {/* --- Right Column: History --- */}
                <Col xs={24} lg={16}>
                    <Card title={<Title level={4}><HistoryOutlined /> Recent Manual Repayments</Title>} className="shadow-md h-full">
                        <Table
                            columns={paymentColumns}
                            dataSource={payments}
                            rowKey="id"
                            pagination={{ pageSize: 5 }}
                            size="middle"
                            bordered
                        />
                    </Card>
                </Col>
            </Row>
            </div>
        </div>
    );
};

export default ManualRepayment;