const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authMiddleware");
const { checkRole, checkRoleLevel, checkAnyRole, ROLES } = require("../middleware/roleMiddleware");

// Dữ liệu test users (trong thực tế sẽ lưu trong database)
let USERS_DATA = [
  {
    id: 1,
    email: "user@example.com",
    name: "Test User",
    role: ROLES.USER,
    createdAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: 2, 
    email: "moderator@example.com",
    name: "Test Moderator",
    role: ROLES.MODERATOR,
    createdAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: 3,
    email: "admin@example.com", 
    name: "Test Admin",
    role: ROLES.ADMIN,
    createdAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: 4,
    email: "user2@example.com",
    name: "Another User", 
    role: ROLES.USER,
    createdAt: new Date().toISOString(),
    isActive: false
  }
];

// === Activity 6: Admin Dashboard Root Endpoint ===
router.get("/", authenticateToken, checkRole(ROLES.ADMIN), (req, res) => {
  res.json({
    message: "Admin dashboard access granted",
    data: {
      adminInfo: "Only admins can see this content",
      systemStats: {
        totalUsers: USERS_DATA.length,
        activeUsers: USERS_DATA.filter(u => u.isActive).length,
        totalAdmins: USERS_DATA.filter(u => u.role === ROLES.ADMIN).length,
        serverUptime: process.uptime(),
        timestamp: new Date().toISOString()
      },
      adminActions: [
        { name: "Manage Users", endpoint: "/admin/users" },
        { name: "View Statistics", endpoint: "/admin/users/stats" },
        { name: "System Logs", endpoint: "/admin/logs" }
      ]
    }
  });
});

// === SV1: API quản lý users - chỉ Admin mới truy cập được ===

// GET /admin/users - Lấy danh sách tất cả users (Admin only)
router.get("/users", authenticateToken, checkRole(ROLES.ADMIN), (req, res) => {
  const { page = 1, limit = 10, role, isActive } = req.query;
  
  let filteredUsers = [...USERS_DATA];
  
  // Filter theo role nếu có
  if (role) {
    filteredUsers = filteredUsers.filter(user => user.role === role);
  }
  
  // Filter theo isActive nếu có
  if (isActive !== undefined) {
    const activeFilter = isActive === 'true';
    filteredUsers = filteredUsers.filter(user => user.isActive === activeFilter);
  }
  
  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
  
  res.json({
    message: "Danh sách người dùng",
    data: paginatedUsers,
    pagination: {
      current_page: parseInt(page),
      per_page: parseInt(limit),
      total: filteredUsers.length,
      total_pages: Math.ceil(filteredUsers.length / limit)
    },
    requester: {
      id: req.user.id,
      role: req.user.role,
      name: req.user.name
    }
  });
});

// GET /admin/users/:id - Lấy thông tin 1 user cụ thể (Admin only)
router.get("/users/:id", authenticateToken, checkRole(ROLES.ADMIN), (req, res) => {
  const userId = parseInt(req.params.id);
  const user = USERS_DATA.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ 
      message: "Không tìm thấy người dùng!",
      error: "USER_NOT_FOUND" 
    });
  }
  
  res.json({
    message: "Thông tin người dùng",
    data: user,
    requester: {
      id: req.user.id,
      role: req.user.role,
      name: req.user.name
    }
  });
});

// PUT /admin/users/:id/role - Thay đổi role của user (Admin only)
router.put("/users/:id/role", authenticateToken, checkRole(ROLES.ADMIN), (req, res) => {
  const userId = parseInt(req.params.id);
  const { role } = req.body;
  
  // Validate role
  if (!Object.values(ROLES).includes(role)) {
    return res.status(400).json({
      message: "Role không hợp lệ!",
      error: "INVALID_ROLE",
      validRoles: Object.values(ROLES)
    });
  }
  
  // Tìm user
  const userIndex = USERS_DATA.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ 
      message: "Không tìm thấy người dùng!",
      error: "USER_NOT_FOUND" 
    });
  }
  
  // Không cho phép admin thay đổi role của chính mình
  if (userId === req.user.id) {
    return res.status(403).json({
      message: "Không thể thay đổi role của chính mình!",
      error: "CANNOT_MODIFY_SELF"
    });
  }
  
  const oldRole = USERS_DATA[userIndex].role;
  USERS_DATA[userIndex].role = role;
  USERS_DATA[userIndex].updatedAt = new Date().toISOString();
  
  res.json({
    message: "Thay đổi quyền thành công!",
    data: {
      userId: userId,
      oldRole: oldRole,
      newRole: role,
      updatedBy: req.user.name,
      updatedAt: USERS_DATA[userIndex].updatedAt
    }
  });
});

// PUT /admin/users/:id/status - Kích hoạt/vô hiệu hóa user (Admin only)
router.put("/users/:id/status", authenticateToken, checkRole(ROLES.ADMIN), (req, res) => {
  const userId = parseInt(req.params.id);
  const { isActive } = req.body;
  
  if (typeof isActive !== 'boolean') {
    return res.status(400).json({
      message: "isActive phải là boolean (true/false)!",
      error: "INVALID_STATUS"
    });
  }
  
  const userIndex = USERS_DATA.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ 
      message: "Không tìm thấy người dùng!",
      error: "USER_NOT_FOUND" 
    });
  }
  
  // Không cho phép admin vô hiệu hóa chính mình
  if (userId === req.user.id && !isActive) {
    return res.status(403).json({
      message: "Không thể vô hiệu hóa tài khoản của chính mình!",
      error: "CANNOT_DEACTIVATE_SELF"
    });
  }
  
  const oldStatus = USERS_DATA[userIndex].isActive;
  USERS_DATA[userIndex].isActive = isActive;
  USERS_DATA[userIndex].updatedAt = new Date().toISOString();
  
  res.json({
    message: `${isActive ? 'Kích hoạt' : 'Vô hiệu hóa'} tài khoản thành công!`,
    data: {
      userId: userId,
      oldStatus: oldStatus,
      newStatus: isActive,
      updatedBy: req.user.name,
      updatedAt: USERS_DATA[userIndex].updatedAt
    }
  });
});

// DELETE /admin/users/:id - Xóa user (Admin only)
router.delete("/users/:id", authenticateToken, checkRole(ROLES.ADMIN), (req, res) => {
  const userId = parseInt(req.params.id);
  
  const userIndex = USERS_DATA.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ 
      message: "Không tìm thấy người dùng!",
      error: "USER_NOT_FOUND" 
    });
  }
  
  // Không cho phép admin xóa chính mình
  if (userId === req.user.id) {
    return res.status(403).json({
      message: "Không thể xóa tài khoản của chính mình!",
      error: "CANNOT_DELETE_SELF"
    });
  }
  
  const deletedUser = USERS_DATA[userIndex];
  USERS_DATA.splice(userIndex, 1);
  
  res.json({
    message: "Xóa người dùng thành công!",
    data: {
      deletedUser: {
        id: deletedUser.id,
        email: deletedUser.email,
        name: deletedUser.name,
        role: deletedUser.role
      },
      deletedBy: req.user.name,
      deletedAt: new Date().toISOString()
    }
  });
});

// === API cho Moderator và Admin ===

// GET /admin/users/stats - Thống kê users (Moderator & Admin)
router.get("/users/stats", authenticateToken, checkAnyRole(ROLES.MODERATOR, ROLES.ADMIN), (req, res) => {
  const stats = {
    total: USERS_DATA.length,
    byRole: {
      [ROLES.USER]: USERS_DATA.filter(u => u.role === ROLES.USER).length,
      [ROLES.MODERATOR]: USERS_DATA.filter(u => u.role === ROLES.MODERATOR).length,
      [ROLES.ADMIN]: USERS_DATA.filter(u => u.role === ROLES.ADMIN).length
    },
    byStatus: {
      active: USERS_DATA.filter(u => u.isActive).length,
      inactive: USERS_DATA.filter(u => !u.isActive).length
    }
  };
  
  res.json({
    message: "Thống kê người dùng",
    data: stats,
    requester: {
      id: req.user.id,
      role: req.user.role,
      name: req.user.name
    }
  });
});

module.exports = router;