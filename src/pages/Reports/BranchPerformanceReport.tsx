import React, { useState, useEffect } from 'react';
import { Table, message, Card, Row, Col, Statistic, Tag, Alert, Spin, Input, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  TeamOutlined, TrophyOutlined, PercentageOutlined, DollarCircleOutlined,
  SearchOutlined, DownloadOutlined
} from '@ant-design/icons';
import PageHeader from '../../components/common/Layout/PageHeader';
import PageCard from '../../components/common/PageCard/PageCard';
import { APIS } from '../../services/APIS';
import http from '../../services/httpInterceptor';

interface BranchPerformance {
  id: number;
  branchName: string;
  branchCode: string;
  totalCustomers: number;
  activeLoans: number;
  totalLoanAmount: number;
  totalRegistrationFee: number;
  collectionRate: number;
  monthlyTarget: number;
  targetAchievement: number;
  revenue: number;
  branchManager?: string;
}

interface Summary {
  totalBranches: number;
  topPerformingBranch: {
    name: string;
    achievement: number;
  };
  avgCollectionRate: number;
  totalRevenue: number;
}

const DEFAULT_MONTHLY_TARGET = 1000000;

const BranchPerformanceReport: React.FC = () => {
  const [data, setData] = useState<BranchPerformance[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  useEffect(() => {
    loadData();
    loadSummary();
  }, []);

  const loadData = async (page = 1, pageSize = 10, search = '') => {
    try {
      setLoading(true);
      const params: any = { page: page - 1, size: pageSize };
      if (search) params.search = search;

      const response = await http.get(APIS.BRANCH_PERFORMANCE, { params });
      
      if (response.data.content) {
        setData(response.data.content);
        setPagination({ current: page, pageSize, total: response.data.totalElements || 0 });
      } else {
        setData(Array.isArray(response.data) ? response.data : []);
        setPagination({ current: 1, pageSize: 10, total: Array.isArray(response.data) ? response.data.length : 0 });
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to load branch performance');
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      setLoadingSummary(true);
      setError(null);
      const response = await http.get(APIS.SALES_PERFORMANCE_SUMMARY);
      setSummary(response.data);
    } catch (err: any) {
      console.error("Summary fetch error:", err);
      setError("Failed to load summary data");
    } finally {
      setLoadingSummary(false);
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
      
      const response = await http.get(APIS.BRANCH_PERFORMANCE, { 
        params,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `branch-performance-${new Date().toISOString()}.csv`);
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

  const columns: ColumnsType<BranchPerformance> = [
    {
      title: 'Branch Name',
      dataIndex: 'branchName',
      key: 'branchName',
    },
    {
      title: 'Branch Code',
      dataIndex: 'branchCode',
      key: 'branchCode',
    },
    {
      title: 'Total Customers',
      dataIndex: 'totalCustomers',
      key: 'totalCustomers',
      align: 'right',
      render: (value) => value?.toLocaleString() || '-',
    },
    {
      title: 'Active Loans',
      dataIndex: 'activeLoans',
      key: 'activeLoans',
      align: 'right',
      render: (value) => value?.toLocaleString() || '-',
    },
    {
      title: 'Total Loan Amount',
      dataIndex: 'totalLoanAmount',
      key: 'totalLoanAmount',
      align: 'right',
      render: (amount) => formatCurrency(amount),
    },
    {
      title: 'T Reg Fee',
      dataIndex: 'totalRegistrationFee',
      key: 'totalRegistrationFee',
      align: 'right',
      render: (amount) => formatCurrency(amount),
    },
    {
      title: 'Collection Rate %',
      dataIndex: 'collectionRate',
      key: 'collectionRate',
      align: 'center',
      render: (rate) => (
        <Tag
          color={
            rate >= 90
              ? 'green'
              : rate >= 75
              ? 'orange'
              : 'red'
          }
        >
          {rate ? `${Math.round(rate)}%` : '-'}
        </Tag>
      ),
    },
    {
      title: 'Monthly Target',
      dataIndex: 'monthlyTarget',
      key: 'monthlyTarget',
      align: 'right',
      render: (target) => formatCurrency(target ?? DEFAULT_MONTHLY_TARGET),
    },
    {
      title: 'Target Achievement %',
      dataIndex: 'targetAchievement',
      key: 'targetAchievement',
      align: 'center',
      render: (_, record) => {
        const target = record.monthlyTarget ?? DEFAULT_MONTHLY_TARGET;
        const revenue = record.revenue ?? 0;
        const achievement = target > 0 ? Math.round((revenue / target) * 100) : 0;
        
        return (
          <Tag
            color={
              achievement >= 100
                ? 'green'
                : achievement >= 80
                ? 'blue'
                : achievement >= 60
                ? 'orange'
                : 'red'
            }
          >
            {achievement}%
          </Tag>
        );
      },
    },
    {
      title: 'Revenue',
      dataIndex: 'revenue',
      key: 'revenue',
      align: 'right',
      render: (amount) => (
        <span className="font-semibold text-green-600">
          {formatCurrency(amount)}
        </span>
      ),
    },
    {
      title: 'Branch Manager',
      dataIndex: 'branchManager',
      key: 'branchManager',
      render: (manager) => manager || '--',
    },
  ];

  return (
    <div>
      <PageHeader 
        title="Branch Performance Report" 
        breadcrumbs={[
          { title: 'Reports' },
          { title: 'Branch Performance' }
        ]} 
      />

      {/* Summary Cards */}
      {loadingSummary ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {Array(4).fill(0).map((_, idx) => (
            <Card key={idx} loading={true} />
          ))}
        </div>
      ) : error ? (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          className="mb-6"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-blue-50" bordered={false}>
            <Statistic
              title="Total Branches"
              value={summary?.totalBranches ?? '-'}
              valueStyle={{ color: '#1890ff' }}
              prefix={<TeamOutlined />}
            />
          </Card>
          
          <Card className="bg-green-50" bordered={false}>
            <Statistic
              title="Top Performing"
              value={`${summary?.topPerformingBranch?.name ?? '-'}`}
              valueStyle={{ color: '#52c41a', fontSize: '16px' }}
              prefix={<TrophyOutlined />}
              suffix={summary?.topPerformingBranch?.achievement ? `(${summary.topPerformingBranch.achievement}%)` : ''}
            />
          </Card>
          
          <Card className="bg-orange-50" bordered={false}>
            <Statistic
              title="Average Collection Rate"
              value={summary?.avgCollectionRate ?? 0}
              valueStyle={{ color: '#fa8c16' }}
              prefix={<PercentageOutlined />}
              suffix="%"
            />
          </Card>
          
          <Card className="bg-purple-50" bordered={false}>
            <Statistic
              title="Total Revenue"
              value={summary?.totalRevenue ?? 0}
              valueStyle={{ color: '#722ed1' }}
              prefix={<DollarCircleOutlined />}
              formatter={(value) => formatCurrency(Number(value))}
            />
          </Card>
        </div>
      )}

      <PageCard>
        <div className="flex justify-between items-center mb-4">
          <Input.Search
            placeholder="Search branches..."
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
          scroll={{ x: 1500 }}
        />
      </PageCard>
    </div>
  );
};

export default BranchPerformanceReport;
