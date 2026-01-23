import React, { useState, useEffect } from 'react';
import { Button, Table, Tag, Modal, Form, Select, message, Input } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ReloadOutlined, RetweetOutlined } from '@ant-design/icons';
import PageHeader from '../../components/common/Layout/PageHeader';
import PageCard from '../../components/common/PageCard/PageCard';
import { APIS } from '../../services/APIS';
import http from '../../services/httpInterceptor';

interface MpesaTransaction {
  id: number;
  billRefNumber: string;
  payer: string;
  transID: string;
  transAmount: number;
  transTime: string;
  transactionType: string;
  status: string;
}

interface Group {
  id: number;
  groupName: string;
  groupNumber: string;
}

const SuspendedAccounts: React.FC = () => {
  const [data, setData] = useState<MpesaTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [searchText, setSearchText] = useState('');
  const [reallocateModalOpen, setReallocateModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<MpesaTransaction | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
    loadGroups();
  }, []);

  const loadData = async (page = 1, pageSize = 10, search = '') => {
    try {
      setLoading(true);
      const params: any = {
        page,
        size: pageSize,
        status: 'PENDING',
      };
      if (search) params.search = search;

      const response = await http.get(APIS.ALL_PAYMENTS, { params });
      
      if (response.data.content) {
        setData(response.data.content);
        setPagination({
          current: page,
          pageSize,
          total: response.data.totalElements || 0,
        });
      } else {
        setData(response.data);
        setPagination({ current: 1, pageSize: 10, total: response.data.length });
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to load suspended payments');
    } finally {
      setLoading(false);
    }
  };

  const loadGroups = async () => {
    try {
      const response = await http.get(APIS.LOAD_GROUPS_UNPAGINATED);
      setGroups(response.data);
    } catch (error: any) {
      message.error('Failed to load groups');
    }
  };

  const handleTableChange = (newPagination: any) => {
    loadData(newPagination.current, newPagination.pageSize, searchText);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    loadData(1, pagination.pageSize, value);
  };

  const handleReallocate = (transaction: MpesaTransaction) => {
    setSelectedTransaction(transaction);
    form.resetFields();
    setReallocateModalOpen(true);
  };

  const handleReallocateSubmit = async (values: any) => {
    if (!selectedTransaction) return;

    setSubmitting(true);
    try {
      await http.put(APIS.ALLOCATE_PAYMENT, {
        paymentId: selectedTransaction.id,
        groupNumber: values.groupNumber,
      });
      message.success('Payment reallocated successfully!');
      setReallocateModalOpen(false);
      loadData(pagination.current, pagination.pageSize, searchText);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to reallocate payment');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `Ksh ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const capitalizeWords = (str: string) => {
    return str
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const columns: ColumnsType<MpesaTransaction> = [
    {
      title: 'Group ID',
      dataIndex: 'billRefNumber',
      key: 'billRefNumber',
    },
    {
      title: 'Payer',
      dataIndex: 'payer',
      key: 'payer',
      render: (text) => capitalizeWords(text),
    },
    {
      title: 'Mpesa Code',
      dataIndex: 'transID',
      key: 'transID',
    },
    {
      title: 'Amount',
      dataIndex: 'transAmount',
      key: 'transAmount',
      align: 'right',
      render: (amount) => formatCurrency(amount),
    },
    {
      title: 'Transaction Date',
      dataIndex: 'transTime',
      key: 'transTime',
    },
    {
      title: 'Type',
      dataIndex: 'transactionType',
      key: 'transactionType',
    },
    {
      title: 'Payment Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'PENDING' ? 'orange' : 'default'}>{status}</Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type="default"
          icon={<RetweetOutlined />}
          onClick={() => handleReallocate(record)}
        >
          Reallocate
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader 
        title="Suspended Payments" 
        breadcrumbs={[
          { title: 'Suspended Payments' }
        ]} 
      />

      <PageCard
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={() => loadData(pagination.current, pagination.pageSize, searchText)}
          >
            Refresh
          </Button>
        }
      >
        <Input.Search
          placeholder="Search suspended payments..."
          onSearch={handleSearch}
          onChange={(e) => e.target.value === '' && handleSearch('')}
          style={{ marginBottom: 16, maxWidth: 400 }}
          allowClear
        />

        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
        />
      </PageCard>

      {/* Reallocate Modal */}
      <Modal
        title="Reallocate Payment"
        open={reallocateModalOpen}
        onCancel={() => {
          setReallocateModalOpen(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={submitting}
      >
        {selectedTransaction && (
          <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#fff7e6', borderRadius: 4, border: '1px solid #ffd591' }}>
            <div><strong>Payer:</strong> {capitalizeWords(selectedTransaction.payer)}</div>
            <div><strong>Amount:</strong> {formatCurrency(selectedTransaction.transAmount)}</div>
            <div><strong>M-Pesa Code:</strong> {selectedTransaction.transID}</div>
            <div style={{ marginTop: 8, color: '#d46b08' }}>
              <strong>Status:</strong> This payment is suspended and needs to be allocated to the correct group.
            </div>
          </div>
        )}

        <Form form={form} layout="vertical" onFinish={handleReallocateSubmit}>
          <Form.Item
            name="groupNumber"
            label="Select Group"
            rules={[{ required: true, message: 'Please select a group' }]}
          >
            <Select
              showSearch
              placeholder="Select group to allocate payment"
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={groups.map(group => ({
                label: `${group.groupName} (${group.groupNumber})`,
                value: group.groupNumber,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SuspendedAccounts;
