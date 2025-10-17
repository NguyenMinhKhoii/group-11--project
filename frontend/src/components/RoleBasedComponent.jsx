import React from 'react';
import { useRBAC } from '../hooks/useRBAC';

// Component hiển thị dựa theo role
export const RoleBasedComponent = ({ 
  allowedRoles = [], 
  requiredPermission = null,
  requireAuth = true,
  fallback = null,
  children 
}) => {
  const { isAuthenticated, userRole, hasRole, hasPermission } = useRBAC();

  // Kiểm tra authentication nếu cần
  if (requireAuth && !isAuthenticated) {
    return fallback;
  }

  // Kiểm tra permission nếu có
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return fallback;
  }

  // Kiểm tra role nếu có
  if (allowedRoles.length > 0) {
    const hasValidRole = allowedRoles.some(role => hasRole(role));
    if (!hasValidRole) {
      return fallback;
    }
  }

  return <>{children}</>;
};

// Component chỉ hiển thị cho Admin
export const AdminOnly = ({ children, fallback = null }) => {
  const { canAccessAdmin } = useRBAC();
  
  if (!canAccessAdmin()) {
    return fallback;
  }
  
  return <>{children}</>;
};

// Component chỉ hiển thị cho Moderator trở lên
export const ModeratorOnly = ({ children, fallback = null }) => {
  const { canAccessModerator } = useRBAC();
  
  if (!canAccessModerator()) {
    return fallback;
  }
  
  return <>{children}</>;
};

// Component hiển thị thông tin role
export const RoleDisplay = ({ style = {} }) => {
  const { getRoleDisplay, getRoleColor, userRole } = useRBAC();
  
  const roleStyle = {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold',
    color: 'white',
    backgroundColor: getRoleColor(),
    ...style
  };
  
  return (
    <span style={roleStyle} title={`Role: ${userRole}`}>
      {getRoleDisplay()}
    </span>
  );
};

// Protected Route dựa theo role
export const ProtectedByRole = ({ 
  allowedRoles = [], 
  requiredPermission = null,
  children,
  fallbackComponent = null 
}) => {
  const { isAuthenticated, userRole, hasRole, hasPermission } = useRBAC();

  if (!isAuthenticated) {
    return fallbackComponent || (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        backgroundColor: '#f8f9fa',
        border: '2px dashed #dee2e6',
        borderRadius: '8px'
      }}>
        <h3>🔐 Yêu cầu đăng nhập</h3>
        <p>Bạn cần đăng nhập để truy cập trang này.</p>
      </div>
    );
  }

  // Kiểm tra permission
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return fallbackComponent || (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        backgroundColor: '#fff3cd',
        border: '2px dashed #ffeaa7',
        borderRadius: '8px'
      }}>
        <h3>⚠️ Không đủ quyền</h3>
        <p>Bạn không có quyền <strong>{requiredPermission}</strong> để truy cập trang này.</p>
        <RoleDisplay />
      </div>
    );
  }

  // Kiểm tra role
  if (allowedRoles.length > 0) {
    const hasValidRole = allowedRoles.some(role => hasRole(role));
    if (!hasValidRole) {
      return fallbackComponent || (
        <div style={{ 
          padding: '40px', 
          textAlign: 'center',
          backgroundColor: '#f8d7da',
          border: '2px dashed #f1aeb5',
          borderRadius: '8px'
        }}>
          <h3>🚫 Truy cập bị từ chối</h3>
          <p>Role của bạn không được phép truy cập trang này.</p>
          <p><strong>Yêu cầu:</strong> {allowedRoles.join(', ')}</p>
          <p><strong>Role hiện tại:</strong> <RoleDisplay /></p>
        </div>
      );
    }
  }

  return <>{children}</>;
};