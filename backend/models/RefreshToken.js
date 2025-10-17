// RefreshToken model for storing refresh tokens (giả lập DB)
const crypto = require('crypto');

class RefreshToken {
  constructor(userId, token = null, expiresAt = null) {
    this.id = RefreshTokens.length + 1;
    this.userId = userId;
    this.token = token || crypto.randomBytes(64).toString('hex');
    this.expiresAt = expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    this.revoked = false;
    this.createdAt = new Date();
  }

  // Kiểm tra token có hết hạn không
  isExpired() {
    return new Date() > this.expiresAt;
  }

  // Thu hồi token
  revoke() {
    this.revoked = true;
  }
}

// Mảng lưu refresh tokens (giả lập DB)
const RefreshTokens = [];

// Helper functions
const RefreshTokenService = {
  // Tạo refresh token mới
  create: (userId) => {
    const refreshToken = new RefreshToken(userId);
    RefreshTokens.push(refreshToken);
    return refreshToken;
  },

  // Tìm refresh token theo token string
  findByToken: (token) => {
    return RefreshTokens.find(rt => rt.token === token && !rt.revoked && !rt.isExpired());
  },

  // Tìm refresh token theo userId
  findByUserId: (userId) => {
    return RefreshTokens.filter(rt => rt.userId === userId && !rt.revoked && !rt.isExpired());
  },

  // Thu hồi tất cả refresh token của user
  revokeAllByUserId: (userId) => {
    RefreshTokens.forEach(rt => {
      if (rt.userId === userId) {
        rt.revoke();
      }
    });
  },

  // Thu hồi refresh token cụ thể
  revokeByToken: (token) => {
    const refreshToken = RefreshTokens.find(rt => rt.token === token);
    if (refreshToken) {
      refreshToken.revoke();
      return true;
    }
    return false;
  },

  // Xóa token hết hạn (cleanup)
  cleanupExpired: () => {
    const validTokens = RefreshTokens.filter(rt => !rt.isExpired());
    RefreshTokens.length = 0;
    RefreshTokens.push(...validTokens);
  }
};

module.exports = { RefreshToken, RefreshTokenService, RefreshTokens };