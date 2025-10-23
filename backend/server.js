const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const User = require("./models/User"); // Model bạn đã có
const authRoutes = require("./routes/auth"); // 🔹 Thêm dòng này
const activityLogRoutes = require("./routes/activityLogRoutes"); // 🔹 SV3 Activity 5

// Load environment variables based on environment
if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env.production' });
} else {
  dotenv.config({ path: 'd:\\group-11--project\\backend\\.env' });
}

console.log("Environment:", process.env.NODE_ENV || 'development');
console.log("MONGO_URI:", process.env.MONGO_URI ? "loaded" : "not found");

const app = express();

// CORS Configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Kết nối MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// 🔹 Thêm dòng này sau khi cấu hình middleware (express.json)
app.use("/api/auth", authRoutes); // Đăng ký route cho Authentication
app.use("/api/logs", activityLogRoutes); // 🔹 SV3 Activity 5: Activity Log Routes

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
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
