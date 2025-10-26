dotenv.config();
// Removed test code as requested.

// Test Cloudinary configuration
async function testCloudinaryConfig() {
  console.log("1️⃣ Test Cloudinary configuration...");

  try {
    // Test connection với ping
    const result = await cloudinary.api.ping();
    console.log("✅ Cloudinary connection successful:", result);

    // Hiển thị config (ẩn sensitive info)
    console.log("📋 Cloudinary Config:");
    console.log("   - Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
    console.log(
      "   - API Key:",
      process.env.CLOUDINARY_API_KEY
        ? "***" + process.env.CLOUDINARY_API_KEY.slice(-4)
        : "Not set"
    );
    console.log(
      "   - API Secret:",
      process.env.CLOUDINARY_API_SECRET
        ? "***" + process.env.CLOUDINARY_API_SECRET.slice(-4)
        : "Not set"
    );

    return true;
  } catch (error) {
    console.error("❌ Cloudinary connection failed:", error.message);
    return false;
  }
}

// Tạo test image buffer (base64 image)
function createTestImageBase64() {
  // Tạo một ảnh test đơn giản bằng base64 (1x1 pixel PNG)
  const base64Image =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
  return base64Image;
}

// Test upload ảnh lên Cloudinary
async function testCloudinaryUpload() {
  console.log("\n2️⃣ Test upload ảnh lên Cloudinary...");

  try {
    const testImage = createTestImageBase64();

    // Upload với options để tối ưu cho avatar
    const uploadOptions = {
      folder: "group11_avatars",
      public_id: `test_avatar_${Date.now()}`,
      transformation: [
        { width: 200, height: 200, crop: "fill", gravity: "face" },
        { quality: "auto", format: "webp" },
      ],
      resource_type: "image",
    };

    console.log("   📤 Đang upload test image...");
    const result = await cloudinary.uploader.upload(testImage, uploadOptions);

    console.log("✅ Upload thành công:");
    console.log("   - Public ID:", result.public_id);
    console.log("   - URL:", result.secure_url);
    console.log("   - Width x Height:", `${result.width}x${result.height}`);
    console.log("   - Format:", result.format);
    console.log("   - Size:", Math.round(result.bytes / 1024), "KB");
    console.log("   - Created:", new Date(result.created_at).toISOString());

    return result;
  } catch (error) {
    console.error("❌ Upload failed:", error.message);
    throw error;
  }
}

// Test lưu avatar URL vào User MongoDB
async function testSaveAvatarToUser(avatarUrl) {
  console.log("\n3️⃣ Test lưu avatar URL vào User MongoDB...");

  try {
    // Tạo test user
    const testEmail = `avatar_test_${Date.now()}@group11.com`;
    const testUser = new User({
      name: "Avatar Test User",
      email: testEmail,
      password: "testpassword123",
      role: "user",
    });

    await testUser.save();
    console.log("✅ Tạo test user:", testUser.name);

    // Cập nhật avatar
    testUser.avatar = avatarUrl;
    await testUser.save();

    console.log("✅ Cập nhật avatar thành công:");
    console.log("   - User ID:", testUser._id);
    console.log("   - Avatar URL:", testUser.avatar);

    // Verify bằng cách query lại
    const updatedUser = await User.findById(testUser._id);
    console.log("✅ Verify từ database:");
    console.log("   - Avatar trong DB:", updatedUser.avatar);
    console.log("   - URL match:", updatedUser.avatar === avatarUrl);

    return testUser;
  } catch (error) {
    console.error("❌ Save avatar failed:", error.message);
    throw error;
  }
}

// Test multiple avatar sizes
async function testMultipleAvatarSizes() {
  console.log("\n4️⃣ Test upload multiple avatar sizes...");

  try {
    const testImage = createTestImageBase64();
    const sizes = [
      { name: "thumbnail", width: 50, height: 50 },
      { name: "small", width: 100, height: 100 },
      { name: "medium", width: 200, height: 200 },
      { name: "large", width: 400, height: 400 },
    ];

    const uploadResults = [];

    for (const size of sizes) {
      const uploadOptions = {
        folder: "group11_avatars",
        public_id: `test_${size.name}_${Date.now()}`,
        transformation: [
          {
            width: size.width,
            height: size.height,
            crop: "fill",
            gravity: "face",
          },
          { quality: "auto", format: "webp" },
        ],
        resource_type: "image",
      };

      const result = await cloudinary.uploader.upload(testImage, uploadOptions);
      uploadResults.push({
        size: size.name,
        url: result.secure_url,
        dimensions: `${result.width}x${result.height}`,
        bytes: result.bytes,
      });

      console.log(
        `   ✅ ${size.name}: ${result.width}x${result.height} - ${Math.round(
          result.bytes / 1024
        )}KB`
      );
    }

    return uploadResults;
  } catch (error) {
    console.error("❌ Multiple sizes upload failed:", error.message);
    throw error;
  }
}

// Test avatar transformation presets
async function testAvatarTransformations() {
  console.log("\n5️⃣ Test avatar transformations...");

  try {
    const testImage = createTestImageBase64();
    const transformations = [
      {
        name: "circle_avatar",
        transform: [
          { width: 200, height: 200, crop: "fill", gravity: "face" },
          { radius: "max" },
          { quality: "auto", format: "webp" },
        ],
      },
      {
        name: "square_optimized",
        transform: [
          { width: 200, height: 200, crop: "fill", gravity: "face" },
          { quality: "auto:best", format: "webp" },
        ],
      },
      {
        name: "auto_enhance",
        transform: [
          { width: 200, height: 200, crop: "fill", gravity: "auto" },
          { effect: "auto_brightness" },
          { effect: "auto_contrast" },
          { quality: "auto", format: "webp" },
        ],
      },
    ];

    const results = [];

    for (const trans of transformations) {
      const uploadOptions = {
        folder: "group11_avatars/transformations",
        public_id: `${trans.name}_${Date.now()}`,
        transformation: trans.transform,
        resource_type: "image",
      };

      const result = await cloudinary.uploader.upload(testImage, uploadOptions);
      results.push({
        name: trans.name,
        url: result.secure_url,
        size: Math.round(result.bytes / 1024) + "KB",
      });

      console.log(`   ✅ ${trans.name}: ${result.secure_url}`);
    }

    return results;
  } catch (error) {
    console.error("❌ Transformations test failed:", error.message);
    throw error;
  }
}

// Test cleanup uploaded images
async function testCleanupImages(publicIds) {
  console.log("\n6️⃣ Test cleanup uploaded images...");

  try {
    if (publicIds && publicIds.length > 0) {
      const deleteResult = await cloudinary.api.delete_resources(publicIds);
      console.log("✅ Cleanup completed:");
      console.log("   - Deleted:", Object.keys(deleteResult.deleted).length);
      console.log(
        "   - Not found:",
        Object.keys(deleteResult.not_found || {}).length
      );
    } else {
      console.log("ℹ️ No images to cleanup");
    }
  } catch (error) {
    console.error("❌ Cleanup failed:", error.message);
  }
}

// Main test function
async function testCloudinaryAvatar() {
  console.log("📋 BẮT ĐẦU TEST SV3: Cloudinary Avatar Upload\n");

  const uploadedImages = [];
  let testUser = null;

  try {
    // 1. Test Cloudinary config
    const configOk = await testCloudinaryConfig();
    if (!configOk) {
      throw new Error("Cloudinary configuration failed");
    }

    // 2. Test upload
    const uploadResult = await testCloudinaryUpload();
    uploadedImages.push(uploadResult.public_id);

    // 3. Test save to MongoDB
    testUser = await testSaveAvatarToUser(uploadResult.secure_url);

    // 4. Test multiple sizes
    const sizeResults = await testMultipleAvatarSizes();
    sizeResults.forEach((result) => {
      const publicId = result.url.split("/").pop().split(".")[0];
      uploadedImages.push(`group11_avatars/${publicId}`);
    });

    // 5. Test transformations
    const transformResults = await testAvatarTransformations();
    transformResults.forEach((result) => {
      const publicId = result.url.split("/").pop().split(".")[0];
      uploadedImages.push(`group11_avatars/transformations/${publicId}`);
    });

    console.log("\n🎉 TẤT CẢ TEST SV3 CLOUDINARY ĐÃ PASS!");
    console.log("\n📊 KẾT QUẢ SV3:");
    console.log("   ✅ Cloudinary Account: HOẠT ĐỘNG");
    console.log("   ✅ Upload ảnh: THÀNH CÔNG");
    console.log("   ✅ Lưu URL vào MongoDB: THÀNH CÔNG");
    console.log("   ✅ Multiple sizes: THÀNH CÔNG");
    console.log("   ✅ Transformations: THÀNH CÔNG");
    console.log("   ✅ Integration với User schema: THÀNH CÔNG");

    console.log("\n📋 Avatar URLs created:");
    console.log("   - Main avatar:", uploadResult.secure_url);
    sizeResults.forEach((result) => {
      console.log(`   - ${result.size}:`, result.url);
    });
  } catch (error) {
    console.error("❌ Test SV3 thất bại:", error.message);
    throw error;
  } finally {
    // Cleanup
    console.log("\n🧹 Cleanup test data...");

    // Cleanup MongoDB
    if (testUser) {
      await User.deleteOne({ _id: testUser._id });
      console.log("✅ Cleanup test user from MongoDB");
    }

    // Cleanup Cloudinary
    await testCleanupImages(uploadedImages);
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
    await testCloudinaryAvatar();
    console.log("\n✅ Test SV3 Cloudinary hoàn thành thành công!");
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
    console.error("❌ Lỗi chạy test SV3 Cloudinary:", error);
    process.exit(1);
  });
}

module.exports = { testCloudinaryAvatar };
