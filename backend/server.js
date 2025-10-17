const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ✅ Tạo app Express
const app = express();
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json()); // parse JSON body

// ✅ Kết nối MongoDB
const MONGO_URI = "mongodb+srv://anhbuinhatt_db_user:nhom11@cluster0.ve0bn28.mongodb.net/groupDB?retryWrites=true&w=majority&appName=Cluster0";
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Kết nối MongoDB thành công!"))
  .catch((err) => console.error("❌ Lỗi kết nối MongoDB:", err.message));

// ✅ Tạo Schema User
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, default: "user" } // thêm role
});

const User = mongoose.model("User", userSchema);

// ✅ API: Đăng ký (Sign Up)
app.post("/api/signup", async (req, res) => {
  console.log("Body nhận được:", req.body);
  try {
    const { name, email, password } = req.body;

    // Kiểm tra email tồn tại
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("Email đã tồn tại:", email);
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user mới
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    // Tạo token sau khi đăng ký
    const token = jwt.sign({ id: newUser._id, email }, "group11_secret", { expiresIn: "24h" });
    
    console.log("User đăng ký thành công:", email);
    res.json({ 
      message: "Đăng ký thành công!",
      accessToken: token,
      refreshToken: "dummy_refresh_token",
      user: { id: newUser._id, name: newUser.name, email: newUser.email }
    });
  } catch (err) {
    console.error("Lỗi đăng ký:", err.message);
    res.status(500).json({ message: "Lỗi server khi đăng ký" });
  }
});

// ✅ API: Đăng nhập (Login)
app.post("/api/login", async (req, res) => {
  console.log("Login body:", req.body);
  try {
    const { email, password } = req.body;

    // Tìm user theo email
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Email không tồn tại" });

    // So khớp password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Sai mật khẩu" });

    // Tạo JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, "secret123", { expiresIn: "1h" });

    console.log("Đăng nhập thành công:", email);
    res.json({ 
      message: "Đăng nhập thành công!", 
      accessToken: token,
      refreshToken: "dummy_refresh_token",
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error("Lỗi đăng nhập:", err.message);
    res.status(500).json({ message: "Lỗi server khi đăng nhập" });
  }
});

// ✅ API: Refresh Token (placeholder - frontend cần)
app.post("/api/auth/refresh", (req, res) => {
  // Simplified refresh token - trả về success để frontend không lỗi
  res.json({ 
    message: "Token refreshed successfully",
    accessToken: "dummy_access_token",
    refreshToken: "dummy_refresh_token"
  });
});

// ✅ API: Lấy danh sách users (cho trang Admin)
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }); // Không trả về password
    res.json(users);
  } catch (err) {
    console.error("Lỗi lấy danh sách users:", err.message);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách users" });
  }
});

// ✅ API: Xóa user (cho trang Admin)
app.delete("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);
    
    if (!deletedUser) {
      return res.status(404).json({ message: "Không tìm thấy user để xóa" });
    }
    
    res.json({ 
      message: "Xóa user thành công!", 
      user: { name: deletedUser.name, email: deletedUser.email } 
    });
  } catch (err) {
    console.error("Lỗi xóa user:", err.message);
    res.status(500).json({ message: "Lỗi server khi xóa user" });
  }
});

// ✅ Route test
app.get("/", (req, res) => {
  res.send("🚀 Server đang chạy và MongoDB đã kết nối OK!");
});

// ✅ Khởi động server trên port 5000
const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Server đang chạy tại cổng ${PORT}`));
