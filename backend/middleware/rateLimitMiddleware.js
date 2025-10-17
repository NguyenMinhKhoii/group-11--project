const { trackLoginAttempt, isRateLimited, resetLoginAttempts, saveActivityLog, ACTIONS } = require('../utils/activityLogger');

/**
 * Rate limiting middleware cho login
 * @param {Object} options - Cấu hình rate limiting
 */
const loginRateLimit = (options = {}) => {
  const {
    maxAttempts = 5,           // Số lần thử tối đa
    windowMs = 15 * 60 * 1000, // Window time: 15 minutes
    skipSuccessfulRequests = true, // Bỏ qua request thành công
    message = 'Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau {resetTime}'
  } = options;

  return async (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
    
    // Kiểm tra rate limit
    const rateLimitStatus = isRateLimited(ip, maxAttempts);
    
    if (rateLimitStatus.isLimited) {
      // Log unauthorized access attempt
      saveActivityLog(null, ACTIONS.UNAUTHORIZED_ACCESS, ip, req.get('User-Agent'), {
        reason: 'RATE_LIMITED',
        attempts: rateLimitStatus.attempts,
        resetTime: rateLimitStatus.resetTime,
        url: req.originalUrl
      });

      console.log(`🚫 Rate limited: IP ${ip} exceeded ${maxAttempts} login attempts`);
      
      return res.status(429).json({
        message: message.replace('{resetTime}', rateLimitStatus.resetTime?.toLocaleTimeString('vi-VN')),
        error: 'RATE_LIMITED',
        details: {
          attempts: rateLimitStatus.attempts,
          maxAttempts: maxAttempts,
          resetTime: rateLimitStatus.resetTime,
          retryAfter: Math.ceil((rateLimitStatus.resetTime - new Date()) / 1000) // seconds
        }
      });
    }

    // Track attempt nếu không bị rate limit
    const attemptCount = trackLoginAttempt(ip);
    
    console.log(`🔍 Login attempt ${attemptCount}/${maxAttempts} from IP: ${ip}`);

    // Lưu original res.json để intercept response
    const originalJson = res.json;
    
    res.json = function(data) {
      // Nếu login thành công, reset attempts
      if (res.statusCode >= 200 && res.statusCode < 300 && !data.error) {
        resetLoginAttempts(ip);
        console.log(`✅ Login successful, reset attempts for IP: ${ip}`);
      }
      
      // Set rate limit headers
      res.set({
        'X-RateLimit-Limit': maxAttempts,
        'X-RateLimit-Remaining': Math.max(0, maxAttempts - attemptCount),
        'X-RateLimit-Reset': new Date(Date.now() + windowMs).toISOString()
      });

      return originalJson.call(this, data);
    };

    next();
  };
};

/**
 * General rate limiting middleware
 * @param {Object} options - Cấu hình
 */
const generalRateLimit = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100,                 // Số request tối đa
    message = 'Quá nhiều requests từ IP này'
  } = options;

  const requests = new Map();

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    
    // Clean up old records
    for (const [key, data] of requests.entries()) {
      if (now - data.resetTime > windowMs) {
        requests.delete(key);
      }
    }

    // Get or create record for this IP
    let record = requests.get(ip);
    if (!record) {
      record = {
        count: 0,
        resetTime: now
      };
    }

    // Reset if window expired
    if (now - record.resetTime > windowMs) {
      record.count = 0;
      record.resetTime = now;
    }

    record.count++;
    requests.set(ip, record);

    // Set headers
    res.set({
      'X-RateLimit-Limit': max,
      'X-RateLimit-Remaining': Math.max(0, max - record.count),
      'X-RateLimit-Reset': new Date(record.resetTime + windowMs).toISOString()
    });

    // Check if limit exceeded
    if (record.count > max) {
      saveActivityLog(null, ACTIONS.UNAUTHORIZED_ACCESS, ip, req.get('User-Agent'), {
        reason: 'GENERAL_RATE_LIMITED',
        requests: record.count,
        limit: max,
        url: req.originalUrl
      });

      return res.status(429).json({
        message: message,
        error: 'RATE_LIMITED',
        details: {
          limit: max,
          current: record.count,
          resetTime: new Date(record.resetTime + windowMs)
        }
      });
    }

    next();
  };
};

module.exports = {
  loginRateLimit,
  generalRateLimit
};