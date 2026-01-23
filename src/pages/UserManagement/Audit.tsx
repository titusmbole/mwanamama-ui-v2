import React, { useState, useEffect } from 'react';
import { Table, DatePicker, Button, message, Input } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DownloadOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import PageHeader from '../../components/common/Layout/PageHeader';
import PageCard from '../../components/common/PageCard/PageCard';
import { APIS } from '../../services/APIS';
import http from '../../services/httpInterceptor';

const { RangePicker } = DatePicker;

interface AuditRecord {
  id: number;
  user: string;
  action: string;
  timestamp: string;
  details?: string;
}

const Audit: React.FC = () => {
  const [data, setData] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (page = 1, pageSize = 10, search = '', startDate?: string, endDate?: string) => {
    try {
      setLoading(true);
      const params: any = { page: page - 1, size: pageSize }; // Backend uses 0-indexed pages
      if (search) params.search = search;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await http.get(APIS.AUDIT_TRAIL, { params });
      
      if (response.data.content) {
        setData(response.data.content);
        setPagination({ current: page, pageSize, total: response.data.totalElements || 0 });
      } else {
        setData(response.data);
        setPagination({ current: 1, pageSize: 10, total: response.data.length });
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to load audit trail');
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination: any) => {
    const startDate = dateRange ? dateRange[0].format('YYYY-MM-DD') : undefined;
    const endDate = dateRange ? dateRange[1].format('YYYY-MM-DD') : undefined;
    loadData(newPagination.current, newPagination.pageSize, searchText, startDate, endDate);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    const startDate = dateRange ? dateRange[0].format('YYYY-MM-DD') : undefined;
    const endDate = dateRange ? dateRange[1].format('YYYY-MM-DD') : undefined;
    loadData(1, pagination.pageSize, value, startDate, endDate);
  };

  const handleDateChange = (dates: any) => {
    setDateRange(dates);
    if (dates) {
      const startDate = dates[0].format('YYYY-MM-DD');
      const endDate = dates[1].format('YYYY-MM-DD');
      loadData(1, pagination.pageSize, searchText, startDate, endDate);
    } else {
      loadData(1, pagination.pageSize, searchText);
    }
  };

  const handleDownloadReport = async () => {
    setDownloading(true);
    try {
      const params: any = {};
      if (dateRange) {
        params.startDate = dateRange[0].format('YYYY-MM-DD');
        params.endDate = dateRange[1].format('YYYY-MM-DD');
      }
      if (searchText) params.search = searchText;

      const response = await http.get(APIS.DOWNLOAD_AUDIT_REPORT, {
        params,
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit-trail-${dayjs().format('YYYY-MM-DD')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      message.success('Report downloaded successfully');
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to download report');
    } finally {
      setDownloading(false);
    }
  };

  const columns: ColumnsType<AuditRecord> = [
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
    },
    {
      title: 'Date & Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp) => dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss'),
    }
  ];

  return (
    <div>
      <PageHeader 
        title="Audit Trail" 
        breadcrumbs={[
          { title: 'Audit Trail' }
        ]} 
      />

      <PageCard
        extra={
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleDownloadReport}
            loading={downloading}
          >
            Download Report
          </Button>
        }
      >
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <Input.Search
            placeholder="Search audit trail..."
            onSearch={handleSearch}
            onChange={(e) => e.target.value === '' && handleSearch('')}
            style={{ maxWidth: 400 }}
            allowClear
          />
          
          <RangePicker
            value={dateRange}
            onChange={handleDateChange}
            format="YYYY-MM-DD"
          />
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

export default Audit;
