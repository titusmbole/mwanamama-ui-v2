import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { BASE_URL } from '../config/api.config';
import { showError, showSuccess, showWarning } from '../utils/Notif';

// Create an Axios instance
const http = axios.create({
  baseURL: BASE_URL,
});

const isTokenValid = (token: string): boolean => {
  if (!token) return false;
  try {
    const decodedToken: any = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000);
    return decodedToken.exp ? decodedToken.exp > currentTime : false;
  } catch (e: any) {
    showError('Token decoding error');
    return false;
  }
};

const handleLogout = async () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = '/auth/login';
};

// Request interceptor
http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      if (isTokenValid(token)) {
        config.headers['Authorization'] = `Bearer ${token}`;
      } else {
        showError('Session expired');
        localStorage.removeItem("token");
        window.location.href = '/auth/login';
      }
    }
    return config;
  },
  (error) => {
    showError('Request Failed', 'Failed to send request. Please check your connection.');
    return Promise.reject(error);
  }
);

// Response interceptor - Handle API responses and errors
http.interceptors.response.use(
  (response) => {
    // Handle successful responses (2xx status codes)
    const { data, status } = response;
    
    // Auto-display success messages for POST, PUT, PATCH, DELETE operations
    if (data?.message) {
      // Success status codes: 200, 201, 202, 204
      if (status >= 200 && status < 300) {
        // Only show for non-GET requests to avoid excessive notifications
        if (response.config.method !== 'get') {
            console.log("Im runnning in a sucecess response");
          showSuccess(data.message);
        }
      }
    }
    
    // Check for warnings in successful responses
    if (data?.warning) {
      showWarning('Warning', data.warning);
    }
    
    return response;
  },
  async (error) => {
    // Handle network errors (no response from server)
    if (!error.response) {
            console.log("Im runnning in a error response");

      if (error.code === 'ECONNABORTED') {
        showError('Request Timeout', 'The request took too long to complete. Please try again.');
      } else if (error.code === 'ERR_NETWORK') {
        showError('Network Error', 'Unable to connect to the server. Please check your internet connection.');
      } else {
        showError('Connection Error', 'Failed to connect to the server. Please try again later.');
      }
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    // Extract error message from response
    const getErrorMessage = (data: any): { title: string; description?: string } => {
      // Handle different error response formats from backend
      if (typeof data === 'string') {
        return { title: 'Error', description: data };
      }
      
      // Handle detail errors
      if (data?.detail) {
        return { title: 'Error', description: data.detail };
      }
      
      if (data?.error) {
        if (typeof data.error === 'string') {
          return { title: 'Error', description: data.error };
        }
        // Handle nested error objects
        if (typeof data.error === 'object') {
          const errorMessages = Object.entries(data.error)
            .map(([field, messages]) => {
              if (Array.isArray(messages)) {
                return `${field}: ${messages.join(', ')}`;
              }
              return `${field}: ${messages}`;
            })
            .join('\n');
          return { title: 'Validation Error', description: errorMessages };
        }
      }
      
      if (data?.message) {
        return { title: 'Error', description: data.message };
      }

      // Handle field validation errors
      if (typeof data === 'object' && !data.detail && !data.error && !data.message) {
        const fieldErrors = Object.entries(data)
          .filter(([key]) => key !== 'status')
          .map(([field, messages]) => {
            if (Array.isArray(messages)) {
              return `${field}: ${messages.join(', ')}`;
            }
            return `${field}: ${messages}`;
          })
          .join('\n');
        
        if (fieldErrors) {
          return { title: 'Validation Error', description: fieldErrors };
        }
      }

      return { title: 'Error', description: 'An unexpected error occurred' };
    };

    // Handle different HTTP status codes
    switch (status) {
      case 400: // Bad Request - Validation errors
        {
          const { title, description } = getErrorMessage(data);
          showError(title, description);
        }
        break;

      case 401: // Unauthorized - Invalid credentials or expired token
        {
          const { description } = getErrorMessage(data);
          showError('Authentication Failed', description || 'Invalid credentials. Please try again.');
          
          // Only logout and redirect if this is NOT a login attempt
          const isLoginRequest = error.config?.url?.includes('/login') || 
                                 error.config?.url?.includes('/auth') ||
                                 error.config?.url?.includes('/token');
          
          if (!isLoginRequest) {
            // Logout user and redirect to login for expired sessions
            await handleLogout();
          }
        }
        break;

      case 403: // Forbidden - Insufficient permissions
        {
          const { description } = getErrorMessage(data);
          showError(
            'Access Denied',
            description || 'You do not have permission to perform this action.'
          );
        }
        break;

      case 404: // Not Found
        {
          const { description } = getErrorMessage(data);
          showError('Not Found', description || 'The requested resource was not found.');
        }
        break;

      case 429: // Too Many Requests - Rate Limit
        {
          const retryAfter = data?.retry_after_seconds || data?.retry_after;
          const waitTime = retryAfter 
            ? retryAfter > 60 
              ? `${Math.ceil(retryAfter / 60)} minute(s)` 
              : `${retryAfter} second(s)`
            : 'a moment';
          
          showWarning(
            'Too Many Requests',
            `You've made too many requests. Please wait ${waitTime} before trying again.`
          );
        }
        break;

      case 500: // Internal Server Error
        showError(
          'Server Error',
          'An internal server error occurred. Please try again later or contact support.'
        );
        break;

      case 502: // Bad Gateway
        showError(
          'Service Unavailable',
          'The server is temporarily unavailable. Please try again later.'
        );
        break;

      case 503: // Service Unavailable
        showError(
          'Service Unavailable',
          'The service is temporarily unavailable. Please try again later.'
        );
        break;

      case 504: // Gateway Timeout
        showError('Gateway Timeout', 'The server took too long to respond. Please try again.');
        break;

      default:
        // Handle other error status codes
        if (status >= 500) {
          showError('Server Error', 'A server error occurred. Please try again later.');
        } else {
          const { title, description } = getErrorMessage(data);
          showError(title, description);
        }
    }

    return Promise.reject(error);
  }
);

export default http;
