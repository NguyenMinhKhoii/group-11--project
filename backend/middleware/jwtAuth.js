const jwt = require('jsonwebtoken');
const User = require('../models/UserMongoDB');

/**
 * JWT Authentication Middleware
 * SV1: Middleware xác thực JWT cho bảo mật upload avatar
 */
const authenticateJWT = async (req, res, next) => {
  try {
    let token;

    // Extract token from different sources
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Bearer token in Authorization header
      token = req.headers.authorization.split(' ')[1];
    } else if (req.headers['x-access-token']) {
      // Custom header
      token = req.headers['x-access-token'];
    } else if (req.query.token) {
      // Query parameter (less secure, for testing only)
      token = req.query.token;
    } else if (req.body.token) {
      // Body parameter (for form data)
      token = req.body.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
        code: 'NO_TOKEN'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user in database
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. User not found.',
        code: 'USER_NOT_FOUND'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated.',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to too many failed login attempts.',
        code: 'ACCOUNT_LOCKED'
      });
    }

    // Attach user to request object
    req.user = user;
    next();

  } catch (error) {
    console.error('🔐 JWT Authentication Error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Token expired.',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token.',
        code: 'INVALID_TOKEN'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.',
      code: 'AUTH_ERROR'
    });
  }
};

/**
 * Optional JWT Authentication (doesn't fail if no token)
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.isActive && !user.isLocked) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

/**
 * Role-based Authorization Middleware
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
        code: 'AUTH_REQUIRED'
      });
    }

    const userRoles = Array.isArray(req.user.role) ? req.user.role : [req.user.role];
    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    
    const hasPermission = requiredRoles.some(role => userRoles.includes(role));

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions.',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: requiredRoles,
        current: userRoles
      });
    }

    next();
  };
};

/**
 * Generate JWT Token
 */
const generateToken = (payload, options = {}) => {
  const defaultOptions = {
    expiresIn: '24h',
    issuer: 'group11-rbac-system',
    audience: 'group11-users'
  };

  return jwt.sign(payload, process.env.JWT_SECRET, { ...defaultOptions, ...options });
};

/**
 * Generate Refresh Token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

/**
 * Verify Refresh Token
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET);
};

module.exports = {
  authenticateJWT,
  optionalAuth,
  requireRole,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken
};