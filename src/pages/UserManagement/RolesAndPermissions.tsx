import React, { useState, useEffect } from 'react';
import { Button, Select, Checkbox, message, Spin, Modal, Form, Input } from 'antd';
import { PlusOutlined, AppstoreOutlined } from '@ant-design/icons';
import PageHeader from '../../components/common/Layout/PageHeader';
import PageCard from '../../components/common/PageCard/PageCard';
import { APIS } from '../../services/APIS';
import http from '../../services/httpInterceptor';

interface Permission {
  id: number;
  permissionName: string;
}

interface Role {
  id: number;
  roleName: string;
  description?: string;
}

const RolesAndPermissions: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [loadingRoles, setLoadingRoles] = useState(false);
  
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<number[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [appsModalOpen, setAppsModalOpen] = useState(false);
  
  const [roleApps, setRoleApps] = useState<any[]>([]);
  const [availableApps, setAvailableApps] = useState<any[]>([]);
  const [selectedApps, setSelectedApps] = useState<number[]>([]);
  
  const [createForm] = Form.useForm();

  useEffect(() => {
    loadRoles();
    loadAllPermissions();
  }, []);

  const loadRoles = async (roleIdToSelect?: number) => {
    setLoadingRoles(true);
    try {
      const response = await http.get(APIS.ROLES);
      setRoles(response.data);
      
      if (roleIdToSelect) {
        const newRole = response.data.find((r: Role) => r.id === roleIdToSelect);
        if (newRole) {
          setSelectedRole(newRole);
          loadRolePermissions(newRole.id);
        }
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to load roles');
    } finally {
      setLoadingRoles(false);
    }
  };

  const loadAllPermissions = async () => {
    try {
      const response = await http.get(APIS.ALL_PERMISSONS);
      setAllPermissions(response.data);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to load permissions');
    }
  };

  const loadRolePermissions = async (roleId: number) => {
    setLoadingPermissions(true);
    try {
      const response = await http.get(`${APIS.ROLE_PERMISSONS}${roleId}`);
      const fetchedPermissions = response.data.map((p: Permission) => p.id);
      setRolePermissions(fetchedPermissions);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to load role permissions');
      setRolePermissions([]);
    } finally {
      setLoadingPermissions(false);
    }
  };

  const handleRoleChange = (roleId: number) => {
    const role = roles.find(r => r.id === roleId);
    setSelectedRole(role || null);
    if (role) {
      loadRolePermissions(role.id);
    } else {
      setRolePermissions([]);
    }
  };

  const handlePermissionChange = (permissionId: number, checked: boolean) => {
    setRolePermissions(prev =>
      checked ? [...prev, permissionId] : prev.filter(id => id !== permissionId)
    );
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) {
      message.warning('Please select a role first');
      return;
    }

    setSubmitting(true);
    try {
      const response = await http.put(`${APIS.ROLE_PERMISSONS_UPDATE}${selectedRole.id}`, rolePermissions);
      message.success(response.data.message || 'Permissions updated successfully');
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to update permissions');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateRole = async (values: any) => {
    setSubmitting(true);
    try {
      const response = await http.post(APIS.ROLES, values);
      message.success(response.data.message || 'Role created successfully');
      setCreateModalOpen(false);
      createForm.resetFields();
      loadRoles(response.data.id);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to create role');
    } finally {
      setSubmitting(false);
    }
  };

  const handleManageApps = async () => {
    if (!selectedRole) return;

    try {
      const [roleAppsResponse, availableAppsResponse] = await Promise.all([
        http.get(`${APIS.GET_ROLE_APPS}/${selectedRole.id}`),
        http.get(APIS.GET_ALL_APPS),
      ]);
      setRoleApps(roleAppsResponse.data);
      setAvailableApps(availableAppsResponse.data);
      setSelectedApps(roleAppsResponse.data.map((app: any) => app.id));
      setAppsModalOpen(true);
    } catch (error) {
      message.error('Failed to load applications');
    }
  };

  const handleSaveApps = async () => {
    if (!selectedRole) return;

    setSubmitting(true);
    try {
      await http.post(APIS.ASSIGN_ROLE_APPS, {
        roleId: selectedRole.id,
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

  return (
    <div>
      <PageHeader 
        title="Roles & Permissions" 
        breadcrumbs={[
          { title: 'Home', path: '/' },
          { title: 'User Management', path: '#' },
          { title: 'Roles & Permissions' }
        ]} 
      />

      <PageCard>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <strong>Choose a Role</strong>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button
                icon={<AppstoreOutlined />}
                onClick={handleManageApps}
                disabled={!selectedRole}
              >
                Manage Applications
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
                Add New Role
              </Button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Select
              style={{ width: 300 }}
              value={selectedRole?.id}
              onChange={handleRoleChange}
              placeholder="Select a role"
              options={roles.map(r => ({ label: r.roleName, value: r.id }))}
            />
            {loadingRoles && <Spin size="small" />}
          </div>
        </div>

        {!selectedRole && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔑</div>
            <h3>Choose a role to continue</h3>
          </div>
        )}

        {selectedRole && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <strong>Permissions for {selectedRole.roleName}</strong>
            </div>

            {loadingPermissions ? (
              <Spin />
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 12 }}>
                  {allPermissions.map(permission => (
                    <Checkbox
                      key={permission.id}
                      checked={rolePermissions.includes(permission.id)}
                      onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                    >
                      {permission.permissionName}
                    </Checkbox>
                  ))}
                </div>

                <div style={{ marginTop: 24 }}>
                  <Button
                    type="primary"
                    onClick={handleSavePermissions}
                    loading={submitting}
                    disabled={loadingPermissions}
                  >
                    Save Permissions
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </PageCard>

      {/* Create Role Modal */}
      <Modal
        title="Add New Role"
        open={createModalOpen}
        onCancel={() => { setCreateModalOpen(false); createForm.resetFields(); }}
        onOk={() => createForm.submit()}
        confirmLoading={submitting}
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreateRole}>
          <Form.Item name="roleName" label="Role Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Manage Apps Modal */}
      <Modal
        title={`Manage Applications: ${selectedRole?.roleName}`}
        open={appsModalOpen}
        onCancel={() => setAppsModalOpen(false)}
        onOk={handleSaveApps}
        confirmLoading={submitting}
        width={600}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {availableApps.map(app => (
            <Checkbox
              key={app.id}
              checked={selectedApps.includes(app.id)}
              onChange={(e) => {
                setSelectedApps(e.target.checked 
                  ? [...selectedApps, app.id]
                  : selectedApps.filter(id => id !== app.id)
                );
              }}
            >
              {app.appName}
            </Checkbox>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default RolesAndPermissions;
