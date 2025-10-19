/**
 * Simple HTTP Server for testing Redux integration
 * Hoạt động 6 - Serve static files
 */

const express = require('express');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = 5173;

// Persistent storage file paths
const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const ACTIVITY_FILE = path.join(__dirname, 'data', 'activity-logs.json');
const AVATARS_FILE = path.join(__dirname, 'data', 'avatars.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

// Load or initialize users from persistent storage
function loadUsers() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
      const userMap = new Map();
      data.forEach(user => {
        userMap.set(user.email, user);
      });
      console.log(`📂 Loaded ${userMap.size} users from persistent storage`);
      return userMap;
    }
  } catch (error) {
    console.error('❌ Error loading users:', error);
  }
  
  // Return default users with long IDs and default avatars if file doesn't exist or error
  const baseTimestamp = Date.now();
  return new Map([
    ['admin@test.com', { 
      id: `ADMIN-${baseTimestamp}-001-DFLT`, 
      name: 'Admin User', 
      fullname: 'Administrator', 
      email: 'admin@test.com', 
      password: '123456', 
      role: 'admin',
      createdAt: new Date().toISOString(),
      registrationTimestamp: baseTimestamp,
      avatar: 'https://via.placeholder.com/150x150/dc3545/ffffff?text=ADMIN'
    }],
    ['user@test.com', { 
      id: `USER-${baseTimestamp}-002-DFLT`, 
      name: 'Regular User', 
      fullname: 'User Name', 
      email: 'user@test.com', 
      password: '123456', 
      role: 'user',
      createdAt: new Date().toISOString(),
      registrationTimestamp: baseTimestamp + 1000,
      avatar: 'https://via.placeholder.com/150x150/28a745/ffffff?text=USER'
    }]
  ]);
}

// Save users to persistent storage
function saveUsers() {
  try {
    const usersArray = Array.from(registeredUsers.values());
    fs.writeFileSync(USERS_FILE, JSON.stringify(usersArray, null, 2));
    console.log(`💾 Saved ${usersArray.length} users to persistent storage`);
  } catch (error) {
    console.error('❌ Error saving users:', error);
  }
}

// Load users on startup
const registeredUsers = loadUsers();

// Load or initialize activity logs from persistent storage
function loadActivityLogs() {
  try {
    if (fs.existsSync(ACTIVITY_FILE)) {
      const data = JSON.parse(fs.readFileSync(ACTIVITY_FILE, 'utf8'));
      console.log(`📂 Loaded ${data.length} activity logs from persistent storage`);
      return data;
    }
  } catch (error) {
    console.error('❌ Error loading activity logs:', error);
  }
  return [];
}

// Save activity logs to persistent storage
function saveActivityLogs() {
  try {
    fs.writeFileSync(ACTIVITY_FILE, JSON.stringify(activityLogs, null, 2));
    console.log(`💾 Saved ${activityLogs.length} activity logs to persistent storage`);
  } catch (error) {
    console.error('❌ Error saving activity logs:', error);
  }
}

// Load or initialize avatars from persistent storage
function loadAvatars() {
  try {
    if (fs.existsSync(AVATARS_FILE)) {
      const data = JSON.parse(fs.readFileSync(AVATARS_FILE, 'utf8'));
      const avatarMap = new Map(data);
      console.log(`📂 Loaded ${avatarMap.size} avatars from persistent storage`);
      return avatarMap;
    }
  } catch (error) {
    console.error('❌ Error loading avatars:', error);
  }
  return new Map();
}

// Save avatars to persistent storage
function saveAvatars() {
  try {
    const avatarsArray = Array.from(userAvatars.entries());
    fs.writeFileSync(AVATARS_FILE, JSON.stringify(avatarsArray, null, 2));
    console.log(`💾 Saved ${avatarsArray.length} avatars to persistent storage`);
  } catch (error) {
    console.error('❌ Error saving avatars:', error);
  }
}

// Load data on startup
const activityLogs = loadActivityLogs();
const rateLimitData = new Map(); // email -> { attempts: number, firstAttempt: timestamp, blocked: boolean }
const userAvatars = loadAvatars(); // email -> avatar URL

// Save initial data to ensure files exist
if (!fs.existsSync(USERS_FILE)) saveUsers();
if (!fs.existsSync(ACTIVITY_FILE)) saveActivityLogs();
if (!fs.existsSync(AVATARS_FILE)) saveAvatars();

// Multer setup for avatar uploads
const storage = multer.memoryStorage(); // Store in memory for demo
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Helper function to add activity log
function logActivity(user, action, details, ip = '127.0.0.1') {
  const log = {
    id: activityLogs.length + 1,
    timestamp: new Date().toISOString(),
    user: user,
    action: action,
    details: details,
    ip: ip
  };
  activityLogs.unshift(log); // Add to beginning for latest first
  
  // Keep only last 100 logs
  if (activityLogs.length > 100) {
    activityLogs.splice(100);
  }
  
  // Save to persistent storage
  saveActivityLogs();
  
  console.log(`📝 Activity logged: ${action} - ${user}`);
}

// Rate limiting helper
function checkRateLimit(email, ip) {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;
  
  if (!rateLimitData.has(email)) {
    rateLimitData.set(email, { attempts: 1, firstAttempt: now, blocked: false });
    return { allowed: true, attempts: 1, maxAttempts };
  }
  
  const data = rateLimitData.get(email);
  
  // Reset if window expired
  if (now - data.firstAttempt > windowMs) {
    rateLimitData.set(email, { attempts: 1, firstAttempt: now, blocked: false });
    return { allowed: true, attempts: 1, maxAttempts };
  }
  
  // Increment attempts
  data.attempts++;
  
  // Block if exceeded
  if (data.attempts >= maxAttempts) {
    data.blocked = true;
    rateLimitData.set(email, data);
    return { allowed: false, attempts: data.attempts, maxAttempts, resetTime: new Date(data.firstAttempt + windowMs) };
  }
  
  rateLimitData.set(email, data);
  return { allowed: true, attempts: data.attempts, maxAttempts };
}

// Seed initial activity logs for demo
function seedActivityLogs() {
  const now = new Date();
  
  // Create some demo activities
  logActivity('admin@test.com', 'LOGIN_SUCCESS', 'role: admin, loginTime: ' + new Date(now - 10 * 60000).toISOString());
  logActivity('user@test.com', 'LOGIN_SUCCESS', 'role: user, loginTime: ' + new Date(now - 8 * 60000).toISOString());
  logActivity('test@example.com', 'LOGIN_FAILED', 'reason: Invalid credentials, attemptCount: 1');
  logActivity('admin@test.com', 'USER_REGISTERED', 'role: admin, registrationTime: ' + new Date(now - 15 * 60000).toISOString());
  logActivity('hacker@spam.com', 'LOGIN_FAILED', 'reason: Invalid credentials, attemptCount: 2');
  logActivity('hacker@spam.com', 'LOGIN_FAILED', 'reason: Invalid credentials, attemptCount: 3');
  
  // Set some rate limit data
  rateLimitData.set('hacker@spam.com', { attempts: 3, firstAttempt: now - 5 * 60000, blocked: false });
  rateLimitData.set('test@example.com', { attempts: 5, firstAttempt: now - 10 * 60000, blocked: true });
  
  console.log('🌱 Seeded activity logs and rate limit data');
}

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Serve static files from project root
app.use(express.static(path.join(__dirname)));

// API routes for testing
app.post('/api/auth/login', (req, res) => {
  console.log('🔐 Login attempt:', req.body);
  
  const { email, password } = req.body;
  
  // Check if user exists in registered users
  const user = registeredUsers.get(email);
  
  console.log('🔍 User found:', user ? 'YES' : 'NO');
  if (user) {
    console.log('📋 User data:', { email: user.email, storedPassword: user.password, providedPassword: password });
    console.log('🔒 Password match:', user.password === password);
  }
  
  if (user && user.password === password) {
    // Log successful login
    logActivity(email, 'LOGIN_SUCCESS', email);
    
    res.json({
      success: true,
      message: 'Login successful',
      accessToken: `mock-${user.role}-access-token-` + Date.now(),
      refreshToken: `mock-${user.role}-refresh-token-` + Date.now(),
      user: {
        id: user.id,
        name: user.name,
        fullname: user.fullname,
        email: user.email,
        role: user.role
      }
    });
    console.log(`✅ Login successful for: ${email} (${user.role})`);
  } else {
    // Log failed login attempt and check rate limiting
    const rateCheck = checkRateLimit(email, req.ip);
    logActivity(email, 'LOGIN_FAILED', `reason: Invalid credentials, attemptCount: ${rateCheck.attempts}`, req.ip);
    
    res.status(401).json({
      success: false,
      message: 'Email hoặc mật khẩu không đúng!'
    });
    console.log(`❌ Login failed for: ${email}`);
  }
});

app.post('/api/auth/register', (req, res) => {
  console.log('📝 Register attempt:', req.body);
  
  const { fullname, email, password, role = 'user' } = req.body;
  
  // Check if user already exists
  if (registeredUsers.has(email)) {
    return res.status(400).json({
      success: false,
      message: 'Email đã được đăng ký!'
    });
  }
  
  // Validate required fields
  if (!fullname || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng điền đầy đủ thông tin!'
    });
  }
  
  // Generate long, descriptive ID
  const timestamp = Date.now();
  const rolePrefix = role.toUpperCase();
  const userCount = registeredUsers.size + 1;
  const randomSuffix = Math.random().toString(36).substr(2, 4).toUpperCase();
  
  // Create long ID format: ROLE-TIMESTAMP-COUNT-RANDOM
  const longId = `${rolePrefix}-${timestamp}-${userCount.toString().padStart(3, '0')}-${randomSuffix}`;
  
  // Generate default avatar based on role and name
  const avatarColors = {
    'admin': { bg: 'dc3545', text: 'ffffff' }, // Red for admin
    'user': { bg: '007bff', text: 'ffffff' },  // Blue for user
    'moderator': { bg: 'ffc107', text: '000000' } // Yellow for moderator
  };
  
  const colorScheme = avatarColors[role] || avatarColors['user'];
  const avatarText = fullname.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  const defaultAvatar = `https://via.placeholder.com/150x150/${colorScheme.bg}/${colorScheme.text}?text=${avatarText}`;
  
  // Create new user
  const newUser = {
    id: longId, // Long descriptive ID generation
    name: fullname,
    fullname: fullname,
    email: email,
    password: password,
    role: role,
    createdAt: new Date().toISOString(),
    registrationTimestamp: timestamp,
    avatar: defaultAvatar // Default avatar based on name and role
  };
  
  // Store user
  registeredUsers.set(email, newUser);
  
  // Save to persistent storage
  saveUsers();
  
  // Log registration activity
  logActivity(email, 'USER_REGISTERED', `role: ${role}, registrationTime: ${new Date().toISOString()}`, req.ip);
  
  console.log(`✅ User registered: ${email} (${role})`);
  console.log(`📊 Total users: ${registeredUsers.size}`);
  
  res.json({
    success: true,
    message: 'Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.',
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    }
  });
});

app.post('/api/auth/logout', (req, res) => {
  console.log('🚪 Logout request');
  
  // Log logout activity
  const authHeader = req.headers.authorization;
  if (authHeader) {
    logActivity('user', 'LOGOUT', 'User logged out', req.ip);
  }
  
  res.json({
    success: true,
    message: 'Đăng xuất thành công!'
  });
});

// Avatar upload endpoint
app.post('/api/avatar/upload', upload.single('avatar'), (req, res) => {
  console.log('📷 Avatar upload request');
  
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Không có file được upload!'
      });
    }
    
    // Get user email from form data or token
    const email = req.body.email || 'unknown@example.com';
    
    // Convert buffer to base64 for demo storage
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    
    // Store avatar for user
    userAvatars.set(email, base64Image);
    
    // Save to persistent storage
    saveAvatars();
    
    // Log activity
    logActivity(email, 'AVATAR_UPLOAD', `Uploaded ${req.file.originalname} (${Math.round(req.file.size/1024)}KB)`, req.ip);
    
    console.log(`📷 Avatar uploaded for: ${email} (${req.file.originalname}, ${Math.round(req.file.size/1024)}KB)`);
    
    res.json({
      success: true,
      message: 'Upload avatar thành công!',
      data: {
        filename: req.file.originalname,
        size: req.file.size,
        avatar: base64Image // Return the base64 for immediate display
      }
    });
    
  } catch (error) {
    console.error('❌ Avatar upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi upload avatar!'
    });
  }
});

// Get user avatar
app.get('/api/avatar/:email', (req, res) => {
  const email = req.params.email;
  const avatar = userAvatars.get(email);
  
  if (avatar) {
    res.json({
      success: true,
      avatar: avatar
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Không tìm thấy avatar'
    });
  }
});

// Default route to dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Update existing seedDemoLogs function
function seedDemoLogs() {
  const now = new Date();
  
  // Add some demo logs
  addActivityLog('admin@test.com', 'login', 'Successful login as admin', '127.0.0.1');
  addActivityLog('user@test.com', 'login', 'Successful login as user', '127.0.0.1');
  addActivityLog('user@test.com', 'logout', 'User logged out', '127.0.0.1');
  addActivityLog('test@example.com', 'login_failed', 'Failed login attempt', '127.0.0.1');
  addActivityLog('admin@test.com', 'view_users', 'Admin viewed user list', '127.0.0.1');
  
  console.log('🌱 Demo activity logs seeded');
}

// Helper to add activity log
function addActivityLog(user, action, details, ip = '127.0.0.1') {
  const log = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    user: user || 'anonymous',
    action: action,
    details: details,
    ip: ip
  };
  
  activityLogs.unshift(log); // Add to beginning
  
  // Keep only last 100 logs
  if (activityLogs.length > 100) {
    activityLogs.splice(100);
  }
  
  // Update stats
  rateLimitData.totalLogs = activityLogs.length;
  
  console.log(`📝 Activity logged: ${action} by ${user}`);
}

// Add endpoint to view registered users (for testing)
app.get('/api/users', (req, res) => {
  const users = Array.from(registeredUsers.values()).map(user => {
    // Check if user has uploaded custom avatar
    const customAvatar = userAvatars.get(user.email);
    
    return {
      id: user.id,
      name: user.name,
      fullname: user.fullname,
      email: user.email,
      role: user.role,
      avatar: customAvatar || user.avatar || `https://via.placeholder.com/150x150/6c757d/ffffff?text=${(user.fullname || user.name || 'U').substring(0, 2).toUpperCase()}`,
      createdAt: user.createdAt,
      hasCustomAvatar: !!customAvatar
    };
  });
  
  res.json({
    success: true,
    users: users,
    total: users.length
  }); // Return proper format for dashboard compatibility
});

// Update user endpoint
app.put('/api/users/:email', (req, res) => {
  console.log('✏️ Update user request:', req.params.email, req.body);
  
  const email = decodeURIComponent(req.params.email);
  const { fullname, role } = req.body;
  
  if (!registeredUsers.has(email)) {
    return res.status(404).json({
      success: false,
      message: 'User không tồn tại!'
    });
  }
  
  const user = registeredUsers.get(email);
  
  // Update user info
  if (fullname) user.fullname = fullname;
  if (fullname) user.name = fullname; // Keep both for compatibility
  if (role) user.role = role;
  user.updatedAt = new Date().toISOString();
  
  // Save updated user
  registeredUsers.set(email, user);
  saveUsers();
  
  // Log activity
  logActivity(email, 'USER_UPDATED', `Updated: ${fullname ? 'name, ' : ''}${role ? 'role' : ''}`, req.ip);
  
  console.log(`✅ User updated: ${email}`);
  
  res.json({
    success: true,
    message: 'Cập nhật user thành công!',
    user: user
  });
});

// Delete user endpoint
app.delete('/api/users/:email', (req, res) => {
  console.log('🗑️ Delete user request:', req.params.email);
  
  const email = decodeURIComponent(req.params.email);
  
  if (!registeredUsers.has(email)) {
    return res.status(404).json({
      success: false,
      message: 'User không tồn tại!'
    });
  }
  
  const user = registeredUsers.get(email);
  registeredUsers.delete(email);
  saveUsers();
  
  // Also remove avatar if exists
  if (userAvatars.has(email)) {
    userAvatars.delete(email);
    saveAvatars();
  }
  
  // Log activity
  logActivity(email, 'USER_DELETED', `Deleted user: ${user.fullname || user.name}`, req.ip);
  
  console.log(`✅ User deleted: ${email}`);
  
  res.json({
    success: true,
    message: 'Xóa user thành công!'
  });
});

// Activity 5 API Endpoints
app.get('/api/activity-logs', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  // Sort by timestamp (newest first)
  const sortedLogs = [...activityLogs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  // Enhance logs with user names
  const enhancedLogs = sortedLogs.map(log => {
    let userName = 'Unknown';
    let userEmail = '';
    
    console.log('🔍 Processing log:', { id: log.id, user: log.user, details: log.details });
    
    // Try multiple ways to extract user info
    if (log.user && log.user.includes('@')) {
      // Case 1: log.user contains email (from seed data)
      userEmail = log.user;
    } else if (log.details && log.details.includes('@')) {
      // Case 2: log.details contains email  
      userEmail = log.details;
    } else if (log.user) {
      // Case 3: log.user is a string (fallback)
      userEmail = log.user;
    }
    
    // Find user in registered users by email
    if (userEmail) {
      const user = Array.from(registeredUsers.values()).find(u => u.email === userEmail);
      if (user) {
        userName = user.fullname || user.name || user.email;
        console.log('✅ Found user:', { email: userEmail, name: userName });
      } else {
        userName = userEmail; // Use email as fallback
        console.log('⚠️ User not found in registry, using email:', userEmail);
      }
    }
    
    return {
      ...log,
      userName: userName,
      userEmail: userEmail
    };
  });
  
  const paginatedLogs = enhancedLogs.slice(startIndex, endIndex);
  
  res.json({
    success: true,
    logs: paginatedLogs,
    total: activityLogs.length,
    page: page,
    totalPages: Math.ceil(activityLogs.length / limit),
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(activityLogs.length / limit),
      totalLogs: activityLogs.length,
      hasNext: endIndex < activityLogs.length,
      hasPrev: page > 1
    }
  });
});

app.get('/api/rate-limit-status', (req, res) => {
  // Update stats
  rateLimitData.loginAttempts = activityLogs.filter(log => log.action === 'login').length;
  rateLimitData.activeUsers = registeredUsers.size;
  
  res.json({
    success: true,
    data: {
      totalLogs: rateLimitData.totalLogs,
      loginAttempts: rateLimitData.loginAttempts,
      rateLimited: rateLimitData.rateLimited,
      activeUsers: rateLimitData.activeUsers,
      maxAttempts: 5,
      windowMinutes: 15,
      currentTime: new Date().toISOString()
    }
  });
});

// Duplicate removed - using the first endpoint above

// Rate limit status API
app.get('/api/rate-limit-status', (req, res) => {
  const blockedUsers = [];
  
  for (const [email, data] of rateLimitData.entries()) {
    if (data.blocked || data.attempts >= 5) {
      const resetTime = new Date(data.firstAttempt + 15 * 60 * 1000);
      blockedUsers.push({
        email: email,
        attempts: data.attempts,
        maxAttempts: 5,
        resetTime: resetTime.toISOString(),
        status: data.blocked ? 'blocked' : 'warning'
      });
    }
  }
  
  // Calculate stats
  const totalLogs = activityLogs.length;
  const loginAttempts = activityLogs.filter(log => log.action.includes('LOGIN')).length;
  const rateLimited = blockedUsers.length;
  const activeUsers = new Set(activityLogs.filter(log => log.action === 'LOGIN_SUCCESS').map(log => log.user)).size;
  
  res.json({
    success: true,
    stats: {
      totalLogs,
      loginAttempts,
      rateLimited,
      activeUsers
    },
    blockedUsers: blockedUsers
  });
});

// Seed initial data when server starts
seedActivityLogs();

app.listen(PORT, () => {
  // Seed demo data
  seedDemoLogs();
  
  console.log(`
🚀 Redux Test Server Started!
📍 URL: http://localhost:${PORT}
📄 Files served from: ${__dirname}

📚 Pre-registered Test Accounts:
👑 Admin: admin@test.com / 123456
👤 User:  user@test.com / 123456

🆕 Registration available at:
📝 http://localhost:${PORT}/signup.html

📱 Pages available:
• http://localhost:${PORT}/dashboard.html
• http://localhost:${PORT}/login.html
• http://localhost:${PORT}/signup.html

🔍 API Endpoints:
• View users: http://localhost:${PORT}/api/users
• Activity logs: http://localhost:${PORT}/api/activity-logs
• Rate limit status: http://localhost:${PORT}/api/rate-limit-status

🔄 Features:
✅ Hoạt động 5: Activity Logs & Rate Limiting
✅ Hoạt động 6: Redux & Protected Routes
💾 Persistent Storage: Users, Activity Logs, Avatars
  `);
});

// Graceful shutdown handlers to save data
function gracefulShutdown(signal) {
  console.log(`\n📦 Received ${signal}. Saving data before shutdown...`);
  
  try {
    saveUsers();
    saveActivityLogs();
    saveAvatars();
    console.log('✅ All data saved successfully!');
  } catch (error) {
    console.error('❌ Error saving data during shutdown:', error);
  }
  
  process.exit(0);
}

// Handle different shutdown signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // nodemon restart