const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const authRoutes = require("./routes/auth"); // ✅ Đường dẫn chính xác

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Đăng ký route auth
app.use("/api/auth", authRoutes);

const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
