import { App } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';

// Create a singleton to hold the notification instance
let notificationApi: any = null;

export const setNotificationApi = (api: any) => {
  notificationApi = api;
};

export const showSuccess = (message: string, description?: string) => {
  if (notificationApi) {
    notificationApi.success({
      message,
      description,
      placement: "bottomLeft",
      duration: 4,
      icon: <CheckCircleOutlined style={{ color: '#22c55e', fontSize: '24px' }} />,
      style: {
        borderRadius: '12px',
        padding: '16px 24px',
      },
      className: 'custom-notification',
    });
  }
};

export const showError = (message: string, description?: string) => {
  if (notificationApi) {
    notificationApi.error({
      message,
      description,
      placement: "bottomLeft",
      duration: 5,
      icon: <CloseCircleOutlined style={{ color: '#ef4444', fontSize: '24px' }} />,
      style: {
        borderRadius: '12px',
        padding: '16px 24px',
      },
      className: 'custom-notification',
    });
  }
};

export const showWarning = (message: string, description?: string) => {
  if (notificationApi) {
    notificationApi.warning({
      message,
      description,
      placement: "bottomLeft",
      duration: 4,
      icon: <ExclamationCircleOutlined style={{ color: '#f59e0b', fontSize: '24px' }} />,
      style: {
        borderRadius: '12px',
        padding: '16px 24px',
      },
      className: 'custom-notification',
    });
  }
};

export const showInfo = (message: string, description?: string) => {
  if (notificationApi) {
    notificationApi.info({
      message,
      description,
      placement: "bottomLeft",
      duration: 4,
      icon: <InfoCircleOutlined style={{ color: '#3b82f6', fontSize: '24px' }} />,
      style: {
        borderRadius: '12px',
        padding: '16px 24px',
      },
      className: 'custom-notification',
    });
  }
};

// Hook to initialize notification API
export const useNotificationSetup = () => {
  const { notification } = App.useApp();
  setNotificationApi(notification);
};
