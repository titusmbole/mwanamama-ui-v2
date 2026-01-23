import React, { useState } from 'react';
import { Button, Modal, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EyeOutlined } from '@ant-design/icons';
import PageHeader from '../../components/common/Layout/PageHeader';
import DataTable from '../../components/common/DataTable/DataTable';
import PageCard from '../../components/common/PageCard/PageCard';
import { APIS } from '../../services/APIS';

interface CollectionSheet {
  id: number;
  collectionSheetNumber: string;
  receiptNumber: string;
  groupNumber: string;
  groupName: string;
  totalSavings: number;
  totalLoan: number;
  totalRegistration: number;
  creditOfficer: string;
  datePosted: string;
  collections: CollectionItem[];
}

interface CollectionItem {
  clientName: string;
  memberNumber: string;
  loanAmount: number;
  savingAmount: number;
  registration: number;
}

const DepositSheet: React.FC = () => {
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedSheet, setSelectedSheet] = useState<CollectionSheet | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleView = (sheet: CollectionSheet) => {
    setSelectedSheet(sheet);
    setViewModalOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return `Ksh ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const columns: ColumnsType<CollectionSheet> = [
    {
      title: 'Sheet No',
      dataIndex: 'collectionSheetNumber',
      key: 'collectionSheetNumber',
    },
    {
      title: 'Receipt No.',
      dataIndex: 'receiptNumber',
      key: 'receiptNumber',
      render: (text) => text || 'N/A',
    },
    {
      title: 'Group ID',
      dataIndex: 'groupNumber',
      key: 'groupNumber',
    },
    {
      title: 'T. Down Payment',
      dataIndex: 'totalSavings',
      key: 'totalSavings',
      align: 'right',
      render: (amount) => formatCurrency(amount),
    },
    {
      title: 'T. Loans',
      dataIndex: 'totalLoan',
      key: 'totalLoan',
      align: 'right',
      render: (amount) => formatCurrency(amount),
    },
    {
      title: 'T. Reg Fee',
      dataIndex: 'totalRegistration',
      key: 'totalRegistration',
      align: 'right',
      render: (amount) => formatCurrency(amount),
    },
    {
      title: 'T. Collection',
      key: 'totalCollection',
      align: 'right',
      render: (_, record) => formatCurrency(record.totalLoan + record.totalSavings + record.totalRegistration),
    },
    {
      title: 'D. Posted',
      dataIndex: 'datePosted',
      key: 'datePosted',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleView(record)}
        >
          View
        </Button>
      ),
    },
  ];

  const detailColumns: ColumnsType<CollectionItem> = [
    {
      title: 'Member',
      dataIndex: 'clientName',
      key: 'clientName',
    },
    {
      title: 'Member No.',
      dataIndex: 'memberNumber',
      key: 'memberNumber',
    },
    {
      title: 'Loan',
      dataIndex: 'loanAmount',
      key: 'loanAmount',
      align: 'right',
      render: (amount) => formatCurrency(amount),
    },
    {
      title: 'Saving',
      dataIndex: 'savingAmount',
      key: 'savingAmount',
      align: 'right',
      render: (amount) => formatCurrency(amount),
    },
    {
      title: 'Registration',
      dataIndex: 'registration',
      key: 'registration',
      align: 'right',
      render: (amount) => formatCurrency(amount),
    },
  ];

  return (
    <div>
      <PageHeader 
        title="Deposit Sheets" 
        breadcrumbs={[
          { title: 'Deposit Sheets' }
        ]} 
      />

      <PageCard>
        <DataTable
          key={refreshKey}
          apiUrl={APIS.LOAD_COLLECTION_SHEETS}
          columns={columns}
          searchPlaceholder="Search deposit sheets..."
        />
      </PageCard>

      {/* View Details Modal */}
      <Modal
        title={`Deposit sheet for ${selectedSheet?.groupName} | ${selectedSheet?.datePosted} | ${selectedSheet?.collectionSheetNumber}`}
        open={viewModalOpen}
        onCancel={() => {
          setViewModalOpen(false);
          setSelectedSheet(null);
        }}
        width={900}
        footer={null}
      >
        {selectedSheet && (
          <div>
            <Table
              columns={detailColumns}
              dataSource={selectedSheet.collections}
              rowKey={(record, index) => `${record.memberNumber}-${index}`}
              pagination={false}
            />
            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              marginTop: 24, 
              padding: '12px 16px',
              backgroundColor: '#f5f5f5',
              borderRadius: 8 
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: 8, color: '#666', fontSize: 14 }}>
                  Total Collection:
                </span>
                <span style={{ fontWeight: 'bold', fontSize: 20, color: '#000' }}>
                  {formatCurrency(selectedSheet.totalLoan + selectedSheet.totalSavings + selectedSheet.totalRegistration)}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DepositSheet;
