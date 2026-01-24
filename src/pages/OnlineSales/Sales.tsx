import React, { useState } from 'react';
import { Button, Tag, Modal, Tabs } from 'antd';
import { EyeOutlined, ShoppingCartOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import PageHeader from '../../components/common/Layout/PageHeader';
import PageCard from '../../components/common/PageCard/PageCard';
import DataTable from '../../components/common/DataTable/DataTable';
import { APIS } from '../../services/APIS';

type SaleStatus = 'ALL' | 'COMPLETED' | 'PENDING' | 'CANCELLED';

const Sales: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SaleStatus>('ALL');
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [showSaleModal, setShowSaleModal] = useState(false);

  const formatKES = (amount?: number | string) => {
    const num = Number(amount || 0);
    try {
      return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(num);
    } catch {
      return `KES ${num.toLocaleString()}`;
    }
  };

  const columns = [
    { title: 'Sale ID', dataIndex: 'purchaseId', key: 'purchaseId' },
    { title: 'Customer', dataIndex: 'customerName', key: 'customerName' },
    { title: 'Product', dataIndex: 'product', key: 'product' },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (value: number) => (
        <span className="font-semibold text-green-600">{formatKES(value)}</span>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => (
        <span>
          {date
            ? new Date(date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })
            : 'N/A'}
        </span>
      ),
    },
    {
      title: 'M-Pesa Code',
      dataIndex: 'mpesacode',
      key: 'mpesacode',
      render: (code: string) => <Tag color="blue">{code || 'N/A'}</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, item: any) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedSale(item);
            setShowSaleModal(true);
          }}
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader 
        title="Online Sales" 
        breadcrumbs={[
          { title: 'Sales' }
        ]} 
      />
      <PageCard>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as SaleStatus)}
          items={[
            {
              key: 'ALL',
              label: (
                <span className="flex items-center gap-2">
                  <ShoppingCartOutlined /> All Sales
                </span>
              ),
            },
            {
              key: 'COMPLETED',
              label: (
                <span className="flex items-center gap-2">
                  <CheckCircleOutlined /> Completed
                </span>
              ),
            },
            {
              key: 'PENDING',
              label: (
                <span className="flex items-center gap-2">
                  <ClockCircleOutlined /> Pending
                </span>
              ),
            },
            {
              key: 'CANCELLED',
              label: (
                <span className="flex items-center gap-2">
                  <CloseCircleOutlined /> Cancelled
                </span>
              ),
            },
          ]}
        />

        <DataTable
          apiUrl={APIS.GET_SALES}
          columns={columns}
          searchPlaceholder="Search sales..."
          rowKey="purchaseId"
          additionalParams={{ status: activeTab !== 'ALL' ? activeTab : undefined }}
        />
      </PageCard>

      {/* Sale Details Modal */}
      <Modal
        title="Sale Details"
        open={showSaleModal}
        onCancel={() => setShowSaleModal(false)}
        footer={null}
        width={800}
      >
        {selectedSale && (
          <div className="p-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                Sale #{selectedSale.purchaseId || 'N/A'}
              </h3>
              <Tag color="green" className="text-base px-3 py-1">
                {formatKES(selectedSale.amount)}
              </Tag>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 rounded p-3">
                <h4 className="font-semibold text-gray-700 mb-2">Customer Information</h4>
                <div className="space-y-1 text-sm">
                  <p>
                    <strong>Name:</strong> {selectedSale.customerName || 'N/A'}
                  </p>
                  <p>
                    <strong>Phone:</strong> {selectedSale.phone || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded p-3">
                <h4 className="font-semibold text-gray-700 mb-2">Payment Details</h4>
                <div className="space-y-1 text-sm">
                  <p>
                    <strong>M-Pesa Code:</strong>{' '}
                    <Tag color="blue">{selectedSale.mpesacode || 'N/A'}</Tag>
                  </p>
                  <p>
                    <strong>Amount Paid:</strong> {formatKES(selectedSale.amountPaid)}
                  </p>
                  <p>
                    <strong>Officer:</strong> {selectedSale.officer || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded p-3">
              <h4 className="font-semibold text-gray-700 mb-2">Product Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 text-xs mb-1">Product</p>
                  <p className="font-semibold">{selectedSale.product || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Quantity</p>
                  <p className="font-semibold">{selectedSale.quantity || 0}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Total Amount</p>
                  <p className="font-semibold text-green-600">{formatKES(selectedSale.amount)}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Sales;
