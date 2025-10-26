dotenv.config();
// Removed test code as requested.
// Removed test code as requested.

// Reset tokens storage
let resetTokens = {};

// Avatar storage per user email
let userAvatars = {};

// Activity logs storage
let activityLogs = [];

// Rate limiting storage
let loginAttempts = {};

// Helper function to log activity
function logActivity(userId, userEmail, action, details = {}) {
  const logEntry = {
    id: activityLogs.length + 1,
    userId: userId,
    userEmail: userEmail,
    action: action,
    details: details,
    timestamp: new Date().toISOString(),
    ip: '127.0.0.1' // Mock IP for demo
  };
  
  activityLogs.unshift(logEntry); // Add to beginning for newest first
  
  // Keep only last 100 logs for demo
  if (activityLogs.length > 100) {
    activityLogs = activityLogs.slice(0, 100);
  }
  
  console.log(`📝 Activity logged: ${action} by ${userEmail} (ID: ${userId})`);
  return logEntry;
}

// Rate limiting check
function checkRateLimit(email, maxAttempts = 5, windowMinutes = 15) {
  const now = Date.now();
  const windowMs = windowMinutes * 60 * 1000;
  
  if (!loginAttempts[email]) {
    loginAttempts[email] = [];
  }
  
  // Remove old attempts outside the window
  loginAttempts[email] = loginAttempts[email].filter(attempt => 
    now - attempt < windowMs
  );
  
  return loginAttempts[email].length < maxAttempts;
}

// Add failed login attempt
function addFailedAttempt(email) {
  if (!loginAttempts[email]) {
    loginAttempts[email] = [];
  }
  loginAttempts[email].push(Date.now());
}

// Clear attempts on successful login
function clearAttempts(email) {
  delete loginAttempts[email];
}

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

    // Check rate limit
    if (!checkRateLimit(email)) {
      logActivity(null, email, 'LOGIN_RATE_LIMITED', { 
        reason: 'Too many failed attempts',
        attempts: loginAttempts[email]?.length || 0
      });
      
      return res.status(429).json({
        message: "Quá nhiều lần đăng nhập thất bại! Vui lòng thử lại sau 15 phút.",
        success: false,
        error: "RATE_LIMITED"
      });
    }

    const user = TEST_USERS.find(u => u.email === email && u.password === password);
    
    if (user) {
      console.log(`✅ Login successful for ${email} with password: ${password}`);
      
      // Clear failed attempts on successful login
      clearAttempts(email);
      
      // Log successful login
      logActivity(user.id, user.email, 'LOGIN_SUCCESS', {
        role: user.role,
        loginTime: new Date().toISOString()
      });
      
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
          role: user.role || "user", // Use actual user role, fallback to "user"
          avatar: storedAvatar
        },
        token: "fake-token-for-testing"
      });
    } else {
      console.log(`❌ Login failed for ${email} with password: ${password}`);
      console.log("Available users:", TEST_USERS.map(u => ({ email: u.email, password: u.password })));
      
      // Add failed attempt
      addFailedAttempt(email);
      
      // Log failed login
      logActivity(null, email, 'LOGIN_FAILED', {
        reason: 'Invalid credentials',
        attemptCount: loginAttempts[email]?.length || 0
      });
      
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

    // Log user registration
    logActivity(newUser.id, newUser.email, 'USER_REGISTERED', {
      role: newUser.role,
      registrationTime: new Date().toISOString()
    });

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

// GET users list API
app.get("/api/auth/users", (req, res) => {
  try {
    console.log('📋 Get users list request');
    
    // Return users without passwords for security
    const safeUsers = TEST_USERS.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      fullname: user.name,
      role: user.role || 'user',
      avatar: userAvatars[user.email] || user.avatar || null
    }));
    
    res.json({
      success: true,
      users: safeUsers,
      count: safeUsers.length
    });
    
  } catch (error) {
    console.error('❌ Get users error:', error);
    res.status(500).json({
      success: false,
      message: "Lỗi server!"
    });
  }
});

// DELETE user API
app.delete("/api/auth/users/:email", (req, res) => {
  try {
    const { email } = req.params;
    console.log(`🗑️ Delete user request for: ${email}`);
    
    const userIndex = TEST_USERS.findIndex(u => u.email === email);
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Người dùng không tồn tại!"
      });
    }
    
    // Remove user from array
    const deletedUser = TEST_USERS.splice(userIndex, 1)[0];
    
    // Also remove avatar if exists
    delete userAvatars[email];
    
    console.log(`✅ User deleted successfully: ${email}`);
    console.log("Updated users:", TEST_USERS.map(u => ({ email: u.email, name: u.name, role: u.role })));
    
    res.json({
      success: true,
      message: "Xóa người dùng thành công!",
      deletedUser: {
        id: deletedUser.id,
        email: deletedUser.email,
        name: deletedUser.name,
        role: deletedUser.role
      }
    });
    
  } catch (error) {
    console.error('❌ Delete user error:', error);
    res.status(500).json({
      success: false,
      message: "Lỗi server!"
    });
  }
});

// UPDATE user API  
app.put("/api/auth/users/:email", (req, res) => {
  try {
    const { email } = req.params;
    const { fullname, role } = req.body;
    console.log(`✏️ Update user request for: ${email}`, { fullname, role });
    
    const userIndex = TEST_USERS.findIndex(u => u.email === email);
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Người dùng không tồn tại!"
      });
    }
    
    // Update user data
    if (fullname) TEST_USERS[userIndex].name = fullname;
    if (role) TEST_USERS[userIndex].role = role;
    
    console.log(`✅ User updated successfully: ${email}`);
    console.log("Updated users:", TEST_USERS.map(u => ({ email: u.email, name: u.name, role: u.role })));
    
    res.json({
      success: true,
      message: "Cập nhật người dùng thành công!",
      user: {
        id: TEST_USERS[userIndex].id,
        email: TEST_USERS[userIndex].email,
        name: TEST_USERS[userIndex].name,
        role: TEST_USERS[userIndex].role
      }
    });
    
  } catch (error) {
    console.error('❌ Update user error:', error);
    res.status(500).json({
      success: false,
      message: "Lỗi server!"
    });
  }
});

// GET activity logs API (Admin only)
app.get("/api/admin/activity-logs", (req, res) => {
  try {
    const { limit = 50, offset = 0, action, userId } = req.query;
    console.log('📋 Get activity logs request', { limit, offset, action, userId });
    
    let filteredLogs = [...activityLogs];
    
    // Filter by action if specified
    if (action) {
      filteredLogs = filteredLogs.filter(log => 
        log.action.toLowerCase().includes(action.toLowerCase())
      );
    }
    
    // Filter by userId if specified
    if (userId) {
      filteredLogs = filteredLogs.filter(log => 
        log.userId && log.userId.toString() === userId.toString()
      );
    }
    
    // Pagination
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      logs: paginatedLogs,
      total: filteredLogs.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
  } catch (error) {
    console.error('❌ Get activity logs error:', error);
    res.status(500).json({
      success: false,
      message: "Lỗi server!"
    });
  }
});

// GET rate limit status API
app.get("/api/admin/rate-limit-status", (req, res) => {
  try {
    console.log('🔍 Get rate limit status request');
    
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    
    const rateLimitStatus = Object.keys(loginAttempts).map(email => {
      const attempts = loginAttempts[email] || [];
      const recentAttempts = attempts.filter(attempt => now - attempt < windowMs);
      
      return {
        email: email,
        attemptCount: recentAttempts.length,
        maxAttempts: 5,
        isLimited: recentAttempts.length >= 5,
        nextResetTime: recentAttempts.length > 0 ? 
          new Date(Math.min(...recentAttempts) + windowMs).toISOString() : null
      };
    }).filter(status => status.attemptCount > 0);
    
    res.json({
      success: true,
      rateLimitStatus: rateLimitStatus,
      windowMinutes: 15,
      maxAttempts: 5
    });
    
  } catch (error) {
    console.error('❌ Get rate limit status error:', error);
    res.status(500).json({
      success: false,
      message: "Lỗi server!"
    });
  }
});
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
  console.log(`🚀 Test Server with User Activity Logging & Rate Limiting running on http://localhost:${PORT}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   • POST /api/auth/register - Đăng ký tài khoản`);
  console.log(`   • POST /api/auth/login - Đăng nhập (với rate limiting)`);
  console.log(`   • GET /api/auth/users - Lấy danh sách users`);
  console.log(`   • DELETE /api/auth/users/:email - Xóa user`);
  console.log(`   • PUT /api/auth/users/:email - Cập nhật user`);
  console.log(`   • GET /api/admin/activity-logs - Lấy activity logs (Admin)`);
  console.log(`   • GET /api/admin/rate-limit-status - Kiểm tra rate limit status`);
  console.log(`   • POST /api/auth/forgot-password - Quên mật khẩu`);
  console.log(`   • POST /api/auth/reset-password/:token - Reset mật khẩu`);
  console.log(`   • POST /api/avatar/upload - Upload avatar`);
  console.log(`   • GET /api/avatar - Get avatar`);
  console.log(`   • PUT /api/auth/users/:email/avatar - Update avatar`);
  console.log(`   • GET /api/auth/debug/reset-tokens - Debug tokens`);
  console.log(`   • Static files served from: ${path.join(__dirname, '..')}`);
  console.log(`🎯 Ready to test Activity Logging & Rate Limiting system!`);
  console.log(`📝 Rate Limiting: Max 5 login attempts per 15 minutes per email`);
});