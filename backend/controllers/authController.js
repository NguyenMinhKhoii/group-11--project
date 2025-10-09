const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const users = require("../models/userModel");

// Khóa bí mật JWT
const SECRET_KEY = "group11_secret_key"; // Có thể đổi theo nhóm

// ----------------------
// 🟢 Đăng ký (Sign Up)
// ----------------------
exports.signup = async (req, res) => {
  const { name, email, password } = req.body;

  // Kiểm tra dữ liệu
  if (!name || !email || !password)
    return res.status(400).json({ message: "Thiếu thông tin đăng ký!" });

  // Kiểm tra email trùng
  const existingUser = users.find((u) => u.email === email);
  if (existingUser)
    return res.status(400).json({ message: "Email đã tồn tại!" });

  // Mã hóa mật khẩu
  const hashedPassword = await bcrypt.hash(password, 10);

  // Tạo user mới
  const newUser = {
    id: users.length + 1,
    name,
    email,
    password: hashedPassword,
  };

  users.push(newUser);

  res.status(201).json({
    message: "Đăng ký thành công!",
    user: { id: newUser.id, name: newUser.name, email: newUser.email },
  });
};

// ----------------------
// 🟡 Đăng nhập (Login)
// ----------------------
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Thiếu email hoặc mật khẩu!" });

  const user = users.find((u) => u.email === email);
  if (!user) return res.status(404).json({ message: "Email không tồn tại!" });

  // So sánh mật khẩu
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: "Sai mật khẩu!" });

  // Tạo JWT token (hết hạn sau 1 giờ)
  const token = jwt.sign(
    { id: user.id, email: user.email },
    SECRET_KEY,
    { expiresIn: "1h" }
  );

  res.status(200).json({
    message: "Đăng nhập thành công!",
    token,
    user: { id: user.id, name: user.name, email: user.email },
  });
};

// ----------------------
// 🔴 Đăng xuất (Logout)
// ----------------------
exports.logout = (req, res) => {
  // JWT không lưu trên server, nên chỉ cần client xóa token là xong
  res.status(200).json({ message: "Đăng xuất thành công! (Client xóa token)" });
};
