import axios from 'axios';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../utils/tokenHelper';

// Tạo axios instance
const axiosClient = axios.create({
  baseURL: 'http://localhost:3001/api', // Điều chỉnh theo backend port  
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag để tránh multiple refresh requests
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Request interceptor - tự động thêm access token
axiosClient.interceptors.request.use(
  (config) => {
    console.log('🚀 Axios request:', config.method.toUpperCase(), config.url, config.data);
    const accessToken = getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ Axios request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - tự động refresh token khi access token hết hạn
axiosClient.interceptors.response.use(
  (response) => {
    console.log('✅ Axios response:', response.status, response.data);
    return response;
  },
  async (error) => {
    console.error('❌ Axios response error:', error.response?.status, error.response?.data || error.message);
    const originalRequest = error.config;

    // Nếu lỗi 401 và có error code TOKEN_EXPIRED
    if (error.response?.status === 401 && 
        error.response?.data?.error === 'TOKEN_EXPIRED' && 
        !originalRequest._retry) {
      
      if (isRefreshing) {
        // Nếu đang refresh, đợi trong queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();
      
      if (!refreshToken) {
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // Gọi API refresh token
        const response = await axios.post('http://localhost:5000/api/auth/refresh', {
          refreshToken
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;
        
        // Lưu tokens mới
        setTokens(accessToken, newRefreshToken);
        
        // Process queue
        processQueue(null, accessToken);
        
        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosClient(originalRequest);
        
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
