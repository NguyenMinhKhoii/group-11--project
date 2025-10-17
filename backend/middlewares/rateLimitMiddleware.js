// Rate Limiting Middleware - SV3 Activity 5
const ActivityLogService = require("../services/ActivityLogService");

// Rate limiting middleware for login attempts
const rateLimitLogin = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const action = "LOGIN_ATTEMPT";
    const timeWindow = 15; // minutes
    const maxAttempts = 5; // max attempts per window

    // Check rate limit
    const rateLimit = await ActivityLogService.checkRateLimit(
      ipAddress,
      action,
      timeWindow,
      maxAttempts
    );

    if (rateLimit.blocked) {
      // Log the rate limit violation
      await ActivityLogService.logSecurityViolation(
        null, // No user ID yet
        "Unknown",
        ipAddress,
        `Rate limit exceeded: ${rateLimit.attempts}/${maxAttempts} login attempts`
      );

      return res.status(429).json({
        success: false,
        message: "Too many login attempts. Please try again later.",
        retryAfter: Math.ceil((rateLimit.resetTime - new Date()) / 1000 / 60), // minutes
        details: {
          attempts: rateLimit.attempts,
          maxAttempts: rateLimit.maxAttempts,
          resetTime: rateLimit.resetTime,
        },
      });
    }

    // Store rate limit info in request for later use
    req.rateLimit = rateLimit;
    next();
  } catch (error) {
    console.error("Rate limit middleware error:", error);
    // Don't block request if rate limiting fails
    next();
  }
};

// General rate limiting middleware (configurable)
const rateLimit = (options = {}) => {
  const {
    action = "API_CALL",
    timeWindow = 15, // minutes
    maxAttempts = 100, // requests per window
    skipSuccessful = false,
  } = options;

  return async (req, res, next) => {
    try {
      const ipAddress = req.ip || req.connection.remoteAddress;

      // Check rate limit
      const rateLimit = await ActivityLogService.checkRateLimit(
        ipAddress,
        action,
        timeWindow,
        maxAttempts
      );

      if (rateLimit.blocked) {
        // Log the rate limit violation
        await ActivityLogService.logSecurityViolation(
          req.user?.userId || null,
          req.user?.username || "Unknown",
          ipAddress,
          `Rate limit exceeded: ${rateLimit.attempts}/${maxAttempts} ${action} attempts`
        );

        return res.status(429).json({
          success: false,
          message: `Rate limit exceeded for ${action}. Please try again later.`,
          retryAfter: Math.ceil((rateLimit.resetTime - new Date()) / 1000 / 60),
          details: {
            attempts: rateLimit.attempts,
            maxAttempts: rateLimit.maxAttempts,
            resetTime: rateLimit.resetTime,
          },
        });
      }

      req.rateLimit = rateLimit;
      next();
    } catch (error) {
      console.error("Rate limit middleware error:", error);
      next();
    }
  };
};

// Activity logging middleware
const logActivity = (action, options = {}) => {
  const {
    logSuccess = true,
    logFailure = true,
    includeBody = false,
    includeQuery = false,
  } = options;

  return async (req, res, next) => {
    // Store original end method
    const originalEnd = res.end;

    // Override res.end to capture response
    res.end = function (chunk, encoding) {
      res.end = originalEnd;

      // Determine if request was successful
      const isSuccess = res.statusCode >= 200 && res.statusCode < 400;
      const shouldLog = (isSuccess && logSuccess) || (!isSuccess && logFailure);

      if (shouldLog) {
        // Prepare activity details
        const details = {
          username: req.user?.username || "Anonymous",
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get("User-Agent"),
          status: isSuccess ? "SUCCESS" : "FAILED",
          additionalData: {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            userAgent: req.get("User-Agent"),
          },
        };

        // Include request body if requested (be careful with sensitive data)
        if (includeBody && req.body) {
          details.additionalData.requestBody = req.body;
        }

        // Include query parameters if requested
        if (includeQuery && req.query) {
          details.additionalData.queryParams = req.query;
        }

        // Log the activity (async, don't wait for it)
        ActivityLogService.logActivity(
          req.user?.userId || null,
          action,
          details
        ).catch((error) => {
          console.error("Failed to log activity:", error);
        });
      }

      // Call original end method
      return originalEnd.call(this, chunk, encoding);
    };

    next();
  };
};

// Middleware to log authentication events
const logAuth = async (req, res, next) => {
  // Store original json method
  const originalJson = res.json;

  res.json = function (data) {
    const isSuccess = res.statusCode >= 200 && res.statusCode < 400;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get("User-Agent");

    // Determine action based on endpoint
    let action = "API_CALL";
    if (req.route?.path?.includes("login")) {
      action = isSuccess ? "LOGIN_SUCCESS" : "LOGIN_FAILED";
    } else if (req.route?.path?.includes("register")) {
      action = "REGISTER";
    } else if (req.route?.path?.includes("logout")) {
      action = "LOGOUT";
    } else if (req.route?.path?.includes("reset")) {
      action = "PASSWORD_RESET_REQUEST";
    }

    // Log the authentication event
    const userId = req.user?.userId || data?.user?.id || null;
    const username =
      req.user?.username ||
      data?.user?.username ||
      req.body?.username ||
      "Unknown";

    ActivityLogService.logActivity(userId, action, {
      username,
      ipAddress,
      userAgent,
      status: isSuccess ? "SUCCESS" : "FAILED",
      additionalData: {
        endpoint: req.originalUrl,
        method: req.method,
        statusCode: res.statusCode,
      },
    }).catch((error) => {
      console.error("Failed to log auth activity:", error);
    });

    return originalJson.call(this, data);
  };

  next();
};

module.exports = {
  rateLimitLogin,
  rateLimit,
  logActivity,
  logAuth,
};
