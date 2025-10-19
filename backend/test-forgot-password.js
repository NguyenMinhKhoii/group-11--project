const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const path = require("path");
const multer = require("multer");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase payload limit
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve static files from parent directory
app.use(express.static(path.join(__dirname, '..')));

// Test users
const TEST_USERS = [
  { id: 1, email: "user@example.com", password: "123456", name: "Test User", avatar: null },
  { id: 2, email: "admin@example.com", password: "123456", name: "Admin User", avatar: null },
  { id: 3, email: "khoi@gmail.com", password: "123456", name: "Quoc Khoi", avatar: null },
  { id: 4, email: "student@example.com", password: "123456", name: "Student Test", avatar: null }
];

// Reset tokens storage
let resetTokens = {};

// Avatar storage per user email
let userAvatars = {};

// Mock email function
function sendPasswordResetEmail(email, token, name) {
  console.log(`📧 Mock Email sent to: ${email}`);
  console.log(`🔑 Reset token: ${token}`);
  console.log(`📄 Reset link: http://localhost:5173/reset-password.html?token=${token}`);
  return Promise.resolve({ success: true });
}

// Forgot password API
app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Vui lòng nhập email!",
        error: "MISSING_EMAIL"
      });
    }

    const user = TEST_USERS.find(u => u.email === email);
    if (!user) {
      return res.status(404).json({
        message: "Email không tồn tại trong hệ thống!",
        error: "USER_NOT_FOUND"
      });
    }

    // Generate reset token
    const resetToken = jwt.sign({ userId: user.id, email: user.email }, "RESET_SECRET", { expiresIn: "15m" });
    resetTokens[resetToken] = { userId: user.id, email: user.email, createdAt: Date.now() };

    // Send email (mock)
    await sendPasswordResetEmail(email, resetToken, user.name);

    res.json({
      message: "Email reset password đã được gửi!",
      email: email,
      resetToken: resetToken, // For debugging
      expiresIn: "15 minutes"
    });

  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({
      message: "Lỗi server!",
      error: "INTERNAL_SERVER_ERROR"
    });
  }
});

// Reset password API
app.post("/api/auth/reset-password/:token", (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword, confirmPassword } = req.body;

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
    const tokenData = resetTokens[token];
    if (!tokenData) {
      return res.status(400).json({
        message: "Token không hợp lệ hoặc đã hết hạn!",
        error: "INVALID_TOKEN"
      });
    }

    try {
      jwt.verify(token, "RESET_SECRET");
    } catch (err) {
      delete resetTokens[token];
      return res.status(400).json({
        message: "Token không hợp lệ hoặc đã hết hạn!",
        error: "INVALID_TOKEN"
      });
    }

    // Find user and update password
    const userIndex = TEST_USERS.findIndex(u => u.id === tokenData.userId);
    if (userIndex === -1) {
      return res.status(404).json({
        message: "Người dùng không tồn tại!",
        error: "USER_NOT_FOUND"
      });
    }

    // Update password (in real app, should hash password)
    TEST_USERS[userIndex].password = newPassword;
    
    // Remove used token
    delete resetTokens[token];

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

// Debug endpoint
app.get("/api/auth/debug/reset-tokens", (req, res) => {
  res.json({
    message: "Debug: Active reset tokens",
    activeTokens: Object.keys(resetTokens),
    count: Object.keys(resetTokens).length
  });
});

// Login API for testing
app.post("/api/auth/login", (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Vui lòng nhập email và mật khẩu!",
        success: false
      });
    }

    const user = TEST_USERS.find(u => u.email === email && u.password === password);
    
    if (user) {
      console.log(`✅ Login successful for ${email} with password: ${password}`);
      
      // Get user's stored avatar if available
      const storedAvatar = userAvatars[email] || user.avatar || null;
      
      return res.json({
        message: "Đăng nhập thành công!",
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          fullname: user.name,
          role: "user",
          avatar: storedAvatar
        },
        token: "fake-token-for-testing"
      });
    } else {
      console.log(`❌ Login failed for ${email} with password: ${password}`);
      console.log("Available users:", TEST_USERS.map(u => ({ email: u.email, password: u.password })));
      return res.status(401).json({ 
        message: "Sai email hoặc mật khẩu!",
        success: false
      });
    }
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      message: "Lỗi server!",
      success: false
    });
  }
});

// Register API for testing
app.post("/api/auth/register", (req, res) => {
  try {
    console.log('📝 Register request received:', req.body);
    const { fullname, name, email, password, role } = req.body;

    if (!email || !password || (!fullname && !name)) {
      console.log('❌ Missing required fields:', { email: !!email, password: !!password, fullname: !!fullname, name: !!name });
      return res.status(400).json({
        message: "Vui lòng nhập đầy đủ thông tin!",
        success: false
      });
    }

    // Check if user already exists
    const existingUser = TEST_USERS.find(u => u.email === email);
    if (existingUser) {
      console.log('❌ User already exists:', email);
      return res.status(409).json({
        message: "Email đã được sử dụng!",
        success: false
      });
    }

    // Create new user
    const newUser = {
      id: TEST_USERS.length + 1,
      email: email,
      password: password, // In real app, should hash password
      name: fullname || name,
      role: role || "user",
      avatar: null
    };

    TEST_USERS.push(newUser);
    
    console.log(`✅ User registered successfully: ${email} with role: ${role}`);
    console.log("Updated users:", TEST_USERS.map(u => ({ email: u.email, name: u.name, role: u.role })));

    res.json({
      message: "Đăng ký thành công!",
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        fullname: newUser.name,
        role: newUser.role
      },
      token: "fake-token-for-testing"
    });

  } catch (error) {
    console.error('❌ Register error:', error);
    res.status(500).json({
      message: "Lỗi server!",
      success: false
    });
  }
});

// Mock Avatar Upload API (để không ảnh hưởng dashboard)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

app.post("/api/avatar/upload", upload.single('avatar'), (req, res) => {
  console.log('📷 Avatar upload request received');
  
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Không có file được upload!"
    });
  }
  
  console.log('📄 File info:', {
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size
  });
  
  // Convert buffer to base64 để hiển thị
  const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
  
  // Get user email from request body to store avatar persistently
  const userEmail = req.body.email || 'user@example.com'; // fallback
  
  // Store avatar for this user email
  userAvatars[userEmail] = base64Image;
  
  // Also update in TEST_USERS array
  const userIndex = TEST_USERS.findIndex(u => u.email === userEmail);
  if (userIndex !== -1) {
    TEST_USERS[userIndex].avatar = base64Image;
  }
  
  console.log(`✅ Avatar upload successful and stored for email: ${userEmail}`);
  
  res.json({
    success: true,
    message: "Upload avatar thành công!",
    avatar: base64Image,
    data: {
      avatar: base64Image
    },
    user: {
      id: 1,
      email: userEmail,
      name: "Test User"
    }
  });
});

// GET avatar API 
app.get("/api/avatar", (req, res) => {
  // In a real app, we'd extract user from JWT token
  // For demo, we'll use a default email or check headers
  const userEmail = req.headers['x-user-email'] || 'user@example.com';
  
  const avatar = userAvatars[userEmail];
  if (avatar) {
    res.json({
      success: true,
      data: {
        avatar: avatar
      }
    });
  } else {
    res.status(404).json({
      success: false,
      message: "Avatar not found"
    });
  }
});

// API to update user avatar by email (for persistence)
app.put("/api/auth/users/:email/avatar", (req, res) => {
  try {
    const { email } = req.params;
    const { avatar } = req.body;
    
    if (!avatar) {
      return res.status(400).json({ 
        success: false, 
        message: "Avatar URL required" 
      });
    }
    
    // Store in memory
    userAvatars[email] = avatar;
    
    // Update in users array
    const userIndex = TEST_USERS.findIndex(u => u.email === email);
    if (userIndex !== -1) {
      TEST_USERS[userIndex].avatar = avatar;
    }
    
    console.log(`🔄 Updated avatar for email: ${email}`);
    
    res.json({
      success: true,
      message: "Avatar updated successfully",
      avatar: avatar
    });
  } catch (error) {
    console.error('❌ Update avatar error:', error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

const PORT = 5173;
app.listen(PORT, () => {
  console.log(`🚀 Test Server for Forgot Password running on http://localhost:${PORT}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   • POST /api/auth/register - Đăng ký tài khoản`);
  console.log(`   • POST /api/auth/login - Đăng nhập`);
  console.log(`   • POST /api/auth/forgot-password - Quên mật khẩu`);
  console.log(`   • POST /api/auth/reset-password/:token - Reset mật khẩu`);
  console.log(`   • POST /api/avatar/upload - Upload avatar`);
  console.log(`   • GET /api/avatar - Get avatar`);
  console.log(`   • GET /api/auth/debug/reset-tokens - Debug tokens`);
  console.log(`   • Static files served from: ${path.join(__dirname, '..')}`);
  console.log(`🎯 Ready to test complete authentication system!`);
});