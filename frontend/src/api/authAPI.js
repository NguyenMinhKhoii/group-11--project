import axiosClient from './axiosClient';
import { setTokens, clearTokens } from '../utils/tokenHelper';

// ----------------------
// 🔐 Auth API Functions
// ----------------------

// Đăng ký
export const signup = async (userData) => {
  try {
    const response = await axiosClient.post('/auth/signup', userData);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Đăng ký thất bại',
      error: error.response?.data,
    };
  }
};

// Đăng nhập
export const login = async (credentials) => {
  try {
    console.log('🌐 Gửi request login tới:', axiosClient.defaults.baseURL + '/auth/login');
    console.log('📤 Login data:', credentials);
    const response = await axiosClient.post('/auth/login', credentials);
    console.log('📥 Login response:', response.data);
    const { accessToken, refreshToken, user } = response.data;
    
    // Lưu tokens và user info
    setTokens(accessToken, refreshToken, user);
    
    return {
      success: true,
      data: response.data,
      user,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Đăng nhập thất bại',
      error: error.response?.data,
    };
  }
};

// Đăng xuất
export const logout = async () => {
  try {
    const refreshToken = localStorage.getItem('refresh_token');
    
    // Gọi API logout để revoke refresh token
    if (refreshToken) {
      await axiosClient.post('/auth/logout', { refreshToken });
    }
    
    // Xóa tokens khỏi localStorage
    clearTokens();
    
    return {
      success: true,
      message: 'Đăng xuất thành công',
    };
  } catch (error) {
    // Vẫn xóa tokens dù API call thất bại
    clearTokens();
    
    return {
      success: false,
      message: error.response?.data?.message || 'Đăng xuất thất bại',
      error: error.response?.data,
    };
  }
};

// Refresh token
export const refreshToken = async (refreshTokenValue) => {
  try {
    const response = await axiosClient.post('/auth/refresh', {
      refreshToken: refreshTokenValue
    });
    
    const { accessToken, refreshToken: newRefreshToken, user } = response.data;
    
    // Lưu tokens mới
    setTokens(accessToken, newRefreshToken, user);
    
    return {
      success: true,
      data: response.data,
      accessToken,
      refreshToken: newRefreshToken,
    };
  } catch (error) {
    // Nếu refresh token thất bại, xóa hết tokens
    clearTokens();
    
    return {
      success: false,
      message: error.response?.data?.message || 'Làm mới token thất bại',
      error: error.response?.data,
    };
  }
};

// Kiểm tra trạng thái đăng nhập
export const checkAuthStatus = () => {
  const accessToken = localStorage.getItem('access_token');
  const refreshToken = localStorage.getItem('refresh_token');
  const userInfo = localStorage.getItem('user_info');
  
  return {
    isAuthenticated: !!accessToken && !!refreshToken,
    accessToken,
    refreshToken,
    user: userInfo ? JSON.parse(userInfo) : null,
  };
};

// Validate current session
export const validateSession = async () => {
  try {
    // Gọi một API protected để kiểm tra session
    const response = await axiosClient.get('/auth/me'); // Cần tạo endpoint này
    return {
      success: true,
      user: response.data.user,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Session không hợp lệ',
    };
  }
};
