const express = require("express");
const router = express.Router();

// Mock data storage
let users = [
  {
    id: 1,
    email: "admin@test.com",
    password: "123456",
    fullname: "Admin User",
    role: "admin",
    avatar: "https://via.placeholder.com/150/667eea/white?text=Admin"
  },
  {
    id: 2,
    email: "user@test.com", 
    password: "123456",
    fullname: "Regular User",
    role: "user",
    avatar: "https://via.placeholder.com/150/95e1d3/white?text=User"
  }
];

// Register/Signup endpoint
router.post("/register", (req, res) => {
  const { fullname, name, email, password, role = "user" } = req.body;
  const userName = fullname || name;
  
  // Check if user exists
  if (users.find(u => u.email === email)) {
    return res.json({ success: false, message: "Email đã tồn tại" });
  }
  
  // Create new user
  const newUser = {
    id: users.length + 1,
    email,
    password,
    fullname: userName,
    role,
    avatar: `https://via.placeholder.com/150/667eea/white?text=${encodeURIComponent(userName)}`
  };
  
  users.push(newUser);
  
  res.json({ 
    success: true, 
    message: "Đăng ký thành công",
    user: { ...newUser, password: undefined } 
  });
});

// Signup endpoint (alias for register)
router.post("/signup", (req, res) => {
  const { fullname, name, email, password, role = "user" } = req.body;
  const userName = fullname || name;
  
  // Check if user exists
  if (users.find(u => u.email === email)) {
    return res.json({ success: false, message: "Email đã tồn tại" });
  }
  
  // Create new user
  const newUser = {
    id: users.length + 1,
    email,
    password,
    fullname: userName,
    role,
    avatar: `https://via.placeholder.com/150/667eea/white?text=${encodeURIComponent(userName)}`
  };
  
  users.push(newUser);
  
  res.json({ 
    success: true, 
    message: "Đăng ký thành công",
    user: { ...newUser, password: undefined } 
  });
});

// Login endpoint
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    res.json({ 
      success: true, 
      message: "Đăng nhập thành công",
      user: { ...user, password: undefined },
      token: "mock_token_" + user.id
    });
  } else {
    res.json({ success: false, message: "Email hoặc mật khẩu không đúng" });
  }
});
// Get all users
router.get("/users", (req, res) => {
  res.json({ 
    success: true, 
    users: users.map(u => ({ ...u, password: undefined }))
  });
});

// Update user
router.put("/users/:email", (req, res) => {
  const { email } = req.params;
  const { fullname, role } = req.body;
  
  const userIndex = users.findIndex(u => u.email === email);
  
  if (userIndex === -1) {
    return res.json({ success: false, message: "Không tìm thấy người dùng" });
  }
  
  if (fullname) users[userIndex].fullname = fullname;
  if (role) users[userIndex].role = role;
  
  res.json({ 
    success: true, 
    message: "Cập nhật thành công",
    user: { ...users[userIndex], password: undefined }
  });
});

// Delete user
router.delete("/users/:email", (req, res) => {
  const { email } = req.params;
  
  const userIndex = users.findIndex(u => u.email === email);
  
  if (userIndex === -1) {
    return res.json({ success: false, message: "Không tìm thấy người dùng" });
  }
  
  users.splice(userIndex, 1);
  
  res.json({ success: true, message: "Xóa người dùng thành công" });
});

// Update avatar
router.put("/users/:email/avatar", (req, res) => {
  const { email } = req.params;
  const { avatar } = req.body;
  
  const userIndex = users.findIndex(u => u.email === email);
  
  if (userIndex === -1) {
    return res.json({ success: false, message: "Không tìm thấy người dùng" });
  }
  
  users[userIndex].avatar = avatar;
  
  res.json({ 
    success: true, 
    message: "Cập nhật avatar thành công",
    user: { ...users[userIndex], password: undefined }
  });
});

// Get user profile
router.get("/profile/:email", (req, res) => {
  const { email } = req.params;
  
  const user = users.find(u => u.email === email);
  
  if (!user) {
    return res.json({ success: false, message: "Không tìm thấy người dùng" });
  }
  
  res.json({ 
    success: true, 
    user: { ...user, password: undefined }
  });
});

// Change password
router.put("/users/:email/password", (req, res) => {
  const { email } = req.params;
  const { currentPassword, newPassword } = req.body;
  
  const userIndex = users.findIndex(u => u.email === email);
  
  if (userIndex === -1) {
    return res.json({ success: false, message: "Không tìm thấy người dùng" });
  }
  
  // Check current password
  if (users[userIndex].password !== currentPassword) {
    return res.json({ success: false, message: "Mật khẩu hiện tại không đúng" });
  }
  
  // Update password
  users[userIndex].password = newPassword;
  
  res.json({ 
    success: true, 
    message: "Đổi mật khẩu thành công"
  });
});

// Update user profile
router.put("/profile/:email", (req, res) => {
  const { email } = req.params;
  const { fullname, phone, address, bio } = req.body;
  
  const userIndex = users.findIndex(u => u.email === email);
  
  if (userIndex === -1) {
    return res.json({ success: false, message: "Không tìm thấy người dùng" });
  }
  
  // Update profile fields
  if (fullname) users[userIndex].fullname = fullname;
  if (phone !== undefined) users[userIndex].phone = phone;
  if (address !== undefined) users[userIndex].address = address;
  if (bio !== undefined) users[userIndex].bio = bio;
  
  res.json({ 
    success: true, 
    message: "Cập nhật hồ sơ thành công",
    user: { ...users[userIndex], password: undefined }
  });
});

module.exports = router;
// Export the in-memory users for dev helpers (server.js dev-fallback may update them)
module.exports.TEST_USERS = users;
