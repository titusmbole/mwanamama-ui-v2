import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Space, Modal, Form, Input, InputNumber, message, Row, Col, Switch
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined
} from '@ant-design/icons';
import PageHeader from '../../components/common/Layout/PageHeader';
import PageCard from '../../components/common/PageCard/PageCard';
import FormDrawer from '../../components/common/FormDrawer/FormDrawer';
import http from '../../services/httpInterceptor';
import { APIS } from '../../services/APIS';

interface Model {
  id: number;
  modelName: string;
  manufacturer: string;
  engineCapacity: number;
  fuelType: string;
  basePrice: number;
  description: string;
  isActive: boolean;
}

const MotorbikeModels: React.FC = () => {
  const [data, setData] = useState<Model[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
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
      const response = await http.get(APIS.LOAD_MOTORBIKE_MODELS, {
        params: {
          page: pagination.current - 1,
          size: pagination.pageSize
        }
      });
      setData(response.data.content || []);
      setPagination(prev => ({ ...prev, total: response.data.totalElements || 0 }));
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to load models');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (values: any) => {
    setSubmitLoading(true);
    try {
      const response = await http.post(APIS.CREATE_MOTORBIKE_MODEL, values);
      message.success(response.data.message || 'Model created successfully');
      setCreateModalOpen(false);
      createForm.resetFields();
      setRefreshKey(prev => prev + 1);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to create model');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleUpdate = async (values: any) => {
    if (!selectedModel) return;
    
    setSubmitLoading(true);
    try {
      const response = await http.put(`${APIS.UPDATE_MOTORBIKE_MODEL}/${selectedModel.id}`, values);
      message.success(response.data.message || 'Model updated successfully');
      setEditModalOpen(false);
      editForm.resetFields();
      setRefreshKey(prev => prev + 1);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to update model');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await http.delete(`${APIS.DELETE_MOTORBIKE_MODEL}/${id}`);
      message.success(response.data.message || 'Model deleted successfully');
      setRefreshKey(prev => prev + 1);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to delete model');
    }
  };

  const handleEdit = (model: Model) => {
    setSelectedModel(model);
    editForm.setFieldsValue(model);
    setEditModalOpen(true);
  };

  const columns: ColumnsType<Model> = [
    {
      title: 'Model Name',
      dataIndex: 'modelName',
      key: 'modelName'
    },
    {
      title: 'Manufacturer',
      dataIndex: 'manufacturer',
      key: 'manufacturer'
    },
    {
      title: 'Engine (cc)',
      dataIndex: 'engineCapacity',
      key: 'engineCapacity'
    },
    {
      title: 'Fuel Type',
      dataIndex: 'fuelType',
      key: 'fuelType'
    },
    {
      title: 'Base Price',
      dataIndex: 'basePrice',
      key: 'basePrice',
      render: (value: number) => `KES ${value.toLocaleString()}`
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Switch checked={isActive} disabled />
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record: Model) => (
        <Space>
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
                title: 'Delete Model',
                content: 'Are you sure you want to delete this model?',
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
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="modelName"
            label="Model Name"
            rules={[{ required: true, message: 'Model name is required' }]}
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
            name="engineCapacity"
            label="Engine Capacity (cc)"
            rules={[{ required: true, message: 'Engine capacity is required' }]}
          >
            <InputNumber style={{ width: '100%' }} placeholder="Enter cc" min={0} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="fuelType"
            label="Fuel Type"
            rules={[{ required: true, message: 'Fuel type is required' }]}
          >
            <Input placeholder="e.g., Petrol, Diesel" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="basePrice"
        label="Base Price"
        rules={[{ required: true, message: 'Base price is required' }]}
      >
        <InputNumber style={{ width: '100%' }} placeholder="Enter base price" min={0} />
      </Form.Item>

      <Form.Item
        name="description"
        label="Description"
      >
        <Input.TextArea rows={4} placeholder="Enter description" />
      </Form.Item>

      <Form.Item
        name="isActive"
        label="Active"
        valuePropName="checked"
        initialValue={true}
      >
        <Switch />
      </Form.Item>
    </>
  );

  return (
    <div>
      <PageHeader 
        title="Motorbike Models" 
        breadcrumbs={[
          { title: 'Home', path: '/' },
          { title: 'Motor Bikes', path: '#' },
          { title: 'Models' }
        ]} 
      />

      <PageCard
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalOpen(true)}
          >
            Add Model
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
        />
      </PageCard>

      <FormDrawer
        title="Create Model"
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
        title="Edit Model"
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
    </div>
  );
};

export default MotorbikeModels;
