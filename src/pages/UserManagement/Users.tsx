import React, { useState, useEffect } from 'react';
import { Button, Table, Drawer, Form, Input, Select, message, Tag, Tooltip, Alert } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, EditOutlined, EyeOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import PageHeader from '../../components/common/Layout/PageHeader';
import PageCard from '../../components/common/PageCard/PageCard';
import FormDrawer from '../../components/common/FormDrawer/FormDrawer';
import UserDetails from '../../components/UserManagement/UserDetails';
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
  
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const [submitting, setSubmitting] = useState(false);
  const [isAdminRole, setIsAdminRole] = useState(false);
  const [createError, setCreateError] = useState<string>('');
  const [editError, setEditError] = useState<string>('');
  
  const [roles, setRoles] = useState<Role[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  
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
      const params: any = { page: page - 1, size: pageSize }; // Backend uses 0-indexed pages
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
    setCreateError('');
    try {
      // Transform payload to match backend expectations
      const payload = {
        name: values.name,
        email: values.email,
        phoneNumber: values.phoneNumber,
        role: values.role,
        designation: values.designation,
        location: values.location,
        gender: values.gender?.toUpperCase(),
        idno: values.idno,
        branch: values.branch,
      };
      
      await http.post(APIS.CREATE_USER, payload);
      message.success('User created successfully');
      setCreateDrawerOpen(false);
      createForm.resetFields();
      setCreateError('');
      loadData(pagination.current, pagination.pageSize, searchText);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create user';
      setCreateError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsAdminRole(user.role.roleName === 'ADMIN');
    editForm.setFieldsValue({
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      idno: user.idNo,
      gender: user.gender,
      designation: user.designation,
      location: (user as any).location || '',
      role: user.role.id,
      branch: user.branch?.id || null,
    });
    setEditDrawerOpen(true);
  };

  const handleUpdate = async (values: any) => {
    if (!selectedUser) return;
    
    setSubmitting(true);
    setEditError('');
    try {
      // Transform payload to match backend expectations
      const payload = {
        name: values.name,
        email: values.email,
        phoneNumber: values.phoneNumber,
        role: values.role,
        designation: values.designation,
        location: values.location,
        gender: values.gender?.toUpperCase(),
        idno: values.idno,
        branch: values.branch,
      };
      
      await http.put(`${APIS.UPDATE_USER}/${selectedUser.id}`, payload);
      message.success('User updated successfully');
      setEditDrawerOpen(false);
      editForm.resetFields();
      setEditError('');
      loadData(pagination.current, pagination.pageSize, searchText);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update user';
      setEditError(errorMessage);
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
              onClick={() => { setSelectedUser(record); setViewDrawerOpen(true); }}
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

  const handleRoleChange = (value: number, form: any) => {
    const selectedRole = roles.find(r => r.id === value);
    const isAdmin = selectedRole?.roleName === 'ADMIN';
    setIsAdminRole(isAdmin);
    
    // Clear branch if switching to ADMIN role
    if (isAdmin) {
      form.setFieldsValue({ branch: null });
    }
  };

  const formItems = (form: any, error: string) => (
    <>
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          closable
          onClose={() => form === createForm ? setCreateError('') : setEditError('')}
          style={{ marginBottom: 16 }}
        />
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Form.Item name="name" label="Name" rules={[{ required: true }]}>
          <Input placeholder="Enter Name" />
        </Form.Item>
        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
          <Input placeholder="Enter email" />
        </Form.Item>
        <Form.Item name="phoneNumber" label="Phone Number" rules={[{ required: true }]}>
          <Input placeholder="Enter phone number" />
        </Form.Item>
        <Form.Item name="idno" label="ID Number" rules={[{ required: true }]}>
          <Input placeholder="Enter ID Number" />
        </Form.Item>
        <Form.Item name="designation" label="Designation" rules={[{ required: true }]}>
          <Input placeholder="Enter Designation" />
        </Form.Item>
        <Form.Item name="location" label="Address" rules={[{ required: true }]}>
          <Input placeholder="Location" />
        </Form.Item>
        <Form.Item name="gender" label="Gender" rules={[{ required: true }]}>
          <Select 
            placeholder="Select Gender"
            options={[{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }]} 
          />
        </Form.Item>
        <Form.Item name="role" label="Role" rules={[{ required: true }]}>
          <Select 
            placeholder="Select Role"
            options={roles.map(r => ({ label: r.roleName, value: r.id }))}
            onChange={(value) => handleRoleChange(value, form)}
          />
        </Form.Item>
        {!isAdminRole && (
          <Form.Item name="branch" label="Branch">
            <Select 
              placeholder="Select Branch"
              options={branches.map(b => ({ label: b.branchName, value: b.id }))} 
            />
          </Form.Item>
        )}
      </div>
    </>
  );

  return (
    <div>
      <PageHeader 
        title="Users" 
        breadcrumbs={[
          { title: 'Users' }
        ]} 
      />

      <PageCard
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateDrawerOpen(true)}>
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

      {/* Create Drawer */}
      <FormDrawer
        title="Add User"
        open={createDrawerOpen}
        onClose={() => { setCreateDrawerOpen(false); createForm.resetFields(); setIsAdminRole(false); setCreateError(''); }}
        onSubmit={handleCreate}
        loading={submitting}
        form={createForm}
        width={800}
      >
        {formItems(createForm, createError)}
      </FormDrawer>

      {/* Edit Drawer */}
      <FormDrawer
        title={`Edit: ${selectedUser?.name}`}
        open={editDrawerOpen}
        onClose={() => { setEditDrawerOpen(false); editForm.resetFields(); setIsAdminRole(false); setEditError(''); }}
        onSubmit={handleUpdate}
        loading={submitting}
        form={editForm}
        width={800}
      >
        {formItems(editForm, editError)}
      </FormDrawer>

      {/* View Drawer */}
      <Drawer
        title={selectedUser?.name}
        placement="right"
        width={900}
        onClose={() => setViewDrawerOpen(false)}
        open={viewDrawerOpen}
      >
        {selectedUser && <UserDetails user={selectedUser} />}
      </Drawer>
    </div>
  );
};

export default Users;
