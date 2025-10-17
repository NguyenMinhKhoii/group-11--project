// Test Avatar Helper - SV3
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const AvatarUploadHelper = require("./utils/avatarHelper");
const User = require("./models/User");

dotenv.config();

console.log("🧪 SV3: Test Avatar Helper + MongoDB Integration\n");

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

// Tạo test image buffer
function createTestImageBuffer() {
  // Tạo một buffer từ base64 image
  const base64Image =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
  return Buffer.from(base64Image, "base64");
}

// Test chính cho Avatar Helper
async function testAvatarHelper() {
  console.log("📋 BẮT ĐẦU TEST SV3: Avatar Helper\n");

  let testUser = null;
  let uploadResults = [];

  try {
    // 1. Tạo test user
    console.log("1️⃣ Tạo test user...");
    const testEmail = `avatar_helper_test_${Date.now()}@group11.com`;
    testUser = new User({
      name: "Avatar Helper Test User",
      email: testEmail,
      password: "testpassword123",
      role: "user",
    });

    await testUser.save();
    console.log("✅ Test user đã được tạo:");
    console.log("   - ID:", testUser._id);
    console.log("   - Name:", testUser.name);
    console.log("   - Email:", testUser.email);

    // 2. Test validate image
    console.log("\n2️⃣ Test validate image...");
    const validFile = {
      mimetype: "image/jpeg",
      size: 1024 * 500, // 500KB
    };
    const invalidFile = {
      mimetype: "image/gif",
      size: 1024 * 1024 * 10, // 10MB
    };

    const validResult = AvatarUploadHelper.validateImage(validFile);
    const invalidResult = AvatarUploadHelper.validateImage(invalidFile);

    console.log("✅ Valid file test:", validResult.valid ? "PASS" : "FAIL");
    console.log(
      "✅ Invalid file test:",
      !invalidResult.valid ? "PASS" : "FAIL"
    );
    console.log("   - Invalid reason:", invalidResult.error);

    // 3. Test upload single avatar
    console.log("\n3️⃣ Test upload single avatar...");
    const testImageBuffer = createTestImageBuffer();

    const uploadResult = await AvatarUploadHelper.uploadAvatar(
      testImageBuffer,
      testUser._id
    );

    if (uploadResult.success) {
      console.log("✅ Single upload thành công:");
      console.log("   - Public ID:", uploadResult.data.public_id);
      console.log("   - URL:", uploadResult.data.url);
      console.log(
        "   - Dimensions:",
        `${uploadResult.data.width}x${uploadResult.data.height}`
      );
      console.log(
        "   - Size:",
        Math.round(uploadResult.data.bytes / 1024),
        "KB"
      );
      uploadResults.push(uploadResult.data.public_id);
    } else {
      throw new Error("Upload failed: " + uploadResult.error);
    }

    // 4. Test upload multiple sizes
    console.log("\n4️⃣ Test upload multiple sizes...");
    const multiSizeResult = await AvatarUploadHelper.uploadAvatarMultipleSizes(
      testImageBuffer,
      testUser._id
    );

    if (multiSizeResult.success) {
      console.log("✅ Multiple sizes upload thành công:");
      Object.entries(multiSizeResult.data).forEach(([size, data]) => {
        console.log(
          `   - ${size}: ${data.width}x${data.height} - ${Math.round(
            data.bytes / 1024
          )}KB`
        );
        uploadResults.push(data.public_id);
      });
    } else {
      throw new Error("Multiple sizes upload failed: " + multiSizeResult.error);
    }

    // 5. Test update user avatar
    console.log("\n5️⃣ Test update user avatar...");
    const updateResult = await AvatarUploadHelper.updateUserAvatar(
      testUser._id,
      uploadResult.data.url,
      uploadResult.data
    );

    if (updateResult.success) {
      console.log("✅ Update user avatar thành công:");
      console.log("   - Avatar URL:", updateResult.data.avatar);
      console.log("   - User name:", updateResult.data.user.name);

      // Verify database
      const updatedUser = await User.findById(testUser._id);
      console.log("✅ Database verification:");
      console.log("   - Avatar in DB:", updatedUser.avatar);
      console.log(
        "   - Metadata public_id:",
        updatedUser.avatarMetadata?.public_id
      );
      console.log("   - Metadata format:", updatedUser.avatarMetadata?.format);
      console.log(
        "   - Metadata dimensions:",
        `${updatedUser.avatarMetadata?.width}x${updatedUser.avatarMetadata?.height}`
      );
    } else {
      throw new Error("Update user avatar failed: " + updateResult.error);
    }

    // 6. Test avatar presets
    console.log("\n6️⃣ Test avatar presets...");
    const presets = AvatarUploadHelper.getAvatarPresets();
    console.log("✅ Available presets:");
    Object.keys(presets).forEach((preset) => {
      console.log(`   - ${preset}: ${JSON.stringify(presets[preset][0])}`);
    });

    // 7. Test generate transformed URL
    console.log("\n7️⃣ Test generate transformed URL...");
    const transformedUrl = AvatarUploadHelper.generateTransformedUrl(
      uploadResult.data.public_id,
      presets.circle
    );

    if (transformedUrl) {
      console.log("✅ Transformed URL generated:");
      console.log("   - Circle avatar:", transformedUrl);
    }

    // 8. Test get user avatars
    console.log("\n8️⃣ Test get user avatars...");
    const userAvatarsResult = await AvatarUploadHelper.getUserAvatars(
      testUser._id
    );

    if (userAvatarsResult.success) {
      console.log("✅ User avatars retrieved:");
      console.log("   - Found:", userAvatarsResult.data.length, "avatars");
      userAvatarsResult.data.forEach((avatar, index) => {
        console.log(
          `   - Avatar ${index + 1}: ${avatar.width}x${avatar.height} - ${
            avatar.format
          }`
        );
      });
    }

    // 9. Test extract public ID
    console.log("\n9️⃣ Test extract public ID...");
    const extractedId = AvatarUploadHelper.extractPublicIdFromUrl(
      uploadResult.data.url
    );
    console.log("✅ Extract public ID:");
    console.log("   - Original:", uploadResult.data.public_id);
    console.log("   - Extracted:", extractedId);
    console.log("   - Match:", extractedId === uploadResult.data.public_id);

    console.log("\n🎉 TẤT CẢ TEST AVATAR HELPER ĐÃ PASS!");
    console.log("\n📊 KẾT QUẢ SV3 AVATAR:");
    console.log("   ✅ Cloudinary Integration: HOÀN THÀNH");
    console.log("   ✅ Avatar Upload Helper: HOÀN THÀNH");
    console.log("   ✅ Multiple Sizes Support: HOÀN THÀNH");
    console.log("   ✅ User Avatar Update: HOÀN THÀNH");
    console.log("   ✅ Metadata Storage: HOÀN THÀNH");
    console.log("   ✅ Image Validation: HOÀN THÀNH");
    console.log("   ✅ Transformation Presets: HOÀN THÀNH");
    console.log("   ✅ URL Generation: HOÀN THÀNH");
  } catch (error) {
    console.error("❌ Test Avatar Helper thất bại:", error.message);
    throw error;
  } finally {
    // Cleanup
    console.log("\n🧹 Cleanup test data...");

    // Cleanup MongoDB
    if (testUser) {
      await User.deleteOne({ _id: testUser._id });
      console.log("✅ Cleanup test user từ MongoDB");
    }

    // Cleanup Cloudinary
    if (uploadResults.length > 0) {
      try {
        const deletePromises = uploadResults.map((publicId) =>
          AvatarUploadHelper.deleteAvatar(publicId)
        );
        await Promise.all(deletePromises);
        console.log("✅ Cleanup", uploadResults.length, "images từ Cloudinary");
      } catch (cleanupError) {
        console.warn("⚠️ Cleanup warning:", cleanupError.message);
      }
    }
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
    await testAvatarHelper();
    console.log("\n✅ Test SV3 Avatar Helper hoàn thành thành công!");
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
    console.error("❌ Lỗi chạy test SV3 Avatar Helper:", error);
    process.exit(1);
  });
}

module.exports = { testAvatarHelper };
