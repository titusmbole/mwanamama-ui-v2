import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Form, Input, Select, message, Tag, Tooltip, Switch } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, EditOutlined, EyeOutlined, CheckCircleOutlined, CloseCircleOutlined, AppstoreAddOutlined } from '@ant-design/icons';
import PageHeader from '../../components/common/Layout/PageHeader';
import PageCard from '../../components/common/PageCard/PageCard';
import { APIS } from '../../services/APIS';
import http from '../../services/httpInterceptor';

interface Role {
  id: number;
  roleName: string;
}

interface Branch {
  id: number;
  branchName: string;
  branchCode: string;
}

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phoneNumber: string;
  idNo: string;
  gender: string;
  designation?: string;
  allowLogin: boolean;
  role: Role;
  branch: Branch;
  createdAt: string;
}

const Users: React.FC = () => {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [searchText, setSearchText] = useState('');
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [appsModalOpen, setAppsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const [submitting, setSubmitting] = useState(false);
  
  const [roles, setRoles] = useState<Role[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [userApps, setUserApps] = useState<any[]>([]);
  const [availableApps, setAvailableApps] = useState<any[]>([]);
  const [selectedApps, setSelectedApps] = useState<number[]>([]);
  
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  useEffect(() => {
    loadData();
    loadRoles();
    loadBranches();
  }, []);

  const loadData = async (page = 1, pageSize = 10, search = '') => {
    try {
      setLoading(true);
      const params: any = { page, size: pageSize };
      if (search) params.search = search;

      const response = await http.get(APIS.LIST_USERS, { params });
      
      if (response.data.content) {
        setData(response.data.content);
        setPagination({ current: page, pageSize, total: response.data.totalElements || 0 });
      } else {
        setData(response.data);
        setPagination({ current: 1, pageSize: 10, total: response.data.length });
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const response = await http.get(APIS.ROLES);
      setRoles(response.data);
    } catch (error) {
      message.error('Failed to load roles');
    }
  };

  const loadBranches = async () => {
    try {
      const response = await http.get(APIS.LOAD_BRANCHES);
      const branchData = Array.isArray(response.data) ? response.data : response.data.content || [];
      setBranches(branchData);
    } catch (error) {
      message.error('Failed to load branches');
    }
  };

  const handleTableChange = (newPagination: any) => {
    loadData(newPagination.current, newPagination.pageSize, searchText);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    loadData(1, pagination.pageSize, value);
  };

  const handleCreate = async (values: any) => {
    setSubmitting(true);
    try {
      await http.post(APIS.CREATE_USER, values);
      message.success('User created successfully');
      setCreateModalOpen(false);
      createForm.resetFields();
      loadData(pagination.current, pagination.pageSize, searchText);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    editForm.setFieldsValue({
      name: user.name,
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
      idNo: user.idNo,
      gender: user.gender,
      designation: user.designation,
      roleId: user.role.id,
      branchId: user.branch.id,
    });
    setEditModalOpen(true);
  };

  const handleUpdate = async (values: any) => {
    if (!selectedUser) return;
    
    setSubmitting(true);
    try {
      await http.put(`${APIS.UPDATE_USER}/${selectedUser.id}`, values);
      message.success('User updated successfully');
      setEditModalOpen(false);
      editForm.resetFields();
      loadData(pagination.current, pagination.pageSize, searchText);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to update user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await http.put(`${APIS.ACTIVATEDEACTIVATE}/${user.id}`, { allowLogin: !user.allowLogin });
      message.success(`User ${!user.allowLogin ? 'activated' : 'deactivated'} successfully`);
      loadData(pagination.current, pagination.pageSize, searchText);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleManageApps = async (user: User) => {
    setSelectedUser(user);
    try {
      const [userAppsResponse, availableAppsResponse] = await Promise.all([
        http.get(`${APIS.GET_USER_APPS}/${user.id}`),
        http.get(APIS.GET_ALL_APPS),
      ]);
      setUserApps(userAppsResponse.data);
      setAvailableApps(availableAppsResponse.data);
      setSelectedApps(userAppsResponse.data.map((app: any) => app.id));
      setAppsModalOpen(true);
    } catch (error) {
      message.error('Failed to load applications');
    }
  };

  const handleSaveApps = async () => {
    if (!selectedUser) return;

    setSubmitting(true);
    try {
      await http.post(APIS.ASSIGN_USER_APPS, {
        userId: selectedUser.id,
        appIds: selectedApps,
      });
      message.success('Applications updated successfully');
      setAppsModalOpen(false);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to update applications');
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone Number',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
    },
    {
      title: 'ID Number',
      dataIndex: 'idNo',
      key: 'idNo',
    },
    {
      title: 'Role',
      key: 'role',
      render: (_, record) => record.role?.roleName || 'N/A',
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
    },
    {
      title: 'Branch',
      key: 'branch',
      render: (_, record) => record.branch?.branchName || 'N/A',
    },
    {
      title: 'Status',
      dataIndex: 'allowLogin',
      key: 'allowLogin',
      render: (allowLogin) => (
        <Tag color={allowLogin ? 'green' : 'red'}>{allowLogin ? 'ACTIVE' : 'INACTIVE'}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Tooltip title="Edit">
            <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          <Tooltip title="View">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => { setSelectedUser(record); setViewModalOpen(true); }}
            />
          </Tooltip>
          <Tooltip title="Manage Apps">
            <Button
              type="link"
              icon={<AppstoreAddOutlined />}
              onClick={() => handleManageApps(record)}
            />
          </Tooltip>
          <Tooltip title={record.allowLogin ? 'Deactivate' : 'Activate'}>
            <Button
              type="link"
              danger={record.allowLogin}
              icon={record.allowLogin ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
              onClick={() => handleToggleStatus(record)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  const formItems = (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="username" label="Username" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="phoneNumber" label="Phone Number" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="idNo" label="ID Number" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="gender" label="Gender" rules={[{ required: true }]}>
          <Select options={[{ label: 'Male', value: 'MALE' }, { label: 'Female', value: 'FEMALE' }]} />
        </Form.Item>
        <Form.Item name="designation" label="Designation">
          <Input />
        </Form.Item>
        <Form.Item name="roleId" label="Role" rules={[{ required: true }]}>
          <Select options={roles.map(r => ({ label: r.roleName, value: r.id }))} />
        </Form.Item>
        <Form.Item name="branchId" label="Branch" rules={[{ required: true }]}>
          <Select options={branches.map(b => ({ label: b.branchName, value: b.id }))} />
        </Form.Item>
      </div>
    </>
  );

  return (
    <div>
      <PageHeader 
        title="Users" 
        breadcrumbs={[
          { title: 'Home', path: '/' },
          { title: 'User Management', path: '#' },
          { title: 'Users' }
        ]} 
      />

      <PageCard
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
            Add User
          </Button>
        }
      >
        <Input.Search
          placeholder="Search users..."
          onSearch={handleSearch}
          onChange={(e) => e.target.value === '' && handleSearch('')}
          style={{ marginBottom: 16, maxWidth: 400 }}
          allowClear
        />

        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </PageCard>

      {/* Create Modal */}
      <Modal
        title="Add User"
        open={createModalOpen}
        onCancel={() => { setCreateModalOpen(false); createForm.resetFields(); }}
        onOk={() => createForm.submit()}
        confirmLoading={submitting}
        width={800}
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreate}>
          {formItems}
          <Form.Item name="password" label="Password" rules={[{ required: true, min: 6 }]}>
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title={`Edit: ${selectedUser?.name}`}
        open={editModalOpen}
        onCancel={() => { setEditModalOpen(false); editForm.resetFields(); }}
        onOk={() => editForm.submit()}
        confirmLoading={submitting}
        width={800}
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdate}>
          {formItems}
        </Form>
      </Modal>

      {/* View Modal */}
      <Modal
        title={selectedUser?.name}
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        footer={null}
        width={700}
      >
        {selectedUser && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div><strong>Username:</strong> {selectedUser.username}</div>
            <div><strong>Email:</strong> {selectedUser.email}</div>
            <div><strong>Phone:</strong> {selectedUser.phoneNumber}</div>
            <div><strong>ID Number:</strong> {selectedUser.idNo}</div>
            <div><strong>Gender:</strong> {selectedUser.gender}</div>
            <div><strong>Designation:</strong> {selectedUser.designation || 'N/A'}</div>
            <div><strong>Role:</strong> {selectedUser.role?.roleName}</div>
            <div><strong>Branch:</strong> {selectedUser.branch?.branchName}</div>
            <div><strong>Status:</strong> <Tag color={selectedUser.allowLogin ? 'green' : 'red'}>{selectedUser.allowLogin ? 'ACTIVE' : 'INACTIVE'}</Tag></div>
            <div><strong>Created:</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}</div>
          </div>
        )}
      </Modal>

      {/* Manage Apps Modal */}
      <Modal
        title={`Manage Applications: ${selectedUser?.name}`}
        open={appsModalOpen}
        onCancel={() => setAppsModalOpen(false)}
        onOk={handleSaveApps}
        confirmLoading={submitting}
        width={600}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {availableApps.map((app) => (
            <div key={app.id} style={{ padding: 8, border: '1px solid #d9d9d9', borderRadius: 4 }}>
              <Switch
                checked={selectedApps.includes(app.id)}
                onChange={(checked) => {
                  setSelectedApps(checked 
                    ? [...selectedApps, app.id]
                    : selectedApps.filter(id => id !== app.id)
                  );
                }}
              />
              <span style={{ marginLeft: 12 }}>{app.appName}</span>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default Users;
