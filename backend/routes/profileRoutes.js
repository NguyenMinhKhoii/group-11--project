const express = require("express");
const router = express.Router();

// ✅ Route đơn giản để test
router.get("/", (req, res) => {
  res.json({ message: "Thông tin hồ sơ người dùng" });
});

module.exports = router;
