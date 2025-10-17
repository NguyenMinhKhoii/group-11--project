const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Danh sách người dùng" });
});

module.exports = router;
