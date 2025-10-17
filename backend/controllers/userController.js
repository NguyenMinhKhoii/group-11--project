console.log("✅ File userController.js đã được load!");

// Import users từ userModel để cùng dùng chung với auth
const users = require("../models/userModel");

// GET: lấy danh sách user
exports.getUsers = (req, res) => {
  res.status(200).json(users);
};

// POST: thêm user mới
exports.createUser = (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ message: "Thiếu name hoặc email!" });
  }

  const newUser = {
    id: users.length + 1,
    name,
    email,
  };

  users.push(newUser);
  res.status(201).json(newUser);
};

// ----------------------
// 📤 SHARE TOKENS/MESSAGES
// ----------------------
let sharedMessages = []; // Lưu messages/tokens được share

// GET: Lấy danh sách messages được share
exports.getSharedMessages = (req, res) => {
  res.status(200).json({
    total: sharedMessages.length,
    messages: sharedMessages
  });
};

// POST: Gửi token/message cho nhóm
exports.shareMessage = (req, res) => {
  const { type, content, from, to, timestamp } = req.body;
  
  if (!type || !content || !from) {
    return res.status(400).json({ message: "Thiếu thông tin: type, content, from" });
  }

  const newMessage = {
    id: sharedMessages.length + 1,
    type: type, // "token", "message", "reset_token", etc.
    content: content,
    from: from, // Người gửi
    to: to || "all", // Người nhận (default: tất cả)
    timestamp: timestamp || new Date().toISOString(),
    status: "sent"
  };

  sharedMessages.push(newMessage);
  
  res.status(201).json({
    message: "✅ Gửi thành công!",
    data: newMessage
  });
};

// DELETE: Xóa message (để test)
exports.clearSharedMessages = (req, res) => {
  sharedMessages = [];
  res.status(200).json({ message: "Đã xóa tất cả messages" });
};

// PUT: cập nhật user theo id
exports.updateUser = (req, res) => {
  const { id } = req.params;
  const index = users.findIndex((u) => u.id == id);

  if (index !== -1) {
    users[index] = { ...users[index], ...req.body };
    res.json(users[index]);
  } else {
    res.status(404).json({ message: "User not found" });
  }
};

// DELETE: xóa user theo id
exports.deleteUser = (req, res) => {
  const { id } = req.params;
  users = users.filter((u) => u.id != id);
  res.json({ message: "User deleted" });
};
