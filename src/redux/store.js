/**
 * Redux Store Configuration
 * Hoạt động 6 - Frontend Redux & Protected Routes
 */

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';

// Configure Redux Store với Redux Toolkit
export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production', // Enable Redux DevTools
});

// Export store for use in React components
export default store;