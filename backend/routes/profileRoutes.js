const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const profileController = require("../controllers/profileController");

// Xem thông tin cá nhân
router.get("/", authMiddleware, profileController.getProfile);

// Cập nhật thông tin cá nhân
router.put("/", authMiddleware, profileController.updateProfile);

module.exports = router;

