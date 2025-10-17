// User Activity Logging Service - SV3 Activity 5
const UserActivityLog = require("../models/UserActivityLog");
const crypto = require("crypto");

class ActivityLogService {
  // Main logging function
  static async logActivity(userId, action, details = {}) {
    try {
      const logData = {
        userId,
        username: details.username || "Unknown",
        action,
        ipAddress: details.ipAddress || "0.0.0.0",
        userAgent: details.userAgent || "",
        details: details.additionalData || {},
        status: details.status || "SUCCESS",
        riskLevel: this.calculateRiskLevel(action, details),
        sessionId: details.sessionId || crypto.randomUUID(),
        location: details.location || {},
      };

      const result = await UserActivityLog.logActivity(logData);

      if (result.success) {
        console.log(`✅ Activity logged: ${action} for user ${userId}`);
      } else {
        console.error(`❌ Failed to log activity: ${result.error}`);
      }

      return result;
    } catch (error) {
      console.error("Error in logActivity:", error);
      return { success: false, error: error.message };
    }
  }

  // Calculate risk level based on action and context
  static calculateRiskLevel(action, details) {
    const highRiskActions = [
      "SECURITY_VIOLATION",
      "ACCOUNT_LOCK",
      "LOGIN_FAILED",
    ];
    const mediumRiskActions = [
      "PASSWORD_RESET_REQUEST",
      "ROLE_CHANGE",
      "LOGIN_ATTEMPT",
    ];

    if (highRiskActions.includes(action)) return "HIGH";
    if (mediumRiskActions.includes(action)) return "MEDIUM";

    // Check for suspicious patterns
    if (details.failedAttempts && details.failedAttempts > 3) return "HIGH";
    if (details.newLocation) return "MEDIUM";

    return "LOW";
  }

  // Log login attempt
  static async logLoginAttempt(
    userId,
    username,
    ipAddress,
    userAgent,
    success = true
  ) {
    return await this.logActivity(
      userId,
      success ? "LOGIN_SUCCESS" : "LOGIN_FAILED",
      {
        username,
        ipAddress,
        userAgent,
        status: success ? "SUCCESS" : "FAILED",
      }
    );
  }

  // Log logout
  static async logLogout(userId, username, ipAddress, sessionId) {
    return await this.logActivity(userId, "LOGOUT", {
      username,
      ipAddress,
      sessionId,
      status: "SUCCESS",
    });
  }

  // Log password reset request
  static async logPasswordResetRequest(userId, username, ipAddress, email) {
    return await this.logActivity(userId, "PASSWORD_RESET_REQUEST", {
      username,
      ipAddress,
      additionalData: { email },
      status: "SUCCESS",
    });
  }

  // Log profile update
  static async logProfileUpdate(userId, username, ipAddress, changes) {
    return await this.logActivity(userId, "PROFILE_UPDATE", {
      username,
      ipAddress,
      additionalData: { changes },
      status: "SUCCESS",
    });
  }

  // Log security violation
  static async logSecurityViolation(userId, username, ipAddress, violation) {
    return await this.logActivity(userId, "SECURITY_VIOLATION", {
      username,
      ipAddress,
      additionalData: { violation },
      status: "BLOCKED",
      riskLevel: "CRITICAL",
    });
  }

  // Check rate limit for specific action
  static async checkRateLimit(
    ipAddress,
    action = "LOGIN_ATTEMPT",
    timeWindow = 15,
    maxAttempts = 5
  ) {
    try {
      return await UserActivityLog.checkRateLimit(
        ipAddress,
        action,
        timeWindow,
        maxAttempts
      );
    } catch (error) {
      console.error("Error checking rate limit:", error);
      return { blocked: false, error: error.message };
    }
  }

  // Get user activity logs
  static async getUserActivityLogs(userId, options = {}) {
    try {
      return await UserActivityLog.getUserLogs(userId, options);
    } catch (error) {
      console.error("Error getting user logs:", error);
      return { logs: [], error: error.message };
    }
  }

  // Get security analytics
  static async getSecurityAnalytics(timeframe = 24) {
    try {
      return await UserActivityLog.getSecurityAnalytics(timeframe);
    } catch (error) {
      console.error("Error getting security analytics:", error);
      return { analytics: [], error: error.message };
    }
  }

  // Get suspicious activities
  static async getSuspiciousActivities(timeframe = 24) {
    try {
      return await UserActivityLog.getSuspiciousActivities(timeframe);
    } catch (error) {
      console.error("Error getting suspicious activities:", error);
      return { activities: [], error: error.message };
    }
  }

  // Clean old logs (manual cleanup, though TTL handles this automatically)
  static async cleanOldLogs(daysOld = 90) {
    try {
      const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
      const result = await UserActivityLog.deleteMany({
        timestamp: { $lt: cutoffDate },
      });

      console.log(`🧹 Cleaned ${result.deletedCount} old activity logs`);
      return { success: true, deletedCount: result.deletedCount };
    } catch (error) {
      console.error("Error cleaning old logs:", error);
      return { success: false, error: error.message };
    }
  }

  // Get logs by IP address (for admin monitoring)
  static async getLogsByIP(ipAddress, timeframe = 24, limit = 100) {
    try {
      const startTime = new Date(Date.now() - timeframe * 60 * 60 * 1000);

      const logs = await UserActivityLog.find({
        ipAddress,
        timestamp: { $gte: startTime },
      })
        .sort({ timestamp: -1 })
        .limit(limit)
        .lean();

      return { logs, total: logs.length };
    } catch (error) {
      console.error("Error getting logs by IP:", error);
      return { logs: [], error: error.message };
    }
  }

  // Generate activity summary for user
  static async getUserActivitySummary(userId, timeframe = 24) {
    try {
      const startTime = new Date(Date.now() - timeframe * 60 * 60 * 1000);

      const summary = await UserActivityLog.aggregate([
        {
          $match: {
            userId: userId,
            timestamp: { $gte: startTime },
          },
        },
        {
          $group: {
            _id: "$action",
            count: { $sum: 1 },
            lastActivity: { $max: "$timestamp" },
            statuses: { $push: "$status" },
          },
        },
        {
          $project: {
            action: "$_id",
            count: 1,
            lastActivity: 1,
            successCount: {
              $size: {
                $filter: {
                  input: "$statuses",
                  cond: { $eq: ["$$this", "SUCCESS"] },
                },
              },
            },
            failedCount: {
              $size: {
                $filter: {
                  input: "$statuses",
                  cond: { $eq: ["$$this", "FAILED"] },
                },
              },
            },
          },
        },
        { $sort: { count: -1 } },
      ]);

      return { summary };
    } catch (error) {
      console.error("Error getting user activity summary:", error);
      return { summary: [], error: error.message };
    }
  }
}

module.exports = ActivityLogService;
