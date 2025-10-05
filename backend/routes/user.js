const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Lấy danh sách user
router.get("/", userController.getUsers);

// Thêm user mới
router.post("/", userController.createUser);

module.exports = router;
