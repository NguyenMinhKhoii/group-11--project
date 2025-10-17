// Activity Log Controller - SV3 Activity 5
const ActivityLogService = require('../services/ActivityLogService');
const UserActivityLog = require('../models/UserActivityLog');

class ActivityLogController {
  
  // Get user activity logs (for admin or user themselves)
  static async getUserLogs(req, res) {
    try {
      const { userId } = req.params;
      const {
        page = 1,
        limit = 50,
        action,
        status,
        startDate,
        endDate
      } = req.query;

      // Authorization check - users can only see their own logs, admins can see all
      if (req.user.role !== 'admin' && req.user.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You can only view your own activity logs'
        });
      }

      const result = await ActivityLogService.getUserActivityLogs(userId, {
        page: parseInt(page),
        limit: parseInt(limit),
        action,
        status,
        startDate,
        endDate
      });

      if (result.error) {
        return res.status(500).json({
          success: false,
          message: 'Failed to retrieve activity logs',
          error: result.error
        });
      }

      // Log this admin action
      if (req.user.role === 'admin' && req.user.userId !== userId) {
        await ActivityLogService.logActivity(req.user.userId, 'DATA_ACCESS', {
          username: req.user.username,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          additionalData: { targetUserId: userId, action: 'VIEW_USER_LOGS' }
        });
      }

      res.json({
        success: true,
        data: result.logs,
        pagination: result.pagination
      });

    } catch (error) {
      console.error('Error in getUserLogs:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get security analytics (admin only)
  static async getSecurityAnalytics(req, res) {
    try {
      const { timeframe = 24 } = req.query;

      // Admin only
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Admin privileges required'
        });
      }

      const analytics = await ActivityLogService.getSecurityAnalytics(parseInt(timeframe));

      // Log admin action
      await ActivityLogService.logActivity(req.user.userId, 'DATA_ACCESS', {
        username: req.user.username,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        additionalData: { action: 'VIEW_SECURITY_ANALYTICS', timeframe }
      });

      res.json({
        success: true,
        data: analytics,
        timeframe: `${timeframe} hours`
      });

    } catch (error) {
      console.error('Error in getSecurityAnalytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve security analytics',
        error: error.message
      });
    }
  }

  // Get suspicious activities (admin only)
  static async getSuspiciousActivities(req, res) {
    try {
      const { timeframe = 24 } = req.query;

      // Admin only
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Admin privileges required'
        });
      }

      const activities = await ActivityLogService.getSuspiciousActivities(parseInt(timeframe));

      // Log admin action
      await ActivityLogService.logActivity(req.user.userId, 'DATA_ACCESS', {
        username: req.user.username,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        additionalData: { action: 'VIEW_SUSPICIOUS_ACTIVITIES', timeframe }
      });

      res.json({
        success: true,
        data: activities,
        timeframe: `${timeframe} hours`
      });

    } catch (error) {
      console.error('Error in getSuspiciousActivities:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve suspicious activities',
        error: error.message
      });
    }
  }

  // Get logs by IP address (admin only)
  static async getLogsByIP(req, res) {
    try {
      const { ipAddress } = req.params;
      const { timeframe = 24, limit = 100 } = req.query;

      // Admin only
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Admin privileges required'
        });
      }

      const result = await ActivityLogService.getLogsByIP(
        ipAddress,
        parseInt(timeframe),
        parseInt(limit)
      );

      // Log admin action
      await ActivityLogService.logActivity(req.user.userId, 'DATA_ACCESS', {
        username: req.user.username,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        additionalData: { action: 'VIEW_LOGS_BY_IP', targetIP: ipAddress, timeframe }
      });

      res.json({
        success: true,
        data: result.logs,
        total: result.total,
        ipAddress,
        timeframe: `${timeframe} hours`
      });

    } catch (error) {
      console.error('Error in getLogsByIP:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve logs by IP',
        error: error.message
      });
    }
  }

  // Get user activity summary
  static async getUserActivitySummary(req, res) {
    try {
      const { userId } = req.params;
      const { timeframe = 24 } = req.query;

      // Authorization check
      if (req.user.role !== 'admin' && req.user.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You can only view your own activity summary'
        });
      }

      const result = await ActivityLogService.getUserActivitySummary(
        userId,
        parseInt(timeframe)
      );

      if (result.error) {
        return res.status(500).json({
          success: false,
          message: 'Failed to retrieve activity summary',
          error: result.error
        });
      }

      res.json({
        success: true,
        data: result.summary,
        timeframe: `${timeframe} hours`
      });

    } catch (error) {
      console.error('Error in getUserActivitySummary:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Check rate limit status for IP
  static async checkRateLimit(req, res) {
    try {
      const { ipAddress } = req.params;
      const { action = 'LOGIN_ATTEMPT', timeWindow = 15, maxAttempts = 5 } = req.query;

      // Admin only
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Admin privileges required'
        });
      }

      const rateLimit = await ActivityLogService.checkRateLimit(
        ipAddress,
        action,
        parseInt(timeWindow),
        parseInt(maxAttempts)
      );

      // Log admin action
      await ActivityLogService.logActivity(req.user.userId, 'DATA_ACCESS', {
        username: req.user.username,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        additionalData: { action: 'CHECK_RATE_LIMIT', targetIP: ipAddress }
      });

      res.json({
        success: true,
        data: rateLimit
      });

    } catch (error) {
      console.error('Error in checkRateLimit:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check rate limit',
        error: error.message
      });
    }
  }

  // Manual log entry (admin only, for testing)
  static async createLog(req, res) {
    try {
      const { userId, action, details } = req.body;

      // Admin only
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Admin privileges required'
        });
      }

      // Validate required fields
      if (!userId || !action) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: userId and action'
        });
      }

      const logDetails = {
        ...details,
        ipAddress: details?.ipAddress || req.ip,
        userAgent: details?.userAgent || req.get('User-Agent'),
        username: details?.username || 'Unknown'
      };

      const result = await ActivityLogService.logActivity(userId, action, logDetails);

      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: 'Failed to create log entry',
          error: result.error
        });
      }

      // Log this admin action
      await ActivityLogService.logActivity(req.user.userId, 'DATA_ACCESS', {
        username: req.user.username,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        additionalData: { action: 'MANUAL_LOG_CREATION', targetUserId: userId, logAction: action }
      });

      res.status(201).json({
        success: true,
        message: 'Log entry created successfully',
        logId: result.logId
      });

    } catch (error) {
      console.error('Error in createLog:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get activity statistics dashboard (admin only)
  static async getActivityDashboard(req, res) {
    try {
      // Admin only
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Admin privileges required'
        });
      }

      const { timeframe = 24 } = req.query;
      const hoursAgo = parseInt(timeframe);
      const startTime = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

      // Get comprehensive dashboard data
      const [
        totalLogs,
        uniqueUsers,
        uniqueIPs,
        analytics,
        suspicious,
        recentActivity
      ] = await Promise.all([
        UserActivityLog.countDocuments({ timestamp: { $gte: startTime } }),
        UserActivityLog.distinct('userId', { timestamp: { $gte: startTime } }),
        UserActivityLog.distinct('ipAddress', { timestamp: { $gte: startTime } }),
        ActivityLogService.getSecurityAnalytics(hoursAgo),
        ActivityLogService.getSuspiciousActivities(hoursAgo),
        UserActivityLog.find({ timestamp: { $gte: startTime } })
          .sort({ timestamp: -1 })
          .limit(10)
          .lean()
      ]);

      // Calculate risk distribution
      const riskDistribution = await UserActivityLog.aggregate([
        { $match: { timestamp: { $gte: startTime } } },
        { $group: { _id: '$riskLevel', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      const dashboard = {
        timeframe: `${hoursAgo} hours`,
        summary: {
          totalActivities: totalLogs,
          uniqueUsers: uniqueUsers.length,
          uniqueIPs: uniqueIPs.length,
          suspiciousCount: suspicious.length
        },
        analytics,
        riskDistribution,
        recentActivity: recentActivity.slice(0, 5), // Latest 5 activities
        suspiciousActivities: suspicious.slice(0, 10) // Top 10 suspicious
      };

      // Log admin dashboard access
      await ActivityLogService.logActivity(req.user.userId, 'DATA_ACCESS', {
        username: req.user.username,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        additionalData: { action: 'VIEW_ACTIVITY_DASHBOARD', timeframe: hoursAgo }
      });

      res.json({
        success: true,
        data: dashboard
      });

    } catch (error) {
      console.error('Error in getActivityDashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve activity dashboard',
        error: error.message
      });
    }
  }
}

module.exports = ActivityLogController;
