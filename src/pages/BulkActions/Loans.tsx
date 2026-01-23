import React, { useState } from 'react';
import { Button, Modal, Form, InputNumber, Tag, message, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  PlusOutlined, PlusCircleOutlined, EditOutlined, EyeOutlined,
  CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined
} from '@ant-design/icons';
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
  durationMonths: number;
  balance: number;
  totalPaid: number;
  nextPaymentDate: string;
  bookedBy: string;
  loanItems?: LoanItem[];
  status: 'ACTIVE' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'REPAID' | 'DUE';
}

interface LoanItem {
  productName: string;
  quantity: number;
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
  const [activeTab, setActiveTab] = useState<'all' | 'ACTIVE' | 'PENDING' | 'REJECTED'>('all');
  const [paymentForm] = Form.useForm();
  const [statusForm] = Form.useForm();

  const getApiUrl = () => {
    if (activeTab === 'all') {
      return APIS.LIST_LOANS;
    }
    return `${APIS.LIST_LOANS}?status=${activeTab}`;
  };

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

  const tabs = [
    { key: 'all', label: 'All', color: 'default' },
    { key: 'ACTIVE', label: 'Active', color: 'blue' },
    { key: 'PENDING', label: 'Pending', color: 'orange' },
    { key: 'REJECTED', label: 'Rejected', color: 'red' },
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
        {/* Tabs */}
        <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
          {tabs.map((tab) => (
            <Tag
              key={tab.key}
              color={activeTab === tab.key ? tab.color : 'default'}
              style={{ cursor: 'pointer', fontSize: 14, padding: '4px 12px' }}
              onClick={() => {
                setActiveTab(tab.key as any);
                setRefreshKey(prev => prev + 1);
              }}
            >
              {tab.label}
            </Tag>
          ))}
        </div>

        <DataTable
          key={`${refreshKey}-${activeTab}`}
          apiUrl={getApiUrl()}
          columns={columns}
          searchPlaceholder="Search loans..."
        />
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
        title={`Loan Details - ${selectedLoan?.customerName}`}
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        footer={null}
        width={700}
      >
        {selectedLoan && (
          <div style={{ display: 'grid', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <div style={{ color: '#666', fontSize: 12 }}>Customer</div>
                <div style={{ fontWeight: 500 }}>{selectedLoan.customerName}</div>
              </div>
              <div>
                <div style={{ color: '#666', fontSize: 12 }}>Group</div>
                <div style={{ fontWeight: 500 }}>{selectedLoan.groupName}</div>
              </div>
              <div>
                <div style={{ color: '#666', fontSize: 12 }}>Principal Amount</div>
                <div style={{ fontWeight: 500 }}>{formatCurrency(selectedLoan.principalAmount)}</div>
              </div>
              <div>
                <div style={{ color: '#666', fontSize: 12 }}>Interest Amount</div>
                <div style={{ fontWeight: 500 }}>{formatCurrency(selectedLoan.interestAmount)}</div>
              </div>
              <div>
                <div style={{ color: '#666', fontSize: 12 }}>Total Loan</div>
                <div style={{ fontWeight: 500 }}>{formatCurrency(selectedLoan.principalAmount + selectedLoan.interestAmount)}</div>
              </div>
              <div>
                <div style={{ color: '#666', fontSize: 12 }}>Balance</div>
                <div style={{ fontWeight: 500, color: '#cf1322' }}>{formatCurrency(selectedLoan.balance)}</div>
              </div>
              <div>
                <div style={{ color: '#666', fontSize: 12 }}>Duration</div>
                <div style={{ fontWeight: 500 }}>{selectedLoan.durationMonths} Months</div>
              </div>
              <div>
                <div style={{ color: '#666', fontSize: 12 }}>Status</div>
                <Tag color={selectedLoan.status === 'ACTIVE' ? 'blue' : 'default'}>{selectedLoan.status}</Tag>
              </div>
            </div>
            {selectedLoan.loanItems && selectedLoan.loanItems.length > 0 && (
              <div>
                <div style={{ color: '#666', fontSize: 12, marginBottom: 8 }}>Loan Items</div>
                <ul style={{ paddingLeft: 20 }}>
                  {selectedLoan.loanItems.map((item, index) => (
                    <li key={index}>{item.productName} - Qty: {item.quantity}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Loans;
