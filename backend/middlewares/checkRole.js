// backend/middlewares/checkRole.js

const checkRole = function (roles = []) {
    // Nếu roles là chuỗi, chuyển thành mảng
    if (typeof roles === "string") {
        roles = [roles];
    }

    // Middleware chính
    return (req, res, next) => {
        // Kiểm tra xem req.user có tồn tại và role của user có nằm trong danh sách cho phép không
        // Giả định verifyToken đã chạy trước đó và đính kèm req.user
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false,
                message: "Không có quyền truy cập!" 
            });
        }
        next();
    };
};

// ✅ SỬA LỖI: Export trực tiếp hàm, không dùng đối tượng { checkRole }
module.exports = checkRole;