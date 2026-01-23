import React, { useState, useMemo } from 'react';
import { 
    Typography, Card, Row, Col, Table, Tag, Input, Select, Button, 
    Descriptions, Divider, Space, Statistic
} from 'antd';
import { 
    TeamOutlined, SearchOutlined, UserOutlined, MailOutlined, PhoneOutlined, 
    HomeOutlined, CalendarOutlined, EyeOutlined, ArrowLeftOutlined, SolutionOutlined, CheckCircleOutlined, SyncOutlined
} from '@ant-design/icons';
import PageHeader from '../../components/common/Layout/PageHeader';

const { Title, Text } = Typography;
const { Option } = Select;

// ----------------------------------------------------
// 1. DATA STRUCTURES & MOCK DATA
// ----------------------------------------------------

interface User {
    id: number;
    name: string;
    email: string;
    role: 'Admin' | 'Loan Officer' | 'Branch Manager' | 'System Auditor';
    branch: string;
    status: 'Active' | 'Suspended' | 'On Leave';
    phoneNumber: string;
    hireDate: string; // YYYY-MM-DD
    loanPortfolioValue?: number; // For L.O.s
}

const mockUsers: User[] = [
    { id: 101, name: 'Esther Kimani', email: 'esther.k@mfi.com', role: 'Loan Officer', branch: 'Central Market Hub', status: 'Active', phoneNumber: '0712 345 678', hireDate: '2023-01-15', loanPortfolioValue: 8500000 },
    { id: 102, name: 'David Mwangi', email: 'david.m@mfi.com', role: 'Branch Manager', branch: 'East Side Business', status: 'Active', phoneNumber: '0722 987 654', hireDate: '2022-05-20', loanPortfolioValue: 0 },
    { id: 103, name: 'Fatima Aden', email: 'fatima.a@mfi.com', role: 'Loan Officer', branch: 'West Field Outreach', status: 'Suspended', phoneNumber: '0733 112 233', hireDate: '2024-03-10', loanPortfolioValue: 4100000 },
    { id: 104, name: 'Alex Johnson', email: 'alex.j@mfi.com', role: 'Admin', branch: 'Head Office', status: 'Active', phoneNumber: '0744 556 677', hireDate: '2021-11-01', loanPortfolioValue: 0 },
    { id: 105, name: 'Ben Carter', email: 'ben.c@mfi.com', role: 'Loan Officer', branch: 'East Side Business', status: 'On Leave', phoneNumber: '0755 889 900', hireDate: '2023-08-22', loanPortfolioValue: 6200000 },
    { id: 106, name: 'Charles Ndungu', email: 'charles.n@mfi.com', role: 'Loan Officer', branch: 'Central Market Hub', status: 'Active', phoneNumber: '0766 221 100', hireDate: '2024-01-05', loanPortfolioValue: 7900000 },
    { id: 107, name: 'Grace Mwai', email: 'grace.m@mfi.com', role: 'System Auditor', branch: 'Head Office', status: 'Active', phoneNumber: '0777 889 911', hireDate: '2024-06-01', loanPortfolioValue: 0 },
];

// Utility functions
const formatCurrency = (amount: number | undefined) => amount ? `KSh ${amount.toLocaleString('en-KE')}` : 'N/A';

const getStatusTagProps = (status: string) => {
    switch (status) {
        case 'Active': return { color: 'green', icon: <CheckCircleOutlined /> };
        case 'Suspended': return { color: 'red', icon: <SyncOutlined spin /> };
        case 'On Leave': return { color: 'blue', icon: <CalendarOutlined /> };
        default: return { color: 'default', icon: null };
    }
};

const getRoleTagColor = (role: string) => {
    switch (role) {
        case 'Admin': return 'volcano';
        case 'Branch Manager': return 'purple';
        case 'Loan Officer': return 'geekblue';
        case 'System Auditor': return 'cyan';
        default: return 'default';
    }
};

// ----------------------------------------------------
// 2. SUPPORT COMPONENT (Detail View)
// ----------------------------------------------------

const UserDetailView: React.FC<{ user: User, onBack: () => void }> = ({ user, onBack }) => {

    return (
        <div className="page-container p-4 min-h-screen bg-gray-50">
            <Button 
                onClick={onBack} 
                icon={<ArrowLeftOutlined />} 
                type="dashed"
                className="mb-4"
            >
                Back to User List
            </Button>
            
            <Title level={2} className="text-gray-800 flex items-center">
                <UserOutlined style={{ marginRight: 8, color: getRoleTagColor(user.role) }} /> User Profile: {user.name}
            </Title>
            <Text type="secondary" className="block mb-4">
                Employee ID: <Tag color="default">{user.id}</Tag> | Status: <Tag {...getStatusTagProps(user.status)}>{user.status}</Tag>
            </Text>

            <Row gutter={[16, 16]} className="mt-4">
                {/* Section 1: Contact & Role */}
                <Col xs={24} lg={8}>
                    <Card title="Contact & Role Info" className="h-full border-t-4 border-blue-500 shadow-md">
                        <Descriptions column={1} bordered size="small">
                            <Descriptions.Item label="Full Name"><UserOutlined /> {user.name}</Descriptions.Item>
                            <Descriptions.Item label="System Role">
                                <Tag color={getRoleTagColor(user.role)} icon={<SolutionOutlined />}>{user.role}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Phone"><PhoneOutlined /> {user.phoneNumber}</Descriptions.Item>
                            <Descriptions.Item label="Email"><MailOutlined /> {user.email}</Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Col>

                {/* Section 2: Employment Details */}
                <Col xs={24} lg={8}>
                    <Card title="Employment Details" className="h-full border-t-4 border-purple-500 shadow-md">
                        <Descriptions column={1} bordered size="small">
                            <Descriptions.Item label="Branch"><HomeOutlined /> {user.branch}</Descriptions.Item>
                            <Descriptions.Item label="Hire Date"><CalendarOutlined /> {user.hireDate}</Descriptions.Item>
                            <Descriptions.Item label="User Status">
                                <Tag {...getStatusTagProps(user.status)}>{user.status}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Last Activity">2025-11-20 14:30</Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Col>
                
                {/* Section 3: Performance/Portfolio (Conditional) */}
                <Col xs={24} lg={8}>
                    <Card title="Performance Snapshot" className="h-full border-t-4 border-green-500 shadow-md">
                        {user.role === 'Loan Officer' ? (
                            <Statistic
                                title="Active Loan Portfolio Value"
                                value={user.loanPortfolioValue}
                                formatter={formatCurrency}
                                valueStyle={{ color: '#3f8600' }}
                            />
                        ) : (
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <Text type="secondary">
                                    <HomeOutlined /> This user does not manage a direct loan portfolio.
                                </Text>
                            </div>
                        )}
                        <Divider />
                        <Space direction="vertical" className="w-full">
                            <Button type="primary" block>Edit User Details</Button>
                            <Button type="dashed" danger block>Suspend Account</Button>
                        </Space>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};


// ----------------------------------------------------
// 3. MAIN COMPONENT (Users List)
// ----------------------------------------------------

const Users: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Memoize data to handle filtering
  const filteredUsers = useMemo(() => {
    let data = mockUsers;

    // 1. Filter by Role
    if (selectedRole !== 'All') {
        data = data.filter(user => user.role === selectedRole);
    }

    // 2. Filter by Search Text (Name, Email, or ID)
    if (searchText) {
        const lowerCaseSearch = searchText.toLowerCase();
        data = data.filter(user =>
            user.name.toLowerCase().includes(lowerCaseSearch) ||
            user.email.toLowerCase().includes(lowerCaseSearch) ||
            user.id.toString().includes(lowerCaseSearch)
        );
    }

    return data;
  }, [selectedRole, searchText]);

  // Handler to view user details
  const handleViewUser = (record: User) => {
    setSelectedUser(record);
  };


  const userColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      sorter: (a: User, b: User) => a.id - b.id,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong>{text}</Text>
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => <Tag color={getRoleTagColor(role)}>{role}</Tag>,
      filters: Array.from(new Set(mockUsers.map(u => u.role))).map(role => ({ text: role, value: role })),
      onFilter: (value: any, record: User) => record.role.indexOf(value as string) === 0,
    },
    {
      title: 'Branch',
      dataIndex: 'branch',
      key: 'branch',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag {...getStatusTagProps(status)}>{status}</Tag>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: User) => (
          <Button 
              type="link" 
              onClick={() => handleViewUser(record)} 
              icon={<EyeOutlined />}
              className="p-0"
          >
              View Profile
          </Button>
      ),
    },
  ];

  // Conditional Rendering: Show detail view if a loan is selected
  if (selectedUser) {
    return <UserDetailView user={selectedUser} onBack={() => setSelectedUser(null)} />;
  }


  // Main User List View
  return (
    <div>
      <PageHeader 
        title="Users" 
        breadcrumbs={[
          { title: 'Users' }
        ]} 
      />
      
      <div className="page-container p-4 min-h-screen bg-gray-50">
        <Title level={2} className="text-gray-800">
          👥 System User Management <TeamOutlined style={{ color: '#888' }} />
        </Title>
        <Text type="secondary">
          Manage and view data for **all system users**, their roles, and current operational status.
        </Text>

      <Card title={<Title level={4} className="mb-0"><SolutionOutlined /> User Directory</Title>} className="mt-4 shadow-lg border-t-4 border-gray-400">
        
        {/* Filter and Search Controls */}
        <Row gutter={[16, 16]} align="middle" className="mb-4">
            <Col xs={24} md={10} lg={6}>
                <Input
                    placeholder="Search Name, Email or ID"
                    prefix={<SearchOutlined />}
                    allowClear
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    size="large"
                />
            </Col>
            <Col xs={24} md={8} lg={6}>
                <Select
                    value={selectedRole}
                    style={{ width: '100%' }}
                    onChange={setSelectedRole}
                    size="large"
                >
                    <Option value="All">Filter by: All Roles</Option>
                    {Array.from(new Set(mockUsers.map(u => u.role))).map(role => (
                        <Option key={role} value={role}>{role}</Option>
                    ))}
                </Select>
            </Col>
            <Col xs={24} md={6} lg={12} className="text-right">
                <Text type="secondary">Showing {filteredUsers.length} active users/profiles.</Text>
            </Col>
        </Row>
        
        {/* User Table */}
        <Table 
            columns={userColumns} 
            dataSource={filteredUsers}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            size="middle"
        />
      </Card>
      </div>
    </div>
  );
};

export default Users;