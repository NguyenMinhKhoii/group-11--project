// components/RoleProtectedRoute.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { useRBAC } from '../hooks/useRBAC';

const RoleProtectedRoute = ({ children, allowedRoles = [], fallback = null }) => {
  const location = useLocation();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { hasRole } = useRBAC();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated but doesn't have required role
  if (!hasRole(allowedRoles)) {
    if (fallback) {
      return fallback;
    }
    
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          <h4><i className="fas fa-ban me-2"></i>Access Denied</h4>
          <p>You don't have permission to access this page.</p>
          <p>Required roles: <strong>{allowedRoles.join(', ')}</strong></p>
          <hr />
          <div className="mb-0">
            <button 
              className="btn btn-secondary" 
              onClick={() => window.history.back()}
            >
              <i className="fas fa-arrow-left me-2"></i>Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default RoleProtectedRoute;