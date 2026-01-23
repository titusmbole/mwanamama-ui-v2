import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Space, Tag, Modal, Form, Input, InputNumber, Select, message, Row, Col
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

const { Option } = Select;

interface SparePart {
  id: number;
  partNumber: string;
  partName: string;
  category: string;
  manufacturer: string;
  price: number;
  stockQuantity: number;
  minStockLevel: number;
  description: string;
}

const SpareParts: React.FC = () => {
  const [data, setData] = useState<SparePart[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<SparePart | null>(null);
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
      const response = await http.get(APIS.LOAD_SPARE_PARTS, {
        params: {
          page: pagination.current - 1,
          size: pagination.pageSize
        }
      });
      setData(response.data.content || []);
      setPagination(prev => ({ ...prev, total: response.data.totalElements || 0 }));
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to load spare parts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (values: any) => {
    setSubmitLoading(true);
    try {
      const response = await http.post(APIS.CREATE_SPARE_PART, values);
      message.success(response.data.message || 'Spare part created successfully');
      setCreateModalOpen(false);
      createForm.resetFields();
      setRefreshKey(prev => prev + 1);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to create spare part');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleUpdate = async (values: any) => {
    if (!selectedPart) return;
    
    setSubmitLoading(true);
    try {
      const response = await http.put(`${APIS.UPDATE_SPARE_PART}/${selectedPart.id}`, values);
      message.success(response.data.message || 'Spare part updated successfully');
      setEditModalOpen(false);
      editForm.resetFields();
      setRefreshKey(prev => prev + 1);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to update spare part');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await http.delete(`${APIS.DELETE_SPARE_PART}/${id}`);
      message.success(response.data.message || 'Spare part deleted successfully');
      setRefreshKey(prev => prev + 1);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to delete spare part');
    }
  };

  const handleEdit = (part: SparePart) => {
    setSelectedPart(part);
    editForm.setFieldsValue(part);
    setEditModalOpen(true);
  };

  const columns: ColumnsType<SparePart> = [
    {
      title: 'Part Number',
      dataIndex: 'partNumber',
      key: 'partNumber'
    },
    {
      title: 'Part Name',
      dataIndex: 'partName',
      key: 'partName'
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => <Tag color="blue">{category}</Tag>
    },
    {
      title: 'Manufacturer',
      dataIndex: 'manufacturer',
      key: 'manufacturer'
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (value: number) => `KES ${value.toLocaleString()}`
    },
    {
      title: 'Stock',
      dataIndex: 'stockQuantity',
      key: 'stockQuantity',
      render: (qty: number, record: SparePart) => (
        <Tag color={qty <= record.minStockLevel ? 'red' : qty <= record.minStockLevel * 2 ? 'orange' : 'green'}>
          {qty}
        </Tag>
      )
    },
    {
      title: 'Min Level',
      dataIndex: 'minStockLevel',
      key: 'minStockLevel'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record: SparePart) => (
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
                title: 'Delete Spare Part',
                content: 'Are you sure you want to delete this spare part?',
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
            name="partNumber"
            label="Part Number"
            rules={[{ required: true, message: 'Part number is required' }]}
          >
            <Input placeholder="Enter part number" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="partName"
            label="Part Name"
            rules={[{ required: true, message: 'Part name is required' }]}
          >
            <Input placeholder="Enter part name" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Category is required' }]}
          >
            <Select placeholder="Select category">
              <Option value="Engine">Engine</Option>
              <Option value="Brakes">Brakes</Option>
              <Option value="Transmission">Transmission</Option>
              <Option value="Electrical">Electrical</Option>
              <Option value="Body Parts">Body Parts</Option>
              <Option value="Other">Other</Option>
            </Select>
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
        <Col span={8}>
          <Form.Item
            name="price"
            label="Price"
            rules={[{ required: true, message: 'Price is required' }]}
          >
            <InputNumber style={{ width: '100%' }} placeholder="Enter price" min={0} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="stockQuantity"
            label="Stock Quantity"
            rules={[{ required: true, message: 'Stock quantity is required' }]}
          >
            <InputNumber style={{ width: '100%' }} placeholder="Enter quantity" min={0} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="minStockLevel"
            label="Min Stock Level"
            rules={[{ required: true, message: 'Min stock level is required' }]}
          >
            <InputNumber style={{ width: '100%' }} placeholder="Enter min level" min={0} />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="description"
        label="Description"
      >
        <Input.TextArea rows={3} placeholder="Enter description" />
      </Form.Item>
    </>
  );

  return (
    <div>
      <PageHeader 
        title="Spare Parts" 
        breadcrumbs={[
          { title: 'Home', path: '/' },
          { title: 'Motor Bikes', path: '#' },
          { title: 'Spare Parts' }
        ]} 
      />

      <PageCard
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalOpen(true)}
          >
            Add Spare Part
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
          scroll={{ x: 1000 }}
        />
      </PageCard>

      <FormDrawer
        title="Create Spare Part"
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
        title="Edit Spare Part"
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

export default SpareParts;
