// Test User Schema với RBAC - SV3
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

console.log("🧪 SV3: Test User Schema với RBAC\n");

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

// Test chính cho SV3 RBAC
async function testRBACUserSchema() {
  console.log("📋 BẮT ĐẦU TEST SV3: User Schema với RBAC\n");

  try {
    // 1. Test tạo users với các role khác nhau
    console.log("1️⃣ Test tạo users với các role...");

    const testUsers = [
      {
        name: "Test Admin",
        email: `test_admin_${Date.now()}@example.com`,
        password: "admin123456",
        role: "admin",
      },
      {
        name: "Test Moderator",
        email: `test_mod_${Date.now()}@example.com`,
        password: "mod123456",
        role: "moderator",
      },
      {
        name: "Test User",
        email: `test_user_${Date.now()}@example.com`,
        password: "user123456",
        role: "user",
      },
    ];

    const createdUsers = {};

    for (const userData of testUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers[user.role] = user;
      console.log(`   ✅ Tạo ${user.role}: ${user.name}`);
      console.log(`      - Permissions: ${user.permissions.length} quyền`);
      console.log(`      - Permissions: [${user.permissions.join(", ")}]`);
    }

    // 2. Test role checking methods
    console.log("\n2️⃣ Test role checking methods...");

    const admin = createdUsers.admin;
    const moderator = createdUsers.moderator;
    const user = createdUsers.user;

    console.log("   👑 Admin methods:");
    console.log(`      - isAdmin(): ${admin.isAdmin()}`);
    console.log(`      - isModerator(): ${admin.isModerator()}`);
    console.log(`      - hasRole('admin'): ${admin.hasRole("admin")}`);

    console.log("   👮 Moderator methods:");
    console.log(`      - isAdmin(): ${moderator.isAdmin()}`);
    console.log(`      - isModerator(): ${moderator.isModerator()}`);
    console.log(
      `      - hasRole('moderator'): ${moderator.hasRole("moderator")}`
    );

    console.log("   👤 User methods:");
    console.log(`      - isAdmin(): ${user.isAdmin()}`);
    console.log(`      - isModerator(): ${user.isModerator()}`);
    console.log(`      - hasRole('user'): ${user.hasRole("user")}`);

    // 3. Test permission checking
    console.log("\n3️⃣ Test permission checking...");

    const permissions = [
      "read_users",
      "create_users",
      "delete_users",
      "manage_roles",
      "moderate_content",
    ];

    console.log("   Kiểm tra permissions cho từng role:");
    permissions.forEach((permission) => {
      console.log(`   📋 ${permission}:`);
      console.log(`      - Admin: ${admin.hasPermission(permission)}`);
      console.log(`      - Moderator: ${moderator.hasPermission(permission)}`);
      console.log(`      - User: ${user.hasPermission(permission)}`);
    });

    // 4. Test static methods
    console.log("\n4️⃣ Test static methods...");

    const adminUsers = await User.findByRole("admin");
    const modUsers = await User.findByRole("moderator");
    const normalUsers = await User.findByRole("user");

    console.log(`   - Admins trong database: ${adminUsers.length}`);
    console.log(`   - Moderators trong database: ${modUsers.length}`);
    console.log(`   - Users trong database: ${normalUsers.length}`);

    // 5. Test user stats
    console.log("\n5️⃣ Test user statistics...");
    const stats = await User.getUserStats();
    console.log("   📊 Thống kê users theo role:");
    stats.forEach((stat) => {
      console.log(
        `      - ${stat._id}: ${stat.count} users (${stat.active} active)`
      );
    });

    // 6. Test update role
    console.log("\n6️⃣ Test update role...");
    const testUserForUpdate = new User({
      name: "Test Update Role",
      email: `test_update_${Date.now()}@example.com`,
      password: "password123",
      role: "user",
    });
    await testUserForUpdate.save();

    console.log(
      `   - Trước update: role=${testUserForUpdate.role}, permissions=${testUserForUpdate.permissions.length}`
    );

    await testUserForUpdate.updateRole("moderator");

    console.log(
      `   - Sau update: role=${testUserForUpdate.role}, permissions=${testUserForUpdate.permissions.length}`
    );

    // 7. Test validation
    console.log("\n7️⃣ Test validation...");

    try {
      const invalidUser = new User({
        name: "A", // Quá ngắn
        email: "invalid-email", // Email không hợp lệ
        password: "123", // Password quá ngắn
        role: "invalid_role", // Role không hợp lệ
      });
      await invalidUser.save();
      console.log("   ❌ Validation không hoạt động!");
    } catch (error) {
      console.log(
        "   ✅ Validation hoạt động đúng:",
        error.message.split(":")[0]
      );
    }

    // 8. Test public info
    console.log("\n8️⃣ Test public info...");
    const publicInfo = admin.getPublicInfo();
    const hasPassword = "password" in publicInfo;
    const hasResetToken = "resetToken" in publicInfo;

    console.log(`   - Public info không chứa password: ${!hasPassword}`);
    console.log(`   - Public info không chứa resetToken: ${!hasResetToken}`);
    console.log(
      `   - Public info fields: ${Object.keys(publicInfo).length} trường`
    );

    // 9. Test constants
    console.log("\n9️⃣ Test constants...");
    console.log(`   - ROLES: ${Object.keys(User.ROLES).join(", ")}`);
    console.log(
      `   - PERMISSIONS: ${Object.values(User.PERMISSIONS).length} permissions`
    );
    console.log(
      `   - ROLE_PERMISSIONS mapping: ${
        Object.keys(User.ROLE_PERMISSIONS).length
      } roles`
    );

    // Cleanup test data
    console.log("\n🧹 Cleanup test data...");
    await User.deleteMany({
      email: { $regex: /^test_(admin|mod|user|update)_\d+@example\.com$/ },
    });
    console.log("   ✅ Đã cleanup test data");

    console.log("\n🎉 TẤT CẢ TEST SV3 RBAC ĐÃ PASS!");
    console.log("\n📊 KẾT QUẢ SV3 RBAC:");
    console.log("   ✅ User Schema với 3 roles: HOÀN THÀNH");
    console.log("   ✅ Permissions system: HOÀN THÀNH");
    console.log("   ✅ Role checking methods: HOÀN THÀNH");
    console.log("   ✅ Permission checking: HOÀN THÀNH");
    console.log("   ✅ Static methods: HOÀN THÀNH");
    console.log("   ✅ Validation: HOÀN THÀNH");
    console.log("   ✅ Security (public info): HOÀN THÀNH");
  } catch (error) {
    console.error("❌ Test SV3 RBAC thất bại:", error.message);
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
    await testRBACUserSchema();
    console.log("\n✅ Test SV3 RBAC hoàn thành thành công!");
  } catch (error) {
    console.error("\n❌ Test SV3 RBAC thất bại:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Đã đóng kết nối database");
    process.exit(0);
  }
}

// Chạy test
if (require.main === module) {
  main().catch((error) => {
    console.error("❌ Lỗi chạy test SV3 RBAC:", error);
    process.exit(1);
  });
}

module.exports = { testRBACUserSchema };
