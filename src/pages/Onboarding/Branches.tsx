import React, { useState, useEffect, useCallback } from 'react';
import { 
    Table, Button, Typography, Space, Row, Col, Input, 
    Card, Skeleton, Modal, Select, TimePicker, Tag, Tabs, Statistic, message 
} from 'antd';
import { PlusOutlined, SearchOutlined, EyeOutlined, EditOutlined, UserOutlined, TeamOutlined, ShoppingOutlined } from '@ant-design/icons';
import type { TabsProps } from 'antd';
import dayjs from 'dayjs';
import PageHeader from '../../components/common/Layout/PageHeader';

const BASE_URL = "http://api.truetana.com/v1";
export const APIS = {
  CREATE_BRANCH: `${BASE_URL}/branches/create`,
  LOAD_BRANCHES: `${BASE_URL}/branches/list`,
  UPDATE_BRANCH: `${BASE_URL}/branches/update`,
};

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

interface Branch {
  key: string;
  id: number;
  code: string;
  name: string;
  street: string; 
  city: string; 
  state: string; 
  postalCode: string; 
  operatingHours: string; 
  clients: number;
  status: 'Active' | 'Inactive'; 
  createdDate: string; 
}

const initialBranchData: Branch[] = []; 

const generateNewBranchCode = (currentData: Branch[]): string => {
    const existingCodes = currentData
        .map(branch => parseInt(branch.code, 10))
        .filter(num => !isNaN(num));
    const maxCode = existingCodes.length > 0 ? Math.max(...existingCodes) : 0;
    const newCode = maxCode + 1;
    return newCode.toString().padStart(4, '0');
};

interface BranchInfoModalProps {
    visible: boolean;
    onClose: () => void;
    branch: Branch | null;
}

const BranchInfoModal: React.FC<BranchInfoModalProps> = ({ visible, onClose, branch }) => {
    if (!branch) return null;

    const items: TabsProps['items'] = [
        { 
            key: '1', 
            label: <Space><UserOutlined /> <span style={{ display: window.innerWidth > 640 ? 'inline' : 'none' }}>Users (4)</span><span style={{ display: window.innerWidth <= 640 ? 'inline' : 'none' }}>4</span></Space>, 
            children: (
                <div>
                    <Text strong>STOREKEEPER (2)</Text>
                    <Card size="small" style={{ marginTop: 8 }}><Text>Clementine Bahati</Text></Card>
                    <Card size="small" style={{ marginTop: 8 }}><Text>Suleiman Bonaya</Text></Card>
                    <Text strong style={{ display: 'block', marginTop: 16 }}>STAFF (2)</Text>
                    <Card size="small" style={{ marginTop: 8 }}><Text>Dennis Mutuku Kyalo</Text></Card>
                </div>
            ) 
        },
        { 
            key: '2', 
            label: <Space><TeamOutlined /> <span style={{ display: window.innerWidth > 640 ? 'inline' : 'none' }}>Groups (23)</span><span style={{ display: window.innerWidth <= 640 ? 'inline' : 'none' }}>23</span></Space>, 
            children: (
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}><Card size="small">SMART MKOMANI (11 members)</Card></Col>
                    <Col xs={24} sm={12}><Card size="small">LULU WOMEN GROUP (11 members)</Card></Col>
                    <Col xs={24} sm={12}><Card size="small">BIDII GROUP FANJUA (9 members)</Card></Col>
                    <Col xs={24} sm={12}><Card size="small">NGANGARI WOMEN GROUP FANJUA (12 members)</Card></Col>
                </Row>
            )
        },
        { 
            key: '3', 
            label: <Space><ShoppingOutlined /> <span style={{ display: window.innerWidth > 640 ? 'inline' : 'none' }}>Customers (217)</span><span style={{ display: window.innerWidth <= 640 ? 'inline' : 'none' }}>217</span></Space>, 
            children: (
                <div>
                    <Card size="small" style={{ backgroundColor: '#e9fbe9', marginBottom: 8 }}>
                      <Space style={{ width: '100%', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                        <Text strong>BAHATI TWAIBI ABDI</Text>
                        <Tag color="green">ACTIVE</Tag>
                      </Space>
                    </Card>
                    <Card size="small" style={{ backgroundColor: '#e9fbe9', marginBottom: 8 }}>
                      <Space style={{ width: '100%', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                        <Text strong>NAMKULI HALAKO KOMORA</Text>
                        <Tag color="green">ACTIVE</Tag>
                      </Space>
                    </Card>
                    <Card size="small" style={{ backgroundColor: '#e9fbe9' }}>
                      <Space style={{ width: '100%', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                        <Text strong>AMINA HAMADAWA MOHAMED</Text>
                        <Tag color="green">ACTIVE</Tag>
                      </Space>
                    </Card>
                </div>
            ) 
        },
    ];

    return (
        <Modal
            title={<Title level={4} style={{ margin: 0, fontSize: window.innerWidth <= 640 ? 16 : 20 }}>Branch Info: {branch.name}</Title>}
            open={visible}
            onCancel={onClose}
            footer={null}
            width="calc(100% - 32px)"
            style={{ top: 20, maxWidth: 1000 }}
            bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }} 
        >
            <div style={{ padding: '10px 0' }}>
                <Row gutter={[8, 8]}>
                    <Col xs={12} sm={6}><Card><Statistic title="Managers" value={0} valueStyle={{ fontSize: 16 }} /></Card></Col>
                    <Col xs={12} sm={6}><Card><Statistic title="Users" value={4} valueStyle={{ color: '#52c41a', fontSize: 16 }} /></Card></Col>
                    <Col xs={12} sm={6}><Card><Statistic title="Customers" value={217} valueStyle={{ color: '#eb2f96', fontSize: 16 }} /></Card></Col>
                    <Col xs={12} sm={6}><Card><Statistic title="Groups" value={23} valueStyle={{ color: '#faad14', fontSize: 16 }} /></Card></Col>
                </Row>

                <Title level={5} style={{ marginTop: 20, marginBottom: 10, fontSize: 16 }}>Branch Details</Title>
                <Row gutter={[8, 8]}>
                    <Col xs={24} sm={12}><Text strong>Name:</Text> {branch.name}</Col>
                    <Col xs={24} sm={12}><Text strong>Code:</Text> {branch.code}</Col>
                    <Col xs={24} sm={12}><Text strong>Location:</Text> {branch.city}</Col>
                    <Col xs={24} sm={12}><Text strong>Street:</Text> {branch.street}</Col>
                    <Col xs={24} sm={12}><Text strong>Postal Code:</Text> {branch.postalCode}</Col>
                    <Col xs={24} sm={12}><Text strong>Created:</Text> {branch.createdDate}</Col>
                </Row>

                <div style={{ marginTop: 20 }}>
                    <Tabs defaultActiveKey="2" items={items} />
                </div>
            </div>
        </Modal>
    );
};

const BranchFormSkeleton: React.FC = () => (
    <div>
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <div style={{ marginBottom: 16 }}>
            <Skeleton.Input style={{ width: 100, marginBottom: 8 }} active size="small" />
            <Skeleton.Input style={{ width: '100%' }} active />
          </div>
        </Col>
        <Col xs={24} sm={12}>
          <div style={{ marginBottom: 16 }}>
            <Skeleton.Input style={{ width: 80, marginBottom: 8 }} active size="small" />
            <Skeleton.Input style={{ width: '100%' }} active />
          </div>
        </Col>
      </Row>
    </div>
);

interface BranchFormData {
  name: string;
  code: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  openTime: dayjs.Dayjs | null;
  closeTime: dayjs.Dayjs | null;
  status: 'Active' | 'Inactive';
}

const BranchEditForm: React.FC<{
  formData: BranchFormData;
  onChange: (field: keyof BranchFormData, value: any) => void;
  isEditing: boolean;
}> = ({ formData, onChange, isEditing }) => {
  return (
    <div>
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Branch Name *</label>
            <Input 
              value={formData.name}
              onChange={(e) => onChange('name', e.target.value)}
              placeholder="Enter branch name"
            />
          </div>
        </Col>
        <Col xs={24} sm={12}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Branch Code</label>
            <Input 
              value={formData.code}
              onChange={(e) => onChange('code', e.target.value)}
              disabled={isEditing}
              placeholder="Auto-generated"
            />
          </div>
        </Col>
      </Row>
      
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Street Address *</label>
        <Input 
          value={formData.street}
          onChange={(e) => onChange('street', e.target.value)}
          placeholder="Enter street address"
        />
      </div>

      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>City *</label>
            <Input 
              value={formData.city}
              onChange={(e) => onChange('city', e.target.value)}
              placeholder="Enter city"
            />
          </div>
        </Col>
        <Col xs={24} sm={8}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>State *</label>
            <Select 
              value={formData.state}
              onChange={(value) => onChange('state', value)}
              placeholder="Select State"
              style={{ width: '100%' }}
            >
              <Option value="NY">New York</Option>
              <Option value="TX">Texas</Option>
              <Option value="MA">Massachusetts</Option>
            </Select>
          </div>
        </Col>
        <Col xs={24} sm={8}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Postal Code *</label>
            <Input 
              value={formData.postalCode}
              onChange={(e) => onChange('postalCode', e.target.value)}
              placeholder="Enter postal code"
            />
          </div>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Opening Time *</label>
            <TimePicker 
              value={formData.openTime}
              onChange={(time) => onChange('openTime', time)}
              format="HH:mm" 
              style={{ width: '100%' }} 
              minuteStep={15}
            />
          </div>
        </Col>
        <Col xs={24} sm={12}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Closing Time *</label>
            <TimePicker 
              value={formData.closeTime}
              onChange={(time) => onChange('closeTime', time)}
              format="HH:mm" 
              style={{ width: '100%' }} 
              minuteStep={15}
            />
          </div>
        </Col>
      </Row>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Status *</label>
        <Select 
          value={formData.status}
          onChange={(value) => onChange('status', value)}
          placeholder="Select Status"
          style={{ width: '100%' }}
        >
          <Option value="Active">Active</Option>
          <Option value="Inactive">Inactive</Option>
        </Select>
      </div>
    </div>
  );
};

const Branches: React.FC = () => {
  const [pageLoading, setPageLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [allBranches, setAllBranches] = useState<Branch[]>(initialBranchData); 
  const [filteredData, setFilteredData] = useState<Branch[]>(initialBranchData);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [formData, setFormData] = useState<BranchFormData>({
    name: '',
    code: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    openTime: null,
    closeTime: null,
    status: 'Active'
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchBranches = useCallback(async () => {
    setPageLoading(true);
    try {
        const response = await new Promise<Branch[]>(resolve => {
            setTimeout(() => resolve([
                { key: '1', id: 1, code: '0001', name: 'Main Headquarters', street: '123 Wall St', city: 'New York', state: 'NY', postalCode: '10005', operatingHours: '09:00 - 17:00', clients: 450, status: 'Active', createdDate: '10/1/2025' },
                { key: '2', id: 2, code: '0002', name: 'East District Office', street: '789 Elm Blvd', city: 'Boston', state: 'MA', postalCode: '02108', operatingHours: '10:00 - 16:00', clients: 320, status: 'Active', createdDate: '9/15/2025' },
                { key: '3', id: 3, code: '0003', name: 'West Field Branch', street: '45 Grove Ln', city: 'Dallas', state: 'TX', postalCode: '75201', operatingHours: '09:00 - 17:00', clients: 180, status: 'Inactive', createdDate: '11/5/2025' },
            ]), 1500);
        });

        setAllBranches(response);
        setFilteredData(response);
        message.success('Branches loaded successfully');

    } catch (error) {
        console.error("Error fetching branches:", error);
        message.error('Failed to load branches.');
        setAllBranches([]);
        setFilteredData([]);
    } finally {
        setPageLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const handleSearch = (value: string) => {
    const searchTerm = value.toLowerCase().trim();
    if (!searchTerm) {
      setFilteredData(allBranches);
      return;
    }

    const newFilteredData = allBranches.filter((branch) => {
      return (
        branch.name.toLowerCase().includes(searchTerm) ||
        branch.city.toLowerCase().includes(searchTerm) ||
        branch.postalCode.includes(searchTerm)
      );
    });

    setFilteredData(newFilteredData);
  };

  const handleFormChange = (field: keyof BranchFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleOpenEditModal = (branch: Branch | null) => {
    setSelectedBranch(branch);
    setEditModalOpen(true);
    setModalLoading(true);
    
    if (branch) {
      const [openTimeStr, closeTimeStr] = branch.operatingHours.split(' - ');
      setFormData({
        name: branch.name,
        code: branch.code,
        street: branch.street,
        city: branch.city,
        state: branch.state,
        postalCode: branch.postalCode,
        openTime: dayjs(openTimeStr, 'HH:mm'),
        closeTime: dayjs(closeTimeStr, 'HH:mm'),
        status: branch.status
      });
    } else {
      const newCode = generateNewBranchCode(allBranches);
      setFormData({
        name: '',
        code: newCode,
        street: '',
        city: '',
        state: '',
        postalCode: '',
        openTime: null,
        closeTime: null,
        status: 'Active'
      });
    }

    setTimeout(() => {
      setModalLoading(false); 
    }, 1000); 
  };
  
  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedBranch(null);
    setModalLoading(false);
  };
  
  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      message.warning('Please enter branch name');
      return false;
    }
    if (!formData.street.trim()) {
      message.warning('Please enter street address');
      return false;
    }
    if (!formData.city.trim()) {
      message.warning('Please enter city');
      return false;
    }
    if (!formData.state) {
      message.warning('Please select state');
      return false;
    }
    if (!formData.postalCode.trim()) {
      message.warning('Please enter postal code');
      return false;
    }
    if (!formData.openTime || !formData.closeTime) {
      message.warning('Please select opening and closing times');
      return false;
    }
    return true;
  };

  const handleSaveBranch = async () => {
    if (!validateForm()) return;

    setModalLoading(true);
    const isEditing = !!selectedBranch;
    
    const payload = {
      ...formData,
      operatingHours: `${dayjs(formData.openTime).format('HH:mm')} - ${dayjs(formData.closeTime).format('HH:mm')}`,
    };

    const url = isEditing ? `${APIS.UPDATE_BRANCH}/${selectedBranch!.id}` : APIS.CREATE_BRANCH;
    const method = isEditing ? 'PUT' : 'POST';

    try {
      console.log(`${method} ${url}:`, payload);
      await new Promise(resolve => setTimeout(resolve, 800)); 
      
      message.success(`Branch ${isEditing ? 'updated' : 'created'} successfully!`);
      handleCloseEditModal();
      fetchBranches();
      
    } catch (error) {
      message.error(`Failed to ${isEditing ? 'update' : 'create'} branch.`);
      console.error("API error:", error);
    } finally {
      setModalLoading(false);
    }
  };

  const handleOpenInfoModal = (branch: Branch) => {
      setSelectedBranch(branch);
      setInfoModalOpen(true);
  };
  
  const handleCloseInfoModal = () => {
      setInfoModalOpen(false);
      setSelectedBranch(null);
  };

  const tableSkeleton = <Skeleton active title={false} paragraph={{ rows: 5 }} />;

  const actionColumns = [
    { title: 'Branch Name', dataIndex: 'name', key: 'name', width: 200 },
    { title: 'Code', dataIndex: 'code', key: 'code', width: 100, responsive: ['md' as const] },
    { title: 'City/State', key: 'location', render: (_: any, record: Branch) => `${record.city}, ${record.state}`, responsive: ['lg' as const] },
    { title: 'Postal Code', dataIndex: 'postalCode', key: 'postalCode', responsive: ['xl' as const] },
    { title: 'Operating Hrs', dataIndex: 'operatingHours', key: 'operatingHours', responsive: ['xl' as const] },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: 'Active' | 'Inactive') => (
          <Tag color={status === 'Active' ? 'green' : 'red'}>
              {status.toUpperCase()}
          </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'action',
      width: 120,
      fixed: 'right' as const,
      render: (_: any, record: Branch) => (
        <Space size="small">
          <Button 
              icon={<EyeOutlined />} 
              onClick={() => handleOpenInfoModal(record)}
              type="text"
              title="View Branch Info"
          />
          <Button 
              icon={<EditOutlined />} 
              onClick={() => handleOpenEditModal(record)}
              type="text"
              title="Edit Branch"
          />
        </Space>
      ),
    },
  ];

  const MobileBranchCard: React.FC<{ branch: Branch }> = ({ branch }) => (
    <Card 
      size="small" 
      style={{ marginBottom: 12 }}
      actions={[
        <Button key="view" type="link" icon={<EyeOutlined />} onClick={() => handleOpenInfoModal(branch)}>View</Button>,
        <Button key="edit" type="link" icon={<EditOutlined />} onClick={() => handleOpenEditModal(branch)}>Edit</Button>,
      ]}
    >
      <Row gutter={[8, 8]}>
        <Col span={18}>
          <Text strong style={{ fontSize: 16 }}>{branch.name}</Text>
        </Col>
        <Col span={6} style={{ textAlign: 'right' }}>
          <Tag color={branch.status === 'Active' ? 'green' : 'red'}>{branch.status}</Tag>
        </Col>
        <Col span={12}>
          <Text type="secondary" style={{ fontSize: 12 }}>Code:</Text> <Text style={{ fontSize: 12 }}>{branch.code}</Text>
        </Col>
        <Col span={12}>
          <Text type="secondary" style={{ fontSize: 12 }}>City:</Text> <Text style={{ fontSize: 12 }}>{branch.city}</Text>
        </Col>
        <Col span={24}>
          <Text type="secondary" style={{ fontSize: 12 }}>Address:</Text> <Text style={{ fontSize: 12 }}>{branch.street}</Text>
        </Col>
        <Col span={12}>
          <Text type="secondary" style={{ fontSize: 12 }}>Hours:</Text> <Text style={{ fontSize: 12 }}>{branch.operatingHours}</Text>
        </Col>
        <Col span={12}>
          <Text type="secondary" style={{ fontSize: 12 }}>Clients:</Text> <Text style={{ fontSize: 12 }}>{branch.clients}</Text>
        </Col>
      </Row>
    </Card>
  );

  return (
    <div>
      <PageHeader 
        title="Branches" 
        breadcrumbs={[
          { title: 'Branches' }
        ]} 
      />  
      
    </div>
    // <div style={{ padding: 16, maxWidth: '100%', overflow: 'hidden' }}>
    //   <div style={{ marginBottom: 16 }}>
    //     <Title level={2} style={{ margin: 0, fontSize: isMobile ? 20 : 28 }}>🏢 Branches Management</Title>
    //     <Text type="secondary" style={{ fontSize: isMobile ? 12 : 14 }}>Manage the physical and virtual branches for your loan operations.</Text>
    //   </div>
      
    //   <Card style={{ marginTop: 20 }}>
    //     <div style={{ marginBottom: 20 }}>
    //       <Row gutter={[8, 8]} align="middle">
    //         <Col xs={24} sm={16} md={12}>
    //           <Search
    //             placeholder="Search branches"
    //             onSearch={handleSearch}
    //             style={{ width: '100%' }}
    //             enterButton={<SearchOutlined />}
    //             disabled={pageLoading}
    //             size={isMobile ? "middle" : "large"}
    //           />
    //         </Col>
    //         <Col xs={24} sm={8} md={12} style={{ textAlign: isMobile ? 'left' : 'right' }}>
    //           <Button 
    //             type="primary" 
    //             icon={<PlusOutlined />} 
    //             onClick={() => handleOpenEditModal(null)} 
    //             disabled={pageLoading}
    //             block={isMobile}
    //             size={isMobile ? "middle" : "large"}
    //           >
    //             {isMobile ? 'Add Branch' : 'Add New Branch'}
    //           </Button>
    //         </Col>
    //       </Row>
    //     </div>
        
    //     {pageLoading ? tableSkeleton : (
    //       <>
    //         {!isMobile ? (
    //           <Table 
    //             columns={actionColumns} 
    //             dataSource={filteredData}
    //             pagination={{ pageSize: 10, responsive: true, showSizeChanger: false }}
    //             scroll={{ x: 800 }}
    //           />
    //         ) : (
    //           <div>
    //             {filteredData.length === 0 ? (
    //               <div style={{ textAlign: 'center', padding: 20 }}>
    //                 <Text type="secondary">No branches found</Text>
    //               </div>
    //             ) : (
    //               filteredData.map(branch => (
    //                 <MobileBranchCard key={branch.key} branch={branch} />
    //               ))
    //             )}
    //           </div>
    //         )}
    //       </>
    //     )}
    //   </Card>

    //   <Modal
    //     title={selectedBranch ? "Edit Branch" : "Add New Branch"}
    //     open={editModalOpen}
    //     onOk={handleSaveBranch}
    //     onCancel={handleCloseEditModal}
    //     confirmLoading={modalLoading}
    //     okButtonProps={{ disabled: modalLoading }}
    //     width="calc(100% - 32px)"
    //     style={{ top: 20, maxWidth: 600 }}
    //   >
    //     {modalLoading ? (
    //       <BranchFormSkeleton />
    //     ) : (
    //       <BranchEditForm 
    //         formData={formData}
    //         onChange={handleFormChange}
    //         isEditing={!!selectedBranch}
    //       />
    //     )}
    //   </Modal>
      
    //   <BranchInfoModal 
    //       visible={infoModalOpen} 
    //       onClose={handleCloseInfoModal} 
    //       branch={selectedBranch}
    //   />
    // </div>
  );
};

export default Branches;