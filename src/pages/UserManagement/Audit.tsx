import React, { useState, useMemo } from 'react';
import { 
    Typography, Card, Table, Tag, Input, Select, Row, Col, Space, DatePicker 
} from 'antd';
import { 
    HistoryOutlined, FilterOutlined, UserOutlined, ClockCircleOutlined, 
    CheckCircleOutlined, CloseCircleOutlined, PlusCircleOutlined, ExclamationCircleOutlined 
} from '@ant-design/icons';
import PageHeader from '../../components/common/Layout/PageHeader';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

// ----------------------------------------------------
// 1. DATA STRUCTURES & MOCK DATA
// ----------------------------------------------------

interface AuditLog {
    logId: string;
    timestamp: string;
    userName: string;
    actionType: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'ERROR';
    entityType: 'Loan' | 'Client' | 'User' | 'System Config';
    entityId: string;
    description: string;
}

// Mock Data
const mockAuditLogs: AuditLog[] = [
    { logId: 'AUDT001', timestamp: '2025-11-21 10:05:30', userName: 'Alex Johnson', actionType: 'LOGIN', entityType: 'System Config', entityId: 'N/A', description: 'Successful administrator login.' },
    { logId: 'AUDT002', timestamp: '2025-11-21 10:15:12', userName: 'Esther Kimani', actionType: 'CREATE', entityType: 'Client', entityId: 'CLNT502', description: 'Created new client record: Ben Kipkemboi.' },
    { logId: 'AUDT003', timestamp: '2025-11-21 10:18:45', userName: 'Esther Kimani', actionType: 'CREATE', entityType: 'Loan', entityId: 'LN9006', description: 'Approved and created loan LN9006 for CLNT502.' },
    { logId: 'AUDT004', timestamp: '2025-11-21 11:30:01', userName: 'Fatima Aden', actionType: 'UPDATE', entityType: 'Loan', entityId: 'LN9004', description: 'Updated overdue status on LN9004. Added collection note.' },
    { logId: 'AUDT005', timestamp: '2025-11-21 12:40:55', userName: 'Alex Johnson', actionType: 'DELETE', entityType: 'User', entityId: 'USR103', description: 'Suspended user account for Fatima Aden.' },
    { logId: 'AUDT006', timestamp: '2025-11-21 14:02:10', userName: 'David Mwangi', actionType: 'UPDATE', entityType: 'Client', entityId: 'CLNT501', description: 'Updated client contact details for Alice Muthoni.' },
    { logId: 'AUDT007', timestamp: '2025-11-21 15:15:15', userName: 'System', actionType: 'ERROR', entityType: 'System Config', entityId: 'N/A', description: 'Database connection failed during batch report generation.' },
    { logId: 'AUDT008', timestamp: '2025-11-21 16:20:00', userName: 'Esther Kimani', actionType: 'LOGIN', entityType: 'System Config', entityId: 'N/A', description: 'Successful loan officer login.' },
];

// Utility functions
const getActionTagProps = (actionType: string) => {
    switch (actionType) {
        case 'CREATE': return { color: 'green', icon: <PlusCircleOutlined /> };
        case 'UPDATE': return { color: 'blue', icon: <CheckCircleOutlined /> };
        case 'DELETE': return { color: 'red', icon: <CloseCircleOutlined /> };
        case 'LOGIN': return { color: 'purple', icon: <UserOutlined /> };
        case 'ERROR': return { color: 'volcano', icon: <ExclamationCircleOutlined /> };
        default: return { color: 'default', icon: null };
    }
};

const getEntityTagColor = (entityType: string) => {
    switch (entityType) {
        case 'Loan': return 'geekblue';
        case 'Client': return 'cyan';
        case 'User': return 'gold';
        case 'System Config': return 'magenta';
        default: return 'default';
    }
};

// ----------------------------------------------------
// 2. MAIN COMPONENT (Audit Log)
// ----------------------------------------------------

const Audit: React.FC = () => {
    const [filterUser, setFilterUser] = useState('');
    const [filterAction, setFilterAction] = useState('All');
    const [filterEntity, setFilterEntity] = useState('All');

    // Extract unique users, actions, and entities for filter options
    const uniqueUsers = useMemo(() => Array.from(new Set(mockAuditLogs.map(log => log.userName))), []);
    const uniqueActions = useMemo(() => Array.from(new Set(mockAuditLogs.map(log => log.actionType))), []);
    const uniqueEntities = useMemo(() => Array.from(new Set(mockAuditLogs.map(log => log.entityType))), []);

    // Memoize and apply filtering logic
    const filteredLogs = useMemo(() => {
        let data = mockAuditLogs;

        // Filter by User Name (case-insensitive partial match)
        if (filterUser) {
            const lowerCaseUser = filterUser.toLowerCase();
            data = data.filter(log => log.userName.toLowerCase().includes(lowerCaseUser));
        }

        // Filter by Action Type
        if (filterAction !== 'All') {
            data = data.filter(log => log.actionType === filterAction);
        }

        // Filter by Entity Type
        if (filterEntity !== 'All') {
            data = data.filter(log => log.entityType === filterEntity);
        }
        
        // Sorting by timestamp (newest first)
        return data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    }, [filterUser, filterAction, filterEntity]);

    const auditColumns = [
        {
            title: 'Timestamp',
            dataIndex: 'timestamp',
            key: 'timestamp',
            render: (text: string) => <Tag icon={<ClockCircleOutlined />} color="default">{text}</Tag>,
            sorter: (a: AuditLog, b: AuditLog) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        },
        {
            title: 'User',
            dataIndex: 'userName',
            key: 'userName',
            render: (text: string) => <Text strong>{text}</Text>,
        },
        {
            title: 'Action Type',
            dataIndex: 'actionType',
            key: 'actionType',
            render: (type: string) => {
                const props = getActionTagProps(type);
                return <Tag color={props.color} icon={props.icon}>{type}</Tag>;
            },
        },
        {
            title: 'Target Entity',
            dataIndex: 'entityType',
            key: 'entityType',
            render: (type: string) => <Tag color={getEntityTagColor(type)}>{type}</Tag>,
        },
        {
            title: 'Entity ID',
            dataIndex: 'entityId',
            key: 'entityId',
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            width: '30%',
            responsive: ['md'],
        },
    ];

    return (
        <div>
            <PageHeader 
                title="Audit" 
                breadcrumbs={[
                    { title: 'Audit' }
                ]} 
            />
            
            <div className="page-container p-4 min-h-screen bg-gray-50">
                <Title level={2} className="text-gray-800">
                    📜 System Activity Audit Log <HistoryOutlined style={{ color: '#555' }} />
                </Title>
                <Text type="secondary">
                View **all system events** in chronological order, including user actions and administrative changes.
            </Text>

            <Card title={<Title level={4} className="mb-0"><FilterOutlined /> Log Filters</Title>} className="mt-4 shadow-lg border-t-4 border-gray-400">
                
                <Row gutter={[16, 16]} align="middle">
                    {/* Filter by User */}
                    <Col xs={24} sm={12} lg={6}>
                        <Text strong className="block mb-1">Filter by User:</Text>
                        <Input
                            placeholder="Search User Name..."
                            prefix={<UserOutlined />}
                            allowClear
                            value={filterUser}
                            onChange={e => setFilterUser(e.target.value)}
                        />
                    </Col>
                    
                    {/* Filter by Action Type */}
                    <Col xs={24} sm={12} lg={5}>
                        <Text strong className="block mb-1">Filter by Action:</Text>
                        <Select
                            value={filterAction}
                            style={{ width: '100%' }}
                            onChange={setFilterAction}
                        >
                            <Option value="All">All Actions</Option>
                            {uniqueActions.map(action => (
                                <Option key={action} value={action}>{action}</Option>
                            ))}
                        </Select>
                    </Col>

                    {/* Filter by Target Entity */}
                    <Col xs={24} sm={12} lg={5}>
                        <Text strong className="block mb-1">Filter by Entity:</Text>
                        <Select
                            value={filterEntity}
                            style={{ width: '100%' }}
                            onChange={setFilterEntity}
                        >
                            <Option value="All">All Entities</Option>
                            {uniqueEntities.map(entity => (
                                <Option key={entity} value={entity}>{entity}</Option>
                            ))}
                        </Select>
                    </Col>

                    {/* Date Range Picker (Placeholder for real implementation) */}
                    <Col xs={24} sm={12} lg={8}>
                        <Text strong className="block mb-1">Date Range (Mock Filter):</Text>
                        <RangePicker style={{ width: '100%' }} disabled placeholder={["Start Date", "End Date"]} />
                    </Col>
                </Row>
            </Card>

            <Card title={<Title level={4} className="mb-0"><HistoryOutlined /> Audit Log ({filteredLogs.length} Records)</Title>} className="mt-4 shadow-lg border-t-4 border-blue-500">
                <Table 
                    columns={auditColumns} 
                    dataSource={filteredLogs}
                    rowKey="logId"
                    pagination={{ pageSize: 15 }}
                    size="middle"
                    scroll={{ x: 800 }} // Ensure horizontal scrolling on small screens
                />
            </Card>
            </div>
        </div>
    );
};

export default Audit;