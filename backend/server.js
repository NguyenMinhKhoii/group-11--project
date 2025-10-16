const express = require("express");
const bodyParser = require("body-parser");
const { authenticateToken } = require("./middleware/authMiddleware");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
app.use(bodyParser.json());

// ✅ Đăng ký router
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
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

const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Server chạy tại http://localhost:${PORT}`));
