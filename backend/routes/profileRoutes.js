// backend/routes/profileRoutes.js
// Activity 6: Protected Routes APIs for Redux testing

const express = require("express");
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { checkAnyRole, ROLES } = require('../middleware/roleMiddleware');
const { logActivity, ACTIONS } = require('../middleware/activityMiddleware');

// === Activity 6: API /profile - Protected user profile ===
router.get("/", 
  authenticateToken,
  logActivity(ACTIONS.API_ACCESS),
  (req, res) => {
    // Simulated user profile data
    const userProfile = {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
      profile: {
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(req.user.name)}&background=0D8ABC&color=fff`,
        joinDate: "2024-01-15",
        lastLogin: new Date().toISOString(),
        preferences: {
          theme: "light",
          language: "vi",
          notifications: true
        },
        stats: {
          loginCount: Math.floor(Math.random() * 100) + 10,
          activeDays: Math.floor(Math.random() * 365) + 30
        }
      }
    };

    res.json({
      message: "Profile retrieved successfully",
      data: userProfile
    });
  }
);

// === Activity 6: API /profile/dashboard - User dashboard data ===
router.get('/dashboard', 
  authenticateToken,
  logActivity(ACTIONS.API_ACCESS),
  (req, res) => {
    const dashboardData = {
      user: {
        id: req.user.id,
        name: req.user.name,
        role: req.user.role
      },
      recentActivity: [
        {
          id: 1,
          action: "Profile Updated",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          description: "Updated profile preferences"
        },
        {
          id: 2,
          action: "Login",
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          description: "Logged in from web browser"
        }
      ],
      notifications: [
        {
          id: 1,
          type: "info",
          title: "Welcome to Activity 6!",
          message: "Redux và Protected Routes đã được cài đặt thành công.",
          timestamp: new Date().toISOString(),
          read: false
        }
      ],
      stats: {
        totalLogins: Math.floor(Math.random() * 100) + 50,
        activeDays: Math.floor(Math.random() * 30) + 15,
        profileViews: Math.floor(Math.random() * 200) + 100,
        lastActivity: new Date().toISOString()
      }
    };

    res.json({
      message: "Dashboard data retrieved successfully",
      data: dashboardData
    });
  }
);

module.exports = router;
