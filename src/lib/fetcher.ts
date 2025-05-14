import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

const axiosInstance = axios.create({
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      console.error('Response error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('Request error:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export type FetcherConfig = AxiosRequestConfig & {
  customOption?: string;
};

export type ResponseData<T> = T;

/**
 * Fetcher function that can be used with SWR or standalone
 * Works on both client-side and server-side
 * 
 * @param url - The URL to fetch
 * @param config - Optional axios configuration
 * @returns Promise with the response data
 * 
 * Usage with SWR:
 * ```
 * import { fetcher } from '@/lib/fetcher';
 * import useSWR from 'swr';
 * 
 * function MyComponent() {
 *   const { data, error, isLoading } = useSWR('/api/data', fetcher);
 *   
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *   return <div>{data.name}</div>;
 * }
 * ```
 * 
 * Usage without SWR:
 * ```
 * import { fetcher } from '@/lib/fetcher';
 * 
 * async function getData() {
 *   try {
 *     const data = await fetcher('/api/data');
 *     return data;
 *   } catch (error) {
 *     console.error('Failed to fetch data:', error);
 *   }
 * }
 * ```
 */
export const fetcher = async <T>(
  url: string, 
  config?: FetcherConfig
): Promise<ResponseData<T>> => {
  try {
    const response: AxiosResponse<T> = await axiosInstance(url, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export type RequestData = Record<string, unknown>;

/**
 * Extended fetcher with explicit HTTP methods
 * Provides a more intuitive API for different request types
 */
export const fetcherExtended = {
  get: <T>(url: string, config?: FetcherConfig) => 
    fetcher<T>(url, { ...config, method: 'GET' }),
  
  post: <T>(url: string, data?: RequestData, config?: FetcherConfig) => 
    fetcher<T>(url, { ...config, method: 'POST', data }),
  
  put: <T>(url: string, data?: RequestData, config?: FetcherConfig) => 
    fetcher<T>(url, { ...config, method: 'PUT', data }),
  
  patch: <T>(url: string, data?: RequestData, config?: FetcherConfig) => 
    fetcher<T>(url, { ...config, method: 'PATCH', data }),
  
  delete: <T>(url: string, config?: FetcherConfig) => 
    fetcher<T>(url, { ...config, method: 'DELETE' }),
};

export { axiosInstance };

export default fetcher;
