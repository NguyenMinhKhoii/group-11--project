// Simple Cloudinary Test - SV3
const dotenv = require("dotenv");
const cloudinary = require("./config/cloudinary");

dotenv.config();

console.log("🧪 SV3: Simple Cloudinary Test\n");

async function testSimpleCloudinary() {
  try {
    console.log("1️⃣ Test Cloudinary configuration...");

    // Check environment variables
    console.log("📋 Environment Variables:");
    console.log(
      "   - CLOUDINARY_CLOUD_NAME:",
      process.env.CLOUDINARY_CLOUD_NAME ? "✅ Set" : "❌ Not Set"
    );
    console.log(
      "   - CLOUDINARY_API_KEY:",
      process.env.CLOUDINARY_API_KEY ? "✅ Set" : "❌ Not Set"
    );
    console.log(
      "   - CLOUDINARY_API_SECRET:",
      process.env.CLOUDINARY_API_SECRET ? "✅ Set" : "❌ Not Set"
    );

    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      throw new Error("Thiếu Cloudinary credentials trong .env file");
    }

    console.log("\n2️⃣ Test Cloudinary connection...");

    // Test ping
    const pingResult = await cloudinary.api.ping();
    console.log("✅ Cloudinary ping successful:", pingResult);

    console.log("\n3️⃣ Test upload simple image...");

    // Upload một ảnh test đơn giản
    const testImageBase64 =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

    const uploadOptions = {
      folder: "group11_test",
      public_id: `test_upload_${Date.now()}`,
      resource_type: "image",
    };

    const uploadResult = await cloudinary.uploader.upload(
      testImageBase64,
      uploadOptions
    );

    console.log("✅ Upload successful:");
    console.log("   - Public ID:", uploadResult.public_id);
    console.log("   - URL:", uploadResult.secure_url);
    console.log("   - Size:", uploadResult.bytes, "bytes");

    console.log("\n4️⃣ Test delete image...");

    // Xóa ảnh test
    const deleteResult = await cloudinary.uploader.destroy(
      uploadResult.public_id
    );
    console.log("✅ Delete successful:", deleteResult);

    console.log("\n🎉 CLOUDINARY TEST PASS!");
    console.log("\n📊 KẾT QUẢ SV3 CLOUDINARY:");
    console.log("   ✅ Account setup: HOÀN THÀNH");
    console.log("   ✅ Connection: HOÀN THÀNH");
    console.log("   ✅ Upload: HOÀN THÀNH");
    console.log("   ✅ Delete: HOÀN THÀNH");  } catch (error) {
    console.error("❌ Cloudinary test failed:", error.message || error);
    
    if (error.message && error.message.includes("credentials")) {
      console.log("\n🔧 HƯỚNG DẪN SỬA LỖI:");
      console.log("1. Kiểm tra file .env có đầy đủ thông tin Cloudinary:");
      console.log("   CLOUDINARY_CLOUD_NAME=your_cloud_name");
      console.log("   CLOUDINARY_API_KEY=your_api_key");
      console.log("   CLOUDINARY_API_SECRET=your_api_secret");
      console.log("2. Đăng nhập Cloudinary Dashboard để lấy thông tin");
      console.log("3. Restart server sau khi cập nhật .env");
    }
    
    console.log("\n🔍 Debug info:");
    console.log("   - Error type:", typeof error);
    console.log("   - Error keys:", Object.keys(error));
    
    process.exit(1);
  }
}

// Chạy test
testSimpleCloudinary();
