import React, { useState, useMemo } from 'react';
import { 
    Typography, Card, Table, Tag, Input, Row, Col, Tooltip, Switch, Button, Space, message
} from 'antd';
import { 
    KeyOutlined, EditOutlined,CheckOutlined, LockOutlined,SearchOutlined,UserOutlined,DeleteOutlined, UnlockOutlined, SettingOutlined, EyeOutlined, PlusOutlined 
} from '@ant-design/icons';

const { Title, Text } = Typography;

// ----------------------------------------------------
// 1. DATA STRUCTURES & MOCK DATA
// ----------------------------------------------------

interface Permission {
    module: 'Clients' | 'Loans' | 'Reports' | 'Users' | 'Audit';
    read: boolean;
    write: boolean;
    delete: boolean;
}

interface Role {
    id: number;
    name: string;
    description: string;
    permissions: Permission[];
    userCount: number;
    isCore: boolean; // Cannot be deleted
}

// Define the base permissions for each role
const mockRoles: Role[] = [
    {
        id: 1,
        name: 'Admin',
        description: 'Full, unrestricted system access and configuration rights.',
        permissions: [
            { module: 'Clients', read: true, write: true, delete: true },
            { module: 'Loans', read: true, write: true, delete: true },
            { module: 'Reports', read: true, write: true, delete: false },
            { module: 'Users', read: true, write: true, delete: true },
            { module: 'Audit', read: true, write: false, delete: false },
        ],
        userCount: 2,
        isCore: true,
    },
    {
        id: 2,
        name: 'Branch Manager',
        description: 'Oversees branch operations, client, and loan approvals within their branch.',
        permissions: [
            { module: 'Clients', read: true, write: true, delete: false },
            { module: 'Loans', read: true, write: true, delete: false },
            { module: 'Reports', read: true, write: false, delete: false },
            { module: 'Users', read: true, write: false, delete: false },
            { module: 'Audit', read: false, write: false, delete: false },
        ],
        userCount: 4,
        isCore: true,
    },
    {
        id: 3,
        name: 'Loan Officer',
        description: 'Primary role for client engagement, loan application, and disbursement.',
        permissions: [
            { module: 'Clients', read: true, write: true, delete: false },
            { module: 'Loans', read: true, write: true, delete: false },
            { module: 'Reports', read: true, write: false, delete: false },
            { module: 'Users', read: false, write: false, delete: false },
            { module: 'Audit', read: false, write: false, delete: false },
        ],
        userCount: 15,
        isCore: true,
    },
    {
        id: 4,
        name: 'Guest Viewer',
        description: 'Read-only access to basic client and report data for review purposes.',
        permissions: [
            { module: 'Clients', read: true, write: false, delete: false },
            { module: 'Loans', read: true, write: false, delete: false },
            { module: 'Reports', read: true, write: false, delete: false },
            { module: 'Users', read: false, write: false, delete: false },
            { module: 'Audit', read: false, write: false, delete: false },
        ],
        userCount: 1,
        isCore: false,
    },
];

// ----------------------------------------------------
// 2. SUPPORT COMPONENTS
// ----------------------------------------------------

/**
 * Renders the detailed permissions matrix for a single role.
 */
const ExpandedRowRender: React.FC<{ role: Role }> = ({ role }) => {
    
    // State to hold the permissions being edited (for mock saving)
    const [localPermissions, setLocalPermissions] = useState<Permission[]>(role.permissions);
    const [isEditing, setIsEditing] = useState(false);

    const handlePermissionChange = (module: string, type: 'read' | 'write' | 'delete', checked: boolean) => {
        setLocalPermissions(prev => prev.map(p => 
            p.module === module ? { ...p, [type]: checked } : p
        ) as Permission[]);
    };

    const handleSave = () => {
        // In a real app, this would be an API call to update the role permissions
        message.success(`Permissions for ${role.name} updated successfully! (Mock Save)`);
        role.permissions = localPermissions; // Update main data structure for persistence in mock
        setIsEditing(false);
    };

    const permissionColumns = [
        {
            title: 'System Module',
            dataIndex: 'module',
            key: 'module',
            render: (text: string) => <Text strong>{text}</Text>,
        },
        {
            title: 'Read Access (View Data)',
            dataIndex: 'read',
            key: 'read',
            render: (read: boolean, record: Permission) => (
                <Switch 
                    checkedChildren={<UnlockOutlined />} 
                    unCheckedChildren={<LockOutlined />} 
                    checked={read}
                    disabled={!isEditing}
                    onChange={(checked) => handlePermissionChange(record.module, 'read', checked)}
                />
            ),
            align: 'center' as const,
        },
        {
            title: 'Write Access (Create/Update)',
            dataIndex: 'write',
            key: 'write',
            render: (write: boolean, record: Permission) => (
                <Switch 
                    checkedChildren={<UnlockOutlined />} 
                    unCheckedChildren={<LockOutlined />} 
                    checked={write}
                    disabled={!isEditing || !record.read} // Write usually requires read
                    onChange={(checked) => handlePermissionChange(record.module, 'write', checked)}
                />
            ),
            align: 'center' as const,
        },
        {
            title: 'Delete Access (High Risk)',
            dataIndex: 'delete',
            key: 'delete',
            render: (del: boolean, record: Permission) => (
                <Tooltip title="Delete access is irreversible">
                    <Switch 
                        checkedChildren={<UnlockOutlined />} 
                        unCheckedChildren={<LockOutlined />} 
                        checked={del}
                        disabled={!isEditing || !record.write} // Delete usually requires write
                        danger
                        onChange={(checked) => handlePermissionChange(record.module, 'delete', checked)}
                    />
                </Tooltip>
            ),
            align: 'center' as const,
        },
    ];

    return (
        <div className="p-4 bg-gray-50 rounded-lg">
            <Row justify="space-between" align="middle" className="mb-3">
                <Col>
                    <Title level={5} className="mb-0">
                        Granular Permissions for: <Tag color="blue">{role.name}</Tag>
                    </Title>
                </Col>
                <Col>
                    {isEditing ? (
                        <Space>
                            <Button onClick={() => setIsEditing(false)}>Cancel</Button>
                            <Button type="primary" onClick={handleSave} icon={<CheckOutlined />}>Save Changes</Button>
                        </Space>
                    ) : (
                        <Button onClick={() => setIsEditing(true)} icon={<EditOutlined />} type="dashed" className="text-sm">
                            Edit Permissions
                        </Button>
                    )}
                </Col>
            </Row>
            <Table
                columns={permissionColumns}
                dataSource={localPermissions}
                rowKey="module"
                pagination={false}
                size="small"
                bordered
            />
        </div>
    );
};


// ----------------------------------------------------
// 3. MAIN COMPONENT (Roles & Permissions)
// ----------------------------------------------------

const RolesAndPermissions: React.FC = () => {
    const [roles, setRoles] = useState(mockRoles);
    const [searchText, setSearchText] = useState('');

    const filteredRoles = useMemo(() => {
        if (!searchText) return roles;
        const lowerCaseSearch = searchText.toLowerCase();
        return roles.filter(role => 
            role.name.toLowerCase().includes(lowerCaseSearch) || 
            role.description.toLowerCase().includes(lowerCaseSearch)
        );
    }, [roles, searchText]);

    const handleCreateRole = () => {
        message.info("Role Creation Modal/Form would open here.");
    };

    const roleColumns = [
        {
            title: 'Role Name',
            dataIndex: 'name',
            key: 'name',
            render: (text: string, record: Role) => (
                <Text strong className="flex items-center">
                    <KeyOutlined className="mr-2 text-blue-500" />
                    {text} 
                    {record.isCore && <Tag color="processing" className="ml-2">Core</Tag>}
                </Text>
            ),
            sorter: (a: Role, b: Role) => a.name.localeCompare(b.name),
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            width: '40%',
            responsive: ['lg'],
        },
        {
            title: 'Users Assigned',
            dataIndex: 'userCount',
            key: 'userCount',
            render: (count: number) => <Tag color="magenta" icon={<UserOutlined />}>{count}</Tag>,
            align: 'center' as const,
            sorter: (a: Role, b: Role) => a.userCount - b.userCount,
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: Role) => (
                <Space size="middle">
                    <Tooltip title="View/Edit Permissions">
                        <Button icon={<EditOutlined />} size="small" type="primary" ghost>
                            Edit
                        </Button>
                    </Tooltip>
                    {!record.isCore && (
                        <Tooltip title="Delete Custom Role">
                            <Button icon={<DeleteOutlined />} size="small" danger>
                                Delete
                            </Button>
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div className="page-container p-4 min-h-screen bg-gray-50">
            <Title level={2} className="text-gray-800">
                🔑 Roles & Permissions Management <SettingOutlined style={{ color: '#888' }} />
            </Title>
            <Text type="secondary">
                Define and manage **role-based access control (RBAC)** to ensure data security and compliance.
            </Text>

            <Card 
                title={<Title level={4} className="mb-0"><LockOutlined /> Defined System Roles</Title>} 
                className="mt-4 shadow-lg border-t-4 border-blue-500"
            >
                
                <Row gutter={[16, 16]} align="middle" className="mb-4">
                    <Col xs={24} md={12} lg={8}>
                        <Input
                            placeholder="Search Role Name or Description..."
                            prefix={<SearchOutlined />}
                            allowClear
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                            size="large"
                        />
                    </Col>
                    <Col xs={24} md={12} lg={16} className="text-right">
                        <Button type="primary" size="large" onClick={handleCreateRole} icon={<PlusOutlined />}>
                            Create New Role
                        </Button>
                    </Col>
                </Row>
                
                {/* Roles Table with Expandable Detail */}
                <Table 
                    columns={roleColumns} 
                    dataSource={filteredRoles}
                    rowKey="id"
                    pagination={false}
                    size="middle"
                    expandable={{
                        expandedRowRender: (record) => <ExpandedRowRender role={record} />,
                        rowExpandable: (record) => record.permissions.length > 0,
                        expandIcon: ({ expanded, onExpand, record }) =>
                            expanded ? (
                                <Tooltip title="Collapse Details">
                                    <EyeOutlined onClick={e => onExpand(record, e)} style={{ fontSize: 16, color: '#1890ff' }} />
                                </Tooltip>
                            ) : (
                                <Tooltip title="View Granular Permissions">
                                    <EyeOutlined onClick={e => onExpand(record, e)} style={{ fontSize: 16, color: '#999' }} />
                                </Tooltip>
                            ),
                    }}
                />
            </Card>
        </div>
    );
};

export default RolesAndPermissions;