const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const verifyToken = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware"); // ✅ Import đúng cách

// Lấy danh sách user (Admin)
router.get("/", verifyToken, checkRole("Admin"), userController.getUsers);

// Xóa user (Admin hoặc chính chủ)
router.delete("/:id", verifyToken, userController.deleteUser);

module.exports = router;
