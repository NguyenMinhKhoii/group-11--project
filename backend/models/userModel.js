const bcrypt = require("bcryptjs");

// Tạo mật khẩu hash cho password "123456"
const hashedPassword = bcrypt.hashSync("123456", 10);

const users = [
  { id: 1, name: "Khoi Test", email: "khoi@gmail.com", password: hashedPassword },
  { id: 2, name: "Test User", email: "test@example.com", password: hashedPassword },
  { id: 3, name: "Demo User", email: "demo@example.com", password: hashedPassword }
]; // Mảng lưu người dùng (giả lập DB)

console.log("✅ User model loaded with hashed passwords for testing!");

module.exports = users;
