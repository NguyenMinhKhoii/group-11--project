const jwt = require("jsonwebtoken");
const fs = require("fs");

let resetTokens = {}; // { email: token }

exports.forgotPassword = (req, res) => {
  const { email } = req.body;
  const user = global.users.find(u => u.email === email);
  if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng!" });

  const token = jwt.sign({ email }, "RESET_SECRET", { expiresIn: "10m" });
  resetTokens[email] = token;

  console.log(`🟢 Token reset cho ${email}: ${token}`);
  res.json({ message: "Đã gửi token reset (xem console để test)", token });
};

exports.resetPassword = (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const decoded = jwt.verify(token, "RESET_SECRET");
    const user = global.users.find(u => u.email === decoded.email);
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng!" });

    user.password = newPassword;
    delete resetTokens[decoded.email];
    res.json({ message: "Đặt lại mật khẩu thành công!" });
  } catch (err) {
    res.status(400).json({ message: "Token không hợp lệ hoặc đã hết hạn!" });
  }
};

exports.uploadAvatar = (req, res) => {
  const userId = req.user.id;
  const user = global.users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng!" });

  // Giả lập URL Cloudinary
  const avatarUrl = `https://fake-cloudinary.com/${req.file.filename}.jpg`;
  user.avatar = avatarUrl;

  res.json({ message: "Cập nhật avatar thành công!", avatar: avatarUrl });
};
