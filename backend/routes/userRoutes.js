// backend/routes/userRoutes.js

const express = require("express");
const router = express.Router();

// ✅ Đặt TẤT CẢ imports lên đầu tiên
const path = require('path');
const userController = require(path.join(__dirname, "../controllers/userController"));
const { verifyToken } = require("../middlewares/verifyToken"); 
const checkRole = require("../middlewares/checkRole");     
const User = require("../models/User"); 

// -----------------------------------------------------------
// Route GET /all - Lấy danh sách tất cả người dùng
// -----------------------------------------------------------
router.get(
    "/all",
    verifyToken, // Middleware 1
    checkRole([User.ROLES.ADMIN, User.ROLES.MODERATOR]), // Middleware 2
    userController.getAllUsers // ✅ Callback Function (Lúc này phải tồn tại)
);

// -----------------------------------------------------------
// Route DELETE /:id - Xóa người dùng
// -----------------------------------------------------------
router.delete(
    "/:id",
    verifyToken,
    userController.deleteUser
);

// -----------------------------------------------------------
// Route Mặc định /
// -----------------------------------------------------------
router.get("/", (req, res) => {
    res.json({ message: "Endpoint mặc định của User Routes đã hoạt động." });
});

module.exports = router;