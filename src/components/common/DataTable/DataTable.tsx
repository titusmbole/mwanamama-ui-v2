import React, { useState, useEffect, useCallback } from 'react';
import { Table, Input, Space, Button, message } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';
import http from '../../../services/httpInterceptor';

interface DataTableProps {
  apiUrl: string;
  columns: TableProps<any>['columns'];
  searchPlaceholder?: string;
  showSearch?: boolean;
  extraFilters?: React.ReactNode;
  onDataLoaded?: (data: any[]) => void;
  rowKey?: string;
  expandable?: TableProps<any>['expandable'];
  scroll?: TableProps<any>['scroll'];
}

const DataTable: React.FC<DataTableProps> = ({
  apiUrl,
  columns,
  searchPlaceholder = "Search...",
  showSearch = true,
  extraFilters,
  onDataLoaded,
  rowKey = "id",
  expandable,
  scroll
}) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchText, setSearchText] = useState('');

  const fetchData = useCallback(async (page = 1, pageSize = 10, search = '') => {
    setLoading(true);
    try {
      const response = await http.get(apiUrl, {
        params: {
          page: page - 1, // Backend uses 0-based indexing
          size: pageSize,
          search: search || undefined,
        },
      });

      const responseData = response.data;
      
      // Handle paginated response
      if (responseData.content && Array.isArray(responseData.content)) {
        setData(responseData.content);
        setPagination({
          current: page,
          pageSize: pageSize,
          total: responseData.totalElements || 0,
        });
        onDataLoaded?.(responseData.content);
      } 
      // Handle non-paginated array response
      else if (Array.isArray(responseData)) {
        setData(responseData);
        setPagination({
          current: 1,
          pageSize: responseData.length,
          total: responseData.length,
        });
        onDataLoaded?.(responseData);
      }
      // Handle other response structures
      else if (responseData.data && Array.isArray(responseData.data)) {
        setData(responseData.data);
        setPagination({
          current: page,
          pageSize: pageSize,
          total: responseData.total || responseData.data.length,
        });
        onDataLoaded?.(responseData.data);
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch data');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, onDataLoaded]);

  useEffect(() => {
    fetchData(pagination.current, pagination.pageSize, searchText);
  }, []);

  const handleTableChange = (newPagination: any) => {
    fetchData(newPagination.current, newPagination.pageSize, searchText);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    fetchData(1, pagination.pageSize, value);
  };

  const handleRefresh = () => {
    fetchData(pagination.current, pagination.pageSize, searchText);
  };

  return (
    <div>
      {(showSearch || extraFilters) && (
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            {showSearch && (
              <Input.Search
                placeholder={searchPlaceholder}
                allowClear
                onSearch={handleSearch}
                onChange={(e) => !e.target.value && handleSearch('')}
                style={{ width: 300 }}
                prefix={<SearchOutlined />}
              />
            )}
            {extraFilters}
            <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
              Refresh
            </Button>
          </Space>
        </div>
      )}
      
      <Table
        rowKey={rowKey}
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} items`,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        onChange={handleTableChange}
        expandable={expandable}
        scroll={scroll || { x: 'max-content' }}
      />
    </div>
  );
};

export default DataTable;
