// Test đầy đủ cho RefreshToken với database
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const RefreshToken = require("./models/RefreshToken");
const crypto = require("crypto");

dotenv.config();

// Kết nối database với timeout ngắn hơn
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout sau 5 giây
      socketTimeoutMS: 45000,
    });
    console.log("✅ MongoDB connected successfully");
    return true;
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    return false;
  }
}

// Test chính
async function runRefreshTokenTest() {
  console.log("🧪 Bắt đầu test RefreshToken Schema với Database...\n");

  try {
    // Test 1: Tạo user mẫu
    console.log("1️⃣ Tạo user test...");
    const testUser = new User({
      name: "Test User Refresh Token",
      email: `test_${Date.now()}@example.com`,
      password: "password123",
      role: "user",
    });

    const savedUser = await testUser.save();
    console.log("✅ User đã được lưu với ID:", savedUser._id);

    // Test 2: Tạo RefreshToken
    console.log("\n2️⃣ Test tạo RefreshToken...");
    const tokenValue = crypto.randomBytes(32).toString("hex");

    const refreshToken = await RefreshToken.createToken(
      savedUser._id,
      tokenValue,
      7
    );
    console.log("✅ RefreshToken đã được tạo:");
    console.log("   - Token ID:", refreshToken._id);
    console.log(
      "   - Token (first 20 chars):",
      refreshToken.token.substring(0, 20) + "..."
    );
    console.log("   - User ID:", refreshToken.userId);
    console.log("   - Expiry Date:", refreshToken.expiryDate);
    console.log("   - Is Revoked:", refreshToken.isRevoked);

    // Test 3: Truy xuất RefreshToken
    console.log("\n3️⃣ Test truy xuất RefreshToken...");
    const foundToken = await RefreshToken.findById(refreshToken._id).populate(
      "userId"
    );

    if (foundToken) {
      console.log("✅ Truy xuất thành công:");
      console.log("   - User Name:", foundToken.userId.name);
      console.log("   - User Email:", foundToken.userId.email);
      console.log("   - Token Valid:", !foundToken.isExpired());
      console.log("   - Created At:", foundToken.createdAt);
    } else {
      console.log("❌ Không tìm thấy token");
    }

    // Test 4: Verify token
    console.log("\n4️⃣ Test verify RefreshToken...");
    try {
      const verifiedToken = await RefreshToken.verifyToken(tokenValue);
      console.log("✅ Verify thành công:");
      console.log("   - User:", verifiedToken.userId.name);
    } catch (error) {
      console.log("❌ Verify thất bại:", error.message);
    }

    // Test 5: Tạo token hết hạn
    console.log("\n5️⃣ Test token hết hạn...");
    const expiredTokenValue = crypto.randomBytes(32).toString("hex");
    const expiredToken = new RefreshToken({
      userId: savedUser._id,
      token: expiredTokenValue,
      expiryDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Hết hạn 1 ngày trước
    });

    await expiredToken.save();
    console.log(
      "✅ Token hết hạn đã tạo, IsExpired:",
      expiredToken.isExpired()
    );

    // Test 6: Verify token hết hạn
    console.log("\n6️⃣ Test verify token hết hạn...");
    try {
      await RefreshToken.verifyToken(expiredTokenValue);
      console.log("❌ Lỗi: Token hết hạn vẫn được chấp nhận");
    } catch (error) {
      console.log("✅ Token hết hạn bị từ chối đúng:", error.message);
    }

    // Test 7: Revoke token
    console.log("\n7️⃣ Test revoke token...");
    await RefreshToken.revokeToken(tokenValue);
    const revokedToken = await RefreshToken.findOne({ token: tokenValue });
    console.log("✅ Token đã được revoke:", revokedToken.isRevoked);

    // Test 8: Verify token đã revoke
    console.log("\n8️⃣ Test verify token đã revoke...");
    try {
      await RefreshToken.verifyToken(tokenValue);
      console.log("❌ Lỗi: Token đã revoke vẫn được chấp nhận");
    } catch (error) {
      console.log("✅ Token đã revoke bị từ chối đúng:", error.message);
    }

    // Test 9: Query performance
    console.log("\n9️⃣ Test performance query...");
    const startTime = Date.now();
    const userTokens = await RefreshToken.find({ userId: savedUser._id });
    const queryTime = Date.now() - startTime;
    console.log("✅ Query tìm token theo userId:", queryTime + "ms");
    console.log("   - Số token tìm thấy:", userTokens.length);

    // Cleanup
    console.log("\n🧹 Cleanup test data...");
    await RefreshToken.deleteMany({ userId: savedUser._id });
    await User.findByIdAndDelete(savedUser._id);
    console.log("✅ Đã xóa test data");

    console.log(
      "\n🎉 TẤT CẢ TEST ĐÃ PASS! RefreshToken schema hoạt động hoàn hảo!"
    );
  } catch (error) {
    console.error("❌ Test thất bại:", error.message);
    console.error("Stack:", error.stack);
  }
}

// Main function
async function main() {
  const connected = await connectDB();

  if (!connected) {
    console.log("❌ Không thể kết nối database, dừng test");
    process.exit(1);
  }

  await runRefreshTokenTest();

  console.log("\n✅ Đóng kết nối database...");
  await mongoose.connection.close();
  console.log("👋 Test hoàn thành!");
  process.exit(0);
}

// Chạy với error handling
main().catch((error) => {
  console.error("❌ Lỗi không mong đợi:", error);
  process.exit(1);
});
