const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const verifyToken = require("../middlewares/verifyToken");
const { rateLimitLogin, logAuth } = require("../middlewares/rateLimitMiddleware");

// Public routes
// POST /signup
router.post("/signup", authController.signup);

// POST /login - with rate limiting and logging
router.post("/login", rateLimitLogin, logAuth, authController.login);

// Protected routes (require token)
// GET /verify - Verify token and get current user
router.get("/verify", verifyToken, authController.verifyToken);

// GET /me - Get current user data
router.get("/me", verifyToken, authController.getCurrentUser);

// POST /logout - Logout user
router.post("/logout", verifyToken, authController.logout);

// PUT /profile - Update user profile
router.put("/profile", verifyToken, authController.updateProfile);

// PUT /change-password - Change password
router.put("/change-password", verifyToken, authController.changePassword);

module.exports = router;
