// Activity Log Routes - SV3 Activity 5
const express = require('express');
const router = express.Router();
const ActivityLogController = require('../controllers/activityLogController');
const verifyToken = require('../middlewares/verifyToken');
const checkRole = require('../middlewares/checkRole');

// Middleware to verify token for all routes
router.use(verifyToken);

// Get user activity logs
// GET /api/logs/user/:userId
router.get('/user/:userId', ActivityLogController.getUserLogs);

// Get user activity summary  
// GET /api/logs/user/:userId/summary
router.get('/user/:userId/summary', ActivityLogController.getUserActivitySummary);

// Admin only routes
// Get security analytics
// GET /api/logs/analytics
router.get('/analytics', checkRole(['admin']), ActivityLogController.getSecurityAnalytics);

// Get suspicious activities
// GET /api/logs/suspicious
router.get('/suspicious', checkRole(['admin']), ActivityLogController.getSuspiciousActivities);

// Get logs by IP address
// GET /api/logs/ip/:ipAddress
router.get('/ip/:ipAddress', checkRole(['admin']), ActivityLogController.getLogsByIP);

// Check rate limit for IP
// GET /api/logs/ratelimit/:ipAddress
router.get('/ratelimit/:ipAddress', checkRole(['admin']), ActivityLogController.checkRateLimit);

// Get activity dashboard
// GET /api/logs/dashboard
router.get('/dashboard', checkRole(['admin']), ActivityLogController.getActivityDashboard);

// Create manual log entry (for testing)
// POST /api/logs
router.post('/', checkRole(['admin']), ActivityLogController.createLog);

module.exports = router;
