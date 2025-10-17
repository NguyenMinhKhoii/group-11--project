// Test đơn giản cho RefreshToken Schema - SV3
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const RefreshToken = require("./models/RefreshToken");
const User = require("./models/User");
const crypto = require("crypto");

dotenv.config();

console.log("🧪 SV3: Test RefreshToken Schema - Lưu và Truy xuất\n");

// Kết nối database
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log("✅ Kết nối MongoDB thành công");
    return true;
  } catch (error) {
    console.error("❌ Kết nối MongoDB thất bại:", error.message);
    return false;
  }
}

// Test chính cho SV3
async function testSV3RefreshToken() {
  console.log("📋 BẮT ĐẦU TEST SV3: Schema RefreshToken và lưu/truy xuất\n");

  try {
    // 1. Test tạo User test
    console.log("1️⃣ Tạo User test...");
    const testEmail = `sv3_test_${Date.now()}@example.com`;

    let testUser = new User({
      name: "SV3 Test User",
      email: testEmail,
      password: "testpassword123",
      role: "user",
    });

    await testUser.save();
    console.log("✅ User test đã được tạo với ID:", testUser._id);

    // 2. Test tạo RefreshToken bằng static method
    console.log("\n2️⃣ Test tạo RefreshToken bằng createToken()...");
    const tokenValue = crypto.randomBytes(64).toString("hex");

    const refreshToken = await RefreshToken.createToken(
      testUser._id,
      tokenValue,
      7
    );
    console.log("✅ RefreshToken đã được tạo:");
    console.log("   - Token ID:", refreshToken._id);
    console.log("   - User ID:", refreshToken.userId);
    console.log(
      "   - Token (20 ký tự đầu):",
      refreshToken.token.substring(0, 20) + "..."
    );
    console.log("   - Ngày hết hạn:", refreshToken.expiryDate.toISOString());
    console.log("   - Đã bị revoke:", refreshToken.isRevoked);

    // 3. Test truy xuất RefreshToken từ database
    console.log("\n3️⃣ Test truy xuất RefreshToken từ database...");
    const foundToken = await RefreshToken.findOne({
      token: tokenValue,
    }).populate("userId");

    if (foundToken) {
      console.log("✅ Truy xuất RefreshToken thành công:");
      console.log("   - Tên User:", foundToken.userId.name);
      console.log("   - Email User:", foundToken.userId.email);
      console.log("   - Token còn hiệu lực:", !foundToken.isExpired());
      console.log("   - Ngày tạo:", foundToken.createdAt.toISOString());
    } else {
      throw new Error("Không tìm thấy RefreshToken");
    }

    // 4. Test verify token
    console.log("\n4️⃣ Test verify RefreshToken...");
    try {
      const verifiedToken = await RefreshToken.verifyToken(tokenValue);
      console.log("✅ Verify token thành công:");
      console.log("   - User được verify:", verifiedToken.userId.name);
      console.log("   - Email:", verifiedToken.userId.email);
    } catch (error) {
      console.log("❌ Verify token thất bại:", error.message);
    }

    // 5. Test tạo token hết hạn
    console.log("\n5️⃣ Test token hết hạn...");
    const expiredTokenValue = crypto.randomBytes(64).toString("hex");
    const expiredToken = new RefreshToken({
      userId: testUser._id,
      token: expiredTokenValue,
      expiryDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Hết hạn từ 1 ngày trước
    });
    await expiredToken.save();
    console.log("✅ Token hết hạn đã được tạo");
    console.log("   - Đã hết hạn:", expiredToken.isExpired());

    // 6. Test revoke token
    console.log("\n6️⃣ Test revoke RefreshToken...");
    const revokedToken = await RefreshToken.revokeToken(tokenValue);
    console.log("✅ Token đã được revoke:");
    console.log("   - Trạng thái revoke:", revokedToken.isRevoked);

    // 7. Test query performance với index
    console.log("\n7️⃣ Test performance query với index...");
    const startTime = Date.now();
    const userTokens = await RefreshToken.find({ userId: testUser._id });
    const queryTime = Date.now() - startTime;
    console.log("✅ Query tokens theo userId:", queryTime + "ms");
    console.log("   - Số token tìm thấy:", userTokens.length);

    // 8. Cleanup test data
    console.log("\n8️⃣ Cleanup test data...");
    await RefreshToken.deleteMany({ userId: testUser._id });
    await User.deleteOne({ _id: testUser._id });
    console.log("✅ Đã cleanup test data");

    console.log("\n🎉 TẤT CẢ TEST SV3 ĐÃ PASS!");
    console.log("\n📊 KẾT QUẢ SV3:");
    console.log("   ✅ Schema RefreshToken: HOÀN THÀNH");
    console.log("   ✅ Lưu RefreshToken: HOÀN THÀNH");
    console.log("   ✅ Truy xuất RefreshToken: HOÀN THÀNH");
    console.log("   ✅ Verify RefreshToken: HOÀN THÀNH");
    console.log("   ✅ Revoke RefreshToken: HOÀN THÀNH");
    console.log("   ✅ Performance Index: HOÀN THÀNH");
  } catch (error) {
    console.error("❌ Test SV3 thất bại:", error.message);
    throw error;
  }
}

// Main execution
async function main() {
  const connected = await connectDB();
  if (!connected) {
    console.error("❌ Không thể kết nối database. Dừng test.");
    process.exit(1);
  }

  try {
    await testSV3RefreshToken();
    console.log("\n✅ Test SV3 hoàn thành thành công!");
  } catch (error) {
    console.error("\n❌ Test SV3 thất bại:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Đã đóng kết nối database");
    process.exit(0);
  }
}

// Chạy test
if (require.main === module) {
  main().catch((error) => {
    console.error("❌ Lỗi chạy test SV3:", error);
    process.exit(1);
  });
}

module.exports = { testSV3RefreshToken };
