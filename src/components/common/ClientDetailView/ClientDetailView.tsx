import React, { useEffect, useState } from 'react';
import { Button, Tag, Table, Skeleton, message } from 'antd';
import {
    ArrowLeftOutlined, UserOutlined, BankOutlined, DollarCircleOutlined,
    CalendarOutlined, PhoneOutlined, MailOutlined, HomeOutlined, HistoryOutlined
} from '@ant-design/icons';
import http from '../../../services/httpInterceptor';
import { APIS } from '../../../services/APIS';

interface ClientDetailViewProps {
    memberNumber: string | number;
    onBack?: () => void;
    showBackButton?: boolean;
}

interface ClientData {
    id: number;
    clientNumber: string;
    name: string;
    clientId: string;
    phone: string;
    email: string;
    idNumber: string;
    age: number;
    gender: string;
    status: string;
    address: string;
    creditOfficer: string;
    groupName: string;
    branch: string;
    savingsBalance: number;
    activeLoans: number;
    onboardDate: string;
    latestLoans: any[];
    transactionHistory: any[];
}

const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        minimumFractionDigits: 0,
    }).format(amount);
};

const getLoanStatusTagProps = (status: string) => {
    switch (status?.toUpperCase()) {
        case 'ACTIVE':
            return { color: 'green', icon: null };
        case 'PAID':
        case 'CLOSED':
            return { color: 'blue', icon: null };
        case 'OVERDUE':
            return { color: 'red', icon: null };
        default:
            return { color: 'default', icon: null };
    }
};

const getTransactionTagProps = (type: string) => {
    switch (type) {
        case 'Deposit':
            return { color: 'green' };
        case 'Withdrawal':
            return { color: 'red' };
        case 'Repayment':
            return { color: 'blue' };
        default:
            return { color: 'default' };
    }
};

const ClientDetailView: React.FC<ClientDetailViewProps> = ({ 
    memberNumber, 
    onBack, 
    showBackButton = true 
}) => {
    const [loading, setLoading] = useState(true);
    const [client, setClient] = useState<ClientData | null>(null);

    useEffect(() => {
        const fetchClientData = async () => {
            setLoading(true);
            try {
                // Add 500ms delay for skeleton display
                const [response] = await Promise.all([
                    http.get(`${APIS.CLIENT_DETAIL}/${memberNumber}`),
                    new Promise(resolve => setTimeout(resolve, 500))
                ]);

                const apiData = response.data;

                // Transform transaction types
                const transformedTransactions = (apiData.transactions || []).map((t: any) => ({
                    date: t.transactionDate,
                    type: t.transactionType === 'SAVINGS' ? 'Deposit' : 
                          t.transactionType === 'LOAN_REPAYMENT' ? 'Repayment' : 
                          t.transactionType === 'LOAN_DISBURSEMENT' ? 'Withdrawal' : t.transactionType,
                    amount: t.amount,
                    description: t.description || t.narration || '-'
                }));

                // Calculate active loans
                const activeLoansCount = (apiData.loanHistory || []).filter(
                    (loan: any) => loan.status === 'ACTIVE'
                ).length;

                const detailedClient: ClientData = {
                    id: apiData.id,
                    clientNumber: apiData.clientNumber,
                    name: apiData.fullName,
                    clientId: apiData.clientNumber,
                    phone: apiData.phone,
                    email: apiData.email,
                    idNumber: apiData.idNumber,
                    age: apiData.age,
                    gender: apiData.gender === 'MALE' ? 'M' : apiData.gender === 'FEMALE' ? 'F' : apiData.gender,
                    status: apiData.status,
                    address: apiData.location,
                    creditOfficer: apiData.creditOfficer,
                    groupName: apiData.group,
                    branch: apiData.branch,
                    savingsBalance: apiData.totalSavings || 0,
                    activeLoans: activeLoansCount,
                    onboardDate: apiData.onboardDate,
                    latestLoans: apiData.loanHistory || [],
                    transactionHistory: transformedTransactions
                };

                setClient(detailedClient);
            } catch (error: any) {
                message.error(error.response?.data?.message || 'Failed to load client details');
            } finally {
                setLoading(false);
            }
        };

        fetchClientData();
    }, [memberNumber]);

    if (loading) {
        return (
            <div className="p-6">
                {/* Header Skeleton */}
                <div className="mb-6">
                    {showBackButton && (
                        <Skeleton.Button active size="default" style={{ width: 150 }} className="mb-4" />
                    )}
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                        <div className="flex items-center gap-4">
                            <Skeleton.Avatar active size={64} />
                            <div className="flex-1">
                                <Skeleton active paragraph={{ rows: 1 }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Financial Cards Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-xl shadow-md p-6">
                            <Skeleton active paragraph={{ rows: 2 }} />
                        </div>
                    ))}
                </div>

                {/* Personal Info Skeleton */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <Skeleton active paragraph={{ rows: 1 }} className="mb-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="p-4 bg-gray-50 rounded-lg">
                                <Skeleton active paragraph={{ rows: 1 }} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tables Skeleton */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <Skeleton active paragraph={{ rows: 4 }} />
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <Skeleton active paragraph={{ rows: 4 }} />
                </div>
            </div>
        );
    }

    if (!client) {
        return (
            <div className="p-6">
                <div className="text-center py-12">
                    <p className="text-gray-500">Client not found</p>
                    {showBackButton && onBack && (
                        <Button onClick={onBack} className="mt-4">Go Back</Button>
                    )}
                </div>
            </div>
        );
    }

    const latestLoans = client.latestLoans || [];
    const transactionHistory = client.transactionHistory || [];

    const loanColumns = [
        { title: 'Loan ID', dataIndex: 'id', key: 'id' },
        { title: 'Amount', dataIndex: 'amount', key: 'amount', render: (a: number) => formatCurrency(a) },
        { title: 'Date', dataIndex: 'disbursementDate', key: 'disbursementDate' },
        { title: 'Purpose', dataIndex: 'purpose', key: 'purpose' },
        { 
            title: 'Status', 
            dataIndex: 'status', 
            key: 'status', 
            render: (s: string) => {
                const props = getLoanStatusTagProps(s);
                return <Tag color={props.color} icon={props.icon}>{s}</Tag>;
            }
        },
    ];

    const transactionColumns = [
        { title: 'Date', dataIndex: 'date', key: 'date' },
        { 
            title: 'Type', 
            dataIndex: 'type', 
            key: 'type', 
            render: (t: string) => <Tag {...getTransactionTagProps(t)}>{t}</Tag>
        },
        { title: 'Amount', dataIndex: 'amount', key: 'amount', render: (a: number) => formatCurrency(a) },
        { title: 'Description', dataIndex: 'description', key: 'description' },
    ];

    return (
        <div className="min-h-screen p-6">
            {/* Back Button */}
            {showBackButton && onBack && (
                <Button 
                    icon={<ArrowLeftOutlined />} 
                    onClick={onBack}
                    className="mb-6"
                    type="link"
                    style={{ color: '#ac202d', paddingLeft: 0 }}
                >
                    Back to Clients Report
                </Button>
            )}
            
            {/* Header Section */}
            <div>
                {/* Client Header Card */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-l-4" style={{ borderLeftColor: '#ac202d' }}>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white" style={{ backgroundColor: '#ac202d' }}>
                                {client.name.charAt(0)}
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{client.name}</h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-sm text-gray-500">Client ID:</span>
                                    <span className="px-3 py-1 text-xs font-semibold rounded-full" style={{ backgroundColor: '#ac202d20', color: '#ac202d' }}>
                                        {client.clientId}
                                    </span>
                                    <Tag color={client.status === 'Active' ? 'green' : client.status === 'Inactive' ? 'default' : 'red'} className="ml-2">
                                        {client.status}
                                    </Tag>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Financial Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 hover:shadow-lg transition-shadow" style={{ borderLeftColor: '#ac202d' }}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#ac202d10' }}>
                                <BankOutlined className="text-xl" style={{ color: '#ac202d' }} />
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 font-medium mb-1">Total Savings</p>
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(client.savingsBalance)}</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 hover:shadow-lg transition-shadow" style={{ borderLeftColor: '#ac202d' }}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#ac202d10' }}>
                                <DollarCircleOutlined className="text-xl" style={{ color: '#ac202d' }} />
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 font-medium mb-1">Active Loans</p>
                        <p className="text-2xl font-bold text-gray-900">{client.activeLoans}</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 hover:shadow-lg transition-shadow" style={{ borderLeftColor: '#ac202d' }}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#ac202d10' }}>
                                <CalendarOutlined className="text-xl" style={{ color: '#ac202d' }} />
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 font-medium mb-1">Onboard Date</p>
                        <p className="text-2xl font-bold text-gray-900">{client.onboardDate}</p>
                    </div>
                </div>

                {/* Personal Information Card */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <UserOutlined style={{ color: '#ac202d' }} />
                        Personal & Contact Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-xs text-gray-500 mb-1">Age</p>
                            <p className="text-base font-semibold text-gray-800">{client.age} years</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-xs text-gray-500 mb-1">Gender</p>
                            <p className="text-base font-semibold text-gray-800">{client.gender === 'F' ? 'Female' : 'Male'}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-xs text-gray-500 mb-1">ID Number</p>
                            <p className="text-base font-semibold text-gray-800">{client.idNumber}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-xs text-gray-500 mb-1">Phone</p>
                            <p className="text-base font-semibold text-gray-800 flex items-center gap-2">
                                <PhoneOutlined className="text-green-500" />
                                {client.phone || 'N/A'}
                            </p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-xs text-gray-500 mb-1">Email</p>
                            <p className="text-base font-semibold text-gray-800 flex items-center gap-2 break-all">
                                <MailOutlined className="text-blue-500" />
                                {client.email || 'N/A'}
                            </p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-xs text-gray-500 mb-1">Branch</p>
                            <p className="text-base font-semibold text-gray-800">{client.branch}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-xs text-gray-500 mb-1">Credit Officer</p>
                            <p className="text-base font-semibold text-gray-800">{client.creditOfficer}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-xs text-gray-500 mb-1">Group</p>
                            <p className="text-base font-semibold text-gray-800">{client.groupName}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 md:col-span-2 lg:col-span-1">
                            <p className="text-xs text-gray-500 mb-1">Address</p>
                            <p className="text-base font-semibold text-gray-800 flex items-start gap-2">
                                <HomeOutlined className="text-orange-500 mt-1" />
                                <span>{client.address || 'N/A'}</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Loan History Section */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <DollarCircleOutlined style={{ color: '#ac202d' }} />
                        Loan History
                        <span className="ml-2 px-3 py-1 text-xs font-semibold rounded-full" style={{ backgroundColor: '#ac202d20', color: '#ac202d' }}>
                            {latestLoans.length} {latestLoans.length === 1 ? 'Loan' : 'Loans'}
                        </span>
                    </h2>
                    {latestLoans.length > 0 ? (
                        <div className="overflow-x-auto">
                            <Table 
                                columns={loanColumns} 
                                dataSource={latestLoans}
                                rowKey="id"
                                pagination={false}
                                size="small"
                                className="border border-gray-200 rounded-lg"
                            />
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <DollarCircleOutlined className="text-4xl mb-2" />
                            <p>No loan history available</p>
                        </div>
                    )}
                </div>

                {/* Transaction History Section */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <HistoryOutlined style={{ color: '#ac202d' }} />
                        Recent Transactions
                        <span className="ml-2 px-3 py-1 text-xs font-semibold rounded-full" style={{ backgroundColor: '#ac202d20', color: '#ac202d' }}>
                            {transactionHistory.length} {transactionHistory.length === 1 ? 'Transaction' : 'Transactions'}
                        </span>
                    </h2>
                    {transactionHistory.length > 0 ? (
                        <div className="overflow-x-auto">
                            <Table 
                                columns={transactionColumns} 
                                dataSource={transactionHistory}
                                rowKey={(record, index) => `${record.date}-${index}`}
                                pagination={{ pageSize: 10, showSizeChanger: true }}
                                size="small"
                                className="border border-gray-200 rounded-lg"
                            />
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <HistoryOutlined className="text-4xl mb-2" />
                            <p>No transaction history available</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClientDetailView;
