import React, { useEffect } from 'react';
import { Modal, Form, Button, Space } from 'antd';
import type { FormInstance } from 'antd';

interface FormModalProps {
  title: string;
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void> | void;
  children: React.ReactNode;
  width?: number;
  initialValues?: any;
  okText?: string;
  cancelText?: string;
  loading?: boolean;
  form?: FormInstance;
}

const FormModal: React.FC<FormModalProps> = ({
  title,
  open,
  onCancel,
  onSubmit,
  children,
  width = 600,
  initialValues,
  okText = 'Submit',
  cancelText = 'Cancel',
  loading = false,
  form: externalForm,
}) => {
  const [internalForm] = Form.useForm();
  const form = externalForm || internalForm;

  useEffect(() => {
    if (open && initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [open, initialValues, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={title}
      open={open}
      onCancel={handleCancel}
      width={width}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          {cancelText}
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleOk}>
          {okText}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
      >
        {children}
      </Form>
    </Modal>
  );
};

export default FormModal;
