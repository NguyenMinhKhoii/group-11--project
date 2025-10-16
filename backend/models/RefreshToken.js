// models/RefreshToken.js
const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true, // Đảm bảo token là duy nhất
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isRevoked: {
    type: Boolean,
    default: false, // Để track token đã bị revoke hay chưa
  },
});

// Thêm index để tối ưu hóa query
refreshTokenSchema.index({ userId: 1 });
refreshTokenSchema.index({ expiryDate: 1 });

// Thêm method để kiểm tra token có hết hạn không
refreshTokenSchema.methods.isExpired = function () {
  return Date.now() >= this.expiryDate.getTime();
};

// Thêm static method để tạo refresh token
refreshTokenSchema.statics.createToken = async function (
  userId,
  tokenValue,
  expiryDays = 7
) {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + expiryDays);

  const refreshToken = new this({
    userId,
    token: tokenValue,
    expiryDate,
  });

  return await refreshToken.save();
};

// Thêm static method để tìm và verify token
refreshTokenSchema.statics.verifyToken = async function (token) {
  const refreshToken = await this.findOne({
    token,
    isRevoked: false,
  }).populate("userId");

  if (!refreshToken) {
    throw new Error("Refresh token không tồn tại hoặc đã bị revoke");
  }

  if (refreshToken.isExpired()) {
    throw new Error("Refresh token đã hết hạn");
  }

  return refreshToken;
};

// Thêm static method để revoke token
refreshTokenSchema.statics.revokeToken = async function (token) {
  return await this.findOneAndUpdate(
    { token },
    { isRevoked: true },
    { new: true }
  );
};

// Thêm static method để revoke tất cả token của user
refreshTokenSchema.statics.revokeAllUserTokens = async function (userId) {
  return await this.updateMany({ userId }, { isRevoked: true });
};

module.exports = mongoose.model("RefreshToken", refreshTokenSchema);
