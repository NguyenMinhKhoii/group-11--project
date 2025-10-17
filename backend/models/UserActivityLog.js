// User Activity Log Model - SV3 Activity 5
const mongoose = require("mongoose");

const userActivityLogSchema = new mongoose.Schema(
  {
    // User information
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
      index: true,
    },

    // Activity details
    action: {
      type: String,
      required: true,
      enum: [
        "LOGIN_SUCCESS",
        "LOGIN_FAILED",
        "LOGIN_ATTEMPT",
        "LOGOUT",
        "REGISTER",
        "PASSWORD_RESET_REQUEST",
        "PASSWORD_RESET_SUCCESS",
        "PASSWORD_CHANGE",
        "PROFILE_UPDATE",
        "AVATAR_UPLOAD",
        "ROLE_CHANGE",
        "ACCOUNT_LOCK",
        "ACCOUNT_UNLOCK",
        "DATA_ACCESS",
        "API_CALL",
        "SECURITY_VIOLATION",
        "SESSION_EXPIRED",
      ],
      index: true,
    },

    // Request details
    ipAddress: {
      type: String,
      required: true,
      index: true,
    },
    userAgent: {
      type: String,
      default: "",
    },

    // Additional data
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Status and result
    status: {
      type: String,
      enum: ["SUCCESS", "FAILED", "BLOCKED", "WARNING"],
      default: "SUCCESS",
      index: true,
    },

    // Security level
    riskLevel: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "LOW",
      index: true,
    },

    // Timestamps
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },

    // Session tracking
    sessionId: {
      type: String,
      index: true,
    },

    // Location data (optional)
    location: {
      country: String,
      city: String,
      timezone: String,
    },
  },
  {
    timestamps: true,
    // TTL index - auto delete logs after 90 days
    expireAfterSeconds: 90 * 24 * 60 * 60,
  }
);

// Compound indexes for efficient queries
userActivityLogSchema.index({ userId: 1, timestamp: -1 });
userActivityLogSchema.index({ action: 1, timestamp: -1 });
userActivityLogSchema.index({ ipAddress: 1, timestamp: -1 });
userActivityLogSchema.index({ status: 1, riskLevel: 1, timestamp: -1 });
userActivityLogSchema.index({ username: 1, action: 1, timestamp: -1 });

// Index for rate limiting queries
userActivityLogSchema.index(
  {
    ipAddress: 1,
    action: 1,
    timestamp: -1,
  },
  {
    name: "rate_limit_index",
  }
);

// Methods for the schema
userActivityLogSchema.statics.logActivity = async function (logData) {
  try {
    const log = new this(logData);
    await log.save();
    return { success: true, logId: log._id };
  } catch (error) {
    console.error("Error logging activity:", error);
    return { success: false, error: error.message };
  }
};

// Get user activity logs with pagination
userActivityLogSchema.statics.getUserLogs = async function (
  userId,
  options = {}
) {
  const { page = 1, limit = 50, action, status, startDate, endDate } = options;

  const query = { userId };

  if (action) query.action = action;
  if (status) query.status = status;
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = new Date(startDate);
    if (endDate) query.timestamp.$lte = new Date(endDate);
  }

  const logs = await this.find(query)
    .sort({ timestamp: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  const total = await this.countDocuments(query);

  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

// Check rate limit for IP address
userActivityLogSchema.statics.checkRateLimit = async function (
  ipAddress,
  action,
  timeWindow = 15,
  maxAttempts = 5
) {
  const windowStart = new Date(Date.now() - timeWindow * 60 * 1000);

  const attempts = await this.countDocuments({
    ipAddress,
    action,
    timestamp: { $gte: windowStart },
  });

  return {
    attempts,
    maxAttempts,
    blocked: attempts >= maxAttempts,
    resetTime: new Date(Date.now() + timeWindow * 60 * 1000),
  };
};

// Get security analytics
userActivityLogSchema.statics.getSecurityAnalytics = async function (
  timeframe = 24
) {
  const startTime = new Date(Date.now() - timeframe * 60 * 60 * 1000);

  const analytics = await this.aggregate([
    { $match: { timestamp: { $gte: startTime } } },
    {
      $group: {
        _id: {
          action: "$action",
          status: "$status",
        },
        count: { $sum: 1 },
        uniqueUsers: { $addToSet: "$userId" },
        uniqueIPs: { $addToSet: "$ipAddress" },
      },
    },
    {
      $project: {
        action: "$_id.action",
        status: "$_id.status",
        count: 1,
        uniqueUsers: { $size: "$uniqueUsers" },
        uniqueIPs: { $size: "$uniqueIPs" },
      },
    },
    { $sort: { count: -1 } },
  ]);

  return analytics;
};

// Get suspicious activities
userActivityLogSchema.statics.getSuspiciousActivities = async function (
  timeframe = 24
) {
  const startTime = new Date(Date.now() - timeframe * 60 * 60 * 1000);

  return await this.find({
    timestamp: { $gte: startTime },
    $or: [
      { riskLevel: { $in: ["HIGH", "CRITICAL"] } },
      { status: "BLOCKED" },
      { action: "SECURITY_VIOLATION" },
    ],
  })
    .sort({ timestamp: -1 })
    .limit(100);
};

const UserActivityLog = mongoose.model(
  "UserActivityLog",
  userActivityLogSchema
);

module.exports = UserActivityLog;
