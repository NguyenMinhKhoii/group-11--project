// =========================
// 1️⃣ Import thư viện
// =========================
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const userRoutes = require("./routes/userRoutes");
const profileRoutes = require("./routes/profileRoutes");

// =========================
// 2️⃣ Khởi tạo app
// =========================
const app = express();
app.use(cors());
app.use(express.json());

// =========================
// 3️⃣ Dữ liệu tạm
// =========================
global.users = [
  { id: "1", name: "Admin", email: "admin@gmail.com", password: "123456", role: "Admin" },
  { id: "2", name: "User A", email: "a@gmail.com", password: "123456", role: "User" },
  { id: "3", name: "User B", email: "b@gmail.com", password: "123456", role: "User" }
];

// =========================
// 4️⃣ Đăng nhập (Test)
// =========================
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = global.users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ message: "Sai email hoặc mật khẩu!" });

  const token = jwt.sign({ id: user.id, role: user.role }, "SECRET_KEY", { expiresIn: "1h" });
  res.json({ token, role: user.role, name: user.name });
});

// =========================
// 5️⃣ QUÊN MẬT KHẨU + RESET
// =========================
app.post("/forgot-password", (req, res) => {
  const { email } = req.body;
  const user = global.users.find(u => u.email === email);
  if (!user) return res.status(404).json({ message: "Không tìm thấy email này!" });

  const resetToken = jwt.sign({ id: user.id }, "RESET_SECRET", { expiresIn: "10m" });
  console.log(`🟢 Token reset cho ${email}: ${resetToken}`);

  res.json({
    message: "Đã gửi token reset (xem console để test)",
    token: resetToken
  });
});

app.post("/reset-password", (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const decoded = jwt.verify(token, "RESET_SECRET");
    const user = global.users.find(u => u.id === decoded.id);
    if (!user) return res.status(404).json({ message: "Không tìm thấy user!" });

    user.password = newPassword;
    res.json({ message: "Đặt lại mật khẩu thành công!" });
  } catch (err) {
    res.status(400).json({ message: "Token không hợp lệ hoặc đã hết hạn!" });
  }
});

// =========================
// 6️⃣ Routes khác
// =========================
app.use("/users", userRoutes);
app.use("/profile", profileRoutes);

// =========================
// 6️⃣ Upload Avatar (local)
// =========================
const multer = require("multer");
const path = require("path");

// Cấu hình lưu ảnh trong thư mục uploads/
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

// Route upload-avatar
app.post("/upload-avatar", upload.single("avatar"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Chưa có file được chọn!" });

  res.json({
    message: "Upload avatar thành công!",
    file: req.file
  });
});

// =========================
// 7️⃣ Chạy server
// =========================
app.listen(3000, () => console.log("🚀 Server chạy tại http://localhost:3000"));
