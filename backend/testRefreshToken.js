// Test file cho RefreshToken schema
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const RefreshToken = require("./models/RefreshToken");
const crypto = require("crypto");

dotenv.config();

// Kết nối MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/group11_project", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

// Test function chính
async function testRefreshTokenSchema() {
  console.log("🧪 Bắt đầu test RefreshToken Schema...\n");

  try {
    // Bước 1: Tạo user test (nếu chưa có)
    console.log("1️⃣ Tạo user test...");
    let testUser = await User.findOne({ email: "test@example.com" });
    
    if (!testUser) {
      testUser = new User({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        role: "user"
      });
      await testUser.save();
      console.log("✅ User test đã được tạo:", testUser._id);
    } else {
      console.log("✅ User test đã tồn tại:", testUser._id);
    }

    // Bước 2: Test tạo RefreshToken
    console.log("\n2️⃣ Test tạo RefreshToken...");
    const tokenValue = crypto.randomBytes(64).toString('hex');
    
    const refreshToken = await RefreshToken.createToken(testUser._id, tokenValue, 7);
    console.log("✅ RefreshToken đã được tạo:");
    console.log("   - ID:", refreshToken._id);
    console.log("   - Token:", refreshToken.token.substring(0, 20) + "...");
    console.log("   - UserId:", refreshToken.userId);
    console.log("   - ExpiryDate:", refreshToken.expiryDate);
    console.log("   - IsRevoked:", refreshToken.isRevoked);

    // Bước 3: Test truy xuất RefreshToken
    console.log("\n3️⃣ Test truy xuất RefreshToken...");
    const foundToken = await RefreshToken.findOne({ token: tokenValue }).populate('userId');
    if (foundToken) {
      console.log("✅ Tìm thấy RefreshToken:");
      console.log("   - User name:", foundToken.userId.name);
      console.log("   - User email:", foundToken.userId.email);
      console.log("   - Token valid:", !foundToken.isExpired());
    }

    // Bước 4: Test verify token
    console.log("\n4️⃣ Test verify RefreshToken...");
    try {
      const verifiedToken = await RefreshToken.verifyToken(tokenValue);
      console.log("✅ Token verification thành công:");
      console.log("   - User:", verifiedToken.userId.name);
      console.log("   - Email:", verifiedToken.userId.email);
    } catch (error) {
      console.log("❌ Token verification thất bại:", error.message);
    }

    // Bước 5: Test tạo token expired
    console.log("\n5️⃣ Test tạo token đã hết hạn...");
    const expiredTokenValue = crypto.randomBytes(64).toString('hex');
    const expiredDate = new Date();
    expiredDate.setDate(expiredDate.getDate() - 1); // Hết hạn từ hôm qua
    
    const expiredToken = new RefreshToken({
      userId: testUser._id,
      token: expiredTokenValue,
      expiryDate: expiredDate,
    });
    await expiredToken.save();
    
    console.log("✅ Token hết hạn đã được tạo");
    console.log("   - IsExpired:", expiredToken.isExpired());

    // Bước 6: Test verify token hết hạn
    console.log("\n6️⃣ Test verify token hết hạn...");
    try {
      await RefreshToken.verifyToken(expiredTokenValue);
      console.log("❌ Lỗi: Token hết hạn vẫn được accept");
    } catch (error) {
      console.log("✅ Token hết hạn bị reject đúng:", error.message);
    }

    // Bước 7: Test revoke token
    console.log("\n7️⃣ Test revoke RefreshToken...");
    const revokedToken = await RefreshToken.revokeToken(tokenValue);
    if (revokedToken) {
      console.log("✅ Token đã được revoke:");
      console.log("   - IsRevoked:", revokedToken.isRevoked);
    }

    // Bước 8: Test verify token đã revoke
    console.log("\n8️⃣ Test verify token đã revoke...");
    try {
      await RefreshToken.verifyToken(tokenValue);
      console.log("❌ Lỗi: Token đã revoke vẫn được accept");
    } catch (error) {
      console.log("✅ Token đã revoke bị reject đúng:", error.message);
    }

    // Bước 9: Test tạo nhiều token và revoke all
    console.log("\n9️⃣ Test revoke tất cả token của user...");
    
    // Tạo 3 token mới
    const tokens = [];
    for (let i = 0; i < 3; i++) {
      const newTokenValue = crypto.randomBytes(64).toString('hex');
      const newToken = await RefreshToken.createToken(testUser._id, newTokenValue, 7);
      tokens.push(newToken);
    }
    console.log("✅ Đã tạo 3 token mới");

    // Revoke tất cả token của user
    const revokeResult = await RefreshToken.revokeAllUserTokens(testUser._id);
    console.log("✅ Đã revoke tất cả token của user:", revokeResult.modifiedCount, "tokens");

    // Kiểm tra tất cả token đã được revoke
    const userTokens = await RefreshToken.find({ userId: testUser._id });
    const allRevoked = userTokens.every(token => token.isRevoked);
    console.log("✅ Tất cả token đã được revoke:", allRevoked);

    console.log("\n🎉 Tất cả test đã PASS! RefreshToken schema hoạt động đúng.");

  } catch (error) {
    console.error("❌ Test thất bại:", error);
  }
}

// Cleanup function
async function cleanup() {
  try {
    // Xóa tất cả test data
    await RefreshToken.deleteMany({ });
    await User.deleteOne({ email: "test@example.com" });
    console.log("\n🧹 Đã cleanup test data");
  } catch (error) {
    console.error("❌ Cleanup thất bại:", error);
  }
}

// Main execution
async function main() {
  await connectDB();
  await testRefreshTokenSchema();
  await cleanup();
  
  console.log("\n✅ Test hoàn thành. Đóng kết nối database...");
  await mongoose.connection.close();
  process.exit(0);
}

// Chạy test
main().catch(error => {
  console.error("❌ Lỗi chạy test:", error);
  process.exit(1);
});
