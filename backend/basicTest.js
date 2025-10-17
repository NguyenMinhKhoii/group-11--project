// Test cơ bản cho RefreshToken
const mongoose = require("mongoose");
const RefreshToken = require("./models/RefreshToken");

console.log("🔍 Testing RefreshToken model...");
console.log("✅ RefreshToken model loaded successfully");
console.log("📋 Schema fields:", Object.keys(RefreshToken.schema.paths));
console.log(
  "🎯 Schema methods:",
  Object.getOwnPropertyNames(RefreshToken.schema.methods)
);
console.log(
  "📊 Static methods:",
  Object.getOwnPropertyNames(RefreshToken.schema.statics)
);

// Test tạo schema object
const testTokenData = {
  userId: new mongoose.Types.ObjectId(),
  token: "test-token-123",
  expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  isRevoked: false,
};

const testToken = new RefreshToken(testTokenData);
console.log("✅ RefreshToken instance created:", testToken.token);
console.log("📅 Expiry date:", testToken.expiryDate);
console.log("🔒 Is expired?", testToken.isExpired());

console.log("\n🎉 RefreshToken schema test completed successfully!");
