import React, { useState, useEffect, useMemo } from 'react';
import { 
  Form, Input, Button, Table, Card, Statistic, Row, Col, message, Spin, InputNumber, Badge, Empty, Typography, Skeleton, Alert, Tabs, Modal, DatePicker
} from 'antd';
import { 
  SaveOutlined, CalendarOutlined, UserOutlined, EnvironmentOutlined,
  DollarCircleOutlined, ArrowLeftOutlined, ArrowRightOutlined, TeamOutlined, CheckOutlined, SearchOutlined, PlusOutlined, MinusOutlined, FileTextOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '../../components/common/Layout/PageHeader';
import PageCard from '../../components/common/PageCard/PageCard';
import http from '../../services/httpInterceptor';
import { APIS } from '../../services/APIS';

const { Text } = Typography;

interface Group {
  id: number;
  groupName: string;
  groupNumber: string;
  meetingDay: string;
  location: string;
  memberCount: number;
}

interface Client {
  id: number;
  fullName: string;
  clientNumber: string;
  loanId?: number;
  loanAmount?: number;
  registration_fee_balance: number;
}

interface CollectionRow extends Client {
  ekinaSavings: number;
  drawdownAccount: number;
  registration: number;
}

const CollectionSheet: React.FC = () => {
  const [form] = Form.useForm();
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [collectionData, setCollectionData] = useState<CollectionRow[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mpesaAmount, setMpesaAmount] = useState(0);
  const [mpesaCode, setMpesaCode] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCollectionForm, setShowCollectionForm] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState('collection');
  const [singleEntryGroup, setSingleEntryGroup] = useState<Group | null>(null);
  const [singleEntryMembers, setSingleEntryMembers] = useState<Client[]>([]);
  const [loadingSingleMembers, setLoadingSingleMembers] = useState(false);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Client | null>(null);
  const [depositForm] = Form.useForm();
  const [withdrawForm] = Form.useForm();
  const [registrationForm] = Form.useForm();

  const filteredGroups = useMemo(() => {
    if (!searchTerm) return groups;
    
    const term = searchTerm.toLowerCase();
    return groups.filter(group => 
      group.groupName.toLowerCase().includes(term) ||
      group.groupNumber.toLowerCase().includes(term) ||
      group.location?.toLowerCase().includes(term) ||
      group.meetingDay?.toLowerCase().includes(term)
    );
  }, [groups, searchTerm]);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    setLoadingGroups(true);
    const response = await http.get<Group[]>(APIS.LOAD_GROUPS_UNPAGINATED);
    // Add 500ms delay for skeleton loading
    await new Promise(resolve => setTimeout(resolve, 500));
    setGroups(response.data);
    setLoadingGroups(false);
  };

  const loadGroupInfo = async (groupId: number) => {
    setLoadingInfo(true);
    const response = await http.get<{ clients: Client[]; mpesaPayment?: number; mpesaCode?: string }>(
      `${APIS.LOAD_GROUPS_INFO}/${groupId}`
    );
    
    // Add 500ms delay for skeleton loading
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const initialData: CollectionRow[] = response.data.clients.map((member: Client) => ({
      ...member,
      ekinaSavings: 0,
      drawdownAccount: 0,
      registration: 0,
    }));
    
    setCollectionData(initialData);
    setMpesaAmount(response.data.mpesaPayment || 0);
    setMpesaCode(response.data.mpesaCode || '');
    setShowCollectionForm(true);
    setLoadingInfo(false);
  };

  const handleGroupSelect = (group: Group) => {
    setSelectedGroup(group);
  };

  const handleContinue = () => {
    if (!selectedGroup) {
      message.warning('Please select a group first');
      return;
    }
    loadGroupInfo(selectedGroup.id);
    // Reset form fields
    form.setFieldsValue({
      receiptNumber: '',
      chequeNumber: '',
      accountNumber: '',
      payBill: '',
      mpesaCode: '',
    });
  };

  const handleBackToGroups = () => {
    setShowCollectionForm(false);
    setSelectedGroup(null);
    setCollectionData([]);
    setMpesaAmount(0);
    setMpesaCode('');
    form.resetFields();
  };

  const loadSingleEntryMembers = async (groupId: number) => {
    setLoadingSingleMembers(true);
    const response = await http.get<Client[]>(`${APIS.GROUP_MEMBERS}/${groupId}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    setSingleEntryMembers(response.data);
    setLoadingSingleMembers(false);
  };

  const handleSingleEntryGroupSelect = (group: Group) => {
    setSingleEntryGroup(group);
    loadSingleEntryMembers(group.id);
  };

  const handleOpenDepositModal = (member: Client) => {
    setSelectedMember(member);
    setDepositModalOpen(true);
    depositForm.resetFields();
  };

  const handleOpenWithdrawModal = (member: Client) => {
    setSelectedMember(member);
    setWithdrawModalOpen(true);
    withdrawForm.resetFields();
  };

  const handleOpenRegistrationModal = (member: Client) => {
    setSelectedMember(member);
    setRegistrationModalOpen(true);
    registrationForm.resetFields();
  };

  const handleDepositSubmit = async (values: any) => {
    if (!selectedMember) return;

    const payload = {
      tranDate: values.transactionDate.format('YYYY-MM-DD'),
      amount: parseFloat(values.amount),
      paymentType: values.paymentType,
      accountType: values.accountType,
      description: values.description
    };

    await http.post(`${APIS.ADD_DEPOSIT}${selectedMember.id}`, payload);
    setDepositModalOpen(false);
    depositForm.resetFields();
    if (singleEntryGroup) {
      loadSingleEntryMembers(singleEntryGroup.id);
    }
  };

  const handleWithdrawSubmit = async (values: any) => {
    if (!selectedMember) return;

    const payload = {
      tranDate: values.transactionDate.format('YYYY-MM-DD'),
      amount: parseFloat(values.amount),
      paymentType: values.paymentType,
      accountType: values.accountType,
      description: values.description
    };

    await http.post(`${APIS.ADD_DEPOSIT}${selectedMember.id}`, payload);
    setWithdrawModalOpen(false);
    withdrawForm.resetFields();
    if (singleEntryGroup) {
      loadSingleEntryMembers(singleEntryGroup.id);
    }
  };

  const handleRegistrationSubmit = async (values: any) => {
    if (!selectedMember) return;

    const payload = {
      amount: parseFloat(values.amount)
    };

    await http.post(`${APIS.ADD_REGISTRATION_FEE}/${selectedMember.id}`, payload);
    setRegistrationModalOpen(false);
    registrationForm.resetFields();
    if (singleEntryGroup) {
      loadSingleEntryMembers(singleEntryGroup.id);
    }
  };

  const handleInputChange = (memberId: number, field: keyof CollectionRow, value: number) => {
    setCollectionData(prev =>
      prev.map(member =>
        member.id === memberId ? { ...member, [field]: value || 0 } : member
      )
    );
  };

  const totals = useMemo(() => {
    return collectionData.reduce(
      (acc, member) => ({
        ekinaSavings: acc.ekinaSavings + (member.ekinaSavings || 0),
        drawdownAccount: acc.drawdownAccount + (member.drawdownAccount || 0),
        registration: acc.registration + (member.registration || 0),
      }),
      { ekinaSavings: 0, drawdownAccount: 0, registration: 0 }
    );
  }, [collectionData]);

  const grandTotal = totals.ekinaSavings + totals.drawdownAccount + totals.registration;

  const handleSubmit = async (values: any) => {
    if (!selectedGroup) {
      message.error('Please select a group first');
      return;
    }

    if (totals.ekinaSavings === 0 && totals.drawdownAccount === 0 && totals.registration === 0) {
      message.error('Cannot post an empty collection sheet! At least one collection type must have a value.');
      return;
    }

    setSubmitting(true);
    setAlertMessage(null); // Clear any previous alerts
    
    try {
      const collectionSheetNumber = Math.floor(1000000000 + Math.random() * 9000000000);

      const collections = collectionData
        .map(member => ({
          clientId: member.id,
          savingAmount: member.ekinaSavings || 0,
          loanAmount: member.drawdownAccount || 0,
          loanId: member.loanId || null,
          registration: member.registration || 0,
        }))
        .filter(member => !(member.savingAmount === 0 && member.loanAmount === 0 && member.registration === 0));

      const payload = {
        collectionSheetNumber,
        receiptNumber: values.receiptNumber || '',
        chequeNumber: values.chequeNumber || '',
        accountNumber: values.accountNumber || '',
        payBill: values.payBill || '',
        mpesaCode: mpesaCode,
        totalSavings: totals.ekinaSavings,
        totalLoan: totals.drawdownAccount,
        totalRegistration: totals.registration,
        groupId: selectedGroup.id,
        collections,
      };

      const response = await http.post(APIS.POST_COLLECTIONS, payload);
      
      // Show success alert
      setAlertMessage({
        type: 'success',
        message: response.data.message || 'Collection sheet posted successfully'
      });

      // Reset form and reload
      form.resetFields();
      setMpesaAmount(0);
      setMpesaCode('');
      loadGroupInfo(selectedGroup.id);
    } catch (error: any) {
      // Show error alert
      setAlertMessage({
        type: 'error',
        message: error.response?.data?.message || 'Failed to save collection data'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredData = searchTerm
    ? collectionData.filter(member =>
        member.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.clientNumber?.includes(searchTerm)
      )
    : collectionData;

  const columns: ColumnsType<CollectionRow> = [
    {
      title: 'Member No.',
      dataIndex: 'clientNumber',
      key: 'clientNumber',
      width: 120,
    },
    {
      title: 'Member Name',
      dataIndex: 'fullName',
      key: 'fullName',
      width: 200,
    },
    {
      title: 'Loan Amount',
      dataIndex: 'loanAmount',
      key: 'loanAmount',
      width: 120,
      render: (amount) => amount ? `Ksh ${amount.toLocaleString()}` : '-',
    },
    {
      title: 'Ekina Savings',
      key: 'ekinaSavings',
      width: 150,
      render: (_, record) => (
        <InputNumber
          min={0}
          value={record.ekinaSavings}
          onChange={(value) => handleInputChange(record.id, 'ekinaSavings', value || 0)}
          style={{ width: '100%' }}
          prefix="Ksh"
        />
      ),
    },
    {
      title: 'Loan Repayment',
      key: 'drawdownAccount',
      width: 150,
      render: (_, record) => (
        <InputNumber
          min={0}
          value={record.drawdownAccount}
          onChange={(value) => handleInputChange(record.id, 'drawdownAccount', value || 0)}
          style={{ width: '100%' }}
          prefix="Ksh"
        />
      ),
    },
    {
      title: 'Registration',
      key: 'registration',
      width: 150,
      render: (_, record) => (
        <InputNumber
          min={0}
          value={record.registration}
          onChange={(value) => handleInputChange(record.id, 'registration', value || 0)}
          style={{ width: '100%' }}
          prefix="Ksh"
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader 
        title={showCollectionForm ? `${selectedGroup?.groupName} Collection Sheet` : 'Select a Group'}
        breadcrumbs={[
          { title: 'Collection Sheet' }
        ]} 
      />

      <PageCard>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <Tabs.TabPane tab="Collection Sheet" key="collection">
        {!showCollectionForm ? (
          <>
            {loadingGroups ? (
              <Row gutter={[16, 16]}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <Col xs={24} sm={12} md={8} lg={6} key={i}>
                    <Card>
                      <Skeleton active paragraph={{ rows: 4 }} />
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : groups.length === 0 ? (
              <Empty 
                description="No groups available"
                style={{ marginTop: '60px' }}
              />
            ) : (
              <>
                <div style={{ marginBottom: 24 }}>
                  <Input.Search
                    placeholder="Search by group name, number, location, or meeting day..."
                    prefix={<SearchOutlined />}
                    size="large"
                    allowClear
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ maxWidth: 600 }}
                  />
                </div>
                
                {filteredGroups.length === 0 ? (
                  <Empty 
                    description="No groups match your search"
                    style={{ marginTop: '60px' }}
                  />
                ) : (
                <>
                  <Row gutter={[16, 16]}>
                  {filteredGroups.map(group => (
                    <Col xs={24} sm={12} md={8} lg={6} key={group.id}>
                      <Card
                        hoverable
                        onClick={() => handleGroupSelect(group)}
                        style={{
                          borderRadius: '12px',
                          border: selectedGroup?.id === group.id 
                            ? '2px solid #1890ff' 
                            : '1px solid #e8e8e8',
                          background: selectedGroup?.id === group.id 
                            ? 'linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)' 
                            : '#ffffff',
                          boxShadow: selectedGroup?.id === group.id
                            ? '0 8px 24px rgba(24, 144, 255, 0.2)'
                            : '0 2px 8px rgba(0, 0, 0, 0.06)',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          cursor: 'pointer',
                          transform: selectedGroup?.id === group.id ? 'translateY(-4px)' : 'translateY(0)',
                        }}
                        bodyStyle={{ padding: '24px' }}
                      >
                        <div style={{ marginBottom: '16px' }}>
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'flex-start',
                            marginBottom: '4px'
                          }}>
                            <Text strong style={{ fontSize: '17px', color: '#262626', lineHeight: '24px' }}>
                              {group.groupName}
                            </Text>
                            {selectedGroup?.id === group.id && (
                              <div style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                backgroundColor: '#1890ff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}>
                                <CheckOutlined style={{ color: '#fff', fontSize: '14px' }} />
                              </div>
                            )}
                          </div>
                          <Text type="secondary" style={{ fontSize: '12px', color: '#8c8c8c' }}>
                            {group.groupNumber}
                          </Text>
                        </div>
                        
                        <div style={{ 
                          display: 'flex',
                          alignItems: 'center',
                          padding: '8px 12px',
                          backgroundColor: selectedGroup?.id === group.id ? 'rgba(24, 144, 255, 0.1)' : '#fafafa',
                          borderRadius: '8px',
                          marginBottom: '12px'
                        }}>
                          <TeamOutlined style={{ fontSize: '16px', color: '#1890ff', marginRight: '8px' }} />
                          <Badge 
                            count={group.memberCount} 
                            style={{ backgroundColor: '#1890ff' }}
                            showZero
                          />
                          <Text style={{ marginLeft: '8px', fontSize: '13px', color: '#595959', fontWeight: 500 }}>
                            Members
                          </Text>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {group.meetingDay && (
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <CalendarOutlined style={{ fontSize: '14px', marginRight: '8px', color: '#52c41a' }} />
                              <Text style={{ fontSize: '13px', color: '#595959' }}>{group.meetingDay}</Text>
                            </div>
                          )}
                          
                          {group.location && (
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <EnvironmentOutlined style={{ fontSize: '14px', marginRight: '8px', color: '#fa8c16' }} />
                              <Text style={{ fontSize: '13px', color: '#595959' }} ellipsis>
                                {group.location}
                              </Text>
                            </div>
                          )}
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
                
                <div style={{ 
                  marginTop: '32px',
                  paddingBottom: '24px',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center'
                }}>
                  <div>
                    <Button
                      type="primary"
                      size="large"
                      icon={<ArrowRightOutlined />}
                      onClick={handleContinue}
                      disabled={!selectedGroup}
                      style={{ minWidth: '180px' }}
                      iconPosition="end"
                    >
                      Continue
                    </Button>
                  </div>
                </div>
                </>
                )}
              </>
            )}
          </>
        ) : (
          loadingInfo ? (
            <>
              <Skeleton active paragraph={{ rows: 2 }} style={{ marginBottom: 24 }} />
              <Skeleton active paragraph={{ rows: 8 }} />
            </>
          ) : (
            <>
              <div style={{ marginBottom: 16 }}>
                <Button 
                  icon={<ArrowLeftOutlined />} 
                  onClick={handleBackToGroups}
                  size="large"
                >
                  Back to Groups
                </Button>
              </div>
              
              {alertMessage && (
                <Alert
                  message={alertMessage.message}
                  type={alertMessage.type}
                  showIcon
                  closable
                  onClose={() => setAlertMessage(null)}
                  style={{ marginBottom: 24 }}
                />
              )}
              
              {/* Group Info */}
              <Card style={{ marginBottom: 24, backgroundColor: '#f5f5f5' }}>
              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <UserOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                    <div>
                      <div style={{ fontWeight: 500 }}>{selectedGroup?.groupName}</div>
                      <div style={{ fontSize: 12, color: '#666' }}>
                        {selectedGroup?.memberCount} Members
                      </div>
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={8}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <CalendarOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                    <div>
                      <div style={{ fontWeight: 500 }}>Meeting Day</div>
                      <div style={{ fontSize: 12, color: '#666' }}>
                        {selectedGroup?.meetingDay}
                      </div>
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={8}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <EnvironmentOutlined style={{ fontSize: 24, color: '#fa8c16' }} />
                    <div>
                      <div style={{ fontWeight: 500 }}>Location</div>
                      <div style={{ fontSize: 12, color: '#666' }}>
                        {selectedGroup?.location}
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Totals */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col xs={24} sm={6}>
                <Card>
                  <Statistic
                    title="Ekina Savings"
                    value={totals.ekinaSavings}
                    prefix="Ksh"
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card>
                  <Statistic
                    title="Loan Repayments"
                    value={totals.drawdownAccount}
                    prefix="Ksh"
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card>
                  <Statistic
                    title="Registration Fees"
                    value={totals.registration}
                    prefix="Ksh"
                    valueStyle={{ color: '#fa8c16' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card>
                  <Statistic
                    title="Grand Total"
                    value={grandTotal}
                    prefix="Ksh"
                    valueStyle={{ color: '#cf1322', fontWeight: 'bold' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Search */}
            <Input.Search
              placeholder="Search members by name or member number..."
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ marginBottom: 16, maxWidth: 400 }}
            />

            {/* Members Table */}
            <Spin spinning={loadingInfo}>
              <Table
                columns={columns}
                dataSource={filteredData}
                rowKey="id"
                pagination={false}
                scroll={{ x: 800 }}
                bordered
              />
            </Spin>

            {/* Payment Info Form */}
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              style={{ marginTop: 24 }}
            >
              <Row gutter={16}>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item name="receiptNumber" label="Receipt Number">
                    <Input placeholder="Enter receipt number" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item name="chequeNumber" label="Cheque Number">
                    <Input placeholder="Enter cheque number" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item name="accountNumber" label="Account Number">
                    <Input placeholder="Enter account number" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item name="payBill" label="PayBill">
                    <Input placeholder="Enter paybill" />
                  </Form.Item>
                </Col>
              </Row>

              {mpesaAmount > 0 && (
                <Card style={{ marginBottom: 16, backgroundColor: '#e6f7ff' }}>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Statistic
                        title="M-Pesa Payment"
                        value={mpesaAmount}
                        prefix={<DollarCircleOutlined />}
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Col>
                    <Col span={12}>
                      <div style={{ marginTop: 8 }}>
                        <div style={{ fontSize: 14, color: '#666' }}>M-Pesa Code</div>
                        <div style={{ fontSize: 16, fontWeight: 500 }}>{mpesaCode}</div>
                      </div>
                    </Col>
                  </Row>
                </Card>
              )}

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={submitting}
                  size="large"
                >
                  Post Collection Sheet
                </Button>
              </Form.Item>
            </Form>
            </>
          )
        )}
          </Tabs.TabPane>

          <Tabs.TabPane tab="Single Entry" key="single">
            <div style={{ marginBottom: 24 }}>
              <Input.Search
                placeholder="Search by group name, number, location, or meeting day..."
                prefix={<SearchOutlined />}
                size="large"
                allowClear
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ maxWidth: 600 }}
              />
            </div>

            {loadingGroups ? (
              <Row gutter={[16, 16]}>
                {[1, 2, 3, 4].map(i => (
                  <Col xs={24} sm={12} md={8} lg={6} key={i}>
                    <Card>
                      <Skeleton active paragraph={{ rows: 4 }} />
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : filteredGroups.length === 0 ? (
              <Empty description="No groups available" />
            ) : !singleEntryGroup ? (
              <Row gutter={[16, 16]}>
                {filteredGroups.map(group => (
                  <Col xs={24} sm={12} md={8} lg={6} key={group.id}>
                    <Card
                      hoverable
                      onClick={() => handleSingleEntryGroupSelect(group)}
                      style={{
                        borderRadius: '12px',
                        border: '1px solid #e8e8e8',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        cursor: 'pointer',
                      }}
                      bodyStyle={{ padding: '24px' }}
                    >
                      <div style={{ marginBottom: '16px' }}>
                        <Text strong style={{ fontSize: '17px', color: '#262626' }}>
                          {group.groupName}
                        </Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {group.groupNumber}
                        </Text>
                      </div>
                      
                      <div style={{ marginBottom: '8px' }}>
                        <TeamOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                        <Badge count={group.memberCount} style={{ backgroundColor: '#1890ff' }} showZero />
                        <Text style={{ marginLeft: '8px', fontSize: '13px' }}>Members</Text>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <>
                <div style={{ marginBottom: 16 }}>
                  <Button 
                    icon={<ArrowLeftOutlined />} 
                    onClick={() => setSingleEntryGroup(null)}
                    size="large"
                  >
                    Back to Groups
                  </Button>
                </div>

                <Card title={`${singleEntryGroup.groupName} - Members`}>
                  {loadingSingleMembers ? (
                    <Skeleton active paragraph={{ rows: 8 }} />
                  ) : (
                    <Table
                      dataSource={singleEntryMembers}
                      rowKey="id"
                      columns={[
                        {
                          title: 'Client Name',
                          dataIndex: 'fullName',
                          key: 'fullName',
                        },
                        {
                          title: 'Client Number',
                          dataIndex: 'clientNumber',
                          key: 'clientNumber',
                        },
                        {
                          title: 'Registration Balance',
                          dataIndex: 'registration_fee_balance',
                          key: 'registration_fee_balance',
                          render: (balance: number) => (
                            <span style={{ 
                              color: balance > 0 ? '#faad14' : '#52c41a',
                              fontWeight: 500 
                            }}>
                              Ksh {balance?.toLocaleString() || 0}
                            </span>
                          ),
                        },
                        {
                          title: 'Actions',
                          key: 'actions',
                          render: (_, member) => (
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => handleOpenDepositModal(member)}
                                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                              >
                                Deposit
                              </Button>
                             
                              { member.registration_fee_balance > 0 && (
                                <Button
                                  type="primary"
                                  icon={<FileTextOutlined />}
                                  onClick={() => handleOpenRegistrationModal(member)}
                                >
                                  Registration
                                </Button>
                              )}
                            </div>
                          ),
                        },
                      ]}
                    />
                  )}
                </Card>
              </>
            )}
          </Tabs.TabPane>
        </Tabs>

        <Modal
          title="Post Deposit"
          open={depositModalOpen}
          onCancel={() => setDepositModalOpen(false)}
          footer={null}
          width={700}
        >
          <Form
            form={depositForm}
            layout="vertical"
            onFinish={handleDepositSubmit}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="transactionDate"
                  label="Transaction Date"
                  rules={[{ required: true, message: 'Please select date' }]}
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="amount"
                  label="Amount"
                  rules={[{ required: true, message: 'Please enter amount' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="Enter amount"
                    prefix="Ksh"
                    min={0}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="paymentType"
                  label="Payment Type"
                  rules={[{ required: true, message: 'Please select payment type' }]}
                >
                  <Input placeholder="e.g., Paybill" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="accountType"
                  label="Account Type"
                  rules={[{ required: true, message: 'Please select account type' }]}
                  initialValue="MSA_SAVINGS"
                >
                  <Input placeholder="MSA DOWN PAYMENT" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: 'Please enter description' }]}
            >
              <Input.TextArea rows={3} placeholder="Enter description" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Submit Deposit
              </Button>
            </Form.Item>
          </Form>
        </Modal>


        <Modal
          title="Add Registration Fee"
          open={registrationModalOpen}
          onCancel={() => setRegistrationModalOpen(false)}
          footer={null}
          width={500}
        >
          <Form
            form={registrationForm}
            layout="vertical"
            onFinish={handleRegistrationSubmit}
          >
            {selectedMember?.registration_fee_balance && (
              <Alert
                message="Remaining Balance"
                description={`Ksh ${selectedMember.registration_fee_balance.toLocaleString()}`}
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}
            <Form.Item
              name="amount"
              label="Amount"
              rules={[
                { required: true, message: 'Please enter amount' },
                {
                  validator: (_, value) => {
                    if (selectedMember?.registration_fee_balance && value > selectedMember.registration_fee_balance) {
                      return Promise.reject('Amount cannot exceed remaining balance');
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="Enter registration fee"
                prefix="Ksh"
                min={0}
                max={selectedMember?.registration_fee_balance}
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Submit Registration Fee
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </PageCard>
    </div>
  );
};

export default CollectionSheet;
