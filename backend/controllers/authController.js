const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const User = require("../models/User");

// Đăng ký
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Kiểm tra email trùng
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email đã tồn tại!" });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user mới
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: "Đăng ký thành công!", user: newUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Tìm user theo email
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Email không tồn tại!" });

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Sai mật khẩu!" });

    // Tạo JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, "SECRET_KEY", {
      expiresIn: "1h",
    });

    res.json({ message: "Đăng nhập thành công!", token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const users = require("../models/userModel");

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

// ----------------------
// 🔴 Đăng xuất (Logout)
// ----------------------
exports.logout = (req, res) => {
  // JWT không lưu trên server, nên chỉ cần client xóa token là xong
  res.status(200).json({ message: "Đăng xuất thành công! (Client xóa token)" });
};
