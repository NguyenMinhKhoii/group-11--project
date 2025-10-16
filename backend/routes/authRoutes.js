const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { generateAccessToken, generateRefreshToken } = require("../utils/token");
const refreshTokenStore = require("../utils/refreshTokenStore");
const { ROLES } = require("../middleware/roleMiddleware");
require("dotenv").config();

// Dữ liệu test users với roles khác nhau
const TEST_USERS = [
  {
    id: 1,
    email: "user@example.com",
    password: "123456",
    name: "Test User",
    role: ROLES.USER
  },
  {
    id: 2, 
    email: "moderator@example.com",
    password: "123456",
    name: "Test Moderator",
    role: ROLES.MODERATOR
  },
  {
    id: 3,
    email: "admin@example.com", 
    password: "123456",
    name: "Test Admin",
    role: ROLES.ADMIN
  }
];

// === SV1: API /auth/login ===
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Tìm user trong dữ liệu test
  const user = TEST_USERS.find(u => u.email === email && u.password === password);
  
  if (user) {
    // Tạo payload cho token (bao gồm role)
    const tokenPayload = { 
      id: user.id,
      email: user.email, 
      name: user.name,
      role: user.role 
    };
    
    // Tạo Access Token và Refresh Token
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);
    
    // Lưu refresh token
    refreshTokenStore.add(refreshToken);
    
    return res.json({
      message: "Đăng nhập thành công!",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  }

  res.status(401).json({ message: "Sai email hoặc mật khẩu!" });
});

// === SV1: API /auth/refresh ===
router.post("/refresh", (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token is required!" });
  }
  
  if (!refreshTokenStore.has(refreshToken)) {
    return res.status(403).json({ message: "Refresh token not valid!" });
  }
  
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || "refreshsecret", (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Refresh token not valid!" });
    }
    
    // Tạo access token mới
    const newAccessToken = generateAccessToken({ email: user.email, name: user.name });
    
    res.json({
      message: "Token refreshed successfully!",
      accessToken: newAccessToken,
    });
  });
});

// === SV1: API /auth/logout ===
router.post("/logout", (req, res) => {
  const { refreshToken } = req.body;
  
  if (refreshToken) {
    // Xóa refresh token khỏi store
    refreshTokenStore.remove(refreshToken);
  }
  
  res.json({ message: "Đăng xuất thành công!" });
});

// === SV1: API Debug - kiểm tra refresh tokens (chỉ dùng để test) ===
router.get("/debug/tokens", (req, res) => {
  res.json({
    message: "Debug: Refresh tokens info",
    count: refreshTokenStore.count(),
    tokens: refreshTokenStore.getAll()
  });
});

module.exports = router;
