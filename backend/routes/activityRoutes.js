const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { checkAnyRole, ROLES } = require('../middleware/roleMiddleware');
const { 
  getAllLogs, 
  getUserLogs, 
  getLogsByAction, 
  getActivityStats,
  ACTIONS 
} = require('../utils/activityLogger');
const { logActivity } = require('../middleware/activityMiddleware');

// ✅ GET /logs - Xem tất cả logs (chỉ admin)
router.get('/', 
  authenticateToken, 
  checkAnyRole(ROLES.ADMIN), 
  logActivity(ACTIONS.API_ACCESS),
  (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 100;
      const logs = getAllLogs(limit);
      
      res.json({
        message: 'Lấy activity logs thành công',
        logs: logs,
        total: logs.length,
        limit: limit
      });
    } catch (error) {
      res.status(500).json({
        message: 'Lỗi khi lấy activity logs',
        error: 'INTERNAL_ERROR',
        details: error.message
      });
    }
  }
);

// ✅ GET /logs/user/:userId - Xem logs của một user cụ thể
router.get('/user/:userId', 
  authenticateToken,
  checkAnyRole([ROLES.ADMIN, ROLES.MODERATOR]),
  logActivity(ACTIONS.API_ACCESS),
  (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const limit = parseInt(req.query.limit) || 50;
      
      if (!userId) {
        return res.status(400).json({
          message: 'User ID không hợp lệ',
          error: 'INVALID_USER_ID'
        });
      }

      const logs = getUserLogs(userId, limit);
      
      res.json({
        message: `Lấy activity logs của user ${userId} thành công`,
        userId: userId,
        logs: logs,
        total: logs.length,
        limit: limit
      });
    } catch (error) {
      res.status(500).json({
        message: 'Lỗi khi lấy user logs',
        error: 'INTERNAL_ERROR',
        details: error.message
      });
    }
  }
);

// ✅ GET /logs/my - Xem logs của chính mình
router.get('/my', 
  authenticateToken,
  logActivity(ACTIONS.API_ACCESS),
  (req, res) => {
    try {
      const userId = req.user.id;
      const limit = parseInt(req.query.limit) || 50;
      
      const logs = getUserLogs(userId, limit);
      
      res.json({
        message: 'Lấy activity logs cá nhân thành công',
        logs: logs,
        total: logs.length,
        limit: limit
      });
    } catch (error) {
      res.status(500).json({
        message: 'Lỗi khi lấy personal logs',
        error: 'INTERNAL_ERROR',
        details: error.message
      });
    }
  }
);

// ✅ GET /logs/action/:action - Lọc logs theo action
router.get('/action/:action', 
  authenticateToken,
  checkAnyRole(ROLES.ADMIN),
  logActivity(ACTIONS.API_ACCESS),
  (req, res) => {
    try {
      const action = req.params.action.toUpperCase();
      const limit = parseInt(req.query.limit) || 50;
      
      // Validate action
      if (!Object.values(ACTIONS).includes(action)) {
        return res.status(400).json({
          message: 'Action không hợp lệ',
          error: 'INVALID_ACTION',
          availableActions: Object.values(ACTIONS)
        });
      }

      const logs = getLogsByAction(action, limit);
      
      res.json({
        message: `Lấy logs với action ${action} thành công`,
        action: action,
        logs: logs,
        total: logs.length,
        limit: limit
      });
    } catch (error) {
      res.status(500).json({
        message: 'Lỗi khi lấy logs theo action',
        error: 'INTERNAL_ERROR',
        details: error.message
      });
    }
  }
);

// ✅ GET /logs/stats - Thống kê activity logs
router.get('/stats', 
  authenticateToken,
  checkAnyRole(ROLES.ADMIN, ROLES.MODERATOR),
  logActivity(ACTIONS.API_ACCESS),
  (req, res) => {
    try {
      const stats = getActivityStats();
      
      res.json({
        message: 'Lấy thống kê activity thành công',
        stats: stats,
        timestamp: new Date()
      });
    } catch (error) {
      res.status(500).json({
        message: 'Lỗi khi lấy thống kê',
        error: 'INTERNAL_ERROR',
        details: error.message
      });
    }
  }
);

// ✅ GET /logs/actions - Danh sách tất cả actions available
router.get('/actions', 
  authenticateToken,
  checkAnyRole([ROLES.ADMIN, ROLES.MODERATOR]),
  logActivity(ACTIONS.API_ACCESS),
  (req, res) => {
    try {
      res.json({
        message: 'Danh sách actions thành công',
        actions: Object.values(ACTIONS),
        actionsDetail: ACTIONS
      });
    } catch (error) {
      res.status(500).json({
        message: 'Lỗi khi lấy danh sách actions',
        error: 'INTERNAL_ERROR',
        details: error.message
      });
    }
  }
);

module.exports = router;