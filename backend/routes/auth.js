const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

feature/refresh-token
// POST /signup
router.post("/signup", authController.signup);

// POST /login
router.post("/login", authController.login);


// API: /api/auth/signup
router.post("/signup", authController.signup);

// API: /api/auth/login
router.post("/login", authController.login);

// API: /api/auth/logout
router.post("/logout", authController.logout);

backend
module.exports = router;
