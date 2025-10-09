const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User"); // Model bạn đã có
const authRoutes = require("./routes/auth"); // 🔹 Thêm dòng này

dotenv.config();
const app = express();
app.use(express.json());

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
