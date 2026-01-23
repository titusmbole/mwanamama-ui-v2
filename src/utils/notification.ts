import { message } from 'antd';

/**
 * Display success notification
 */
export const showSuccess = (title: string, description?: string) => {
  message.success(description || title);
};

/**
 * Display error notification
 */
export const showError = (title: string, description?: string) => {
  message.error(description || title);
};

/**
 * Display warning notification
 */
export const showWarning = (title: string, description?: string) => {
  message.warning(description || title);
};

/**
 * Display info notification
 */
export const showInfo = (title: string, description?: string) => {
  message.info(description || title);
};

/**
 * Display loading notification
 */
export const showLoading = (content: string) => {
  return message.loading(content, 0); // 0 means it won't auto-close
};
