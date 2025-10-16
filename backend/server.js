const express = require("express");
const bodyParser = require("body-parser");
const { authenticateToken } = require("./middleware/authMiddleware");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
app.use(bodyParser.json());

// ✅ Đăng ký router
app.use("/auth", authRoutes);
app.use("/users", userRoutes);

app.get("/protected", authenticateToken, (req, res) => {
  res.json({ message: `Xin chào ${req.user.name}, bạn đã truy cập thành công!` });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Server chạy tại http://localhost:${PORT}`));
