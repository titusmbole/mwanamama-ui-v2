import React, { useState, useEffect } from 'react';
import { Table, message, Card, Statistic, Tabs, DatePicker, Button, Tag, Alert, Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Dayjs } from 'dayjs';
import { 
  DollarCircleOutlined, RiseOutlined, FallOutlined, 
  ShoppingCartOutlined, UserOutlined, ShopOutlined, InboxOutlined
} from '@ant-design/icons';
import PageHeader from '../../components/common/Layout/PageHeader';
import PageCard from '../../components/common/PageCard/PageCard';
import { APIS } from '../../services/APIS';
import http from '../../services/httpInterceptor';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const MONTHLY_TARGET_AMOUNT = 1000000;

interface Summary {
  totalSales?: number;
  totalRevenue: number;
}

interface SalesPerformanceOfficer {
  id: number;
  agentName: string;
  branchName: string;
  totalRevenue: number;
  totalSales: number;
  totalQuantitySold: number;
  averageSaleValue: number;
  activeProducts: number;
}

interface SalesPerformanceProduct {
  id: number;
  itemCode: string;
  itemName: string;
  totalQuantitySold: number;
  totalRevenue: number;
  unitPrice: number;
  averageMonthlySales: number;
  topSellingBranch: string;
  stockLevel: number;
  lastSaleDate: string;
}

interface SalesPerformanceBranch {
  id: number;
  branchName: string;
  branchCode: string;
  totalRevenue: number;
  totalSales: number;
  activeOfficers: number;
  topProduct: string;
  averageSaleValue: number;
  monthlyGrowth: number | string;
  lastSaleDate: string;
}

const SalesPerformanceReport: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'officer' | 'product' | 'branch'>('officer');
  const [data, setData] = useState<any[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  useEffect(() => {
    loadSummary();
  }, [startDate, endDate]);

  useEffect(() => {
    loadData();
  }, [activeTab, startDate, endDate]);

  const loadSummary = async () => {
    try {
      setLoadingSummary(true);
      setError(null);
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const response = await http.get(APIS.SALES_PERFORMANCE_SUMMARY, { params });
      setSummary(response.data);
    } catch (err: any) {
      console.error("Summary fetch error:", err);
      setError("Failed to load summary data");
    } finally {
      setLoadingSummary(false);
    }
  };

  const loadData = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      const params: any = { page: page - 1, size: pageSize };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      let apiUrl = '';
      switch (activeTab) {
        case 'officer':
          apiUrl = APIS.SALES_PERFORMANCE_BY_OFFICER;
          break;
        case 'product':
          apiUrl = APIS.SALES_PERFORMANCE_BY_PRODUCT;
          break;
        case 'branch':
          apiUrl = APIS.SALES_PERFORMANCE_BY_BRANCH;
          break;
      }

      const response = await http.get(apiUrl, { params });
      
      if (response.data.content) {
        setData(response.data.content);
        setPagination({ current: page, pageSize, total: response.data.totalElements || 0 });
      } else {
        setData(Array.isArray(response.data) ? response.data : []);
        setPagination({ current: 1, pageSize: 10, total: Array.isArray(response.data) ? response.data.length : 0 });
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to load sales performance data');
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination: any) => {
    loadData(newPagination.current, newPagination.pageSize);
  };

  const handleDateRangeChange = (dates: any) => {
    if (dates) {
      setStartDate(dates[0].format('YYYY-MM-DD'));
      setEndDate(dates[1].format('YYYY-MM-DD'));
    } else {
      setStartDate(null);
      setEndDate(null);
    }
  };

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null) return 'Ksh 0.00';
    return `Ksh ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const officerColumns: ColumnsType<SalesPerformanceOfficer> = [
    {
      title: 'Officer Name',
      dataIndex: 'agentName',
      key: 'agentName',
    },
    {
      title: 'Branch',
      dataIndex: 'branchName',
      key: 'branchName',
    },
    {
      title: 'Total Sales (Revenue)',
      dataIndex: 'totalRevenue',
      key: 'totalRevenue',
      align: 'right',
      render: (amount) => (
        <span className="font-semibold text-green-600">{formatCurrency(amount)}</span>
      ),
    },
    {
      title: 'Total Sales Count',
      dataIndex: 'totalSales',
      key: 'totalSales',
      align: 'right',
      render: (count) => <span className="font-medium text-blue-600">{count ?? '-'}</span>,
    },
    {
      title: 'Units Sold',
      dataIndex: 'totalQuantitySold',
      key: 'totalQuantitySold',
      align: 'right',
      render: (count) => count?.toLocaleString() || '-',
    },
    {
      title: 'Avg Sale Value',
      dataIndex: 'averageSaleValue',
      key: 'averageSaleValue',
      align: 'right',
      render: (amount) => formatCurrency(amount),
    },
    {
      title: 'Active Products',
      dataIndex: 'activeProducts',
      key: 'activeProducts',
      align: 'right',
    },
  ];

  const productColumns: ColumnsType<SalesPerformanceProduct> = [
    {
      title: 'Product Code',
      dataIndex: 'itemCode',
      key: 'itemCode',
      render: (code) => (
        <span className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
          {code || '-'}
        </span>
      ),
    },
    {
      title: 'Product Name',
      dataIndex: 'itemName',
      key: 'itemName',
    },
    {
      title: 'Units Sold',
      dataIndex: 'totalQuantitySold',
      key: 'totalQuantitySold',
      align: 'right',
      render: (count) => (
        <span className="font-medium text-blue-600">
          {count?.toLocaleString() || '-'}
        </span>
      ),
    },
    {
      title: 'Revenue',
      dataIndex: 'totalRevenue',
      key: 'totalRevenue',
      align: 'right',
      render: (amount) => (
        <span className="font-semibold text-green-600">{formatCurrency(amount)}</span>
      ),
    },
    {
      title: 'Unit Price',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      align: 'right',
      render: (amount) => formatCurrency(amount),
    },
    {
      title: 'Avg Monthly Sales',
      dataIndex: 'averageMonthlySales',
      key: 'averageMonthlySales',
      align: 'right',
      render: (amount) => formatCurrency(amount),
    },
    {
      title: 'Top Branch',
      dataIndex: 'topSellingBranch',
      key: 'topSellingBranch',
    },
    {
      title: 'Current Stock',
      dataIndex: 'stockLevel',
      key: 'stockLevel',
      align: 'center',
      render: (level) => (
        <Tag
          color={
            level > 50 ? 'green' : level > 20 ? 'orange' : 'red'
          }
        >
          {level ?? '-'}
        </Tag>
      ),
    },
    {
      title: 'Last Sale Date',
      dataIndex: 'lastSaleDate',
      key: 'lastSaleDate',
      render: (date) => date ? new Date(date).toLocaleDateString() : 'N/A',
    },
  ];

  const branchColumns: ColumnsType<SalesPerformanceBranch> = [
    {
      title: 'Branch Name',
      dataIndex: 'branchName',
      key: 'branchName',
    },
    {
      title: 'Branch Code',
      dataIndex: 'branchCode',
      key: 'branchCode',
      render: (code) => (
        <span className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
          {code || '-'}
        </span>
      ),
    },
    {
      title: 'Total Sales (Revenue)',
      dataIndex: 'totalRevenue',
      key: 'totalRevenue',
      align: 'right',
      render: (amount) => (
        <span className="font-semibold text-green-600">{formatCurrency(amount)}</span>
      ),
    },
    {
      title: 'Total Sales Count',
      dataIndex: 'totalSales',
      key: 'totalSales',
      align: 'right',
      render: (count) => <span className="font-medium text-blue-600">{count ?? '-'}</span>,
    },
    {
      title: 'Active Officers',
      dataIndex: 'activeOfficers',
      key: 'activeOfficers',
      align: 'right',
    },
    {
      title: 'Best Selling Product',
      dataIndex: 'topProduct',
      key: 'topProduct',
    },
    {
      title: 'Avg Sale Value',
      dataIndex: 'averageSaleValue',
      key: 'averageSaleValue',
      align: 'right',
      render: (amount) => formatCurrency(amount),
    },
    {
      title: 'Monthly Growth %',
      dataIndex: 'monthlyGrowth',
      key: 'monthlyGrowth',
      align: 'center',
      render: (growth) => {
        const growthValue = typeof growth === 'string' ? parseFloat(growth.replace('%', '')) : growth;
        return (
          <div className="flex items-center justify-center gap-1">
            {growthValue >= 0 ? (
              <RiseOutlined style={{ color: '#52c41a' }} />
            ) : (
              <FallOutlined style={{ color: '#f5222d' }} />
            )}
            <span
              className={`font-medium ${
                growthValue >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {growth ? `${growthValue > 0 ? '+' : ''}${growth}` : '-'}
            </span>
          </div>
        );
      },
    },
    {
      title: 'Last Sale Date',
      dataIndex: 'lastSaleDate',
      key: 'lastSaleDate',
      render: (date) => date ? new Date(date).toLocaleDateString() : 'N/A',
    },
  ];

  const getColumnsForTab = () => {
    switch (activeTab) {
      case 'officer':
        return officerColumns;
      case 'product':
        return productColumns;
      case 'branch':
        return branchColumns;
      default:
        return officerColumns;
    }
  };

  return (
    <div>
      <PageHeader 
        title="Sales Performance Report" 
        breadcrumbs={[
          { title: 'Reports' },
          { title: 'Sales Performance' }
        ]} 
      />

      {/* Date Range Filters */}
      <PageCard>
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <RangePicker 
              onChange={handleDateRangeChange}
              style={{ width: '100%' }}
              size="large"
            />
          </div>
        </div>
      </PageCard>

      {/* Summary Cards */}
      {loadingSummary ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 mb-6">
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
          className="mt-6 mb-6"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 mb-6">
          <Card className="bg-blue-50" bordered={false}>
            <Statistic
              title="Total Sales (Revenue)"
              value={summary?.totalRevenue || summary?.totalSales || 0}
              valueStyle={{ color: '#1890ff' }}
              prefix={<DollarCircleOutlined />}
              formatter={(value) => formatCurrency(Number(value))}
            />
          </Card>
          
          <Card className="bg-green-50" bordered={false}>
            <Statistic
              title="Total Revenue"
              value={summary?.totalRevenue || 0}
              valueStyle={{ color: '#52c41a' }}
              prefix={<ShoppingCartOutlined />}
              formatter={(value) => formatCurrency(Number(value))}
            />
          </Card>
          
          <Card className="bg-purple-50" bordered={false}>
            <Statistic
              title="Monthly Target"
              value={MONTHLY_TARGET_AMOUNT}
              valueStyle={{ color: '#722ed1' }}
              prefix={<RiseOutlined />}
              formatter={(value) => formatCurrency(Number(value))}
            />
          </Card>
          
          <Card className="bg-orange-50" bordered={false}>
            <Statistic
              title="Achievement"
              value={summary?.totalRevenue ? Math.round((summary.totalRevenue / MONTHLY_TARGET_AMOUNT) * 100) : 0}
              valueStyle={{ color: '#fa8c16' }}
              prefix={<FallOutlined />}
              suffix="%"
            />
          </Card>
        </div>
      )}

      {/* Tabs and Table */}
      <PageCard>
        <Tabs 
          activeKey={activeTab} 
          onChange={(key) => setActiveTab(key as 'officer' | 'product' | 'branch')}
        >
          <Tabs.TabPane 
            tab={<span className="flex items-center gap-2"><UserOutlined /> By Officer</span>} 
            key="officer"
          >
            <Table
              columns={getColumnsForTab()}
              dataSource={data}
              rowKey="id"
              loading={loading}
              pagination={pagination}
              onChange={handleTableChange}
              scroll={{ x: 1200 }}
            />
          </Tabs.TabPane>
          
          <Tabs.TabPane 
            tab={<span className="flex items-center gap-2"><InboxOutlined /> By Product</span>} 
            key="product"
          >
            <Table
              columns={getColumnsForTab()}
              dataSource={data}
              rowKey="id"
              loading={loading}
              pagination={pagination}
              onChange={handleTableChange}
              scroll={{ x: 1400 }}
            />
          </Tabs.TabPane>
          
          <Tabs.TabPane 
            tab={<span className="flex items-center gap-2"><ShopOutlined /> By Branch</span>} 
            key="branch"
          >
            <Table
              columns={getColumnsForTab()}
              dataSource={data}
              rowKey="id"
              loading={loading}
              pagination={pagination}
              onChange={handleTableChange}
              scroll={{ x: 1400 }}
            />
          </Tabs.TabPane>
        </Tabs>
      </PageCard>
    </div>
  );
};

export default SalesPerformanceReport;
