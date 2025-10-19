/**
 * Redux Store for HTML pages - Hoạt động 6
 * Tích hợp Redux vào giao diện HTML có sẵn
 */

// Redux CDN - Add to HTML files
// <script src="https://unpkg.com/@reduxjs/toolkit@1.9.7/dist/redux-toolkit.umd.js"></script>

const { configureStore, createSlice, createAsyncThunk } = RTK;

// API Base URL
const API_BASE = 'http://localhost:5173';

// Auth Async Thunks
const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      
      // Store tokens in localStorage
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const registerUser = createAsyncThunk(
  'auth/registerUser', 
  async (userData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { getState }) => {
    try {
      const { auth } = getState();
      
      if (auth.refreshToken) {
        // Call logout API to invalidate refresh token
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth.accessToken}`
          },
          body: JSON.stringify({ refreshToken: auth.refreshToken }),
        });
      }
      
      // Clear localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      return null;
    } catch (error) {
      // Even if logout API fails, clear local storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      return null;
    }
  }
);

// Auth Slice
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isAuthenticated: !!localStorage.getItem('accessToken'),
    user: JSON.parse(localStorage.getItem('user')) || null,
    accessToken: localStorage.getItem('accessToken') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    loading: false,
    error: null,
    lastActivity: localStorage.getItem('lastActivity') || null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateLastActivity: (state) => {
      const now = new Date().toISOString();
      state.lastActivity = now;
      localStorage.setItem('lastActivity', now);
    },
    clearAuth: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.error = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('lastActivity');
    }
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.error = null;
        state.lastActivity = new Date().toISOString();
        localStorage.setItem('lastActivity', state.lastActivity);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
      })
      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout cases
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.error = null;
        state.lastActivity = null;
      });
  },
});

// Export actions
const { clearError, updateLastActivity, clearAuth } = authSlice.actions;

// Selectors
const selectAuth = (state) => state.auth;
const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
const selectUser = (state) => state.auth.user;
const selectAuthLoading = (state) => state.auth.loading;
const selectAuthError = (state) => state.auth.error;

// Configure Redux Store
const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

// Activity Tracker - Update last activity on user actions
let activityTimer;
function startActivityTracking() {
  function trackActivity() {
    if (store.getState().auth.isAuthenticated) {
      store.dispatch(updateLastActivity());
    }
  }
  
  // Track mouse movement, clicks, keyboard
  document.addEventListener('mousedown', trackActivity);
  document.addEventListener('keydown', trackActivity);
  document.addEventListener('scroll', trackActivity);
  
  // Auto-update every 5 minutes
  activityTimer = setInterval(() => {
    if (store.getState().auth.isAuthenticated) {
      store.dispatch(updateLastActivity());
    }
  }, 5 * 60 * 1000); // 5 minutes
}

// Auto-logout after 30 minutes of inactivity
function checkInactivity() {
  const state = store.getState().auth;
  if (state.isAuthenticated && state.lastActivity) {
    const lastActivity = new Date(state.lastActivity);
    const now = new Date();
    const diffMinutes = (now - lastActivity) / (1000 * 60);
    
    if (diffMinutes > 30) {
      console.log('🚪 Auto-logout due to inactivity');
      store.dispatch(logoutUser());
      alert('Phiên đăng nhập đã hết hạn do không hoạt động!');
      window.location.href = '/login.html';
    }
  }
}

// Check inactivity every minute
setInterval(checkInactivity, 60 * 1000);

// Start activity tracking when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startActivityTracking);
} else {
  startActivityTracking();
}

// Global Redux Helper Functions
window.ReduxStore = store;
window.ReduxActions = {
  loginUser,
  registerUser, 
  logoutUser,
  clearError,
  updateLastActivity,
  clearAuth
};
window.ReduxSelectors = {
  selectAuth,
  selectIsAuthenticated,
  selectUser,
  selectAuthLoading,
  selectAuthError
};

console.log('🔄 Redux Store initialized for HTML pages');
console.log('📊 Current auth state:', store.getState().auth);