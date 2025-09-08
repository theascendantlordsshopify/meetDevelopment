import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL } from '@/constants';
import { ApiResponse, ApiError } from '@/types';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }

    // Add CSRF token for non-GET requests
    if (config.method !== 'get') {
      const csrfToken = getCsrfToken();
      if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken;
      }
    }

    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
      });
    }

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`, {
        status: error.response?.status,
        data: error.response?.data,
      });
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          const response = await apiClient.post('/api/v1/users/refresh/', {
            refresh: refreshToken,
          });

          const { token } = response.data;
          setAuthToken(token);

          // Retry original request
          originalRequest.headers.Authorization = `Token ${token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        clearAuthTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      }
    }

    // Handle 429 Rate Limited
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      if (retryAfter && !originalRequest._retryCount) {
        originalRequest._retryCount = 1;
        const delay = parseInt(retryAfter) * 1000;
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return apiClient(originalRequest);
      }
    }

    // Transform error response
    const apiError: ApiError = {
      error: error.response?.data?.error || error.message || 'An unexpected error occurred',
      details: error.response?.data?.details,
      code: error.response?.data?.code,
      field_errors: error.response?.data?.field_errors,
    };

    return Promise.reject(apiError);
  }
);

// Token management functions
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refresh_token');
}

function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('auth_token', token);
}

function getCsrfToken(): string | null {
  if (typeof window === 'undefined') return null;
  const cookies = document.cookie.split(';');
  const csrfCookie = cookies.find(cookie => cookie.trim().startsWith('csrftoken='));
  return csrfCookie ? csrfCookie.split('=')[1] : null;
}

function clearAuthTokens(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
  localStorage.removeItem('refresh_token');
}

// API client methods
export const api = {
  // Generic methods
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> =>
    apiClient.get(url, config),

  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> =>
    apiClient.post(url, data, config),

  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> =>
    apiClient.put(url, data, config),

  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> =>
    apiClient.patch(url, data, config),

  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> =>
    apiClient.delete(url, config),

  // File upload
  upload: <T = any>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> =>
    apiClient.post(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
    }),

  // Download file
  download: (url: string, filename?: string, config?: AxiosRequestConfig): Promise<void> =>
    apiClient.get(url, {
      ...config,
      responseType: 'blob',
    }).then(response => {
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    }),
};

// Export token management functions
export { getAuthToken, setAuthToken, clearAuthTokens };

export default apiClient;