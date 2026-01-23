import React, { useState, useEffect } from 'react';
import { 
    Button, Space, Tag, Modal, Form, Input, Select, message, Tooltip
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
    PlusOutlined, EditOutlined, UserAddOutlined, UsergroupAddOutlined,
    CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/Layout/PageHeader';
import DataTable from '../../components/common/DataTable/DataTable';
import FormDrawer from '../../components/common/FormDrawer/FormDrawer';
import PageCard from '../../components/common/PageCard/PageCard';
import { APIS } from '../../services/APIS';
import http from '../../services/httpInterceptor';
import { useAuth } from '../../context/AuthContext';

interface Group {
  id: number;
  groupNumber: string;
  groupName: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  meetingDay: string;
  meetingTime: string;
  meetingFrequency: string;
  location: string;
  googlePin?: string;
  branch: string;
  branchId: number;
  creditOfficer: string;
  creditOfficerId: number;
  memberCount: number;
}

interface SelectOption {
  label: string;
  value: any;
}

const Groups: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [users, setUsers] = useState<SelectOption[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [branches, setBranches] = useState<SelectOption[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const meetingFrequencies = [
    { label: "Weekly", value: "Weekly" },
    { label: "Monthly", value: "Monthly" },
  ];

  const meetingDays = [
    { label: "Sunday", value: "Sunday" },
    { label: "Monday", value: "Monday" },
    { label: "Tuesday", value: "Tuesday" },
    { label: "Wednesday", value: "Wednesday" },
    { label: "Thursday", value: "Thursday" },
    { label: "Friday", value: "Friday" },
    { label: "Saturday", value: "Saturday" },
  ];

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
    loadBranches();
  }, [isAdmin]);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await http.get(APIS.LOAD_USERS_UNPAGINATED);
      const userOptions: SelectOption[] = response.data.map((u: any) => ({
        label: u.name,
        value: u.id,
      }));
      setUsers(userOptions);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadBranches = async () => {
    try {
      setLoadingBranches(true);
      const response = await http.get(APIS.UNPAGINATED_BRANCHES);
      const branchOptions: SelectOption[] = response.data.map((b: any) => ({
        label: b.branchName,
        value: b.id,
      }));
      setBranches(branchOptions);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to load branches');
    } finally {
      setLoadingBranches(false);
    }
  };

  const handleEdit = (group: Group) => {
    setSelectedGroup(group);
    editForm.setFieldsValue({
      groupName: group.groupName,
      meetingDay: group.meetingDay,
      meetingTime: group.meetingTime,
      meetingFrequency: group.meetingFrequency,
      location: group.location,
      googlePin: group.googlePin || '',
      creditOfficer: group.creditOfficerId,
      branch: group.branchId,
    });
    setEditModalOpen(true);
  };

  const handleApproveGroup = async (groupId: number) => {
    try {
      await http.put(`${APIS.APPROVE_GROUP}/${groupId}`);
      message.success("Group approved successfully!");
      setRefreshKey(prev => prev + 1);
    } catch (error: any) {
      message.error(
        error.response?.status === 403
          ? "Not authorized to perform this action!"
          : error.response?.data?.message || 'Failed to approve group'
      );
    }
  };

  const handleActivateDeactivateGroup = async (groupId: number, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    await http.put(`${APIS.ACTIVATE_DEACTIVATE_GROUP}/${groupId}`, { status: newStatus });
    setRefreshKey(prev => prev + 1);
  };

  const handleCreate = async (values: any) => {
    setSubmitLoading(true);
    const payload = {
      groupName: values.name,
      meetingDay: values.meetingDay,
      meetingTime: values.meetingTime,
      meetingFrequency: values.meetingFrequency,
      location: values.location,
      googlePin: values.googlePin || '',
      creditOfficer: isAdmin ? values.creditOfficer : user?.id,
    };

    const response = await http.post(APIS.CREATE_GROUP, payload);
    
    // Ask if user wants to add members
    Modal.confirm({
      title: 'Group Created!',
      content: 'Would you like to add members to this group now?',
      okText: 'Yes, Add Members',
      cancelText: 'No, Later',
      onOk: () => {
        navigate('/group/add-members', {
          state: { 
            groupId: response.data.group.id, 
            groupName: response.data.group.groupName 
          },
        });
      },
    });

    setCreateModalOpen(false);
    createForm.resetFields();
    setRefreshKey(prev => prev + 1);
    setSubmitLoading(false);
  };

  const handleUpdate = async (values: any) => {
    if (!selectedGroup) return;
    
    setSubmitLoading(true);
    const payload = {
      groupName: values.groupName,
      meetingDay: values.meetingDay,
      meetingTime: values.meetingTime,
      meetingFrequency: values.meetingFrequency,
      location: values.location,
      googlePin: values.googlePin || '',
      creditOfficerId: isAdmin ? values.creditOfficer : selectedGroup.creditOfficerId,
      branchId: values.branch || selectedGroup.branchId,
    };

    await http.put(`${APIS.UPDATE_GROUP}/${selectedGroup.id}`, payload);
    setEditModalOpen(false);
    editForm.resetFields();
    setRefreshKey(prev => prev + 1);
    setSubmitLoading(false);
  };

  const columns: ColumnsType<Group> = [
    {
      title: 'Group Code',
      dataIndex: 'groupNumber',
      key: 'groupNumber',
    },
    {
      title: 'Name',
      dataIndex: 'groupName',
      key: 'groupName',
    },
    {
      title: 'Branch',
      dataIndex: 'branch',
      key: 'branch',
    },
    {
      title: 'Credit Officer',
      dataIndex: 'creditOfficer',
      key: 'creditOfficer',
    },
    {
      title: 'Meeting Day',
      dataIndex: 'meetingDay',
      key: 'meetingDay',
    },
    {
      title: 'Member Count',
      dataIndex: 'memberCount',
      key: 'memberCount',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const config = {
          ACTIVE: { color: 'green', icon: <CheckCircleOutlined /> },
          INACTIVE: { color: 'red', icon: <CloseCircleOutlined /> },
          PENDING: { color: 'orange', icon: <ClockCircleOutlined /> },
        };
        const { color, icon } = config[status as keyof typeof config] || { color: 'default', icon: null };
        return (
          <Tag color={color} icon={icon}>
            {status}
          </Tag>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record: Group) => {
        if (isAdmin) {
          if (record.status === "PENDING" || record.status === "INACTIVE") {
            return (
              <Tooltip title="Approve Group">
                <Button
                  type="link"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleApproveGroup(record.id)}
                />
              </Tooltip>
            );
          } else if (record.status === "ACTIVE") {
            return (
              <Space>
                <Tooltip title="Add Members">
                  <Button
                    type="link"
                    icon={<UserAddOutlined />}
                    onClick={() => navigate('/group/add-members', {
                      state: { groupId: record.id, groupName: record.groupName },
                    })}
                  />
                </Tooltip>
                <Tooltip title="Edit Group">
                  <Button
                    type="link"
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(record)}
                  />
                </Tooltip>
                <Tooltip title="View Members">
                  <Button
                    type="link"
                    icon={<UsergroupAddOutlined />}
                    onClick={() => navigate('/group/members', {
                      state: { groupId: record.id, groupName: record.groupName },
                    })}
                  />
                </Tooltip>
                <Tooltip title={record.status === "ACTIVE" ? "Deactivate" : "Activate"}>
                  <Button
                    type="link"
                    danger={record.status === "ACTIVE"}
                    icon={record.status === "ACTIVE" ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
                    onClick={() => handleActivateDeactivateGroup(record.id, record.status)}
                  />
                </Tooltip>
              </Space>
            );
          }
        } else {
          const isDisabled = ["PENDING", "INACTIVE"].includes(record.status);
          return (
            <Space>
              <Tooltip title={isDisabled ? "Group not active" : "Add Members"}>
                <Button
                  type="link"
                  icon={<UserAddOutlined />}
                  disabled={isDisabled}
                  onClick={() => !isDisabled && navigate('/group/add-members', {
                    state: { groupId: record.id, groupName: record.groupName },
                  })}
                />
              </Tooltip>
              <Tooltip title={isDisabled ? "Group not active" : "View Members"}>
                <Button
                  type="link"
                  icon={<UsergroupAddOutlined />}
                  disabled={isDisabled}
                  onClick={() => !isDisabled && navigate('/group/members', {
                    state: { groupId: record.id, groupName: record.groupName },
                  })}
                />
              </Tooltip>
            </Space>
          );
        }
      },
    },
  ];

  return (
    <div>
      <PageHeader 
        title="Groups" 
        breadcrumbs={[
          { title: 'Home', path: '/' },
          { title: 'Onboarding', path: '#' },
          { title: 'Groups' }
        ]} 
      />

      <PageCard
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalOpen(true)}
          >
            Add Group
          </Button>
        }
      >
        <DataTable
          key={refreshKey}
          apiUrl={APIS.LOAD_GROUPS}
          columns={columns}
          searchPlaceholder="Search groups..."
        />
      </PageCard>

      {/* Create Group Drawer */}
      <FormDrawer
        title="Create Group"
        open={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          createForm.resetFields();
        }}
        onSubmit={handleCreate}
        loading={submitLoading}
        form={createForm}
        width={700}
      >
        <Form.Item
          name="name"
          label="Group Name"
          rules={[{ required: true, message: 'Group Name is required' }]}
        >
          <Input placeholder="Enter Group Name" />
        </Form.Item>

        <Form.Item
          name="meetingDay"
          label="Meeting Day"
          rules={[{ required: true, message: 'Meeting Day is required' }]}
        >
          <Select placeholder="Select Meeting Day" options={meetingDays} />
        </Form.Item>

        <Form.Item
          name="meetingTime"
          label="Meeting Time"
          rules={[{ required: true, message: 'Meeting Time is required' }]}
        >
          <Input type="time" placeholder="Select Meeting Time" />
        </Form.Item>

        <Form.Item
          name="meetingFrequency"
          label="Meeting Frequency"
          rules={[{ required: true, message: 'Meeting Frequency is required' }]}
        >
          <Select placeholder="Select Frequency" options={meetingFrequencies} />
        </Form.Item>

        <Form.Item
          name="location"
          label="Location"
          rules={[{ required: true, message: 'Location is required' }]}
        >
          <Input placeholder="Enter Location" />
        </Form.Item>

        <Form.Item
          name="googlePin"
          label="Google Pin (Optional)"
        >
          <Input placeholder="Enter Google Pin" />
        </Form.Item>

        {isAdmin && (
          <Form.Item
            name="creditOfficer"
            label="Credit Officer"
            rules={[{ required: true, message: 'Credit Officer is required' }]}
          >
            <Select
              placeholder="Select Credit Officer"
              options={users}
              loading={loadingUsers}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>
        )}
      </FormDrawer>

      {/* Edit Group Drawer */}
      <FormDrawer
        title={`Edit ${selectedGroup?.groupName || 'Group'}`}
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          editForm.resetFields();
        }}
        onSubmit={handleUpdate}
        loading={submitLoading}
        form={editForm}
        width={700}
      >
        <Form.Item
          name="groupName"
          label="Group Name"
          rules={[{ required: true, message: 'Group Name is required' }]}
        >
          <Input placeholder="Enter Group Name" />
        </Form.Item>

        <Form.Item
          name="meetingDay"
          label="Meeting Day"
          rules={[{ required: true, message: 'Meeting Day is required' }]}
        >
          <Select placeholder="Select Meeting Day" options={meetingDays} />
        </Form.Item>

        <Form.Item
          name="meetingTime"
          label="Meeting Time"
          rules={[{ required: true, message: 'Meeting Time is required' }]}
        >
          <Input type="time" placeholder="Select Meeting Time" />
        </Form.Item>

        <Form.Item
          name="meetingFrequency"
          label="Meeting Frequency"
          rules={[{ required: true, message: 'Meeting Frequency is required' }]}
        >
          <Select placeholder="Select Frequency" options={meetingFrequencies} />
        </Form.Item>

        <Form.Item
          name="location"
          label="Location"
          rules={[{ required: true, message: 'Location is required' }]}
        >
          <Input placeholder="Enter Location" />
        </Form.Item>

        <Form.Item
          name="googlePin"
          label="Google Pin (Optional)"
        >
          <Input placeholder="Enter Google Pin" />
        </Form.Item>

        <Form.Item
          name="branch"
          label="Branch"
          rules={[{ required: true, message: 'Branch is required' }]}
        >
          <Select
            placeholder="Select Branch"
            options={branches}
            loading={loadingBranches}
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>

        {isAdmin && (
          <Form.Item
            name="creditOfficer"
            label="Credit Officer"
            rules={[{ required: true, message: 'Credit Officer is required' }]}
          >
            <Select
              placeholder="Select Credit Officer"
              options={users}
              loading={loadingUsers}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>
        )}
      </FormDrawer>
    </div>
  );
};

export default Groups;
