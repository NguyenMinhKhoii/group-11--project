import { useSelector } from 'react-redux';
import { 
  ROLES, 
  hasRole, 
  hasRoleOrHigher, 
  isAdmin, 
  isModerator,
  canAccessAdmin,
  canAccessModerator,
  hasPermission,
  getRoleDisplayName,
  getRoleColor,
  getPermissionsByRole
} from '../utils/rbac';

// Custom hook for RBAC functionality
export const useRBAC = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const userRole = user?.role || ROLES.USER;

  return {
    // User info
    user,
    userRole,
    isAuthenticated,
    
    // Role checking functions
    hasRole: (role) => hasRole(userRole, role),
    hasRoleOrHigher: (role) => hasRoleOrHigher(userRole, role),
    isAdmin: () => isAdmin(userRole),
    isModerator: () => isModerator(userRole),
    
    // Access checking
    canAccessAdmin: () => canAccessAdmin(userRole),
    canAccessModerator: () => canAccessModerator(userRole),
    hasPermission: (permission) => hasPermission(userRole, permission),
    
    // Display functions
    getRoleDisplay: () => getRoleDisplayName(userRole),
    getRoleColor: () => getRoleColor(userRole),
    getPermissions: () => getPermissionsByRole(userRole),
    
    // Role constants
    ROLES
  };
};