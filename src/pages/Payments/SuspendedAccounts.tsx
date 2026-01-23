import React, { useState, useMemo } from 'react';
import { 
    Typography, Card, Table, Tag, Row, Col, Button, Modal, Form, Select, Input, message
} from 'antd';
import { 
    LockOutlined, ExclamationCircleOutlined,CheckCircleOutlined, SwapOutlined, SearchOutlined
} from '@ant-design/icons';
import PageHeader from '../../components/common/Layout/PageHeader';

const { Title, Text } = Typography;
const { Option } = Select;

const CURRENCY = 'Ksh';

// ----------------------------------------------------
// 1. DATA STRUCTURES & MOCK DATA
// ----------------------------------------------------

// Data structure for an unmatched or misdirected payment
interface SuspensePayment {
    id: number;
    amount: number;
    date: string;
    sourceDetails: string; // Phone number or Paybill Ref used
    errorReason: string; // Why it failed automated matching
    status: 'Pending Verification' | 'Reassigned' | 'Reversed';
    suspenseRef: string;
}

// Simplified Group list for reassignment purposes (must match groups in previous context)
const mockGroups = [
    { id: 101, groupName: 'Truetana Investment Group', loanAccountNumber: 'LN001A' },
    { id: 102, groupName: 'Unity Sacco', loanAccountNumber: 'LN003C' },
    { id: 103, groupName: 'Unmatched Group Account', loanAccountNumber: 'N/A' },
];


const initialSuspensePayments: SuspensePayment[] = [
    {
        id: 201,
        amount: 4000.00,
        date: '2025-11-23',
        sourceDetails: '0712****** (Ref: GHY78E)',
        errorReason: 'Group Account Number Mismatch (Paid to non-existent group ID)',
        status: 'Pending Verification',
        suspenseRef: 'SPN201',
    },
    {
        id: 202,
        amount: 1500.00,
        date: '2025-11-22',
        sourceDetails: '0723****** (Ref: KJ89W1)',
        errorReason: 'Payment Reference Code Missing/Invalid',
        status: 'Pending Verification',
        suspenseRef: 'SPN202',
    },
    {
        id: 203,
        amount: 8000.00,
        date: '2025-11-21',
        sourceDetails: '0700****** (Ref: AB12C3)',
        errorReason: 'Reassigned (Original: Paid to Group 103 instead of 101)',
        status: 'Reassigned',
        suspenseRef: 'SPN203',
    },
];

// ----------------------------------------------------
// 2. HELPER FUNCTIONS
// ----------------------------------------------------

const formatCurrency = (amount: number) => {
    return `${CURRENCY} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
};

const getStatusTag = (status: SuspensePayment['status']) => {
    switch (status) {
        case 'Pending Verification': return <Tag color="warning" icon={<ExclamationCircleOutlined />}>{status}</Tag>;
        case 'Reassigned': return <Tag color="success" icon={<CheckCircleOutlined />}>{status}</Tag>;
        case 'Reversed': return <Tag color="error" icon={<LockOutlined />}>{status}</Tag>;
        default: return <Tag>{status}</Tag>;
    }
};

// ----------------------------------------------------
// 3. REASSIGNMENT MODAL
// ----------------------------------------------------

interface ReassignmentModalProps {
    visible: boolean;
    onClose: () => void;
    payment: SuspensePayment | null;
    onReassign: (paymentId: number, targetGroupName: string) => void;
}

const ReassignmentModal: React.FC<ReassignmentModalProps> = ({ visible, onClose, payment, onReassign }) => {
    const [form] = Form.useForm();

    const handleOk = () => {
        form.validateFields().then(values => {
            if (payment) {
                onReassign(payment.id, values.targetGroup);
                onClose();
            }
        });
    };

    if (!payment) return null;

    return (
        <Modal
            title={<Title level={4}><SwapOutlined /> Reassign Suspense Payment</Title>}
            open={visible}
            onOk={handleOk}
            onCancel={onClose}
            okText="Confirm Reassignment"
            cancelText="Cancel"
        >
            <p className="mb-4">
                You are about to reassign a suspense payment of **{formatCurrency(payment.amount)}** to the correct Group DDA.
            </p>
            <Card size="small" className="bg-red-50 mb-4">
                <Text strong type="danger">Suspense Ref:</Text> {payment.suspenseRef} | 
                <Text strong type="danger" className="ml-3">Reason:</Text> {payment.errorReason}
            </Card>

            <Form form={form} layout="vertical" initialValues={{ targetGroup: '' }}>
                <Form.Item
                    name="targetGroup"
                    label="Target Group Account"
                    rules={[{ required: true, message: 'Please select the correct group account' }]}
                >
                    <Select showSearch placeholder="Select the verified correct destination group">
                        {mockGroups.map(g => (
                            <Option key={g.id} value={g.groupName}>
                                {g.groupName} (Loan: {g.loanAccountNumber})
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item
                    name="verificationNotes"
                    label="Verification Notes"
                    rules={[{ required: true, message: 'Please enter verification details' }]}
                >
                    <Input.TextArea rows={2} placeholder="e.g., Confirmed via call with client 0712*** that payment was intended for Truetana." />
                </Form.Item>
            </Form>
        </Modal>
    );
};

// ----------------------------------------------------
// 4. MAIN COMPONENT (Payments Suspense Register)
// ----------------------------------------------------

const PaymentsSuspenseRegister: React.FC = () => {
    const [suspensePayments, setSuspensePayments] = useState<SuspensePayment[]>(initialSuspensePayments);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<SuspensePayment | null>(null);

    const handleReassign = (paymentId: number, targetGroupName: string) => {
        setSuspensePayments(prev => 
            prev.map(p => 
                p.id === paymentId
                    ? { 
                        ...p, 
                        status: 'Reassigned' as const, 
                        errorReason: `Reassigned to ${targetGroupName}. Original reason: ${p.errorReason}` 
                      }
                    : p
            )
        );
        message.success(`Payment ${paymentId} successfully reassigned to ${targetGroupName}.`);
        // In a real system, you would call an API here to move the funds and update the Loan DDA.
    };

    const openReassignment = (payment: SuspensePayment) => {
        setSelectedPayment(payment);
        setIsModalVisible(true);
    };

    const columns = [
        {
            title: 'Ref',
            dataIndex: 'suspenseRef',
            key: 'suspenseRef',
            width: 100,
            render: (text: string) => <Tag color="red">{text}</Tag>,
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            align: 'right' as const,
            render: (amount: number) => <Text strong>{formatCurrency(amount)}</Text>,
        },
        {
            title: 'Error Reason',
            dataIndex: 'errorReason',
            key: 'errorReason',
            render: (text: string) => <Text type="danger" className="text-sm">{text}</Text>,
        },
        {
            title: 'Source Details',
            dataIndex: 'sourceDetails',
            key: 'sourceDetails',
            width: 150,
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            width: 100,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            align: 'center' as const,
            render: getStatusTag,
        },
        {
            title: 'Action',
            key: 'action',
            width: 120,
            align: 'center' as const,
            render: (_: any, record: SuspensePayment) => (
                <Button 
                    icon={<SwapOutlined />} 
                    type="primary" 
                    size="small"
                    onClick={() => openReassignment(record)}
                    disabled={record.status !== 'Pending Verification'}
                >
                    Reassign
                </Button>
            ),
        },
    ];

    const pendingCount = useMemo(() => 
        suspensePayments.filter(p => p.status === 'Pending Verification').length, 
        [suspensePayments]
    );

    return (
        <div>
            <PageHeader 
                title="Suspended Accounts" 
                breadcrumbs={[
                    { title: 'Suspended Accounts' }
                ]} 
            />
            
            <div className="page-container p-4 min-h-screen bg-gray-50">
                
                <Title level={2} className="text-gray-800">
                    <LockOutlined style={{ marginRight: 10 }} /> Payments Suspense Register
                </Title>
                <Text type="secondary">
                    This log tracks payments that failed automatic allocation due to **wrong account numbers or missing references**. Payments must be manually verified and reassigned.
                </Text>

            <Card style={{ marginTop: 20 }} className="shadow-lg">
                <Row gutter={16} className="mb-4" align="middle">
                    <Col>
                         <Title level={4} className="mb-0">Unmatched Payments List</Title>
                    </Col>
                    <Col>
                        <Tag color="volcano" icon={<ExclamationCircleOutlined />} style={{ padding: '8px 12px', fontSize: '14px' }}>
                            {pendingCount} Payments Pending Verification
                        </Tag>
                    </Col>
                </Row>
                <Table
                    columns={columns}
                    dataSource={suspensePayments}
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                    size="middle"
                    bordered
                />
            </Card>

            <ReassignmentModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                payment={selectedPayment}
                onReassign={handleReassign}
            />
            </div>
        </div>
    );
};

export default PaymentsSuspenseRegister;