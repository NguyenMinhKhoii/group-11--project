/**
 * Auth Slice - Redux State Management
 * Hoạt động 6 - Frontend Redux & Protected Routes
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// API Base URL
const API_BASE_URL = 'http://localhost:5173/api';

// Async thunk cho login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      console.log('🔐 Redux thunk: Attempting login...', credentials);
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      console.log('🔐 Login API response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token in localStorage
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userInfo', JSON.stringify(data.user));
      }

      return {
        token: data.token,
        user: data.user,
      };
    } catch (error) {
      console.error('❌ Login error:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk cho logout
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🚪 Redux thunk: Logging out...');
      
      // Clear localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('userInfo');
      
      return {};
    } catch (error) {
      console.error('❌ Logout error:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk cho register
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      console.log('📝 Redux thunk: Attempting registration...', userData);
      
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      console.log('📝 Register API response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      return {
        message: data.message,
        user: data.user,
      };
    } catch (error) {
      console.error('❌ Registration error:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  user: JSON.parse(localStorage.getItem('userInfo')) || null,
  token: localStorage.getItem('authToken') || null,
  isAuthenticated: !!localStorage.getItem('authToken'),
  loading: false,
  error: null,
};

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    // Initialize from localStorage
    initializeAuth: (state) => {
      const token = localStorage.getItem('authToken');
      const userInfo = localStorage.getItem('userInfo');
      
      if (token && userInfo) {
        state.token = token;
        state.user = JSON.parse(userInfo);
        state.isAuthenticated = true;
      }
    },
    // Clear auth state
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('authToken');
      localStorage.removeItem('userInfo');
    },
  },
  extraReducers: (builder) => {
    // Login cases
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.error = action.payload;
      });

    // Logout cases
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
        state.loading = false;
      });

    // Register cases
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        // Don't auto-login after registration
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export actions
export const { clearError, initializeAuth, clearAuth } = authSlice.actions;

// Export reducer
export default authSlice.reducer;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;