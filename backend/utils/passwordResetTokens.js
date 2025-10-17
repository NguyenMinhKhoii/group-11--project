const crypto = require('crypto');

// In-memory storage for password reset tokens (trong thực tế sẽ dùng database)
let passwordResetTokens = new Map();

/**
 * Sinh reset token cho user
 * @param {number} userId - ID của user
 * @param {string} email - Email của user
 * @returns {string} - Reset token
 */
const generateResetToken = (userId, email) => {
  // Tạo token random
  const token = crypto.randomBytes(32).toString('hex');
  
  // Lưu token với thông tin user và thời gian hết hạn (15 phút)
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  
  passwordResetTokens.set(token, {
    userId: userId,
    email: email,
    expiresAt: expiresAt,
    used: false,
    createdAt: new Date()
  });
  
  console.log(`🔑 Generated reset token for user ${userId} (${email})`);
  console.log(`⏰ Token expires at: ${expiresAt.toISOString()}`);
  
  return token;
};

/**
 * Verify reset token
 * @param {string} token - Reset token để verify
 * @returns {Object|null} - Thông tin token nếu hợp lệ, null nếu không
 */
const verifyResetToken = (token) => {
  const tokenData = passwordResetTokens.get(token);
  
  if (!tokenData) {
    console.log('❌ Token not found');
    return null;
  }
  
  if (tokenData.used) {
    console.log('❌ Token already used');
    return null;
  }
  
  if (new Date() > tokenData.expiresAt) {
    console.log('❌ Token expired');
    // Xóa token đã hết hạn
    passwordResetTokens.delete(token);
    return null;
  }
  
  console.log(`✅ Token valid for user ${tokenData.userId}`);
  return tokenData;
};

/**
 * Mark token as used
 * @param {string} token - Token to mark as used
 */
const markTokenAsUsed = (token) => {
  const tokenData = passwordResetTokens.get(token);
  if (tokenData) {
    tokenData.used = true;
    passwordResetTokens.set(token, tokenData);
    console.log(`✅ Token marked as used: ${token}`);
  }
};

/**
 * Clean up expired tokens (chạy định kỳ)
 */
const cleanupExpiredTokens = () => {
  const now = new Date();
  let cleanedCount = 0;
  
  for (const [token, tokenData] of passwordResetTokens.entries()) {
    if (now > tokenData.expiresAt || tokenData.used) {
      passwordResetTokens.delete(token);
      cleanedCount++;
    }
  }
  
  if (cleanedCount > 0) {
    console.log(`🧹 Cleaned up ${cleanedCount} expired/used tokens`);
  }
};

/**
 * Get all active tokens (for debugging)
 */
const getActiveTokens = () => {
  const active = [];
  const now = new Date();
  
  for (const [token, tokenData] of passwordResetTokens.entries()) {
    if (!tokenData.used && now <= tokenData.expiresAt) {
      active.push({
        token: token.substring(0, 8) + '...', // Hide full token
        userId: tokenData.userId,
        email: tokenData.email,
        expiresIn: Math.ceil((tokenData.expiresAt - now) / (1000 * 60)) // minutes
      });
    }
  }
  
  return active;
};

// Cleanup expired tokens mỗi 5 phút
setInterval(cleanupExpiredTokens, 5 * 60 * 1000);

module.exports = {
  generateResetToken,
  verifyResetToken,
  markTokenAsUsed,
  cleanupExpiredTokens,
  getActiveTokens
};