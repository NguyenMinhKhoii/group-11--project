// Activity Log Storage - In-memory database (trong thực tế sẽ dùng MongoDB)
let activityLogs = [];
let loginAttempts = new Map(); // Track login attempts per IP

/**
 * Lưu activity log
 * @param {number} userId - ID của user (null nếu không xác định được)
 * @param {string} action - Hành động thực hiện
 * @param {string} ip - IP address
 * @param {string} userAgent - User agent browser
 * @param {Object} metadata - Thông tin thêm
 */
const saveActivityLog = (userId, action, ip, userAgent = null, metadata = {}) => {
  const log = {
    id: Date.now() + Math.random(), // Simple ID generation
    userId: userId,
    action: action,
    timestamp: new Date(),
    ip: ip,
    userAgent: userAgent,
    metadata: metadata,
    success: metadata.success !== false // Default true unless explicitly false
  };

  activityLogs.push(log);
  
  // Keep only last 1000 logs để tránh memory overflow
  if (activityLogs.length > 1000) {
    activityLogs.shift();
  }

  console.log(`📝 Activity Log: ${action} by user ${userId || 'anonymous'} from ${ip}`);
  return log;
};

/**
 * Lấy logs của một user
 * @param {number} userId - ID của user
 * @param {number} limit - Số lượng logs tối đa
 */
const getUserLogs = (userId, limit = 50) => {
  return activityLogs
    .filter(log => log.userId === userId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, limit);
};

/**
 * Lấy tất cả logs (cho admin)
 * @param {number} limit - Số lượng logs tối đa
 */
const getAllLogs = (limit = 100) => {
  return activityLogs
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, limit);
};

/**
 * Lấy logs theo action
 * @param {string} action - Action cần tìm
 * @param {number} limit - Số lượng logs tối đa
 */
const getLogsByAction = (action, limit = 50) => {
  return activityLogs
    .filter(log => log.action === action)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, limit);
};

/**
 * Track login attempts cho rate limiting
 * @param {string} ip - IP address
 */
const trackLoginAttempt = (ip) => {
  const now = Date.now();
  const windowTime = 15 * 60 * 1000; // 15 minutes window
  
  if (!loginAttempts.has(ip)) {
    loginAttempts.set(ip, []);
  }
  
  let attempts = loginAttempts.get(ip);
  
  // Remove attempts older than window time
  attempts = attempts.filter(attemptTime => now - attemptTime < windowTime);
  
  // Add current attempt
  attempts.push(now);
  
  loginAttempts.set(ip, attempts);
  
  return attempts.length;
};

/**
 * Kiểm tra xem IP có bị rate limit không
 * @param {string} ip - IP address
 * @param {number} maxAttempts - Số lần thử tối đa (default: 5)
 */
const isRateLimited = (ip, maxAttempts = 5) => {
  const now = Date.now();
  const windowTime = 15 * 60 * 1000; // 15 minutes window
  
  if (!loginAttempts.has(ip)) {
    return { isLimited: false, attempts: 0, resetTime: null };
  }
  
  let attempts = loginAttempts.get(ip);
  
  // Remove attempts older than window time
  attempts = attempts.filter(attemptTime => now - attemptTime < windowTime);
  loginAttempts.set(ip, attempts);
  
  const isLimited = attempts.length >= maxAttempts;
  const resetTime = isLimited ? new Date(Math.max(...attempts) + windowTime) : null;
  
  return {
    isLimited: isLimited,
    attempts: attempts.length,
    resetTime: resetTime,
    remaining: Math.max(0, maxAttempts - attempts.length)
  };
};

/**
 * Reset login attempts cho một IP (sau khi login thành công)
 * @param {string} ip - IP address
 */
const resetLoginAttempts = (ip) => {
  loginAttempts.delete(ip);
  console.log(`🔓 Reset login attempts for IP: ${ip}`);
};

/**
 * Statistics functions
 */
const getActivityStats = () => {
  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  const recentLogs = activityLogs.filter(log => new Date(log.timestamp) >= last24h);
  
  const stats = {
    totalLogs: activityLogs.length,
    last24h: recentLogs.length,
    uniqueUsers: new Set(activityLogs.filter(log => log.userId).map(log => log.userId)).size,
    topActions: {},
    failedLogins: activityLogs.filter(log => log.action === 'LOGIN_ATTEMPT' && !log.success).length,
    successfulLogins: activityLogs.filter(log => log.action === 'LOGIN_SUCCESS').length
  };
  
  // Count actions
  recentLogs.forEach(log => {
    stats.topActions[log.action] = (stats.topActions[log.action] || 0) + 1;
  });
  
  return stats;
};

module.exports = {
  saveActivityLog,
  getUserLogs,
  getAllLogs,
  getLogsByAction,
  trackLoginAttempt,
  isRateLimited,
  resetLoginAttempts,
  getActivityStats,
  
  // Action constants
  ACTIONS: {
    LOGIN_ATTEMPT: 'LOGIN_ATTEMPT',
    LOGIN_SUCCESS: 'LOGIN_SUCCESS',
    LOGIN_FAILED: 'LOGIN_FAILED',
    LOGOUT: 'LOGOUT',
    PASSWORD_RESET_REQUEST: 'PASSWORD_RESET_REQUEST',
    PASSWORD_RESET_SUCCESS: 'PASSWORD_RESET_SUCCESS',
    PROFILE_UPDATE: 'PROFILE_UPDATE',
    API_ACCESS: 'API_ACCESS',
    UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS'
  }
};