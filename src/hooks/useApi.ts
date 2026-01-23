import { useState, useCallback } from 'react';
import { message } from 'antd';
import http from '../services/httpInterceptor';

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  successMessage?: string;
  errorMessage?: string;
}

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const request = useCallback(async (
    method: 'get' | 'post' | 'put' | 'delete' | 'patch',
    url: string,
    data?: any,
    options?: UseApiOptions
  ) => {
    setLoading(true);
    setError(null);

    try {
      let response;
      if (method === 'get' || method === 'delete') {
        response = await http[method](url, { params: data });
      } else {
        response = await http[method](url, data);
      }

      if (options?.successMessage) {
        message.success(options.successMessage);
      }
      
      options?.onSuccess?.(response.data);
      return response.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || options?.errorMessage || 'An error occurred';
      message.error(errorMsg);
      setError(err);
      options?.onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const get = useCallback((url: string, params?: any, options?: UseApiOptions) => {
    return request('get', url, params, options);
  }, [request]);

  const post = useCallback((url: string, data?: any, options?: UseApiOptions) => {
    return request('post', url, data, options);
  }, [request]);

  const put = useCallback((url: string, data?: any, options?: UseApiOptions) => {
    return request('put', url, data, options);
  }, [request]);

  const del = useCallback((url: string, params?: any, options?: UseApiOptions) => {
    return request('delete', url, params, options);
  }, [request]);

  const patch = useCallback((url: string, data?: any, options?: UseApiOptions) => {
    return request('patch', url, data, options);
  }, [request]);

  return {
    loading,
    error,
    get,
    post,
    put,
    delete: del,
    patch,
  };
};
