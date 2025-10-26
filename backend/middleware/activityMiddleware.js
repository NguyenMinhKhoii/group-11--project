const { saveActivityLog, ACTIONS } = require('../utils/activityLogger');

/**
 * Middleware để log activity của user
 * @param {string} action - Action thực hiện
 * @param {boolean} logBeforeAuth - Có log trước khi authenticate không
 */
const logActivity = (action, logBeforeAuth = false) => {
  return (req, res, next) => {
    // Lấy thông tin từ request
    const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent');
    
    // Nếu cần log trước auth, thực hiện ngay
    if (logBeforeAuth) {
      saveActivityLog(null, action, ip, userAgent, {
        url: req.originalUrl,
        method: req.method,
        body: req.method === 'POST' ? JSON.stringify(req.body) : undefined
      });
    }

    // Lưu original res.json để intercept response
    const originalJson = res.json;
    
    res.json = function(data) {
      // Xác định user ID từ request (có thể từ token hoặc body)
      let userId = null;
      
      // Thử lấy user ID từ req.user (sau authenticate)
      if (req.user && req.user.id) {
        userId = req.user.id;
      }
      // Hoặc từ response data nếu là login thành công
      else if (data && data.user && data.user.id) {
        userId = data.user.id;
      }
      // Hoặc từ body nếu có email (cho login attempts)
      else if (req.body && req.body.email) {
        // Tìm user ID từ email trong test users
        const TEST_USERS = require('../routes/authRoutes').TEST_USERS || [];
        const user = TEST_USERS.find(u => u.email === req.body.email);
        if (user) {
          userId = user.id;
        }
      }

      // Xác định success từ status code và response
      const isSuccess = res.statusCode >= 200 && res.statusCode < 300 && !data.error;
      
      // Log activity nếu chưa log hoặc có thông tin user
      if (!logBeforeAuth || userId) {
        const metadata = {
          success: isSuccess,
          statusCode: res.statusCode,
          url: req.originalUrl,
          method: req.method,
          responseTime: Date.now() - req.startTime
        };

        // Thêm error message nếu có
        if (!isSuccess && data.message) {
          metadata.error = data.message;
        }

        // Thêm thông tin đặc biệt cho một số actions
        if (action === ACTIONS.LOGIN_ATTEMPT) {
          metadata.email = req.body.email;
          if (isSuccess) {
            // Nếu login thành công, log thêm LOGIN_SUCCESS
            setTimeout(() => {
              saveActivityLog(userId, ACTIONS.LOGIN_SUCCESS, ip, userAgent, {
                email: req.body.email,
                success: true
              });
            }, 0);
          } else {
            // Nếu login thất bại, log LOGIN_FAILED
            setTimeout(() => {
              saveActivityLog(userId, ACTIONS.LOGIN_FAILED, ip, userAgent, {
                email: req.body.email,
                success: false,
                error: data.message
              });
            }, 0);
          }
        }

        saveActivityLog(userId, action, ip, userAgent, metadata);
      }

      // Gọi original json method
      return originalJson.call(this, data);
    };

    // Lưu start time để tính response time
    req.startTime = Date.now();
    
    next();
  };
};

/**
 * Middleware để log API access tự động
 */
const autoLogActivity = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent');
  
  // Xác định action dựa trên route
  let action = ACTIONS.API_ACCESS;
  
  if (req.path.includes('/login')) {
    action = ACTIONS.LOGIN_ATTEMPT;
  } else if (req.path.includes('/logout')) {
    action = ACTIONS.LOGOUT;
  } else if (req.path.includes('/forgot-password')) {
    action = ACTIONS.PASSWORD_RESET_REQUEST;
  } else if (req.path.includes('/reset-password')) {
    action = ACTIONS.PASSWORD_RESET_SUCCESS;
  } else if (req.path.includes('/profile')) {
    action = ACTIONS.PROFILE_UPDATE;
  }

  // Apply logging middleware
  return logActivity(action, true)(req, res, next);
};

module.exports = {
  logActivity,
  autoLogActivity,
  ACTIONS
};