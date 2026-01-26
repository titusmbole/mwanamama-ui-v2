import React, { useState, useEffect } from 'react';
import { Table, Button, message, Popconfirm, Space, Tag, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DownloadOutlined, DeleteOutlined, CloudUploadOutlined, ReloadOutlined } from '@ant-design/icons';
import PageHeader from '../../components/common/Layout/PageHeader';
import PageCard from '../../components/common/PageCard/PageCard';
import { APIS } from '../../services/APIS';
import http from '../../services/httpInterceptor';

interface Backup {
  name: string;
  size: number;
  createdAt: string;
  url: string;
}

const Backups: React.FC = () => {
  const [data, setData] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [restoring, setRestoring] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      const params: any = { page: page - 1, size: pageSize };

      const response = await http.get(APIS.LOAD_BACKUPS, { params });
      
      if (response.data.content) {
        setData(response.data.content);
        setPagination({ current: page, pageSize, total: response.data.totalElements || 0 });
      } else {
        setData(Array.isArray(response.data) ? response.data : []);
        setPagination({ current: 1, pageSize: 10, total: Array.isArray(response.data) ? response.data.length : 0 });
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to load backups');
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination: any) => {
    loadData(newPagination.current, newPagination.pageSize);
  };

  const handleRestore = async (backupName: string) => {
    try {
      setRestoring(backupName);
      const response = await http.post(APIS.RESTORE_BACKUP + backupName);
      message.success(response.data.message || 'Backup restored successfully');
      loadData(pagination.current, pagination.pageSize);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to restore backup');
    } finally {
      setRestoring(null);
    }
  };

  const handleDelete = async (backupName: string) => {
    try {
      setDeleting(backupName);
      const response = await http.delete(APIS.DELETE_BACKUP + backupName);
      message.success(response.data.message || 'Backup deleted successfully');
      loadData(pagination.current, pagination.pageSize);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to delete backup');
    } finally {
      setDeleting(null);
    }
  };

  const handleDownload = (url: string) => {
    window.open(url, '_blank');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatSize = (sizeInMB: number) => {
    if (sizeInMB >= 1024) {
      return `${(sizeInMB / 1024).toFixed(2)} GB`;
    }
    return `${sizeInMB.toFixed(2)} MB`;
  };

  const columns: ColumnsType<Backup> = [
    {
      title: 'Backup Name',
      dataIndex: 'name',
      key: 'name',
      render: (name) => {
        const displayName = name.split('.')[0];
        return (
          <Space>
            <Tag color="blue">{displayName}</Tag>
          </Space>
        );
      },
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      align: 'right',
      render: (size) => formatSize(size),
    },
    {
      title: 'Date Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => formatDate(date),
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Download Backup">
            <Button
              type="text"
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(record.url)}
              className="text-blue-500 hover:text-blue-700"
            />
          </Tooltip>
          
          <Tooltip title="Restore Backup">
            <Popconfirm
              title="Restore Backup"
              description="Are you sure you want to restore this backup? Restoring will overwrite existing data and may result in data loss. Proceed with caution."
              onConfirm={() => handleRestore(record.name)}
              okText="Yes, Restore"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
            >
              <Button
                type="text"
                icon={<CloudUploadOutlined />}
                loading={restoring === record.name}
                className="text-green-500 hover:text-green-700"
              />
            </Popconfirm>
          </Tooltip>

          <Tooltip title="Delete Backup">
            <Popconfirm
              title="Delete Backup"
              description="Are you sure you want to delete this backup? This action cannot be undone."
              onConfirm={() => handleDelete(record.name)}
              okText="Yes, Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
            >
              <Button
                type="text"
                icon={<DeleteOutlined />}
                loading={deleting === record.name}
                danger
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader 
        title="Backups" 
        breadcrumbs={[
          { title: 'Settings' },
          { title: 'Backups' }
        ]} 
      />

      <PageCard>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold">Database Backups</h3>
            <p className="text-sm text-gray-500">
              Manage your system backups. You can restore or download previous backups.
            </p>
          </div>
          
          <Button 
            type="primary" 
            icon={<ReloadOutlined />}
            onClick={() => loadData(pagination.current, pagination.pageSize)}
            loading={loading}
          >
            Refresh
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={data}
          rowKey="name"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
        />
      </PageCard>
    </div>
  );
};

export default Backups;
