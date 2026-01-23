import React, { useState } from 'react';
import { Button, Modal, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '../../components/common/Layout/PageHeader';
import PageCard from '../../components/common/PageCard/PageCard';
import DataTable from '../../components/common/DataTable/DataTable';
import { APIS } from '../../services/APIS';
import http from '../../services/httpInterceptor';

interface EligibleLoan {
  loanId: number;
  clientName: string;
  memberNumber: string;
  groupName: string;
  loanName: string;
  loanPendingAmount: number;
  loanAccountBalance: number;
}

const ManualRepayment: React.FC = () => {
  const [selectedLoan, setSelectedLoan] = useState<EligibleLoan | null>(null);
  const [selectedLoans, setSelectedLoans] = useState<EligibleLoan[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const formatCurrency = (amount: number) => {
    return `Ksh ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const showRepayModal = (loan: EligibleLoan) => {
    setSelectedLoan(loan);
    setIsModalVisible(true);
  };

  const handleRepayConfirm = async () => {
    setLoading(true);
    try {
      if (selectedLoan) {
        // Single loan repayment
        const payload = { id: [selectedLoan.loanId] };
        const response = await http.post(APIS.REPAY_LOAN, payload);
        message.success(response.data.message || 'Loan repaid successfully');
        setRefreshKey(prev => prev + 1);
      } else if (selectedLoans.length > 0) {
        // Batch loan repayment
        const loanIds = selectedLoans.map((loan) => loan.loanId);
        const payload = { id: loanIds };
        const response = await http.post(APIS.REPAY_LOAN, payload);
        message.success(response.data.message || `${loanIds.length} loans repaid successfully`);
        setRefreshKey(prev => prev + 1);
      }
      setIsModalVisible(false);
      setSelectedLoan(null);
      setSelectedLoans([]);
    } catch (error: any) {
      message.error(
        error.response?.status === 403
          ? 'Not authorized to perform this action!'
          : error.response?.data?.message || 'Failed to repay loan(s)'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedLoan(null);
  };

  const columns: ColumnsType<EligibleLoan> = [
    {
      title: 'Client',
      dataIndex: 'clientName',
      key: 'clientName',
    },
    {
      title: 'Member Number',
      dataIndex: 'memberNumber',
      key: 'memberNumber',
    },
    {
      title: 'Group',
      dataIndex: 'groupName',
      key: 'groupName',
    },
    {
      title: 'Loan',
      dataIndex: 'loanName',
      key: 'loanName',
    },
    {
      title: 'Pending Loan',
      dataIndex: 'loanPendingAmount',
      key: 'loanPendingAmount',
      align: 'right',
      render: (amount) => formatCurrency(amount),
    },
    {
      title: 'Loan Account Balance',
      dataIndex: 'loanAccountBalance',
      key: 'loanAccountBalance',
      align: 'right',
      render: (amount) => formatCurrency(amount),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button type="primary" onClick={() => showRepayModal(record)}>
          Repay Loan
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader 
        title="Manual Repayment" 
        breadcrumbs={[
          { title: 'Manual Repayment' }
        ]} 
      />

      <PageCard>
        {selectedLoans.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              onClick={() => setIsModalVisible(true)}
              disabled={loading}
              size="large"
            >
              Repay Selected ({selectedLoans.length})
            </Button>
          </div>
        )}

        <DataTable
          key={refreshKey}
          apiUrl={APIS.MANUAL_ELIGIBLES}
          columns={columns}
          searchPlaceholder="Search eligible loans..."
          rowSelection={{
            type: 'checkbox',
            onChange: (_, selectedRows) => {
              setSelectedLoans(selectedRows);
            },
          }}
        />
      </PageCard>

      {/* Confirm Repayment Modal */}
      <Modal
        title="Confirm Loan Repayment"
        open={isModalVisible}
        onOk={handleRepayConfirm}
        onCancel={handleCancel}
        confirmLoading={loading}
        okText="Confirm Repayment"
        cancelText="Cancel"
      >
        {selectedLoan ? (
          <div>
            <p style={{ marginBottom: 16 }}>
              Are you sure you want to repay the loan for{' '}
              <strong>{selectedLoan.clientName}</strong>?
            </p>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: 8 }}>
                <strong>Loan:</strong> {selectedLoan.loanName}
              </li>
              <li style={{ marginBottom: 8 }}>
                <strong>Pending Amount:</strong>{' '}
                {formatCurrency(selectedLoan.loanPendingAmount)}
              </li>
              <li style={{ marginBottom: 8 }}>
                <strong>Account Balance:</strong>{' '}
                {formatCurrency(selectedLoan.loanAccountBalance)}
              </li>
            </ul>
          </div>
        ) : (
          <p>
            Are you sure you want to repay the {selectedLoans.length} selected loans?
          </p>
        )}
      </Modal>
    </div>
  );
};

export default ManualRepayment;
