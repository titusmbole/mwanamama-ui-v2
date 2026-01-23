import React, { useState } from 'react';
import { 
    Button, Space, Tag, Modal, Tabs, Card, Row, Col, Form, Input, message, Spin
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
    PlusOutlined, EyeOutlined, EditOutlined, UserOutlined, 
    TeamOutlined, UserSwitchOutlined, CheckCircleOutlined, 
    CloseCircleOutlined 
} from '@ant-design/icons';
import PageHeader from '../../components/common/Layout/PageHeader';
import DataTable from '../../components/common/DataTable/DataTable';
import FormDrawer from '../../components/common/FormDrawer/FormDrawer';
import PageCard from '../../components/common/PageCard/PageCard';
import { APIS } from '../../services/APIS';
import http from '../../services/httpInterceptor';

interface Branch {
  id: number;
  branchCode: string;
  branchName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  operatingHours: string;
  branchStatus: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

interface BranchInfo {
  branch: Branch;
  summary: {
    managerCount: number;
    totalUsers: number;
    totalCustomers: number;
    totalGroups: number;
  };
  users: Record<string, any[]>;
  groups: any[];
  customers: any[];
}

const Branches: React.FC = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [branchInfo, setBranchInfo] = useState<BranchInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const handleView = async (branch: Branch) => {
    setSelectedBranch(branch);
    setViewModalOpen(true);
    setLoading(true);
    try {
      const response = await http.get(`${APIS.BRANCH_INFO}${branch.id}/info`);
      setBranchInfo(response.data);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch branch info');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (branch: Branch) => {
    setSelectedBranch(branch);
    editForm.setFieldsValue(branch);
    setEditModalOpen(true);
  };

  const handleCreate = async (values: any) => {
    setSubmitLoading(true);
    try {
      const response = await http.post(APIS.CREATE_BRANCH, values);
      message.success(response.data.message || 'Branch created successfully');
      setCreateModalOpen(false);
      createForm.resetFields();
      setRefreshKey(prev => prev + 1);
    } catch (error: any) {
      message.error(
        error.response?.status === 403 
          ? 'Not authorized to perform this action!' 
          : error.response?.data?.message || 'Failed to create branch'
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleUpdate = async (values: any) => {
    if (!selectedBranch) return;
    
    setSubmitLoading(true);
    try {
      const response = await http.put(`${APIS.UPDATE_BRANCH}/${selectedBranch.id}`, values);
      message.success(response.data.message || 'Branch updated successfully');
      setEditModalOpen(false);
      editForm.resetFields();
      setRefreshKey(prev => prev + 1);
    } catch (error: any) {
      message.error(
        error.response?.status === 403 
          ? 'Not authorized to perform this action!' 
          : error.response?.data?.message || 'Failed to update branch'
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const columns: ColumnsType<Branch> = [
    {
      title: 'Branch Name',
      dataIndex: 'branchName',
      key: 'branchName',
      render: (text: string, record: Branch) => (
        <span>
          {text}
          {record.branchCode === "0001" && " (Head Office)"}
        </span>
      ),
    },
    {
      title: 'Branch Code',
      dataIndex: 'branchCode',
      key: 'branchCode',
    },
    {
      title: 'City',
      dataIndex: 'city',
      key: 'city',
    },
    {
      title: 'Postal Code',
      dataIndex: 'postalCode',
      key: 'postalCode',
    },
    {
      title: 'Operating Hours',
      dataIndex: 'operatingHours',
      key: 'operatingHours',
    },
    {
      title: 'Street',
      dataIndex: 'street',
      key: 'street',
    },
    {
      title: 'Status',
      dataIndex: 'branchStatus',
      key: 'branchStatus',
      render: (status: string) => (
        <Tag color={status === 'ACTIVE' ? 'green' : 'red'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record: Branch) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          />
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader 
        title="Branches" 
        breadcrumbs={[
          { title: 'Home', path: '/' },
          { title: 'Onboarding', path: '#' },
          { title: 'Branches' }
        ]} 
      />

      <PageCard
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalOpen(true)}
          >
            Add Branch
          </Button>
        }
      >
        <DataTable
          key={refreshKey}
          apiUrl={APIS.LOAD_BRANCHES}
          columns={columns}
          searchPlaceholder="Search branches..."
        />
      </PageCard>

      {/* Create Branch Drawer */}
      <FormDrawer
        title="Create Branch"
        open={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          createForm.resetFields();
        }}
        onSubmit={handleCreate}
        loading={submitLoading}
        form={createForm}
      >
        <Form.Item
          name="branchName"
          label="Branch Name"
          rules={[{ required: true, message: 'Branch Name is required' }]}
        >
          <Input placeholder="Enter Branch Name" />
        </Form.Item>

        <Form.Item
          name="street"
          label="Street"
          rules={[{ required: true, message: 'Street is required' }]}
        >
          <Input placeholder="Enter street name" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="city"
              label="City"
              rules={[{ required: true, message: 'City is required' }]}
            >
              <Input placeholder="Enter city name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="state"
              label="State"
              rules={[{ required: true, message: 'State is required' }]}
            >
              <Input placeholder="Enter state name" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="postalCode"
              label="Postal Code"
              rules={[{ required: true, message: 'Postal Code is required' }]}
            >
              <Input placeholder="Enter Postal code" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="operatingHours"
              label="Operating Hours"
              rules={[{ required: true, message: 'Operating Hours are required' }]}
            >
              <Input placeholder="e.g., 8AM - 5PM" />
            </Form.Item>
          </Col>
        </Row>
      </FormDrawer>

      {/* Edit Branch Drawer */}
      <FormDrawer
        title="Edit Branch"
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          editForm.resetFields();
        }}
        onSubmit={handleUpdate}
        loading={submitLoading}
        form={editForm}
      >
        <Form.Item
          name="branchName"
          label="Branch Name"
          rules={[{ required: true, message: 'Branch Name is required' }]}
        >
          <Input placeholder="Enter Branch Name" />
        </Form.Item>

        <Form.Item
          name="street"
          label="Street"
          rules={[{ required: true, message: 'Street is required' }]}
        >
          <Input placeholder="Enter street name" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="city"
              label="City"
              rules={[{ required: true, message: 'City is required' }]}
            >
              <Input placeholder="Enter city name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="state"
              label="State"
              rules={[{ required: true, message: 'State is required' }]}
            >
              <Input placeholder="Enter state name" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="postalCode"
              label="Postal Code"
              rules={[{ required: true, message: 'Postal Code is required' }]}
            >
              <Input placeholder="Enter Postal code" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="operatingHours"
              label="Operating Hours"
              rules={[{ required: true, message: 'Operating Hours are required' }]}
            >
              <Input placeholder="e.g., 8AM - 5PM" />
            </Form.Item>
          </Col>
        </Row>
      </FormDrawer>

      {/* View Branch Info Modal */}
      <Modal
        title={loading ? "Loading..." : `Branch Info: ${branchInfo?.branch?.branchName || ''}`}
        open={viewModalOpen}
        onCancel={() => {
          setViewModalOpen(false);
          setBranchInfo(null);
        }}
        width={900}
        footer={null}
      >
        {loading ? (
          <Spin size="large" style={{ display: 'block', textAlign: 'center', padding: '50px' }} />
        ) : branchInfo ? (
          <div>
            {/* Summary Stats */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={6}>
                <Card>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
                      {branchInfo.summary.managerCount}
                    </div>
                    <div style={{ fontSize: 12, color: '#8c8c8c' }}>Managers</div>
                  </div>
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
                      {branchInfo.summary.totalUsers}
                    </div>
                    <div style={{ fontSize: 12, color: '#8c8c8c' }}>Total Users</div>
                  </div>
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 'bold', color: '#722ed1' }}>
                      {branchInfo.summary.totalCustomers}
                    </div>
                    <div style={{ fontSize: 12, color: '#8c8c8c' }}>Total Customers</div>
                  </div>
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 'bold', color: '#fa8c16' }}>
                      {branchInfo.summary.totalGroups}
                    </div>
                    <div style={{ fontSize: 12, color: '#8c8c8c' }}>Total Groups</div>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Branch Details */}
            <Card title="Branch Details" style={{ marginBottom: 16 }}>
              <Row gutter={[16, 16]}>
                <Col span={12}><strong>Name:</strong> {branchInfo.branch.branchName}</Col>
                <Col span={12}><strong>Code:</strong> {branchInfo.branch.branchCode}</Col>
                <Col span={12}><strong>City:</strong> {branchInfo.branch.city}</Col>
                <Col span={12}><strong>Street:</strong> {branchInfo.branch.street}</Col>
                <Col span={12}><strong>Postal Code:</strong> {branchInfo.branch.postalCode}</Col>
                <Col span={12}><strong>Created:</strong> {new Date(branchInfo.branch.createdAt).toLocaleDateString()}</Col>
              </Row>
            </Card>

            {/* Tabbed Content */}
            <Tabs defaultActiveKey="users">
              <Tabs.TabPane
                tab={
                  <span>
                    <UserOutlined />
                    Users ({branchInfo.summary.totalUsers})
                  </span>
                }
                key="users"
              >
                <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                  {Object.entries(branchInfo.users).map(([role, users]: [string, any]) => (
                    <div key={role} style={{ marginBottom: 16 }}>
                      <h4>{role} ({users.length})</h4>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        {users.map((user: any) => (
                          <Card key={user.id} size="small">
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <div>
                                <div><strong>{user.name}</strong></div>
                                <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                                  {user.email} | {user.phone}
                                </div>
                              </div>
                              <Tag color={user.status === 'A' ? 'green' : 'red'}>
                                {user.status === 'A' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                                {user.status === 'A' ? 'Active' : 'Inactive'}
                              </Tag>
                            </div>
                          </Card>
                        ))}
                      </Space>
                    </div>
                  ))}
                </div>
              </Tabs.TabPane>

              <Tabs.TabPane
                tab={
                  <span>
                    <TeamOutlined />
                    Groups ({branchInfo.groups.length})
                  </span>
                }
                key="groups"
              >
                <Row gutter={[16, 16]}>
                  {branchInfo.groups.map((group: any) => (
                    <Col span={12} key={group.id}>
                      <Card size="small">
                        <div><strong>{group.groupName}</strong></div>
                        <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                          Code: {group.groupCode}
                        </div>
                        <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                          <UserOutlined /> {group.memberCount} members
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Tabs.TabPane>

              <Tabs.TabPane
                tab={
                  <span>
                    <UserSwitchOutlined />
                    Customers ({branchInfo.customers.length})
                  </span>
                }
                key="customers"
              >
                <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {branchInfo.customers.map((customer: any) => (
                      <Card key={customer.id} size="small">
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <div>
                            <div><strong>{customer.fullName}</strong></div>
                            <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                              <TeamOutlined /> Group: {customer.groupName}
                            </div>
                            <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                              Phone: {customer.phone} | ID: {customer.clientNumber}
                            </div>
                          </div>
                          <Tag color={customer.status === 'ACTIVE' ? 'green' : 'red'}>
                            {customer.status === 'ACTIVE' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                            {customer.status}
                          </Tag>
                        </div>
                      </Card>
                    ))}
                  </Space>
                </div>
              </Tabs.TabPane>
            </Tabs>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '50px', color: '#8c8c8c' }}>
            No data available
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Branches;