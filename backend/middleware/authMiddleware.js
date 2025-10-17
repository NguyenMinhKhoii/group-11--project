const jwt = require("jsonwebtoken");
const users = require("../models/userModel");

// Khóa bí mật JWT (phải giống với authController)
const SECRET_KEY = "group11_secret_key";

// ----------------------
// 🛡️ Middleware xác thực Access Token
// ----------------------
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: "Access token không được cung cấp!" });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          message: "Access token đã hết hạn!", 
          error: "TOKEN_EXPIRED" 
        });
      }
      return res.status(403).json({ message: "Access token không hợp lệ!" });
    }

    // Tìm user từ token
    const user = users.find(u => u.id === decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User không tồn tại!" });
    }

    // Gắn thông tin user vào request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: user.name
    };

    next();
  });
};

// ----------------------
// 🛡️ Middleware optional auth (không bắt buộc đăng nhập)
// ----------------------
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      req.user = null;
    } else {
      const user = users.find(u => u.id === decoded.id);
      req.user = user ? {
        id: decoded.id,
        email: decoded.email,
        name: user.name
      } : null;
    }
    next();
  });
};

module.exports = { authenticateToken, optionalAuth };