const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// API: /api/auth/signup
router.post("/signup", authController.signup);

// API: /api/auth/login
router.post("/login", authController.login);

// API: /api/auth/logout
router.post("/logout", authController.logout);

// API: /api/auth/refresh
router.post("/refresh", authController.refresh);

// API: /api/auth/forgot-password
router.post("/forgot-password", authController.forgotPassword);

module.exports = router;
