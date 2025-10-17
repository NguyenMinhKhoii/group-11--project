import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as authAPI from '../../api/authAPI';
import { checkAuthStatus } from '../../api/authAPI';

// ----------------------
// 🔄 Async Thunks
// ----------------------

// Đăng nhập
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    const result = await authAPI.login(credentials);
    if (!result.success) {
      return rejectWithValue(result.message);
    }
    return result;
  }
);

// Đăng ký
export const signupUser = createAsyncThunk(
  'auth/signupUser',
  async (userData, { rejectWithValue }) => {
    const result = await authAPI.signup(userData);
    if (!result.success) {
      return rejectWithValue(result.message);
    }
    return result;
  }
);

// Đăng xuất
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    const result = await authAPI.logout();
    if (!result.success) {
      return rejectWithValue(result.message);
    }
    return result;
  }
);

// Refresh token
export const refreshUserToken = createAsyncThunk(
  'auth/refreshUserToken',
  async (refreshToken, { rejectWithValue }) => {
    const result = await authAPI.refreshToken(refreshToken);
    if (!result.success) {
      return rejectWithValue(result.message);
    }
    return result;
  }
);

// Validate session
export const validateUserSession = createAsyncThunk(
  'auth/validateUserSession',
  async (_, { rejectWithValue }) => {
    const result = await authAPI.validateSession();
    if (!result.success) {
      return rejectWithValue(result.message);
    }
    return result;
  }
);

// ----------------------
// 🔧 Initial State
// ----------------------
const initialState = {
  // User data
  user: null,
  isAuthenticated: false,
  
  // Tokens
  accessToken: null,
  refreshToken: null,
  
  // Loading states
  isLoading: false,
  isLoginLoading: false,
  isSignupLoading: false,
  isRefreshing: false,
  
  // Error states
  error: null,
  loginError: null,
  signupError: null,
  
  // Session
  sessionChecked: false,
};

// ----------------------
// 🔄 Auth Slice
// ----------------------
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Clear errors
    clearAuthError: (state) => {
      state.error = null;
      state.loginError = null;
      state.signupError = null;
    },
    
    // Set authentication from localStorage
    setAuthFromStorage: (state) => {
      const authStatus = checkAuthStatus();
      state.isAuthenticated = authStatus.isAuthenticated;
      state.user = authStatus.user;
      state.accessToken = authStatus.accessToken;
      state.refreshToken = authStatus.refreshToken;
      state.sessionChecked = true;
    },
    
    // Clear auth state
    clearAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.accessToken = null;
      state.refreshToken = null;
      state.error = null;
      state.loginError = null;
      state.signupError = null;
    },
    
    // Update tokens
    updateTokens: (state, action) => {
      const { accessToken, refreshToken } = action.payload;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoginLoading = true;
        state.loginError = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoginLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.data.accessToken;
        state.refreshToken = action.payload.data.refreshToken;
        state.loginError = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoginLoading = false;
        state.loginError = action.payload;
        state.isAuthenticated = false;
        state.user = null;
      })
      
      // Signup
      .addCase(signupUser.pending, (state) => {
        state.isSignupLoading = true;
        state.signupError = null;
      })
      .addCase(signupUser.fulfilled, (state) => {
        state.isSignupLoading = false;
        state.signupError = null;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.isSignupLoading = false;
        state.signupError = action.payload;
      })
      
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.accessToken = null;
        state.refreshToken = null;
        state.error = null;
      })
      
      // Refresh Token
      .addCase(refreshUserToken.pending, (state) => {
        state.isRefreshing = true;
      })
      .addCase(refreshUserToken.fulfilled, (state, action) => {
        state.isRefreshing = false;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
      })
      .addCase(refreshUserToken.rejected, (state) => {
        state.isRefreshing = false;
        state.user = null;
        state.isAuthenticated = false;
        state.accessToken = null;
        state.refreshToken = null;
      })
      
      // Validate Session
      .addCase(validateUserSession.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.sessionChecked = true;
      })
      .addCase(validateUserSession.rejected, (state) => {
        state.sessionChecked = true;
      });
  },
});

export const { 
  clearAuthError, 
  setAuthFromStorage, 
  clearAuth, 
  updateTokens 
} = authSlice.actions;

export default authSlice.reducer;
