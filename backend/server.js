const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const userRoutes = require("./routes/userRoutes");
const profileRoutes = require("./routes/profileRoutes");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Dữ liệu tạm (in-memory)
global.users = [
  { id: "1", name: "Admin", email: "admin@gmail.com", password: "123456", role: "Admin" },
  { id: "2", name: "User A", email: "a@gmail.com", password: "123456", role: "User" },
  { id: "3", name: "User B", email: "b@gmail.com", password: "123456", role: "User" }
];

// Đăng nhập (test)
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = global.users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ message: "Sai email hoặc mật khẩu!" });

  const token = jwt.sign({ id: user.id, role: user.role }, "SECRET_KEY", { expiresIn: "1h" });
  res.json({ token, role: user.role, name: user.name });
});

// 👉 Route
app.use("/users", userRoutes);
app.use("/profile", profileRoutes);

// Chạy server
app.listen(3000, () => console.log("🚀 Server chạy tại http://localhost:3000"));
