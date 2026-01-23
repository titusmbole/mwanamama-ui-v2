import React from 'react';
import { Drawer, Form, Button, Space } from 'antd';
import type { FormInstance } from 'antd/es/form';

interface FormDrawerProps {
  title: string;
  open: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void | Promise<void>;
  loading?: boolean;
  children: React.ReactNode;
  form: FormInstance;
  width?: number | string;
}

const FormDrawer: React.FC<FormDrawerProps> = ({
  title,
  open,
  onClose,
  onSubmit,
  loading = false,
  children,
  form,
  width = 520,
}) => {
  const handleFinish = async (values: any) => {
    await onSubmit(values);
  };

  return (
    <Drawer
      title={title}
      placement="right"
      width={width}
      onClose={onClose}
      open={open}
      extra={
        <Space>
          <Button onClick={onClose}>Cancel</Button>
          <Button 
            type="primary" 
            onClick={() => form.submit()} 
            loading={loading}
          >
            Submit
          </Button>
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
      >
        {children}
      </Form>
    </Drawer>
  );
};

export default FormDrawer;
