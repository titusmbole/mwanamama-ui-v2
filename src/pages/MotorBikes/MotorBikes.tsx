import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Space, Tag, Modal, Form, Input, Select, InputNumber, message, Row, Col
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  PlusOutlined, EditOutlined, EyeOutlined, DeleteOutlined
} from '@ant-design/icons';
import PageHeader from '../../components/common/Layout/PageHeader';
import PageCard from '../../components/common/PageCard/PageCard';
import FormDrawer from '../../components/common/FormDrawer/FormDrawer';
import http from '../../services/httpInterceptor';
import { APIS } from '../../services/APIS';

const { Option } = Select;

interface MotorBike {
  id: number;
  registrationNumber: string;
  modelName: string;
  manufacturer: string;
  year: number;
  price: number;
  mileage: number;
  color: string;
  status: 'AVAILABLE' | 'SOLD' | 'RESERVED';
  condition: 'NEW' | 'USED';
  createdAt: string;
}

const MotorBikesList: React.FC = () => {
  const [data, setData] = useState<MotorBike[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedBike, setSelectedBike] = useState<MotorBike | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  useEffect(() => {
    fetchData();
  }, [pagination.current, pagination.pageSize, refreshKey]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await http.get(APIS.LOAD_MOTORBIKES, {
        params: {
          page: pagination.current - 1,
          size: pagination.pageSize
        }
      });
      setData(response.data.content || []);
      setPagination(prev => ({ ...prev, total: response.data.totalElements || 0 }));
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to load motor bikes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (values: any) => {
    setSubmitLoading(true);
    try {
      const response = await http.post(APIS.CREATE_MOTORBIKE, values);
      message.success(response.data.message || 'Motor bike created successfully');
      setCreateModalOpen(false);
      createForm.resetFields();
      setRefreshKey(prev => prev + 1);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to create motor bike');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleUpdate = async (values: any) => {
    if (!selectedBike) return;
    
    setSubmitLoading(true);
    try {
      const response = await http.put(`${APIS.UPDATE_MOTORBIKE}/${selectedBike.id}`, values);
      message.success(response.data.message || 'Motor bike updated successfully');
      setEditModalOpen(false);
      editForm.resetFields();
      setRefreshKey(prev => prev + 1);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to update motor bike');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await http.delete(`${APIS.DELETE_MOTORBIKE}/${id}`);
      message.success(response.data.message || 'Motor bike deleted successfully');
      setRefreshKey(prev => prev + 1);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to delete motor bike');
    }
  };

  const handleView = (bike: MotorBike) => {
    setSelectedBike(bike);
    setViewModalOpen(true);
  };

  const handleEdit = (bike: MotorBike) => {
    setSelectedBike(bike);
    editForm.setFieldsValue(bike);
    setEditModalOpen(true);
  };

  const columns: ColumnsType<MotorBike> = [
    {
      title: 'Registration #',
      dataIndex: 'registrationNumber',
      key: 'registrationNumber'
    },
    {
      title: 'Model',
      dataIndex: 'modelName',
      key: 'modelName'
    },
    {
      title: 'Manufacturer',
      dataIndex: 'manufacturer',
      key: 'manufacturer'
    },
    {
      title: 'Year',
      dataIndex: 'year',
      key: 'year'
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (value: number) => `KES ${value.toLocaleString()}`
    },
    {
      title: 'Mileage',
      dataIndex: 'mileage',
      key: 'mileage',
      render: (value: number) => `${value.toLocaleString()} km`
    },
    {
      title: 'Condition',
      dataIndex: 'condition',
      key: 'condition',
      render: (condition: string) => (
        <Tag color={condition === 'NEW' ? 'blue' : 'orange'}>
          {condition}
        </Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === 'AVAILABLE' ? 'green' : status === 'SOLD' ? 'red' : 'orange';
        return <Tag color={color}>{status}</Tag>;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record: MotorBike) => (
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
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              Modal.confirm({
                title: 'Delete Motor Bike',
                content: 'Are you sure you want to delete this motor bike?',
                onOk: () => handleDelete(record.id)
              });
            }}
          />
        </Space>
      )
    }
  ];

  const formFields = (
    <>
      <Form.Item
        name="registrationNumber"
        label="Registration Number"
        rules={[{ required: true, message: 'Registration number is required' }]}
      >
        <Input placeholder="Enter registration number" />
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="modelName"
            label="Model"
            rules={[{ required: true, message: 'Model is required' }]}
          >
            <Input placeholder="Enter model name" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="manufacturer"
            label="Manufacturer"
            rules={[{ required: true, message: 'Manufacturer is required' }]}
          >
            <Input placeholder="Enter manufacturer" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="year"
            label="Year"
            rules={[{ required: true, message: 'Year is required' }]}
          >
            <InputNumber style={{ width: '100%' }} placeholder="Enter year" min={1900} max={new Date().getFullYear()} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="price"
            label="Price"
            rules={[{ required: true, message: 'Price is required' }]}
          >
            <InputNumber style={{ width: '100%' }} placeholder="Enter price" min={0} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="mileage"
            label="Mileage (km)"
            rules={[{ required: true, message: 'Mileage is required' }]}
          >
            <InputNumber style={{ width: '100%' }} placeholder="Enter mileage" min={0} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="color"
            label="Color"
            rules={[{ required: true, message: 'Color is required' }]}
          >
            <Input placeholder="Enter color" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="condition"
            label="Condition"
            initialValue="NEW"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="NEW">New</Option>
              <Option value="USED">Used</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="status"
            label="Status"
            initialValue="AVAILABLE"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="AVAILABLE">Available</Option>
              <Option value="RESERVED">Reserved</Option>
              <Option value="SOLD">Sold</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
    </>
  );

  return (
    <div>
      <PageHeader 
        title="Motor Bikes" 
        breadcrumbs={[
          { title: 'Home', path: '/' },
          { title: 'Motor Bikes', path: '#' },
          { title: 'List' }
        ]} 
      />

      <PageCard
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalOpen(true)}
          >
            Add Motor Bike
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="id"
          pagination={{
            ...pagination,
            onChange: (page, pageSize) => setPagination({ ...pagination, current: page, pageSize })
          }}
          scroll={{ x: 1200 }}
        />
      </PageCard>

      <FormDrawer
        title="Create Motor Bike"
        open={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          createForm.resetFields();
        }}
        onSubmit={handleCreate}
        loading={submitLoading}
        form={createForm}
      >
        {formFields}
      </FormDrawer>

      <FormDrawer
        title="Edit Motor Bike"
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          editForm.resetFields();
        }}
        onSubmit={handleUpdate}
        loading={submitLoading}
        form={editForm}
      >
        {formFields}
      </FormDrawer>

      <Modal
        title="Motor Bike Details"
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        footer={null}
        width={600}
      >
        {selectedBike && (
          <Row gutter={[16, 16]}>
            <Col span={12}><strong>Registration #:</strong> {selectedBike.registrationNumber}</Col>
            <Col span={12}><strong>Model:</strong> {selectedBike.modelName}</Col>
            <Col span={12}><strong>Manufacturer:</strong> {selectedBike.manufacturer}</Col>
            <Col span={12}><strong>Year:</strong> {selectedBike.year}</Col>
            <Col span={12}><strong>Price:</strong> KES {selectedBike.price.toLocaleString()}</Col>
            <Col span={12}><strong>Mileage:</strong> {selectedBike.mileage.toLocaleString()} km</Col>
            <Col span={12}><strong>Color:</strong> {selectedBike.color}</Col>
            <Col span={12}><strong>Condition:</strong> <Tag color={selectedBike.condition === 'NEW' ? 'blue' : 'orange'}>{selectedBike.condition}</Tag></Col>
            <Col span={12}><strong>Status:</strong> <Tag color={selectedBike.status === 'AVAILABLE' ? 'green' : selectedBike.status === 'SOLD' ? 'red' : 'orange'}>{selectedBike.status}</Tag></Col>
            <Col span={12}><strong>Added:</strong> {new Date(selectedBike.createdAt).toLocaleDateString()}</Col>
          </Row>
        )}
      </Modal>
    </div>
  );
};

export default MotorBikesList;
