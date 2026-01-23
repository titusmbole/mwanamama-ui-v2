import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Space, Tag, message, Modal
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  ArrowLeftOutlined, DeleteOutlined, ExclamationCircleOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import PageHeader from '../../components/common/Layout/PageHeader';
import PageCard from '../../components/common/PageCard/PageCard';
import http from '../../services/httpInterceptor';
import { APIS } from '../../services/APIS';

interface GroupMember {
  id: number;
  clientNumber: string;
  fullName: string;
  phone: string;
  idNumber: string;
  joinedDate: string;
  status: 'ACTIVE' | 'INACTIVE';
}

const ViewGroupMembers: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { groupId, groupName } = location.state || {};
  
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!groupId) {
      message.error('No group selected');
      navigate('/onboarding/groups');
      return;
    }
    loadMembers();
  }, [groupId, refreshKey]);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const response = await http.get(`${APIS.GROUP_MEMBERS}/${groupId}`);
      setMembers(response.data || []);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: number, memberName: string) => {
    Modal.confirm({
      title: 'Remove Member',
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to remove ${memberName} from this group?`,
      okText: 'Yes, Remove',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const response = await http.delete(`${APIS.REMOVE_GROUP_MEMBER}/${groupId}/${memberId}`);
          message.success(response.data.message || 'Member removed successfully');
          setRefreshKey(prev => prev + 1);
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Failed to remove member');
        }
      },
    });
  };

  const columns: ColumnsType<GroupMember> = [
    {
      title: 'Client Number',
      dataIndex: 'clientNumber',
      key: 'clientNumber',
    },
    {
      title: 'Full Name',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'ID Number',
      dataIndex: 'idNumber',
      key: 'idNumber',
    },
    {
      title: 'Joined Date',
      dataIndex: 'joinedDate',
      key: 'joinedDate',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'ACTIVE' ? 'green' : 'red'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record: GroupMember) => (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveMember(record.id, record.fullName)}
        >
          Remove
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader 
        title={`${groupName || 'Group'} Members`}
        breadcrumbs={[
          { title: 'Home', path: '/' },
          { title: 'Groups', path: '/onboarding/groups' },
          { title: 'View Members' }
        ]} 
      />

      <PageCard
        title={`Members (${members.length})`}
        extra={
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/onboarding/groups')}
          >
            Back to Groups
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={members}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </PageCard>
    </div>
  );
};

export default ViewGroupMembers;
