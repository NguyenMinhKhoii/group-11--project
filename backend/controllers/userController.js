// backend/controllers/userController.js

const User = require("../models/User");

// ✅ HÀM NÀY PHẢI ĐƯỢC EXPORT ĐỂ ROUTES SỬ DỤNG
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select(
            "-password -resetToken -resetTokenExpiry -emailVerificationToken -loginAttempts -lockUntil"
        );
        if (!users || users.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy người dùng nào." });
        }
        res.status(200).json({
            success: true,
            message: "Lấy danh sách người dùng thành công.",
            count: users.length,
            users: users
        });
    } catch (err) {
        console.error("Error in getAllUsers:", err); 
        res.status(500).json({ success: false, message: "Lỗi máy chủ khi truy vấn người dùng." });
    }
};

// Hàm xóa User (cũng cần tồn tại)
exports.deleteUserById = async (req, res) => {
    try {
        const userId = req.params.id;
        // Ngăn admin tự xóa chính mình
        if (req.user.id === userId) {
            return res.status(400).json({ success: false, message: "Không thể tự xóa chính mình." });
        }
        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) {
             return res.status(404).json({ success: false, message: "Không tìm thấy người dùng để xóa." });
        }
        res.json({ success: true, message: "Đã xóa người dùng thành công." });
    } catch (err) {
        console.error("Error in deleteUserById:", err);
        res.status(500).json({ success: false, message: "Lỗi khi xóa người dùng." });
    }
};
