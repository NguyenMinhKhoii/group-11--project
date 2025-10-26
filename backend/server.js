const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config();

// Import database connection
const connectDB = require("./config/db");

// Import middleware
const { authenticateToken } = require("./middleware/authMiddleware");
// const { authenticateJWT } = require("./middleware/jwtAuth"); // Commented out - not needed
const { checkRole, checkRoleLevel, checkAnyRole, ROLES } = require("./middleware/roleMiddleware");
// const { generalRateLimit } = require("./middleware/rateLimitMiddleware"); // Commented out - not needed

// Import routes
const authRoutes = require("./routes/authRoutes");
// const authMongoDB = require("./routes/authMongoDB"); // New MongoDB auth routes - commented out if not exists
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
// const avatarRoutes = require("./routes/avatarRoutes"); // Re-enabled for full functionality - commented out if not exists
// const activityRoutes = require("./routes/activityRoutes"); // commented out if not exists

// Import utilities
// const { testCloudinaryConnection } = require("./utils/cloudinaryConfig"); // Re-enabled for avatar functionality - commented out
// const { testEmailConnection } = require("./utils/emailConfig"); // commented out

// Initialize app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from parent directory (for HTML files)
app.use(express.static(path.join(__dirname, '..')));

// Apply general rate limiting
// app.use(generalRateLimit({ windowMs: 15 * 60 * 1000, max: 100 })); // commented out

// Connect to MongoDB with better error handling
connectDB();

// Register routes
app.use("/api/auth", authRoutes); // Original mock routes
// app.use("/api/auth-mongo", authMongoDB); // New MongoDB routes for Activity 3 - commented out
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
// app.use("/api/avatar", avatarRoutes); // Avatar routes with JWT - Re-enabled - commented out
app.use("/admin", adminRoutes);
// app.use("/activities", activityRoutes); // commented out

// RBAC Demo Routes
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

// Health check route
app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`🚀 Group 11 RBAC Server - Activity 3`);
  console.log(`✅ Server chạy tại http://localhost:${PORT}`);
  console.log('📋 Available endpoints:');
  console.log('   • MongoDB Auth: /api/auth-mongo/*');
  console.log('   • Avatar Upload: /api/avatar/upload (JWT required)');
  console.log('   • Original Auth: /api/auth/*');
  
  // Test connections
  // console.log('🔄 Testing Cloudinary connection...');
  // const cloudinaryOk = await testCloudinaryConnection();
  
  // console.log('🔄 Testing Email connection...');
  // await testEmailConnection();
  
  // if (cloudinaryOk) {
  //   console.log('🎯 Ready for all functionalities: Avatar Upload + Forgot Password!');
  // } else {
  //   console.log('⚠️ Cloudinary connection failed - check .env configuration');
  //   console.log('🎯 Forgot Password functionality ready!');
  // }
  
  console.log('🎯 Server ready for basic authentication and RBAC functionality!');
});
