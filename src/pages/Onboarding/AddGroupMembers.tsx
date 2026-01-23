import React, { useState, useEffect } from 'react';
import { 
  Form, Input, Button, Select, message, Space, Card, Table, Tag
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  SaveOutlined, ArrowLeftOutlined, DeleteOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import PageHeader from '../../components/common/Layout/PageHeader';
import PageCard from '../../components/common/PageCard/PageCard';
import http from '../../services/httpInterceptor';
import { APIS } from '../../services/APIS';

const { Option } = Select;

interface Member {
  key: string;
  clientId: string;
  fullName: string;
  phone: string;
  idNumber: string;
}

interface Client {
  id: number;
  clientNumber: string;
  fullName: string;
  phone: string;
  idNumber: string;
}

const AddGroupMembers: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { groupId, groupName } = location.state || {};
  
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!groupId) {
      message.error('No group selected');
      navigate('/onboarding/groups');
      return;
    }
    loadAvailableClients();
  }, [groupId]);

  const loadAvailableClients = async () => {
    setLoadingClients(true);
    try {
      const response = await http.get(`${APIS.AVAILABLE_CLIENTS}?groupId=${groupId}`);
      setClients(response.data || []);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to load clients');
    } finally {
      setLoadingClients(false);
    }
  };

  const handleAddMember = () => {
    form.validateFields().then((values) => {
      const selectedClient = clients.find(c => c.id === values.clientId);
      if (!selectedClient) return;

      const exists = members.find(m => m.clientId === selectedClient.id.toString());
      if (exists) {
        message.warning('Client already added');
        return;
      }

      setMembers([
        ...members,
        {
          key: selectedClient.id.toString(),
          clientId: selectedClient.id.toString(),
          fullName: selectedClient.fullName,
          phone: selectedClient.phone,
          idNumber: selectedClient.idNumber,
        },
      ]);

      form.resetFields();
      message.success('Member added to list');
    });
  };

  const handleRemoveMember = (clientId: string) => {
    setMembers(members.filter(m => m.clientId !== clientId));
  };

  const handleSubmit = async () => {
    if (members.length === 0) {
      message.warning('Please add at least one member');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        groupId,
        clientIds: members.map(m => parseInt(m.clientId)),
      };

      const response = await http.post(APIS.ADD_GROUP_MEMBERS, payload);
      message.success(response.data.message || 'Members added successfully');
      navigate('/onboarding/groups');
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to add members');
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<Member> = [
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
      title: 'Actions',
      key: 'actions',
      render: (_, record: Member) => (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveMember(record.clientId)}
        >
          Remove
        </Button>
      ),
    },
  ];

  const filteredClients = clients.filter(client =>
    client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.clientNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm)
  );

  return (
    <div>
      <PageHeader 
        title={`Add Members to ${groupName || 'Group'}`}
        breadcrumbs={[
          { title: 'Home', path: '/' },
          { title: 'Groups', path: '/onboarding/groups' },
          { title: 'Add Members' }
        ]} 
      />

      <PageCard
        title="Select Members"
        extra={
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/onboarding/groups')}
            >
              Back to Groups
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSubmit}
              loading={loading}
              disabled={members.length === 0}
            >
              Save Members ({members.length})
            </Button>
          </Space>
        }
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Add Member Form */}
          <Card title="Add Member" size="small">
            <Form form={form} layout="inline" style={{ width: '100%' }}>
              <Form.Item
                name="clientId"
                style={{ flex: 1, minWidth: 300 }}
                rules={[{ required: true, message: 'Please select a client' }]}
              >
                <Select
                  showSearch
                  placeholder="Search and select client"
                  loading={loadingClients}
                  onSearch={setSearchTerm}
                  filterOption={false}
                  style={{ width: '100%' }}
                >
                  {filteredClients.map(client => (
                    <Option key={client.id} value={client.id}>
                      {client.fullName} - {client.clientNumber} ({client.phone})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item>
                <Button type="primary" onClick={handleAddMember}>
                  Add to List
                </Button>
              </Form.Item>
            </Form>
          </Card>

          {/* Members List */}
          <Card 
            title={
              <Space>
                <span>Members List</span>
                <Tag color="blue">{members.length} members</Tag>
              </Space>
            }
          >
            <Table
              columns={columns}
              dataSource={members}
              pagination={false}
              locale={{ emptyText: 'No members added yet' }}
            />
          </Card>
        </Space>
      </PageCard>
    </div>
  );
};

export default AddGroupMembers;
