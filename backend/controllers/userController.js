// backend/controllers/userController.js
const User = require("../models/userModel");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Ẩn mật khẩu
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách người dùng." });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Chỉ admin hoặc chính chủ mới được xóa
    if (req.user.role !== "admin" && req.user._id.toString() !== userId) {
      return res.status(403).json({ message: "Không có quyền xóa tài khoản này." });
    }

    await User.findByIdAndDelete(userId);
    res.json({ message: "Đã xóa người dùng thành công." });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi xóa người dùng." });
  }
};
