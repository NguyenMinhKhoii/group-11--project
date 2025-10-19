/**
 * Protected Route Component
 * Hoạt động 6 - Frontend Redux & Protected Routes
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { selectIsAuthenticated, selectAuthLoading } from '../../redux/slices/authSlice';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);
  const user = useSelector(state => state.auth.user);
  const location = useLocation();

  console.log('🛡️ ProtectedRoute check:', {
    isAuthenticated,
    loading,
    user: user?.email,
    role: user?.role,
    requiredRole,
    currentPath: location.pathname
  });

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <span className="ms-2">Checking authentication...</span>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log('❌ Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRole && user?.role !== requiredRole) {
    console.log(`❌ Access denied. Required: ${requiredRole}, User has: ${user?.role}`);
    return (
      <div className="container mt-5">
        <div className="alert alert-danger text-center">
          <h4>🚫 Access Denied</h4>
          <p>You don't have permission to access this page.</p>
          <p>Required role: <strong>{requiredRole}</strong></p>
          <p>Your role: <strong>{user?.role || 'none'}</strong></p>
          <button 
            className="btn btn-primary"
            onClick={() => window.history.back()}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  console.log('✅ Access granted');
  return children;
};

export default ProtectedRoute;