// Activity Logging Middleware
const ACTIONS = {
  LOGIN: 'login',
  REGISTER: 'register',
  LOGOUT: 'logout',
  UPDATE_PROFILE: 'update_profile',
  CHANGE_PASSWORD: 'change_password',
  ACCESS_ADMIN: 'access_admin',
  ACCESS_MODERATOR: 'access_moderator'
};

// Simple in-memory activity log (trong thực tế nên lưu vào database)
let activityLog = [];

const logActivity = (action, details = {}) => {
  return (req, res, next) => {
    try {
      const activityEntry = {
        timestamp: new Date().toISOString(),
        action,
        userId: req.user?.id || null,
        userEmail: req.user?.email || null,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        details: {
          ...details,
          path: req.path,
          method: req.method
        }
      };

      activityLog.push(activityEntry);
      
      // Giới hạn log size (giữ 1000 entries cuối)
      if (activityLog.length > 1000) {
        activityLog = activityLog.slice(-1000);
      }

      console.log(`[ACTIVITY] ${action}:`, activityEntry);
      next();
    } catch (error) {
      console.error('Activity logging error:', error);
      next(); // Tiếp tục dù có lỗi log
    }
  };
};

const getActivityLog = () => {
  return activityLog.slice(-50); // Trả về 50 entries cuối
};

module.exports = {
  logActivity,
  getActivityLog,
  ACTIONS
};