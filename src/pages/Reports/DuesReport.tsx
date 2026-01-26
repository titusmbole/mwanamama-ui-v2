import React, { useState, useEffect } from 'react';
import { Table, message, Input, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import PageHeader from '../../components/common/Layout/PageHeader';
import PageCard from '../../components/common/PageCard/PageCard';
import { APIS } from '../../services/APIS';
import http from '../../services/httpInterceptor';

interface LoanDue {
  id: number;
  memberNumber: string;
  customerName: string;
  groupName: string;
  loanAmount: number;
  amountDue: number;
  officer: string;
}

const DuesReport: React.FC = () => {
  const [data, setData] = useState<LoanDue[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (page = 1, pageSize = 10, search = '') => {
    try {
      setLoading(true);
      const params: any = { page: page - 1, size: pageSize };
      if (search) params.search = search;

      const response = await http.get(APIS.LOANS_DUE_REPORT, { params });
      
      if (response.data.content) {
        setData(response.data.content);
        setPagination({ current: page, pageSize, total: response.data.totalElements || 0 });
      } else {
        setData(Array.isArray(response.data) ? response.data : []);
        setPagination({ current: 1, pageSize: 10, total: Array.isArray(response.data) ? response.data.length : 0 });
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to load loans due');
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination: any) => {
    loadData(newPagination.current, newPagination.pageSize, searchText);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    loadData(1, pagination.pageSize, value);
  };

  const handleDownload = async () => {
    try {
      message.loading('Preparing download...');
      const params: any = {};
      if (searchText) params.search = searchText;
      
      const response = await http.get(APIS.LOANS_DUE_REPORT, { 
        params,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `loans-due-${new Date().toISOString()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      message.success('Report downloaded successfully');
    } catch (error) {
      message.error('Failed to download report');
    }
  };

  const formatCurrency = (amount: number) => {
    return `Ksh ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const columns: ColumnsType<LoanDue> = [
    {
      title: 'Customer Number',
      dataIndex: 'memberNumber',
      key: 'memberNumber',
    },
    {
      title: 'Customer',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Group',
      dataIndex: 'groupName',
      key: 'groupName',
    },
    {
      title: 'Loan Amount',
      dataIndex: 'loanAmount',
      key: 'loanAmount',
      align: 'right',
      render: (amount) => formatCurrency(amount),
    },
    {
      title: 'Amount Due',
      dataIndex: 'amountDue',
      key: 'amountDue',
      align: 'right',
      render: (amount) => formatCurrency(amount),
    },
    {
      title: 'Officer',
      dataIndex: 'officer',
      key: 'officer',
    },
  ];

  return (
    <div>
      <PageHeader 
        title="Loans Due" 
        breadcrumbs={[
          { title: 'Reports' },
          { title: 'Loans Due' }
        ]} 
      />

      <PageCard>
        <div className="flex justify-between items-center mb-4">
          <Input.Search
            placeholder="Search loans..."
            onSearch={handleSearch}
            onChange={(e) => e.target.value === '' && handleSearch('')}
            style={{ maxWidth: 400 }}
            allowClear
            prefix={<SearchOutlined />}
          />
          
          <Button 
            type="primary" 
            icon={<DownloadOutlined />}
            onClick={handleDownload}
          >
            Download Report
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
        />
      </PageCard>
    </div>
  );
};

export default DuesReport;
