const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const users = require("../models/userModel");
const { RefreshTokenService } = require("../models/RefreshToken");

// Khóa bí mật JWT
const SECRET_KEY = "group11_secret_key"; // Có thể đổi theo nhóm
const REFRESH_SECRET_KEY = "group11_refresh_secret_key"; // Khóa riêng cho refresh token

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

  // Thu hồi tất cả refresh token cũ của user (đăng xuất các session khác)
  RefreshTokenService.revokeAllByUserId(user.id);

  // Tạo Access Token (hết hạn sau 15 phút)
  const accessToken = jwt.sign(
    { id: user.id, email: user.email },
    SECRET_KEY,
    { expiresIn: "15m" }
  );

  // Tạo Refresh Token (hết hạn sau 7 ngày)
  const refreshTokenObj = RefreshTokenService.create(user.id);

  res.status(200).json({
    message: "Đăng nhập thành công!",
    accessToken,
    refreshToken: refreshTokenObj.token,
    user: { id: user.id, name: user.name, email: user.email },
  });
};

// ----------------------
// 🔴 Đăng xuất (Logout)
// ----------------------
exports.logout = (req, res) => {
  const { refreshToken } = req.body;
  
  if (refreshToken) {
    // Thu hồi refresh token
    RefreshTokenService.revokeByToken(refreshToken);
  }

  res.status(200).json({ message: "Đăng xuất thành công!" });
};

// ----------------------
// 🔄 Làm mới token (Refresh Token)
// ----------------------
exports.refresh = (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token không được cung cấp!" });
  }

  // Tìm refresh token trong DB
  const tokenObj = RefreshTokenService.findByToken(refreshToken);
  if (!tokenObj) {
    return res.status(403).json({ message: "Refresh token không hợp lệ hoặc đã hết hạn!" });
  }

  // Tìm user từ refresh token
  const user = users.find(u => u.id === tokenObj.userId);
  if (!user) {
    return res.status(404).json({ message: "User không tồn tại!" });
  }

  // Tạo Access Token mới
  const newAccessToken = jwt.sign(
    { id: user.id, email: user.email },
    SECRET_KEY,
    { expiresIn: "15m" }
  );

  // Tạo Refresh Token mới (rotation)
  RefreshTokenService.revokeByToken(refreshToken); // Thu hồi token cũ
  const newRefreshTokenObj = RefreshTokenService.create(user.id);

  res.status(200).json({
    message: "Token làm mới thành công!",
    accessToken: newAccessToken,
    refreshToken: newRefreshTokenObj.token,
    user: { id: user.id, name: user.name, email: user.email },
  });
};

// ----------------------
// 🟠 Quên mật khẩu (Forgot Password)
// ----------------------
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email không được cung cấp!" });
  }

  // Kiểm tra email có tồn tại không
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(404).json({ message: "Email không tồn tại trong hệ thống!" });
  }

  // Tạo token reset (sử dụng JWT với thời hạn ngắn)
  const resetToken = jwt.sign(
    { id: user.id, email: user.email, purpose: 'reset_password' },
    SECRET_KEY,
    { expiresIn: "30m" } // Token reset có hiệu lực 30 phút
  );

  // Trong thực tế, bạn sẽ gửi email chứa resetToken
  // Ở đây chúng ta return token để test
  res.status(200).json({
    message: "✅ Gửi thành công! Token reset đã được tạo.",
    resetToken: resetToken,
    instructions: "Sử dụng token này để reset mật khẩu trong vòng 30 phút.",
    user: { id: user.id, name: user.name, email: user.email }
  });
};
