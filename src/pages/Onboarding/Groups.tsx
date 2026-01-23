import React, { useState, useEffect, useCallback } from 'react';
import { 
    Table, Button, Typography, Space, Row, Col, Input, 
    Card, Skeleton, Modal, Form, Select, Tag, message, DatePicker, Tabs, Upload, Divider, Drawer, Descriptions, Statistic 
} from 'antd';
import { 
    PlusOutlined, SearchOutlined, EditOutlined, TeamOutlined, 
    CheckCircleOutlined, UploadOutlined, FileTextOutlined,
    BarChartOutlined, SolutionOutlined, UserOutlined, PhoneOutlined, SafetyOutlined, CalendarOutlined
} from '@ant-design/icons';
import type { FormProps } from 'antd';
import dayjs from 'dayjs'; 
import PageHeader from '../../components/common/Layout/PageHeader';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

// 🛑 Placeholder for API Endpoints 
const BASE_URL = "http://api.truetana.com/v1";
const APIS = {
  // ... existing APIs
  CREATE_GROUP: `${BASE_URL}/groups/create`,
  UPDATE_GROUP: `${BASE_URL}/groups/update`,
};

// ----------------------------------------------------
// 1. DATA STRUCTURES
// ----------------------------------------------------

interface Group {
  key: string;
  id: number;
  groupCode: string; 
  name: string;
  branch: string;
  creditOfficer: string;
  meetingDay: string;
  memberCount: number;
  status: 'Pending' | 'Approved' | 'Active' | 'Inactive';
  location: string;
  meetingTime: string;
  frequency: string;
  totalSavings: number;
  totalLoansDisbursed: number;
  totalDrawdownAmount: number;
  averageClientPerformance: number; 
}

interface Member {
    id: number;
    name: string;
    phone: string;
    idNumber: string;
    gender: 'MALE' | 'FEMALE';
    location: string;
    dateOfBirth: dayjs.Dayjs | null;
    nextOfKinName: string;
    nextOfKinID: string;
    nextOfKinPhone: string;
    savings: number;
    loanBalance: number;
    drawdownCount: number;
    performanceScore: number; 
    loanHistory: { date: string, amount: number, status: string }[];
}

// Sample data for the table
const initialGroupData: Group[] = [
    { key: '1', id: 101, groupCode: 'G001', name: 'Unity Savings Circle', branch: 'Main Headquarters', creditOfficer: 'Alex Johnson', meetingDay: 'Monday', memberCount: 15, status: 'Active', location: 'Central Market', meetingTime: '14:00', frequency: 'Weekly', totalSavings: 550000, totalLoansDisbursed: 1200000, totalDrawdownAmount: 350000, averageClientPerformance: 92 },
    { key: '2', id: 102, groupCode: 'G002', name: 'Growth Investors Team', branch: 'East District Office', creditOfficer: 'Ben Carter', meetingDay: 'Friday', memberCount: 11, status: 'Approved', location: 'West Suburb Hall', meetingTime: '10:30', frequency: 'Bi-Weekly', totalSavings: 320000, totalLoansDisbursed: 800000, totalDrawdownAmount: 150000, averageClientPerformance: 85 },
    { key: '3', id: 103, groupCode: 'G003', name: 'Future Builders Co-op', branch: 'West Field Branch', creditOfficer: 'Clara Davis', meetingDay: 'Wednesday', memberCount: 22, status: 'Pending', location: 'Northside Church', meetingTime: '16:00', frequency: 'Monthly', totalSavings: 780000, totalLoansDisbursed: 1800000, totalDrawdownAmount: 550000, averageClientPerformance: 98 },
];

const mockMembers: Member[] = [
    { id: 1, name: 'John Doe', phone: '0711223344', idNumber: '30000001', gender: 'MALE', location: 'Kasarani', dateOfBirth: dayjs('1990-01-15'), nextOfKinName: 'Jane Doe', nextOfKinID: '12345', nextOfKinPhone: '0711111111', savings: 50000, loanBalance: 15000, drawdownCount: 3, performanceScore: 95, loanHistory: [{ date: '2023-01-01', amount: 10000, status: 'Completed' }, { date: '2023-05-15', amount: 25000, status: 'Active' }] },
    { id: 2, name: 'Mary Wanjiku', phone: '0722334455', idNumber: '30000002', gender: 'FEMALE', location: 'Ruiru', dateOfBirth: dayjs('1985-05-20'), nextOfKinName: 'Peter Wanja', nextOfKinID: '12346', nextOfKinPhone: '0722222222', savings: 35000, loanBalance: 0, drawdownCount: 1, performanceScore: 99, loanHistory: [{ date: '2024-02-01', amount: 30000, status: 'Completed' }] },
    { id: 3, name: 'Peter Omondi', phone: '0733445566', idNumber: '30000003', gender: 'MALE', location: 'Thika', dateOfBirth: dayjs('1995-11-01'), nextOfKinName: 'Esther Omondi', nextOfKinID: '12347', nextOfKinPhone: '0733333333', savings: 15000, loanBalance: 25000, drawdownCount: 5, performanceScore: 88, loanHistory: [{ date: '2023-12-01', amount: 5000, status: 'Completed' }, { date: '2024-06-10', amount: 25000, status: 'Active' }] },
];

// Utility functions
const formatCurrency = (amount: number) => `KSh ${amount.toLocaleString('en-KE')}`;
const getPerformanceColor = (score: number) => score > 90 ? 'green' : score > 75 ? 'blue' : 'orange';

// ----------------------------------------------------
// 2. LOGICALLY SEPARATED COMPONENTS (src/pages/Groups/*)
// ----------------------------------------------------


// --- START: src/pages/Groups/MemberProfileDrawer.tsx ---
const MemberProfileDrawer: React.FC<{ visible: boolean, member: Member | null, onClose: () => void }> = ({ visible, member, onClose }) => {
    if (!member) return null;

    return (
        <Drawer
            title={<Space><UserOutlined /> Member Profile: {member.name}</Space>}
            width={450}
            onClose={onClose}
            open={visible}
            maskClosable={true}
        >
            <Title level={4}>Personal Details</Title>
            <Descriptions bordered column={1} size="small" layout="horizontal">
                <Descriptions.Item label="ID Number">{member.idNumber}</Descriptions.Item>
                <Descriptions.Item label="Phone"><PhoneOutlined style={{ marginRight: 8 }} />{member.phone}</Descriptions.Item>
                <Descriptions.Item label="Gender">{member.gender}</Descriptions.Item>
                <Descriptions.Item label="Location">{member.location}</Descriptions.Item>
                <Descriptions.Item label="Date of Birth"><CalendarOutlined style={{ marginRight: 8 }} />{member.dateOfBirth?.format('YYYY-MM-DD')}</Descriptions.Item>
            </Descriptions>

            <Divider orientation="left" plain>Next of Kin Details</Divider>
            <Descriptions bordered column={1} size="small" layout="horizontal">
                <Descriptions.Item label="Kin Name">{member.nextOfKinName}</Descriptions.Item>
                <Descriptions.Item label="Kin ID">{member.nextOfKinID}</Descriptions.Item>
                <Descriptions.Item label="Kin Phone">{member.nextOfKinPhone}</Descriptions.Item>
            </Descriptions>

            <Divider orientation="left" plain>Financial Summary</Divider>
            <Card style={{ backgroundColor: '#e6f7ff', border: '1px solid #91d5ff' }}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Statistic title="Total Savings" value={member.savings} prefix="KSh" formatter={formatCurrency} />
                    </Col>
                    <Col span={12}>
                        <Statistic title="Current Loan Balance" value={member.loanBalance} prefix="KSh" valueStyle={{ color: member.loanBalance > 0 ? '#fa541c' : '#52c41a' }} formatter={formatCurrency} />
                    </Col>
                </Row>
                <Row gutter={16} style={{ marginTop: 16 }}>
                    <Col span={12}>
                        <Statistic title="Drawdown Count" value={member.drawdownCount} />
                    </Col>
                    <Col span={12}>
                        <Statistic 
                            title="Performance Score" 
                            value={member.performanceScore} 
                            suffix="%" 
                            valueStyle={{ color: getPerformanceColor(member.performanceScore) }} 
                        />
                    </Col>
                </Row>
            </Card>

            <Divider orientation="left" plain>Loan History ({member.loanHistory.length})</Divider>
            <Table
                dataSource={member.loanHistory}
                size="small"
                pagination={false}
                rowKey="date"
                columns={[
                    { title: 'Date', dataIndex: 'date', key: 'date' },
                    { title: 'Amount', dataIndex: 'amount', key: 'amount', render: formatCurrency },
                    { title: 'Status', dataIndex: 'status', key: 'status', render: (status) => <Tag color={status === 'Completed' ? 'green' : 'red'}>{status.toUpperCase()}</Tag> },
                ]}
            />
            
        </Drawer>
    );
};
// --- END: src/pages/Groups/MemberProfileDrawer.tsx ---


// --- START: src/pages/Groups/GroupFormModal.tsx ---
const GroupFormModal: React.FC<{ visible: boolean, group: Group | null, onClose: () => void, onGroupSaved: () => void, initialGroups: Group[] }> = ({ visible, group, onClose, onGroupSaved, initialGroups }) => {
    const [form] = Form.useForm();
    const [modalLoading, setModalLoading] = useState(false);
    const isEditing = !!group;

    useEffect(() => {
        if (visible) {
            form.resetFields();
            if (group) {
                // Populate form fields, converting time string to dayjs object
                form.setFieldsValue({
                    ...group,
                    meetingTime: group.meetingTime ? dayjs(group.meetingTime, 'HH:mm') : null,
                });
            } else {
                // Generate a new code for creation
                const maxId = initialGroups.reduce((max, g) => Math.max(max, g.id), 0);
                const newCode = `G${String(maxId + 1).padStart(3, '0')}`;
                form.setFieldsValue({ groupCode: newCode, status: 'Pending', memberCount: 0 });
            }
        }
    }, [visible, group, form, initialGroups]);


    const handleSaveGroup = () => {
        form.validateFields()
            .then(async (values) => {
                setModalLoading(true);
                const isEditing = !!group;
                const endpoint = isEditing ? APIS.UPDATE_GROUP : APIS.CREATE_GROUP;

                const payload = {
                    ...values,
                    meetingTime: values.meetingTime ? dayjs(values.meetingTime).format('HH:mm') : null,
                    id: isEditing ? group!.id : undefined,
                };
                
                try {
                    console.log(`[API Call to ${endpoint}] Saving Group (${isEditing ? 'UPDATE' : 'CREATE'}):`, payload);
                    await new Promise(resolve => setTimeout(resolve, 800)); 
                    
                    message.success(`Group ${isEditing ? 'updated' : 'created'} successfully!`);
                    onClose();
                    onGroupSaved(); 
                } catch (error) {
                    message.error(`Failed to save group.`);
                } finally {
                    setModalLoading(false);
                }
            })
            .catch(info => {
                message.warning('Please complete all required fields.');
            });
    };
    
    return (
        <Modal
            title={isEditing ? `Edit Group: ${group?.name}` : "Add New Group"}
            open={visible}
            onOk={handleSaveGroup}
            onCancel={onClose}
            confirmLoading={modalLoading}
            okButtonProps={{ disabled: modalLoading }}
            destroyOnClose={true} 
            width={600}
        >
            {modalLoading ? <Skeleton active paragraph={{ rows: 5 }} /> : (
                <Form form={form} layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Group Code" name="groupCode" rules={[{ required: true }]} tooltip="Unique identifier for the group.">
                                <Input disabled={isEditing} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Group Name" name="name" rules={[{ required: true, message: 'Please enter the group name' }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item label="Location" name="location" rules={[{ required: true, message: 'Please enter the meeting location' }]}>
                        <Input />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item label="Meeting Day" name="meetingDay" rules={[{ required: true, message: 'Select a day' }]}>
                                <Select placeholder="Select Day">
                                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (<Option key={day} value={day}>{day}</Option>))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="Meeting Time" name="meetingTime" rules={[{ required: true, message: 'Select time' }]}>
                                <DatePicker.TimePicker format="HH:mm" style={{ width: '100%' }} minuteStep={15} /> 
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="Frequency" name="frequency" rules={[{ required: true, message: 'Select frequency' }]}>
                                <Select placeholder="Frequency">
                                    <Option value="Weekly">Weekly</Option>
                                    <Option value="Bi-Weekly">Bi-Weekly</Option>
                                    <Option value="Monthly">Monthly</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item label="Credit Officer" name="creditOfficer" rules={[{ required: true, message: 'Select officer' }]}>
                        <Select placeholder="Select Officer">
                            <Option value="Alex Johnson">Alex Johnson</Option>
                            <Option value="Ben Carter">Ben Carter</Option>
                            <Option value="Clara Davis">Clara Davis</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="Branch" name="branch" rules={[{ required: true, message: 'Select branch' }]}>
                        <Select placeholder="Select Branch">
                            <Option value="Main Headquarters">Main Headquarters</Option>
                            <Option value="East District Office">East District Office</Option>
                            <Option value="West Field Branch">West Field Branch</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="id" hidden><Input /></Form.Item>
                    <Form.Item name="status" hidden><Input /></Form.Item>
                </Form>
            )}
        </Modal>
    );
};
// --- END: src/pages/Groups/GroupFormModal.tsx ---


// --- START: src/pages/Groups/GroupDetailsDrawer.tsx ---
const GroupDetailsDrawer: React.FC<{ visible: boolean, group: Group | null, onClose: () => void }> = ({ visible, group, onClose }) => {
    if (!group) return null;

    return (
        <Drawer
            title={<Space><BarChartOutlined /> Group Performance Summary: {group.name}</Space>}
            width={600}
            onClose={onClose}
            open={visible}
            maskClosable={true}
        >
            <Title level={4}>Financial Overview</Title>
            <Row gutter={16}>
                <Col span={8}>
                    <Statistic title="Total Savings" value={group.totalSavings} prefix="KSh" precision={0} formatter={formatCurrency} />
                </Col>
                <Col span={8}>
                    <Statistic title="Loans Disbursed" value={group.totalLoansDisbursed} prefix="KSh" precision={0} formatter={formatCurrency} />
                </Col>
                <Col span={8}>
                    <Statistic title="Drawdowns Total" value={group.totalDrawdownAmount} prefix="KSh" precision={0} formatter={formatCurrency} />
                </Col>
            </Row>

            <Divider />
            
            <Title level={4}>Operational Details</Title>
            <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="Group Code">{group.groupCode}</Descriptions.Item>
                <Descriptions.Item label="Status"><Tag color={group.status === 'Active' ? 'green' : 'red'}>{group.status.toUpperCase()}</Tag></Descriptions.Item>
                <Descriptions.Item label="Credit Officer">{group.creditOfficer}</Descriptions.Item>
                <Descriptions.Item label="Member Count">{group.memberCount}</Descriptions.Item>
                <Descriptions.Item label="Meeting Details">{`${group.meetingDay}s at ${group.meetingTime} (${group.frequency})`}</Descriptions.Item>
                <Descriptions.Item label="Location">{group.location}</Descriptions.Item>
            </Descriptions>

            <Divider />

            <Title level={4}>Risk & Performance</Title>
            <Card style={{ backgroundColor: '#f9f9f9' }}>
                <Row>
                    <Col span={12}>
                        <Statistic 
                            title="Avg. Client Performance" 
                            value={group.averageClientPerformance} 
                            suffix="%" 
                            valueStyle={{ color: getPerformanceColor(group.averageClientPerformance) }} 
                        />
                    </Col>
                    <Col span={12}>
                        <Statistic 
                            title="Portfolio at Risk (PAR)" 
                            value={8.5} // Mock data
                            suffix="%" 
                            valueStyle={{ color: 'red' }} 
                        />
                    </Col>
                </Row>
            </Card>
        </Drawer>
    );
};
// --- END: src/pages/Groups/GroupDetailsDrawer.tsx ---


// --- START: src/pages/Groups/ViewMembersDrawer.tsx ---
const ViewMembersDrawer: React.FC<{ visible: boolean, group: Group | null, onClose: () => void }> = ({ visible, group, onClose }) => {
    if (!group) return null;

    const [memberSearch, setMemberSearch] = useState('');
    const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
    const [selectedMemberForProfile, setSelectedMemberForProfile] = useState<Member | null>(null);

    // In a real application, you'd fetch members here based on group.id
    const allMembers: Member[] = mockMembers.map(m => ({ ...m, key: m.id.toString() }));
    
    const filteredMembers = allMembers.filter(m => 
        m.name.toLowerCase().includes(memberSearch.toLowerCase()) || 
        m.idNumber.includes(memberSearch)
    );

    const handleViewProfile = (member: Member) => {
        setSelectedMemberForProfile(member);
        setIsProfileDrawerOpen(true);
    };

    const memberColumns = [
        { title: 'Name', dataIndex: 'name', key: 'name', width: 150, render: (text: string) => <Space><UserOutlined />{text}</Space> },
        { title: 'Savings', dataIndex: 'savings', key: 'savings', render: (text: number) => formatCurrency(text), sorter: (a: Member, b: Member) => a.savings - b.savings },
        { title: 'Loan Balance', dataIndex: 'loanBalance', key: 'loanBalance', render: (text: number) => <span style={{ color: text > 0 ? '#fa541c' : '#52c41a' }}>{formatCurrency(text)}</span>, sorter: (a: Member, b: Member) => a.loanBalance - b.loanBalance },
        { 
            title: 'Performance', 
            dataIndex: 'performanceScore', 
            key: 'performanceScore', 
            render: (text: number) => (<Tag color={getPerformanceColor(text)}>{text}%</Tag>),
            sorter: (a: Member, b: Member) => a.performanceScore - b.performanceScore
        },
        { 
            title: 'Action', 
            key: 'action', 
            render: (_: any, record: Member) => (
                <Button type="link" size="small" icon={<SolutionOutlined />} onClick={() => handleViewProfile(record)}>View Profile</Button>
            )
        },
    ];

    return (
        <>
            <Drawer
                title={<Space><TeamOutlined /> Members List: {group.name} ({group.memberCount} total)</Space>}
                width={850}
                onClose={onClose}
                open={visible}
                maskClosable={true}
            >
                <Text type="secondary" style={{ marginBottom: 15, display: 'block' }}>
                    Below is the list of members in this group along with a summary of their individual savings and loan performance.
                </Text>
                
                <Input 
                    placeholder="Search members by name or ID" 
                    prefix={<SearchOutlined />} 
                    style={{ marginBottom: 15, width: 300 }}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    value={memberSearch}
                />

                <Table 
                    columns={memberColumns} 
                    dataSource={filteredMembers} 
                    pagination={{ pageSize: 5 }} 
                    size="small"
                    rowKey="id"
                />
            </Drawer>
            
            {/* Nested Drawer for Member Profile */}
            <MemberProfileDrawer
                visible={isProfileDrawerOpen}
                member={selectedMemberForProfile}
                onClose={() => {
                    setIsProfileDrawerOpen(false);
                    setSelectedMemberForProfile(null);
                }}
            />
        </>
    );
};
// --- END: src/pages/Groups/ViewMembersDrawer.tsx ---


// --- START: src/pages/Groups/AddMembersModal.tsx ---
// Helper component for Bulk Import
const BulkImportSection: React.FC = () => {
    const handleBulkUpload = async (file: File) => {
        message.loading({ content: 'Uploading members data...', key: 'uploadKey' });
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            message.success({ content: 'Bulk upload successful! 50 members processed.', key: 'uploadKey' });
        } catch (error) {
            message.error({ content: 'Bulk upload failed. Check file format.', key: 'uploadKey' });
        }
    };

    const dummyRequest = ({ file, onSuccess }: any) => {
        setTimeout(() => { onSuccess("ok"); handleBulkUpload(file); }, 0);
    };

    return (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Text>For adding large numbers of members (10+), use the bulk import feature.</Text>
            <Card style={{ border: '1px solid #d9d9d9' }}>
                <Title level={5} style={{ marginBottom: 16 }}>Instructions</Title>
                <ol className="text-sm space-y-2">
                    <li><FileTextOutlined style={{ marginRight: 8 }} />Download the <a href="#" onClick={(e) => e.preventDefault()} className="text-blue-500">Member Template File (CSV/XLSX)</a>.</li>
                    <li>Fill in required columns: `Name`, `Phone`, `ID Number`, `Gender`, and `Date of Birth`.</li>
                    <li>Upload the prepared file below.</li>
                </ol>
            </Card>
            <Upload customRequest={dummyRequest} accept=".csv, .xlsx" maxCount={1}>
                <Button icon={<UploadOutlined />} type="default" size="large" style={{ width: '100%' }}>Click to Upload Member File</Button>
            </Upload>
        </Space>
    );
}

// Helper component for Single Entry Form
const SingleEntryForm: React.FC<{ form: any }> = ({ form }) => {
    return (
        <Form form={form} layout="vertical" initialValues={{ members: [{}] }}>
            <Form.List name="members">
                {(fields, { add, remove }) => (
                    <>
                        {fields.map((field, index) => (
                            <Card 
                                size="small" key={field.key} style={{ marginBottom: 16, backgroundColor: '#f9f9f9' }}
                                title={<Text strong>Member Details ({index + 1})</Text>}
                                extra={fields.length > 1 ? (<Button type="link" danger icon={<PlusOutlined />} onClick={() => remove(field.name)} title="Remove Member" size="small">Remove</Button>) : null}
                            >
                                <Row gutter={16}>
                                    <Col span={12}><Form.Item {...field} name={[field.name, 'name']} label="Name" rules={[{ required: true }]}><Input size="small" /></Form.Item></Col>
                                    <Col span={12}><Form.Item {...field} name={[field.name, 'phone']} label="Phone" rules={[{ required: true }, { pattern: /^\d+$/, message: 'Digits only' }]}><Input size="small" /></Form.Item></Col>
                                </Row>
                                <Row gutter={16}>
                                    <Col span={8}><Form.Item {...field} name={[field.name, 'idNumber']} label="ID Number" rules={[{ required: true }]}><Input size="small" /></Form.Item></Col>
                                    <Col span={8}>
                                        <Form.Item {...field} name={[field.name, 'gender']} label="Gender" rules={[{ required: true }]}>
                                            <Select placeholder="Select Gender" size="small"><Option value="MALE">MALE</Option><Option value="FEMALE">FEMALE</Option></Select>
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}><Form.Item {...field} name={[field.name, 'dateOfBirth']} label="Date of Birth" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" size="small" /></Form.Item></Col>
                                </Row>
                                <Divider style={{ margin: '8px 0' }} orientation="left" plain><Text type="secondary" style={{fontSize: '0.8em'}}>Next of Kin (Optional)</Text></Divider>
                                <Row gutter={16}>
                                    <Col span={8}><Form.Item {...field} name={[field.name, 'nextOfKinName']} label="Kin Name"><Input size="small" /></Form.Item></Col>
                                    <Col span={8}><Form.Item {...field} name={[field.name, 'nextOfKinID']} label="Kin ID"><Input size="small" /></Form.Item></Col>
                                    <Col span={8}><Form.Item {...field} name={[field.name, 'nextOfKinPhone']} label="Kin Phone"><Input size="small" /></Form.Item></Col>
                                </Row>
                            </Card>
                        ))}
                        <Form.Item>
                            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>Add Another Member</Button>
                        </Form.Item>
                    </>
                )}
            </Form.List>
        </Form>
    );
}

const AddMembersModal: React.FC<{ visible: boolean, group: Group | null, onClose: () => void, onMembersAdded: () => void }> = ({ visible, group, onClose, onMembersAdded }) => {
    const [form] = Form.useForm();
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('single');

    const handleSaveMembers = () => {
        if (activeTab === 'bulk') {
            message.info('Please use the upload button in the Bulk Import tab.');
            onClose();
            return;
        }

        form.validateFields()
            .then(async (values) => {
                if (!group || !values.members || values.members.length === 0) return;

                const memberData = values.members.map((member: Member) => ({
                    ...member,
                    dateOfBirth: member.dateOfBirth ? member.dateOfBirth.format('YYYY-MM-DD') : null,
                }));
                
                setIsSaving(true);
                try {
                    console.log(`[API Call] Adding ${memberData.length} members to group ${group.name}`);
                    await new Promise(resolve => setTimeout(resolve, 1500)); 
                    
                    message.success(`${memberData.length} members added successfully to ${group.name}.`);
                    form.resetFields();
                    onClose();
                    onMembersAdded(); 
                } catch (error) {
                    message.error(`Failed to add members to group.`);
                } finally {
                    setIsSaving(false);
                }
            })
            .catch(info => {
                message.warning('Please review the form for required fields and validation errors.');
            });
    };
    
    useEffect(() => {
        if (visible) {
            form.setFieldsValue({ members: [{}] });
            setActiveTab('single');
        }
    }, [visible, form]);

    const memberCount = form.getFieldValue('members')?.length || 0;

    return (
        <Modal
            title={`Add Members to Group: ${group?.name || 'N/A'}`}
            open={visible}
            onOk={handleSaveMembers}
            onCancel={onClose}
            confirmLoading={isSaving && activeTab === 'single'}
            okText={activeTab === 'single' ? `Add ${memberCount} Member${memberCount !== 1 ? 's' : ''}` : 'Close'}
            okButtonProps={{ disabled: activeTab === 'bulk' && isSaving }}
            width={750}
            destroyOnClose={true} 
        >
            <Tabs defaultActiveKey="single" activeKey={activeTab} onChange={setActiveTab} style={{ marginTop: -10 }}>
                <TabPane tab={<Space><UserOutlined /> Single/Batch Entry</Space>} key="single">
                    <SingleEntryForm form={form} />
                </TabPane>
                <TabPane tab={<Space><UploadOutlined /> Bulk Import</Space>} key="bulk">
                    <BulkImportSection />
                </TabPane>
            </Tabs>
        </Modal>
    );
};
// --- END: src/pages/Groups/AddMembersModal.tsx ---


// ----------------------------------------------------
// 3. MAIN COMPONENT (src/pages/Groups.tsx)
// ----------------------------------------------------

const Groups: React.FC = () => {
    const [pageLoading, setPageLoading] = useState(true);
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false); 
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false); 
    const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false); 
    const [isMembersDrawerOpen, setIsMembersDrawerOpen] = useState(false); 
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [allGroups, setAllGroups] = useState<Group[]>([]);
    const [filteredData, setFilteredData] = useState<Group[]>([]);

    const fetchGroups = useCallback(async () => {
        setPageLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            const updatedData: Group[] = initialGroupData.map(g => ({ ...g })); 
            setAllGroups(updatedData);
            setFilteredData(updatedData);
        } catch (error) {
            message.error('Failed to load groups.');
        } finally {
            setPageLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGroups();
    }, [fetchGroups]);

    // --- Handlers for Modals/Drawers ---

    const handleOpenGroupModal = (group: Group | null) => {
        setSelectedGroup(group);
        setIsGroupModalOpen(true);
    };
    
    const handleCloseGroupModal = () => {
        setIsGroupModalOpen(false);
        setSelectedGroup(null);
    };
    
    const openAddMembersModal = (group: Group) => {
        setSelectedGroup(group);
        setIsAddMemberModalOpen(true);
    };

    const closeAddMembersModal = () => {
        setIsAddMemberModalOpen(false);
        setSelectedGroup(null);
    };

    const openDetailsDrawer = (group: Group) => {
        setSelectedGroup(group);
        setIsDetailsDrawerOpen(true);
    };

    const closeDetailsDrawer = () => {
        setIsDetailsDrawerOpen(false);
        setSelectedGroup(null);
    };

    const openMembersDrawer = (group: Group) => {
        setSelectedGroup(group);
        setIsMembersDrawerOpen(true);
    };

    const closeMembersDrawer = () => {
        setIsMembersDrawerOpen(false);
        setSelectedGroup(null);
    };


    // --- Other Actions ---

    const handleSearch = (value: string) => {
        const searchTerm = value.toLowerCase().trim();
        if (!searchTerm) {
            setFilteredData(allGroups);
            return;
        }

        const newFilteredData = allGroups.filter((group) => (
            group.name.toLowerCase().includes(searchTerm) ||
            group.groupCode.toLowerCase().includes(searchTerm) ||
            group.creditOfficer.toLowerCase().includes(searchTerm) ||
            group.branch.toLowerCase().includes(searchTerm)
        ));
        setFilteredData(newFilteredData);
    };

    const handleGroupStatusChange = async (group: Group, action: 'approve' | 'activate' | 'deactivate') => {
        let newStatus: Group['status'];
        if (action === 'approve') newStatus = 'Approved';
        else if (action === 'activate') newStatus = 'Active';
        else if (action === 'deactivate') newStatus = 'Inactive';
        else return;

        try {
            message.loading(`Updating status for ${group.name}...`, 0.5);
            await new Promise(resolve => setTimeout(resolve, 500)); 
            message.success(`Group ${group.name} status updated to ${newStatus}.`);
            
            const newGroups = allGroups.map(g => 
                g.id === group.id ? { ...g, status: newStatus } : g
            );
            setAllGroups(newGroups);
            setFilteredData(newGroups.filter(g => filteredData.some(f => f.id === g.id)));

        } catch (error) {
            message.error(`Failed to perform status change on group ${group.name}.`);
        }
    };


    // ------------------- Column Definition -------------------

    const getStatusTag = (status: Group['status']) => {
        switch (status) {
            case 'Active': return <Tag color="green">ACTIVE</Tag>;
            case 'Approved': return <Tag color="blue">APPROVED</Tag>;
            case 'Pending': return <Tag color="orange">PENDING</Tag>;
            case 'Inactive': return <Tag color="red">INACTIVE</Tag>;
            default: return <Tag>{status}</Tag>;
        }
    };

    const actionColumns: FormProps['columns'] = [
        { title: 'Code', dataIndex: 'groupCode', key: 'groupCode', width: 100 },
        { title: 'Name', dataIndex: 'name', key: 'name', width: 200 },
        { title: 'Officer', dataIndex: 'creditOfficer', key: 'creditOfficer' },
        { title: 'Members', dataIndex: 'memberCount', key: 'memberCount', sorter: (a: Group, b: Group) => a.memberCount - b.memberCount, width: 90 },
        { title: 'Status', dataIndex: 'status', key: 'status', render: getStatusTag, width: 120 },
        {
            title: 'Actions',
            key: 'actions',
            width: 300,
            render: (_, record: Group) => (
                <Space size="small">
                    {/* View Group Details (Drawer) */}
                    <Button icon={<BarChartOutlined />} onClick={() => openDetailsDrawer(record)} type="text" title="View Group Performance & Details" style={{ color: '#1890ff' }} />
                    
                    {/* View Members (Drawer) */}
                    <Button icon={<TeamOutlined />} onClick={() => openMembersDrawer(record)} type="text" title="View Member List and Summary" />

                    {/* Add Group Members (Modal) */}
                    <Button icon={<UserOutlined />} onClick={() => openAddMembersModal(record)} type="text" title="Add Group Members" />

                    {/* Edit Group (Modal) */}
                    <Button icon={<EditOutlined />} onClick={() => handleOpenGroupModal(record)} type="text" title="Edit Group Details" />

                    {/* CONTEXTUAL STATUS BUTTONS */}
                    {record.status === 'Pending' && (
                        <Button 
                            icon={<CheckCircleOutlined />} 
                            onClick={() => handleGroupStatusChange(record, 'approve')}
                            type="text"
                            title="Approve Group"
                            style={{ color: 'blue' }}
                        />
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div>
            <PageHeader 
                title="Groups" 
                breadcrumbs={[
                    { title: 'Groups' }
                ]} 
            />
            
            <div className="page-container p-4">
                <Title level={2}>🧑‍🤝‍🧑 Groups Management</Title>
                <Text type="secondary">View, manage, and approve customer groups for lending operations.</Text>
            
            <Card style={{ marginTop: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <Search
                        placeholder="Search by name, code, officer, or branch"
                        onSearch={handleSearch}
                        style={{ width: 400 }}
                        enterButton={<SearchOutlined />}
                        disabled={pageLoading} 
                    />
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenGroupModal(null)} disabled={pageLoading}>
                        Create New Group
                    </Button>
                </div>
                
                {pageLoading ? <Skeleton active title={false} paragraph={{ rows: 5 }} /> : (
                    <Table 
                        columns={actionColumns} 
                        dataSource={filteredData} 
                        pagination={{ pageSize: 10 }}
                        scroll={{ x: 1000 }}
                        rowKey="id"
                    />
                )}
            </Card>

            {/* Modals and Drawers (Implemented above as separate functional components) */}
            <GroupFormModal
                visible={isGroupModalOpen}
                group={selectedGroup}
                onClose={handleCloseGroupModal}
                onGroupSaved={fetchGroups}
                initialGroups={allGroups}
            />
            
            <AddMembersModal
                visible={isAddMemberModalOpen}
                group={selectedGroup}
                onClose={closeAddMembersModal}
                onMembersAdded={fetchGroups}
            />

            <GroupDetailsDrawer
                visible={isDetailsDrawerOpen}
                group={selectedGroup}
                onClose={closeDetailsDrawer}
            />

            <ViewMembersDrawer
                visible={isMembersDrawerOpen}
                group={selectedGroup}
                onClose={closeMembersDrawer}
            />
            </div>
        </div>
    );
};

export default Groups;