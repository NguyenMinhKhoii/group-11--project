const express = require("express");
const router = express.Router();
const userStorage = require("../utils/userStorage");

// Load users từ file
console.log('📂 Loading users from file...');
const users = userStorage.getAllUsers();
console.log(`✅ Loaded ${users.length} users from storage`);

// Login route
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  
  const user = userStorage.findUserByEmail(email);
  
  if (!user || user.password !== password) {
    return res.status(401).json({
      success: false,
      message: "Email hoặc mật khẩu không đúng"
    });
  }
  
  // Tạo mock token
  const token = `token_${user.id}_${Date.now()}`;
  
  res.json({
    success: true,
    message: "Đăng nhập thành công",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    token: token
  });
});

// Register route
router.post("/register", (req, res) => {
  const { name, email, password, role = "user" } = req.body;
  
  // Kiểm tra email đã tồn tại
  const existingUser = userStorage.findUserByEmail(email);
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: "Email đã tồn tại"
    });
  }
  
  // Tạo user mới
  const newUser = userStorage.addUser({
    name,
    email,
    password,
    role
  });
  
  console.log('✅ New user registered:', newUser);
  
  res.json({
    success: true,
    message: "Đăng ký thành công",
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    }
  });
});

// Get user info
router.get("/me", (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token không hợp lệ"
    });
  }
  
  // Parse user ID from token
  const userId = token.split("_")[1];
  const user = userStorage.findUserById(userId);
  
  if (user) {
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: "Token không hợp lệ"
    });
  }
});

// Get all users (Admin only)
router.get("/users", (req, res) => {
  console.log('🔍 GET /users request received');
  console.log('📋 Headers:', req.headers);
  
  const token = req.headers.authorization?.replace("Bearer ", "");
  console.log('🎫 Token:', token);
  
  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({
      success: false,
      message: "Token không hợp lệ"
    });
  }
  
  // Parse user ID from token
  const userId = token.split("_")[1];
  console.log('👤 User ID from token:', userId);
  
  const user = users.find(u => u.id === userId);
  console.log('👤 Found user:', user);
  
  if (!user || user.role !== "admin") {
    console.log('🚫 Access denied - not admin or user not found');
    return res.status(403).json({
      success: false,
      message: "Không có quyền truy cập"
    });
  }
  
  console.log('✅ Returning users list');
  const allUsers = userStorage.getAllUsers();
  res.json({
    success: true,
    users: allUsers.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      avatar: u.avatar
    }))
  });
});

// Update user (Admin only)
router.put("/users/:id", (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token không hợp lệ"
    });
  }
  
  // Check admin permission
  const adminId = token.split("_")[1];
  const admin = userStorage.findUserById(adminId);
  
  if (!admin || admin.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Không có quyền truy cập"
    });
  }
  
  const userId = req.params.id;
  const { name, role } = req.body;
  
  // Update user
  const updateData = {};
  if (name) updateData.name = name;
  if (role) updateData.role = role;
  
  const updatedUser = userStorage.updateUser(userId, updateData);
  
  if (!updatedUser) {
    return res.status(404).json({
      success: false,
      message: "Không tìm thấy người dùng"
    });
  }
  
  console.log('✅ User updated:', updatedUser);
  
  res.json({
    success: true,
    message: "Cập nhật người dùng thành công",
    user: {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role
    }
  });
});

// Delete user (Admin only)
router.delete("/users/:id", (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token không hợp lệ"
    });
  }
  
  // Check admin permission
  const adminId = token.split("_")[1];
  const admin = userStorage.findUserById(adminId);
  
  if (!admin || admin.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Không có quyền truy cập"
    });
  }
  
  const userId = req.params.id;
  
  // Prevent admin from deleting themselves
  if (userId === adminId) {
    return res.status(400).json({
      success: false,
      message: "Không thể xóa chính mình"
    });
  }
  
  // Delete user
  const deletedUser = userStorage.deleteUser(userId);
  
  if (!deletedUser) {
    return res.status(404).json({
      success: false,
      message: "Không tìm thấy người dùng"
    });
  }
  
  console.log('🗑️ User deleted:', deletedUser);
  
  res.json({
    success: true,
    message: `Đã xóa người dùng ${deletedUser.name}`,
    deletedUser: {
      id: deletedUser.id,
      name: deletedUser.name,
      email: deletedUser.email,
      role: deletedUser.role
    }
  });
});

// Reset password (Admin only)
router.put("/users/:id/reset-password", (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token không hợp lệ"
    });
  }
  
  // Check admin permission
  const adminId = token.split("_")[1];
  const admin = userStorage.findUserById(adminId);
  
  if (!admin || admin.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Không có quyền truy cập"
    });
  }
  
  const userId = req.params.id;
  const { newPassword } = req.body;
  
  if (!newPassword) {
    return res.status(400).json({
      success: false,
      message: "Vui lòng nhập mật khẩu mới"
    });
  }
  
  // Reset password
  const updatedUser = userStorage.updateUser(userId, { password: newPassword });
  
  if (!updatedUser) {
    return res.status(404).json({
      success: false,
      message: "Không tìm thấy người dùng"
    });
  }
  
  console.log('🔑 Password reset for user:', updatedUser.name);
  
  res.json({
    success: true,
    message: `Đã reset mật khẩu cho ${updatedUser.name}`,
    user: {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role
    }
  });
});

// Update avatar
router.put("/update-avatar", (req, res) => {
  console.log('📷 PUT /update-avatar request received');
  console.log('📋 Headers:', req.headers);
  console.log('📄 Body:', req.body);
  
  const token = req.headers.authorization?.replace("Bearer ", "");
  console.log('🎫 Token:', token);
  
  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({
      success: false,
      message: "Token không hợp lệ"
    });
  }
  
  const userId = token.split("_")[1];
  console.log('👤 User ID from token:', userId);
  
  const { avatar } = req.body;
  console.log('🖼️ Avatar URL:', avatar);
  
  if (!avatar) {
    console.log('❌ No avatar URL provided');
    return res.status(400).json({
      success: false,
      message: "Vui lòng cung cấp URL avatar"
    });
  }
  
  // Update avatar
  const updatedUser = userStorage.updateUser(userId, { avatar });
  
  if (!updatedUser) {
    console.log('❌ User not found');
    return res.status(404).json({
      success: false,
      message: "Không tìm thấy người dùng"
    });
  }
  
  console.log('✅ Avatar updated for user:', updatedUser.name);
  
  res.json({
    success: true,
    message: "Cập nhật avatar thành công",
    user: {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      avatar: updatedUser.avatar
    }
  });
});

module.exports = router;