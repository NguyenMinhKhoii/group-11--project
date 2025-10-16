// backend/middleware/roleMiddleware.js

// Middleware kiểm tra vai trò (RBAC)
function checkRole(requiredRole) {
  return (req, res, next) => {
    // Kiểm tra xem người dùng đã xác thực hay chưa
    if (!req.user) {
      return res.status(401).json({ message: "Chưa đăng nhập!" });
    }

    // Kiểm tra quyền truy cập
    if (req.user.role !== requiredRole) {
      return res.status(403).json({ message: "Không có quyền truy cập!" });
    }

    // Cho phép tiếp tục
    next();
  };
}

module.exports = checkRole; // ✅ Xuất ra function trực tiếp
