// Rate Limiting Middleware
// Simple in-memory rate limiting (basic implementation without external dependencies)
const requestCounts = new Map();

const createSimpleRateLimit = (windowMs = 15 * 60 * 1000, maxRequests = 100, message = 'Too many requests') => {
  return (req, res, next) => {
    const key = req.ip || (req.connection && req.connection.remoteAddress) || 'unknown';
    const now = Date.now();
    
    // Cleanup old entries
    for (const [ip, data] of requestCounts.entries()) {
      if (now - data.resetTime > windowMs) {
        requestCounts.delete(ip);
      }
    }

    // Get or create entry for this IP
    let entry = requestCounts.get(key);
    if (!entry || (now - entry.resetTime > windowMs)) {
      entry = {
        count: 0,
        resetTime: now
      };
      requestCounts.set(key, entry);
    }

    entry.count++;

    if (entry.count > maxRequests) {
      return res.status(429).json({
        error: message,
        retryAfter: Math.ceil((windowMs - (now - entry.resetTime)) / 1000)
      });
    }

    next();
  };
};

// Specific rate limits
const loginRateLimit = createSimpleRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // 5 attempts
  'Too many login attempts, please try again later'
);

const generalRateLimit = createSimpleRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests
  'Too many requests from this IP, please try again later'
);

const registerRateLimit = createSimpleRateLimit(
  60 * 60 * 1000, // 1 hour
  3, // 3 registrations
  'Too many registration attempts, please try again later'
);

module.exports = {
  loginRateLimit,
  generalRateLimit,
  registerRateLimit
};