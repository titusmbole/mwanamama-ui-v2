import React, { useState, useEffect } from 'react';
import { Button, Checkbox, message, Spin, Modal, Form, Input, Card, Row, Col, Skeleton } from 'antd';
import { PlusOutlined, AppstoreOutlined, CheckOutlined, SafetyOutlined } from '@ant-design/icons';
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

const ROLE_COLORS = [
  '#4a6fa5', '#5a9367', '#b8860b', '#c14953', '#d2691e', '#2f8b8b',
  '#b8679b', '#6b5b95', '#5470a8', '#c55a3a', '#7a9b57', '#6b9b6b',
  '#3d6d9c', '#6b8e5f', '#a0522d', '#b34e4e', '#8b6914', '#2e5f8f',
  '#6a4c93', '#b8763d', '#4a7c4e', '#9b4f7a', '#1e3a8a', '#697a21',
  '#a0753d', '#9a8b2e', '#2f5a5f', '#3d7c8c', '#8b4789', '#9b4f7a'
];

const getColorForRole = (roleId: number): string => {
  return ROLE_COLORS[roleId % ROLE_COLORS.length];
};

const RolesAndPermissions: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [filteredRoles, setFilteredRoles] = useState<Role[]>([]);
  const [searchText, setSearchText] = useState('');
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
      setFilteredRoles(response.data);
      
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

  const handleSearch = (value: string) => {
    setSearchText(value);
    if (!value.trim()) {
      setFilteredRoles(roles);
    } else {
      const filtered = roles.filter(role =>
        role.roleName.toLowerCase().includes(value.toLowerCase()) ||
        role.description?.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredRoles(filtered);
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

  const handleRoleChange = (role: Role) => {
    setSelectedRole(role);
    loadRolePermissions(role.id);
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
      message.success(response.data.message);
      // Reload permissions to ensure they're in sync
      loadRolePermissions(selectedRole.id);
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
        {!selectedRole ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18 }}>Select a Role</h3>
                <p style={{ margin: '4px 0 0', color: '#8c8c8c' }}>Choose a role to manage its permissions and applications</p>
              </div>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
                Add New Role
              </Button>
            </div>

            <Input.Search
              placeholder="Search roles by name or description..."
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              onSearch={handleSearch}
              style={{ marginBottom: 24, maxWidth: 400 }}
              allowClear
            />

            {loadingRoles ? (
              <Row gutter={[16, 16]}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={i}>
                    <Card
                      style={{
                        borderRadius: 12,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                      bodyStyle={{ padding: 20 }}
                    >
                      <Skeleton active paragraph={{ rows: 2 }} />
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : filteredRoles.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                <h3>No roles found</h3>
                <p>Try adjusting your search</p>
              </div>
            ) : (
              <Row gutter={[16, 16]}>
                {filteredRoles.map(role => (
                  <Col xs={24} sm={12} md={8} lg={6} key={role.id}>
                    <Card
                      hoverable
                      onClick={() => handleRoleChange(role)}
                      style={{
                        cursor: 'pointer',
                        background: getColorForRole(role.id),
                        color: 'white',
                        border: 'none',
                        borderRadius: 12,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        transition: 'all 0.3s ease',
                      }}
                      bodyStyle={{ padding: 20 }}
                      className="role-card"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <SafetyOutlined style={{ fontSize: 24 }} />
                        <h4 style={{ margin: 0, color: 'white', fontSize: 16 }}>{role.roleName}</h4>
                      </div>
                      {role.description && (
                        <p style={{ margin: 0, fontSize: 12, opacity: 0.9 }}>
                          {role.description}
                        </p>
                      )}
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18 }}>
                  <SafetyOutlined style={{ marginRight: 8 }} />
                  {selectedRole.roleName}
                </h3>
                {selectedRole.description && (
                  <p style={{ margin: '4px 0 0', color: '#8c8c8c' }}>{selectedRole.description}</p>
                )}
              </div>
              <Button onClick={() => { setSelectedRole(null); setRolePermissions([]); }}>
                Back to Roles
              </Button>
            </div>

            <div style={{ marginBottom: 24 }}>
              <strong>Permissions for {selectedRole.roleName}</strong>
            </div>

            {loadingPermissions ? (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                gap: 12,
                marginBottom: 24 
              }}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <Card
                    key={i}
                    style={{
                      padding: 12,
                      border: '1px solid #d9d9d9',
                      borderRadius: 8,
                    }}
                  >
                    <Skeleton.Button active size="small" style={{ width: '100%' }} />
                  </Card>
                ))}
              </div>
            ) : (
              <>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                  gap: 12,
                  marginBottom: 24 
                }}>
                  {allPermissions.map(permission => (
                    <div
                      key={permission.id}
                      style={{
                        padding: 12,
                        border: '1px solid #d9d9d9',
                        borderRadius: 8,
                        background: rolePermissions.includes(permission.id) ? '#f0f5ff' : 'white',
                        borderColor: rolePermissions.includes(permission.id) ? '#1890ff' : '#d9d9d9',
                        transition: 'all 0.3s',
                      }}
                    >
                      <Checkbox
                        checked={rolePermissions.includes(permission.id)}
                        onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                        style={{ width: '100%' }}
                      >
                        <span style={{ fontWeight: rolePermissions.includes(permission.id) ? 500 : 400 }}>
                          {permission.permissionName}
                        </span>
                      </Checkbox>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <Button
                    icon={<AppstoreOutlined />}
                    onClick={handleManageApps}
                    size="large"
                  >
                    Manage Applications
                  </Button>
                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    onClick={handleSavePermissions}
                    loading={submitting}
                    disabled={loadingPermissions}
                    size="large"
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

      <style>{`
        .role-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.15) !important;
        }
      `}</style>
    </div>
  );
};

export default RolesAndPermissions;
