import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { message } from 'antd';
import { BASE_URL } from '../config/api.config';

// Create an Axios instance
const http = axios.create({
  baseURL: BASE_URL,
});

const isTokenValid = (token: string): boolean => {
  if (!token) return false;
  try {
    const decodedToken: any = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000);
    return decodedToken.exp > currentTime;
  } catch (e: any) {
    console.error('Token decoding error:', e);
    return false;
  }
};

const handleLogout = async () => {
  localStorage.removeItem("token");
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
        message.error('Session expired!');
        localStorage.removeItem("token");
        handleLogout();
      }
    }
    return config;
  },
  (error) => {
    message.error(error.message || "Request error");
    return Promise.reject(error);
  }
);

// Response interceptor
http.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;

    if (response) {
      const { status, data } = response;

      // Handle permission errors or access denied
      if (status === 500 && data?.message === "Access Denied") {
        message.error("Access Denied: You do not have permission to perform this action.");
      }

      // Handle unauthorized token (401)
      if (status === 401) {
        message.error("Unauthorized! Logging out.");
        handleLogout();
      }

      // Handle other errors
      if (status === 403) {
        message.error("Forbidden: You don't have access to this resource.");
      }

      if (status === 404) {
        message.error("Resource not found.");
      }

      if (status >= 500) {
        message.error(data?.message || "Server error occurred.");
      }
    } else {
      message.error("Network error or server is unreachable.");
    }

    return Promise.reject(error);
  }
);

export default http;
