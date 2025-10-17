// RBAC utilities for role-based access control

// Role constants
export const ROLES = {
  USER: 'user',
  MODERATOR: 'moderator', 
  ADMIN: 'admin'
};

// Role hierarchy (higher number = more permissions)
export const ROLE_HIERARCHY = {
  [ROLES.USER]: 1,
  [ROLES.MODERATOR]: 2,
  [ROLES.ADMIN]: 3
};

// Check if user has specific role
export const hasRole = (userRole, requiredRole) => {
  if (!userRole || !requiredRole) return false;
  return userRole === requiredRole;
};

// Check if user has role or higher
export const hasRoleOrHigher = (userRole, requiredRole) => {
  if (!userRole || !requiredRole) return false;
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
};

// Check if user is admin
export const isAdmin = (userRole) => {
  return hasRole(userRole, ROLES.ADMIN);
};

// Check if user is moderator or admin
export const isModerator = (userRole) => {
  return hasRoleOrHigher(userRole, ROLES.MODERATOR);
};

// Check if user can access admin features
export const canAccessAdmin = (userRole) => {
  return isAdmin(userRole);
};

// Check if user can access moderator features
export const canAccessModerator = (userRole) => {
  return isModerator(userRole);
};

// Get role display name
export const getRoleDisplayName = (role) => {
  const roleNames = {
    [ROLES.USER]: '👤 Người dùng',
    [ROLES.MODERATOR]: '🛡️ Điều hành viên',
    [ROLES.ADMIN]: '👑 Quản trị viên'
  };
  return roleNames[role] || '❓ Không rõ';
};

// Get role color
export const getRoleColor = (role) => {
  const roleColors = {
    [ROLES.USER]: '#28a745',
    [ROLES.MODERATOR]: '#ffc107', 
    [ROLES.ADMIN]: '#dc3545'
  };
  return roleColors[role] || '#6c757d';
};

// Get permissions by role
export const getPermissionsByRole = (role) => {
  const permissions = {
    [ROLES.USER]: [
      'view_profile',
      'edit_profile',
      'upload_avatar',
      'share_data'
    ],
    [ROLES.MODERATOR]: [
      'view_profile',
      'edit_profile', 
      'upload_avatar',
      'share_data',
      'moderate_content',
      'view_reports',
      'manage_posts'
    ],
    [ROLES.ADMIN]: [
      'view_profile',
      'edit_profile',
      'upload_avatar', 
      'share_data',
      'moderate_content',
      'view_reports',
      'manage_posts',
      'manage_users',
      'view_admin_dashboard',
      'system_settings',
      'delete_users',
      'assign_roles'
    ]
  };
  
  return permissions[role] || [];
};

// Check if user has specific permission
export const hasPermission = (userRole, permission) => {
  const userPermissions = getPermissionsByRole(userRole);
  return userPermissions.includes(permission);
};