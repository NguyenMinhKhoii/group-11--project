// backend/middleware/roleMiddleware.js

// Định nghĩa các role và cấp độ quyền
const ROLES = {
  USER: 'user',
  MODERATOR: 'moderator', 
  ADMIN: 'admin'
};

// Hierarchy của roles (số càng cao thì quyền càng lớn)
const ROLE_HIERARCHY = {
  [ROLES.USER]: 1,
  [ROLES.MODERATOR]: 2,
  [ROLES.ADMIN]: 3
};

// Middleware kiểm tra vai trò chính xác (RBAC)
function checkRole(requiredRole) {
  return (req, res, next) => {
    // Kiểm tra xem người dùng đã xác thực hay chưa
    if (!req.user) {
      return res.status(401).json({ 
        message: "Chưa đăng nhập!",
        error: "NOT_AUTHENTICATED" 
      });
    }

    // Kiểm tra user có role không
    if (!req.user.role) {
      return res.status(403).json({ 
        message: "Người dùng chưa được phân quyền!",
        error: "NO_ROLE_ASSIGNED" 
      });
    }

    // Kiểm tra quyền truy cập chính xác
    if (req.user.role !== requiredRole) {
      return res.status(403).json({ 
        message: `Cần quyền ${requiredRole}, nhưng bạn chỉ có quyền ${req.user.role}!`,
        error: "INSUFFICIENT_PERMISSIONS",
        required: requiredRole,
        current: req.user.role
      });
    }

    // Cho phép tiếp tục
    next();
  };
}

// Middleware kiểm tra cấp độ quyền (hierarchical)
function checkRoleLevel(minimumRole) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: "Chưa đăng nhập!",
        error: "NOT_AUTHENTICATED" 
      });
    }

    if (!req.user.role) {
      return res.status(403).json({ 
        message: "Người dùng chưa được phân quyền!",
        error: "NO_ROLE_ASSIGNED" 
      });
    }

    const userLevel = ROLE_HIERARCHY[req.user.role] || 0;
    const requiredLevel = ROLE_HIERARCHY[minimumRole] || 0;

    if (userLevel < requiredLevel) {
      return res.status(403).json({
        message: `Cần tối thiểu quyền ${minimumRole}, bạn chỉ có quyền ${req.user.role}!`,
        error: "INSUFFICIENT_ROLE_LEVEL",
        required: minimumRole,
        current: req.user.role
      });
    }

    next();
  };
}

// Middleware kiểm tra nhiều role (OR logic)
function checkAnyRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: "Chưa đăng nhập!",
        error: "NOT_AUTHENTICATED" 
      });
    }

    if (!req.user.role) {
      return res.status(403).json({ 
        message: "Người dùng chưa được phân quyền!",
        error: "NO_ROLE_ASSIGNED" 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Cần một trong các quyền: ${allowedRoles.join(', ')}, bạn có quyền: ${req.user.role}`,
        error: "ROLE_NOT_ALLOWED",
        allowed: allowedRoles,
        current: req.user.role
      });
    }

    next();
  };
}

module.exports = { 
  checkRole, 
  checkRoleLevel, 
  checkAnyRole, 
  ROLES 
};
