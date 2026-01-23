import React, { useState } from 'react';
import { 
  Input, Button, Select, message, Card, Row, Col, Divider
} from 'antd';
import { 
  SaveOutlined, ArrowLeftOutlined, DeleteOutlined, PlusCircleOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import PageHeader from '../../components/common/Layout/PageHeader';
import PageCard from '../../components/common/PageCard/PageCard';
import http from '../../services/httpInterceptor';
import { APIS } from '../../services/APIS';

const { Option } = Select;

interface Member {
  name: string;
  phone: string;
  idNo: string;
  gender: string;
  location: string;
  groupId: number;
  dob: string;
  kinName: string;
  kinId: string;
  kinPhone: string;
}

const emptyMember: Member = {
  name: '',
  phone: '',
  idNo: '',
  gender: '',
  location: '',
  groupId: 0,
  dob: '',
  kinName: '',
  kinId: '',
  kinPhone: '',
};

const AddGroupMembers: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { groupId, groupName } = location.state || {};
  
  const [members, setMembers] = useState<Member[]>([{ ...emptyMember, groupId: groupId || 0 }]);
  const [loading, setLoading] = useState(false);

  if (!groupId || !groupName) {
    message.error('No group selected');
    navigate('/groups');
    return null;
  }

  const addMember = () => {
    setMembers([...members, { ...emptyMember, groupId }]);
  };

  const removeMember = (index: number) => {
    if (members.length === 1) {
      message.warning('At least one member is required');
      return;
    }
    setMembers(members.filter((_, i) => i !== index));
  };

  const updateMember = (index: number, field: keyof Member, value: string | number) => {
    const updatedMembers = [...members];
    updatedMembers[index] = { ...updatedMembers[index], [field]: value };
    setMembers(updatedMembers);
  };

  const handleSubmit = async () => {
    // Validate members data
    const invalidMembers = members.filter(
      member => !member.name || !member.phone || !member.idNo || !member.gender || !member.dob
    );

    if (invalidMembers.length > 0) {
      message.error('Please fill in all required fields for all members');
      return;
    }

    setLoading(true);
    const payload = {
      clients: members
    };

    await http.post(APIS.CREATE_BULK_CLIENTS, payload);
    navigate('/groups');
    setLoading(false);
  };

  return (
    <div>
      <PageHeader 
        title={`Add Members to ${groupName || 'Group'}`}
        breadcrumbs={[
          { title: 'Groups', path: '/groups' },
          { title: 'Add Members' }
        ]} 
      />

      <PageCard
        title={`Add Members to Group: ${groupName}`}
        extra={
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/groups')}
          >
            Back to Groups
          </Button>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <p style={{ color: '#666' }}>Fill in the details for each member you want to add to this group.</p>
        </div>

        {/* Member Forms */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {members.map((member, index) => (
            <Card 
              key={index}
              title={`Member #${index + 1}`}
              extra={
                <Button
                  type="link"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => removeMember(index)}
                  disabled={members.length === 1}
                >
                  Remove
                </Button>
              }
              style={{ border: '1px solid #e8e8e8' }}
            >
              <Row gutter={[16, 16]}>
                {/* Personal Details */}
                <Col xs={24} md={8}>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                      Name <span style={{ color: 'red' }}>*</span>
                    </label>
                    <Input
                      value={member.name}
                      onChange={(e) => updateMember(index, 'name', e.target.value)}
                      placeholder="Full Name"
                    />
                  </div>
                  
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                      Phone <span style={{ color: 'red' }}>*</span>
                    </label>
                    <Input
                      value={member.phone}
                      onChange={(e) => updateMember(index, 'phone', e.target.value)}
                      placeholder="Phone Number"
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                      ID Number <span style={{ color: 'red' }}>*</span>
                    </label>
                    <Input
                      value={member.idNo}
                      onChange={(e) => updateMember(index, 'idNo', e.target.value)}
                      placeholder="ID Number"
                    />
                  </div>
                </Col>

                {/* Additional Details */}
                <Col xs={24} md={8}>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                      Gender <span style={{ color: 'red' }}>*</span>
                    </label>
                    <Select
                      value={member.gender || undefined}
                      onChange={(value) => updateMember(index, 'gender', value)}
                      placeholder="Select Gender"
                      style={{ width: '100%' }}
                    >
                      <Option value="MALE">MALE</Option>
                      <Option value="FEMALE">FEMALE</Option>
                    </Select>
                  </div>
                  
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                      Location
                    </label>
                    <Input
                      value={member.location}
                      onChange={(e) => updateMember(index, 'location', e.target.value)}
                      placeholder="Location"
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                      Date of Birth <span style={{ color: 'red' }}>*</span>
                    </label>
                    <Input
                      type="date"
                      value={member.dob}
                      onChange={(e) => updateMember(index, 'dob', e.target.value)}
                    />
                  </div>
                </Col>

                {/* Next of Kin Details */}
                <Col xs={24} md={8}>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                      Next of Kin Name
                    </label>
                    <Input
                      value={member.kinName}
                      onChange={(e) => updateMember(index, 'kinName', e.target.value)}
                      placeholder="Next of Kin Name"
                    />
                  </div>
                  
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                      Next of Kin ID
                    </label>
                    <Input
                      value={member.kinId}
                      onChange={(e) => updateMember(index, 'kinId', e.target.value)}
                      placeholder="Next of Kin ID"
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                      Next of Kin Phone
                    </label>
                    <Input
                      value={member.kinPhone}
                      onChange={(e) => updateMember(index, 'kinPhone', e.target.value)}
                      placeholder="Next of Kin Phone"
                    />
                  </div>
                </Col>
              </Row>
            </Card>
          ))}
        </div>

        <Divider />

        {/* Add Member Button */}
        <div style={{ marginBottom: 16 }}>
          <Button
            type="dashed"
            icon={<PlusCircleOutlined />}
            onClick={addMember}
            block
          >
            Add Another Member
          </Button>
        </div>

        {/* Submit Button */}
        <div>
          <Button
            type="primary"
            size="large"
            icon={<SaveOutlined />}
            onClick={handleSubmit}
            loading={loading}
            block
          >
            {loading ? 'Adding Members...' : `Add ${members.length} Member${members.length > 1 ? 's' : ''} to Group`}
          </Button>
        </div>
      </PageCard>
    </div>
  );
};

export default AddGroupMembers;
