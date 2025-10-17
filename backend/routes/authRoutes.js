const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { generateAccessToken, generateRefreshToken } = require("../utils/token");
const refreshTokenStore = require("../utils/refreshTokenStore");
const { ROLES } = require("../middleware/roleMiddleware");
const { logActivity, ACTIONS } = require("../middleware/activityMiddleware");
const { loginRateLimit } = require("../middleware/rateLimitMiddleware");
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

// === SV1: API /auth/register ===
router.post("/register", 
  logActivity(ACTIONS.REGISTER_ATTEMPT),
  (req, res) => {
    const { name, email, password, role = ROLES.USER } = req.body;

    // Kiểm tra input
    if (!name || !email || !password) {
      return res.status(400).json({ 
        error: "Tên, email và mật khẩu là bắt buộc!" 
      });
    }

    // Kiểm tra email đã tồn tại
    const existingUser = TEST_USERS.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ 
        error: "Email đã được sử dụng!" 
      });
    }

    // Tạo user mới
    const newUser = {
      id: TEST_USERS.length + 1,
      email,
      password,
      name,
      role: role || ROLES.USER
    };

    // Thêm vào danh sách users
    TEST_USERS.push(newUser);

    res.status(201).json({
      message: "Đăng ký thành công!",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  }
);

// === SV1: API /auth/login ===
router.post("/login", 
  loginRateLimit({ maxAttempts: 5 }),
  logActivity(ACTIONS.LOGIN_ATTEMPT),
  (req, res) => {
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

// === HOẠT ĐỘNG 4 - SV1: Forgot Password & Reset Password ===

const { sendPasswordResetEmail } = require('../utils/emailConfig');
const { 
  generateResetToken, 
  verifyResetToken, 
  markTokenAsUsed,
  getActiveTokens 
} = require('../utils/passwordResetTokens');

// === SV1: API /auth/forgot-password - Gửi email reset password ===
router.post("/forgot-password", 
  logActivity(ACTIONS.PASSWORD_RESET_REQUEST),
  async (req, res) => {
  try {
    const { email } = req.body;

    // Validation
    if (!email) {
      return res.status(400).json({
        message: "Vui lòng nhập email!",
        error: "MISSING_EMAIL"
      });
    }

    // Kiểm tra email có tồn tại không
    const user = TEST_USERS.find(u => u.email === email);
    if (!user) {
      return res.status(404).json({
        message: "Email không tồn tại trong hệ thống!",
        error: "USER_NOT_FOUND"
      });
    }

    // Sinh reset token
    const resetToken = generateResetToken(user.id, user.email);

    // Gửi email
    const emailResult = await sendPasswordResetEmail(email, resetToken, user.name);

    if (emailResult.success) {
      res.json({
        message: "Email reset password đã được gửi!",
        email: email,
        resetToken: resetToken, // Chỉ để debug, thực tế không trả về
        expiresIn: "15 minutes"
      });
    } else {
      res.status(500).json({
        message: "Lỗi gửi email!",
        error: "EMAIL_SEND_FAILED",
        details: emailResult.error
      });
    }

  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({
      message: "Lỗi server!",
      error: "INTERNAL_SERVER_ERROR"
    });
  }
});

// === SV1: API /auth/reset-password/:token - Reset password với token ===
router.post("/reset-password/:token", 
  logActivity(ACTIONS.PASSWORD_RESET_SUCCESS),
  (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword, confirmPassword } = req.body;

    // Validation
    if (!newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "Vui lòng nhập mật khẩu mới và xác nhận mật khẩu!",
        error: "MISSING_PASSWORD"
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "Mật khẩu xác nhận không khớp!",
        error: "PASSWORD_MISMATCH"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Mật khẩu phải có ít nhất 6 ký tự!",
        error: "PASSWORD_TOO_SHORT"
      });
    }

    // Verify token
    const tokenData = verifyResetToken(token);
    if (!tokenData) {
      return res.status(400).json({
        message: "Token không hợp lệ hoặc đã hết hạn!",
        error: "INVALID_TOKEN"
      });
    }

    // Tìm user và cập nhật password
    const userIndex = TEST_USERS.findIndex(u => u.id === tokenData.userId);
    if (userIndex === -1) {
      return res.status(404).json({
        message: "Người dùng không tồn tại!",
        error: "USER_NOT_FOUND"
      });
    }

    // Cập nhật password (trong thực tế sẽ hash password)
    TEST_USERS[userIndex].password = newPassword;
    
    // Mark token as used
    markTokenAsUsed(token);

    console.log(`✅ Password reset successful for user ${tokenData.userId} (${tokenData.email})`);

    res.json({
      message: "Đặt lại mật khẩu thành công!",
      user: {
        id: TEST_USERS[userIndex].id,
        email: TEST_USERS[userIndex].email,
        name: TEST_USERS[userIndex].name
      }
    });

  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(500).json({
      message: "Lỗi server!",
      error: "INTERNAL_SERVER_ERROR"
    });
  }
});

// === SV1: API Debug - kiểm tra active reset tokens ===
router.get("/debug/reset-tokens", (req, res) => {
  res.json({
    message: "Debug: Active reset tokens",
    activeTokens: getActiveTokens()
  });
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
module.exports.TEST_USERS = TEST_USERS;
