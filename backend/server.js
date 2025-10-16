const express = require("express");
feature/rbac
const bodyParser = require("body-parser");
const { authenticateToken } = require("./middleware/authMiddleware");
const authRoutes = require("./routes/authRoutes");
=======
 feature/refresh-token
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User"); // Model bạn đã có
const authRoutes = require("./routes/auth"); // 🔹 Thêm dòng này

dotenv.config();

const cors = require("cors");
const jwt = require("jsonwebtoken");

backend
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const avatarRoutes = require("./routes/avatarRoutes");
const { testCloudinaryConnection } = require("./utils/cloudinaryConfig");

feature/rbac
const app = express();
app.use(bodyParser.json());
=======
// =========================
// 2️⃣ Khởi tạo app
// =========================
 backend
const app = express();
app.use(cors());
app.use(express.json());

feature/refresh-token
// Kết nối MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// 🔹 Thêm dòng này sau khi cấu hình middleware (express.json)
app.use("/api/auth", authRoutes); // Đăng ký route cho Authentication

// API GET
app.get("/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// API POST
app.post("/users", async (req, res) => {
  const { name, email, password } = req.body;
  const newUser = new User({ name, email, password });
  await newUser.save();
  res.status(201).json(newUser);
});

// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
// =========================
// 3️⃣ Dữ liệu tạm
// =========================
global.users = [
  { id: "1", name: "Admin", email: "admin@gmail.com", password: "123456", role: "Admin" },
  { id: "2", name: "User A", email: "a@gmail.com", password: "123456", role: "User" },
  { id: "3", name: "User B", email: "b@gmail.com", password: "123456", role: "User" }
];
backend

// ✅ Đăng ký router
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/users", avatarRoutes);  // Avatar routes
app.use("/admin", adminRoutes);

// Import role middleware
const { checkRole, checkRoleLevel, checkAnyRole, ROLES } = require("./middleware/roleMiddleware");

// ✅ Route demo phân quyền
app.get("/protected", authenticateToken, (req, res) => {
  res.json({ 
    message: `Xin chào ${req.user.name}, bạn đã truy cập thành công!`,
    user: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role
    }
  });
});

// Route chỉ dành cho User
app.get("/user-only", authenticateToken, checkRole(ROLES.USER), (req, res) => {
  res.json({ 
    message: "Đây là khu vực dành riêng cho USER!",
    user: req.user
  });
});

// Route chỉ dành cho Moderator
app.get("/moderator-only", authenticateToken, checkRole(ROLES.MODERATOR), (req, res) => {
  res.json({ 
    message: "Đây là khu vực dành riêng cho MODERATOR!",
    user: req.user
  });
});

// Route chỉ dành cho Admin  
app.get("/admin-only", authenticateToken, checkRole(ROLES.ADMIN), (req, res) => {
  res.json({ 
    message: "Đây là khu vực dành riêng cho ADMIN!",
    user: req.user
  });
});

// Route cho Moderator và Admin (hierarchical)
app.get("/mod-admin", authenticateToken, checkRoleLevel(ROLES.MODERATOR), (req, res) => {
  res.json({ 
    message: "Đây là khu vực dành cho MODERATOR trở lên!",
    user: req.user
  });
});

// Route cho nhiều role (OR logic)
app.get("/multi-role", authenticateToken, checkAnyRole(ROLES.MODERATOR, ROLES.ADMIN), (req, res) => {
  res.json({ 
    message: "Đây là khu vực cho MODERATOR hoặc ADMIN!",
    user: req.user
  });
});

feature/rbac
const PORT = 3000;
feature/avatar-upload
app.listen(PORT, async () => {
  console.log(`✅ Server chạy tại http://localhost:${PORT}`);
  
  // Test Cloudinary connection
  console.log('🔄 Testing Cloudinary connection...');
  await testCloudinaryConnection();
});

app.listen(PORT, () => console.log(`✅ Server chạy tại http://localhost:${PORT}`));

// =========================
// 7️⃣ Chạy server
// =========================
app.listen(3000, () => console.log("🚀 Server chạy tại http://localhost:3000"));
 backend
backend
backend
