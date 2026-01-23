import React, { useState, useEffect } from 'react';
import { Table, Select, message, Empty } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { FileSearchOutlined } from '@ant-design/icons';
import PageHeader from '../../components/common/Layout/PageHeader';
import PageCard from '../../components/common/PageCard/PageCard';
import { APIS } from '../../services/APIS';
import http from '../../services/httpInterceptor';

interface Member {
  id: number;
  fullName: string;
  phone: string;
  savings: number;
}

interface Group {
  id: number;
  groupName: string;
  groupNumber: string;
}

const DownPayments: React.FC = () => {
  const [data, setData] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoadingGroups(true);
      const response = await http.get(APIS.LOAD_GROUPS_UNPAGINATED);
      setGroups(response.data);
    } catch (error: any) {
      message.error(
        error.response?.status === 403
          ? 'Not authorized to perform this action!'
          : error.response?.data?.message || 'Failed to load groups'
      );
    } finally {
      setLoadingGroups(false);
    }
  };

  const loadMembers = async (groupId: number) => {
    try {
      setLoading(true);
      const response = await http.get(`${APIS.LOAD_GROUP_MEMBERS}/${groupId}`);
      setData(response.data);
    } catch (error: any) {
      message.error(
        error.response?.status === 403
          ? 'Not authorized to perform this action!'
          : error.response?.data?.message || 'Failed to load members'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGroupChange = (groupId: number) => {
    setSelectedGroupId(groupId);
    loadMembers(groupId);
  };

  const formatCurrency = (amount: number) => {
    return `Ksh ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const columns: ColumnsType<Member> = [
    {
      title: 'Customer Name',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Phone Number',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Down Payment',
      dataIndex: 'savings',
      key: 'savings',
      align: 'right',
      render: (amount) => formatCurrency(amount || 0),
    },
  ];

  return (
    <div>
      <PageHeader 
        title="Down Payment Accounts" 
        breadcrumbs={[
          { title: 'Down Payments' }
        ]} 
      />

      <PageCard>
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
            Select Group
          </label>
          <Select
            showSearch
            placeholder="Select a group"
            style={{ width: '100%', maxWidth: 400 }}
            loading={loadingGroups}
            onChange={handleGroupChange}
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={groups.map(group => ({
              label: `${group.groupName} (${group.groupNumber})`,
              value: group.id,
            }))}
          />
        </div>

        {selectedGroupId ? (
          <Table
            columns={columns}
            dataSource={data}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 600 }}
          />
        ) : (
          <Empty
            image={<FileSearchOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />}
            description={
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>
                  Choose a group to continue
                </h3>
                <p style={{ color: '#999', fontSize: 14 }}>
                  Select a group from the dropdown above to view member down payments
                </p>
              </div>
            }
            style={{ padding: '60px 20px' }}
          />
        )}
      </PageCard>
    </div>
  );
};

export default DownPayments;
