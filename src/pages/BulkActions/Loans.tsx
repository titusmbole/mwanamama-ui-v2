import React, { useState } from 'react';
import { Button, Modal, Form, InputNumber, Tag, message, Tooltip, Tabs, Card } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  PlusOutlined, PlusCircleOutlined, EditOutlined, EyeOutlined,
  CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined
} from '@ant-design/icons';
import { List, Clock, CheckCircle, X, Check, AlertCircle, Zap, User, CreditCard, DollarSign, Calendar } from 'lucide-react';
import PageHeader from '../../components/common/Layout/PageHeader';
import DataTable from '../../components/common/DataTable/DataTable';
import PageCard from '../../components/common/PageCard/PageCard';
import FormDrawer from '../../components/common/FormDrawer/FormDrawer';
import { APIS } from '../../services/APIS';
import http from '../../services/httpInterceptor';
import { useAuth } from '../../context/AuthContext';

interface Loan {
  id: number;
  customerName: string;
  groupName: string;
  type: string;
  totalLoan: number;
  principalAmount: number;
  interestAmount: number;
  interestRate: number;
  durationMonths: number;
  balance: number;
  totalPaid: number;
  nextPaymentDate: string;
  startDate: string;
  dueDate: string;
  bookedBy: string;
  loanItems?: LoanItem[];
  repayments: Repayment[];
  status: 'ACTIVE' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'REPAID' | 'DUE';
}

interface LoanItem {
  productName: string;
  quantity: number;
}

interface Repayment {
  id: number;
  amount: number;
  datePaid: string;
}

const Loans: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [paymentForm] = Form.useForm();
  const [statusForm] = Form.useForm();

  const handleAddPayment = (loan: Loan) => {
    setSelectedLoan(loan);
    paymentForm.resetFields();
    setPaymentModalOpen(true);
  };

  const handleEditStatus = (loan: Loan) => {
    setSelectedLoan(loan);
    statusForm.setFieldsValue({ status: loan.status });
    setStatusModalOpen(true);
  };

  const handleView = (loan: Loan) => {
    setSelectedLoan(loan);
    setViewModalOpen(true);
  };

  const handlePayment = async (values: any) => {
    if (!selectedLoan) return;

    setSubmitLoading(true);
    try {
      const response = await http.post(`${APIS.REPAY_LOAN}/${selectedLoan.id}`, {
        amount: values.amount,
      });
      message.success(response.data.message || 'Payment added successfully');
      setPaymentModalOpen(false);
      paymentForm.resetFields();
      setRefreshKey(prev => prev + 1);
    } catch (error: any) {
      message.error(
        error.response?.status === 403
          ? 'Not authorized to perform this action!'
          : error.response?.data?.message || 'Failed to add payment'
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleStatusUpdate = async (values: any) => {
    if (!selectedLoan) return;

    setSubmitLoading(true);
    try {
      const response = await http.put(`${APIS.UPDATE_STATUS}/${selectedLoan.id}`, {
        status: values.status,
      });
      message.success(response.data.message || 'Status updated successfully');
      setStatusModalOpen(false);
      statusForm.resetFields();
      setRefreshKey(prev => prev + 1);
    } catch (error: any) {
      message.error(
        error.response?.status === 403
          ? 'Not authorized to perform this action!'
          : error.response?.data?.message || 'Failed to update status'
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `Ksh ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const columns: ColumnsType<Loan> = [
    {
      title: 'Customer Name',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Group',
      dataIndex: 'groupName',
      key: 'groupName',
    },
    {
      title: 'Loan Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Total Amount',
      key: 'totalLoan',
      align: 'right',
      render: (_, record) => formatCurrency(record.principalAmount + record.interestAmount),
    },
    {
      title: 'Duration',
      dataIndex: 'durationMonths',
      key: 'durationMonths',
      render: (months) => `${months} Months`,
    },
    {
      title: 'Balance',
      dataIndex: 'balance',
      key: 'balance',
      align: 'right',
      render: (balance) => formatCurrency(balance),
    },
    {
      title: 'Next Payment',
      dataIndex: 'nextPaymentDate',
      key: 'nextPaymentDate',
    },
    {
      title: 'Items',
      dataIndex: 'loanItems',
      key: 'loanItems',
      render: (items: LoanItem[]) =>
        items?.length > 0
          ? items.map((item) => `${item.productName} (${item.quantity})`).join(', ')
          : '--',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const config = {
          ACTIVE: { color: 'blue', icon: <CheckCircleOutlined /> },
          PENDING: { color: 'orange', icon: <ClockCircleOutlined /> },
          APPROVED: { color: 'green', icon: <CheckCircleOutlined /> },
          REJECTED: { color: 'red', icon: <CloseCircleOutlined /> },
          REPAID: { color: 'cyan', icon: <CheckCircleOutlined /> },
          DUE: { color: 'volcano', icon: <ClockCircleOutlined /> },
        };
        const { color, icon } = config[status as keyof typeof config] || { color: 'default', icon: null };
        return (
          <Tag color={color} icon={icon}>
            {status}
          </Tag>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record: Loan) => {
        const isPendingOrRejected = record.status === 'PENDING' || record.status === 'REJECTED';
        
        if (isPendingOrRejected && !isAdmin) {
          return null;
        }

        return (
          <div style={{ display: 'flex', gap: 8 }}>
            {record.balance > 0 && (record.status === 'ACTIVE' || record.status === 'DUE') && isAdmin && (
              <Tooltip title="Add Payment">
                <Button
                  type="link"
                  icon={<PlusCircleOutlined />}
                  onClick={() => handleAddPayment(record)}
                />
              </Tooltip>
            )}
            {isAdmin && (
              <Tooltip title="Edit Status">
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => handleEditStatus(record)}
                />
              </Tooltip>
            )}
            <Tooltip title="View Loan">
              <Button
                type="link"
                icon={<EyeOutlined />}
                onClick={() => handleView(record)}
              />
            </Tooltip>
          </div>
        );
      },
    },
  ];



  return (
    <div>
      <PageHeader 
        title="Loans" 
        breadcrumbs={[
          { title: 'Home', path: '/' },
          { title: 'Bulk Actions', path: '#' },
          { title: 'Loans' }
        ]} 
      />

      <PageCard>
        <Tabs
          defaultActiveKey="all"
          type="line"
          size="large"
        >
          <Tabs.TabPane
            tab="All"
            key="all"
          >
            <DataTable
              key={`${refreshKey}-all`}
              apiUrl={APIS.LIST_LOANS}
              columns={columns}
              searchPlaceholder="Search loans..."
            />
          </Tabs.TabPane>

          <Tabs.TabPane
            tab="Active"
            key="ACTIVE"
          >
            <DataTable
              key={`${refreshKey}-ACTIVE`}
              apiUrl={`${APIS.LIST_LOANS}?status=ACTIVE`}
              columns={columns}
              searchPlaceholder="Search loans..."
            />
          </Tabs.TabPane>

          <Tabs.TabPane
            tab="Pending"
            key="PENDING"
          >
            <DataTable
              key={`${refreshKey}-PENDING`}
              apiUrl={`${APIS.LIST_LOANS}?status=PENDING`}
              columns={columns}
              searchPlaceholder="Search loans..."
            />
          </Tabs.TabPane>

          <Tabs.TabPane
            tab="Rejected"
            key="REJECTED"
          >
            <DataTable
              key={`${refreshKey}-REJECTED`}
              apiUrl={`${APIS.LIST_LOANS}?status=REJECTED`}
              columns={columns}
              searchPlaceholder="Search loans..."
            />
          </Tabs.TabPane>
        </Tabs>
      </PageCard>

      {/* Add Payment Drawer */}
      <FormDrawer
        title={`Add Payment for ${selectedLoan?.customerName}`}
        open={paymentModalOpen}
        onClose={() => {
          setPaymentModalOpen(false);
          paymentForm.resetFields();
        }}
        onSubmit={handlePayment}
        loading={submitLoading}
        form={paymentForm}
      >
        <Form.Item
          name="amount"
          label="Payment Amount"
          rules={[
            { required: true, message: 'Amount is required' },
            { type: 'number', min: 0, message: 'Amount must be positive' },
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            prefix="Ksh"
            placeholder="Enter payment amount"
          />
        </Form.Item>
        {selectedLoan && (
          <div style={{ marginTop: 16, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
            <div>Outstanding Balance: <strong>{formatCurrency(selectedLoan.balance)}</strong></div>
          </div>
        )}
      </FormDrawer>

      {/* Edit Status Drawer */}
      <FormDrawer
        title={`Edit Status for ${selectedLoan?.customerName}`}
        open={statusModalOpen}
        onClose={() => {
          setStatusModalOpen(false);
          statusForm.resetFields();
        }}
        onSubmit={handleStatusUpdate}
        loading={submitLoading}
        form={statusForm}
      >
        <Form.Item
          name="status"
          label="Loan Status"
          rules={[{ required: true, message: 'Status is required' }]}
        >
          <select style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #d9d9d9' }}>
            <option value="">-- Choose Option --</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="ACTIVE">Active</option>
            <option value="REJECTED">Rejected</option>
            <option value="REPAID">Repaid</option>
            <option value="DUE">Due</option>
          </select>
        </Form.Item>
      </FormDrawer>

      {/* View Loan Modal */}
      <Modal
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        footer={null}
        width={900}
        style={{ top: 20 }}
      >
        {selectedLoan && (
          <div className="bg-white rounded-lg overflow-hidden">
            {/* Header section */}
            <div className="bg-gradient-to-r from-green-600 to-green-800 px-6 py-4">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Loan Details</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedLoan.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                  selectedLoan.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  selectedLoan.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                  selectedLoan.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                  selectedLoan.status === 'REPAID' ? 'bg-emerald-100 text-emerald-800' :
                  selectedLoan.status === 'DUE' ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {selectedLoan.status}
                </span>
              </div>
              <p className="text-green-100 text-sm mt-1">Loan #{selectedLoan.id} • {selectedLoan.type}</p>
            </div>

            {/* Main content */}
            <div className="p-6">
              {/* Customer and Overview Section */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Customer Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h2 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
                    <User size={18} className="mr-2 text-green-600" />
                    Customer Information
                  </h2>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Name: <span className="font-medium text-gray-900">{selectedLoan.customerName}</span></p>
                    <p className="text-sm text-gray-600">Group: <span className="font-medium text-gray-900">{selectedLoan.groupName}</span></p>
                    <p className="text-sm text-gray-600">Booked By: <span className="font-medium text-gray-900">{selectedLoan.bookedBy}</span></p>
                  </div>
                </div>

                {/* Loan Overview */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h2 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
                    <CreditCard size={18} className="mr-2 text-green-600" />
                    Loan Overview
                  </h2>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Principal: <span className="font-medium text-gray-900">{formatCurrency(selectedLoan.principalAmount)}</span></p>
                    {selectedLoan.interestRate && (
                      <p className="text-sm text-gray-600">Interest Rate: <span className="font-medium text-gray-900">{selectedLoan.interestRate}%</span></p>
                    )}
                    <p className="text-sm text-gray-600">Interest Amount: <span className="font-medium text-gray-900">{formatCurrency(selectedLoan.interestAmount)}</span></p>
                    <p className="text-sm text-gray-600">Total Amount: <span className="font-medium text-gray-900">{formatCurrency(selectedLoan.principalAmount + selectedLoan.interestAmount)}</span></p>
                  </div>
                </div>
              </div>

              {/* Repayment Progress */}
              <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                <h2 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
                  <DollarSign size={18} className="mr-2 text-green-600" />
                  Repayment Progress
                </h2>
                <div className="mt-2">
                  {(() => {
                    const totalAmount = selectedLoan.principalAmount + selectedLoan.interestAmount;
                    const totalRepaid = selectedLoan.repayments?.reduce((sum, r) => sum + r.amount, 0) || (totalAmount - selectedLoan.balance);
                    const progressPercentage = Math.min(Math.round((totalRepaid / totalAmount) * 100), 100);
                    return (
                      <>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">{formatCurrency(totalRepaid)} of {formatCurrency(totalAmount)}</span>
                          <span className="text-sm font-medium text-gray-700">{progressPercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${progressPercentage}%` }}
                          ></div>
                        </div>
                      </>
                    );
                  })()}
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    Current Balance: <span className="font-semibold text-gray-900">{formatCurrency(selectedLoan.balance)}</span>
                  </p>
                </div>
              </div>

              {/* Timeline Info */}
              {(selectedLoan.startDate || selectedLoan.nextPaymentDate || selectedLoan.dueDate) && (
                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <h2 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
                    <Calendar size={18} className="mr-2 text-green-600" />
                    Timeline
                  </h2>
                  <div className="grid md:grid-cols-3 gap-4">
                    {selectedLoan.startDate && (
                      <div className="p-3 bg-white rounded-md shadow-sm">
                        <p className="text-xs text-gray-500">START DATE</p>
                        <p className="font-medium">{new Date(selectedLoan.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                      </div>
                    )}
                    {selectedLoan.nextPaymentDate && (
                      <div className="p-3 bg-white rounded-md shadow-sm">
                        <p className="text-xs text-gray-500">NEXT PAYMENT</p>
                        <p className="font-medium">{new Date(selectedLoan.nextPaymentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                      </div>
                    )}
                    {selectedLoan.dueDate && (
                      <div className="p-3 bg-white rounded-md shadow-sm">
                        <p className="text-xs text-gray-500">DUE DATE</p>
                        <p className="font-medium">{new Date(selectedLoan.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                      </div>
                    )}
                  </div>
                  <p className="mt-3 text-sm text-gray-600">Duration: <span className="font-medium">{selectedLoan.durationMonths} {selectedLoan.durationMonths === 1 ? 'month' : 'months'}</span></p>
                </div>
              )}

              {/* Loan Items */}
              {selectedLoan.loanItems && selectedLoan.loanItems.length > 0 && (
                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <h2 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
                    <CreditCard size={18} className="mr-2 text-green-600" />
                    Loan Items
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedLoan.loanItems.map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{item.productName}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Repayment History */}
              {selectedLoan.repayments && selectedLoan.repayments.length > 0 && (
                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <h2 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
                    <Clock size={18} className="mr-2 text-green-600" />
                    Repayment History
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Paid</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedLoan.repayments.map((repayment) => (
                          <tr key={repayment.id}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {new Date(repayment.datePaid).toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: 'numeric',
                                hour12: true
                              })}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(repayment.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Loans;
