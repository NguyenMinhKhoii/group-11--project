// Seed data cho RBAC - SV3
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

console.log("🌱 SV3: Seed dữ liệu mẫu cho RBAC\n");

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

// Dữ liệu mẫu cho các role
const sampleUsers = [
  // Admin users
  {
    name: "Super Admin",
    email: "admin@group11.com",
    password: "admin123456",
    role: "admin",
    phoneNumber: "0123456789",
    emailVerified: true,
    address: {
      street: "123 Admin Street",
      city: "Ho Chi Minh City",
      country: "Vietnam",
    },
    preferences: {
      language: "vi",
      theme: "dark",
      notifications: {
        email: true,
        push: true,
      },
    },
  },
  {
    name: "System Admin",
    email: "sysadmin@group11.com",
    password: "sysadmin123",
    role: "admin",
    phoneNumber: "0123456790",
    emailVerified: true,
    address: {
      street: "456 System Ave",
      city: "Ha Noi",
      country: "Vietnam",
    },
  },

  // Moderator users
  {
    name: "Content Moderator",
    email: "moderator1@group11.com",
    password: "mod123456",
    role: "moderator",
    phoneNumber: "0123456791",
    emailVerified: true,
    address: {
      street: "789 Mod Street",
      city: "Da Nang",
      country: "Vietnam",
    },
    preferences: {
      language: "vi",
      theme: "light",
    },
  },
  {
    name: "User Moderator",
    email: "moderator2@group11.com",
    password: "mod123456",
    role: "moderator",
    phoneNumber: "0123456792",
    emailVerified: true,
  },
  {
    name: "Senior Moderator",
    email: "senior.mod@group11.com",
    password: "seniormod123",
    role: "moderator",
    phoneNumber: "0123456793",
    emailVerified: true,
    address: {
      street: "321 Senior Lane",
      city: "Can Tho",
      country: "Vietnam",
    },
  },

  // Regular users
  {
    name: "Nguyễn Văn A",
    email: "user1@group11.com",
    password: "user123456",
    role: "user",
    phoneNumber: "0123456794",
    emailVerified: true,
    address: {
      street: "111 User Road",
      city: "Ho Chi Minh City",
      country: "Vietnam",
    },
  },
  {
    name: "Trần Thị B",
    email: "user2@group11.com",
    password: "user123456",
    role: "user",
    phoneNumber: "0123456795",
    emailVerified: false,
  },
  {
    name: "Lê Văn C",
    email: "user3@group11.com",
    password: "user123456",
    role: "user",
    phoneNumber: "0123456796",
    emailVerified: true,
    preferences: {
      language: "en",
      theme: "dark",
    },
  },
  {
    name: "Phạm Thị D",
    email: "user4@group11.com",
    password: "user123456",
    role: "user",
    phoneNumber: "0123456797",
    emailVerified: true,
  },
  {
    name: "Hoàng Văn E",
    email: "user5@group11.com",
    password: "user123456",
    role: "user",
    phoneNumber: "0123456798",
    emailVerified: false,
    isActive: false, // User bị khóa
  },
];

// Seed function chính
async function seedRBACData() {
  console.log("📋 BẮT ĐẦU SEED DỮ LIỆU RBAC...\n");

  try {
    // 1. Xóa tất cả users cũ (trừ admin hiện tại nếu có)
    console.log("1️⃣ Cleanup dữ liệu cũ...");
    const existingAdmins = await User.find({ role: "admin" });
    if (existingAdmins.length > 0) {
      console.log(
        `   - Tìm thấy ${existingAdmins.length} admin hiện tại, sẽ giữ lại`
      );
      await User.deleteMany({ role: { $ne: "admin" } });
    } else {
      await User.deleteMany({});
      console.log("   - Đã xóa tất cả users cũ");
    }

    // 2. Tạo users mẫu
    console.log("\n2️⃣ Tạo users mẫu...");
    const createdUsers = [];

    for (const userData of sampleUsers) {
      try {
        // Kiểm tra email đã tồn tại chưa
        const existingUser = await User.findOne({ email: userData.email });
        if (existingUser) {
          console.log(`   ⚠️  Email ${userData.email} đã tồn tại, bỏ qua`);
          continue;
        }

        const user = new User(userData);
        await user.save();
        createdUsers.push(user);
        console.log(`   ✅ Tạo ${user.role}: ${user.name} (${user.email})`);
      } catch (error) {
        console.log(`   ❌ Lỗi tạo user ${userData.email}:`, error.message);
      }
    }

    // 3. Thống kê kết quả
    console.log("\n3️⃣ Thống kê users đã tạo...");
    const stats = await User.getUserStats();

    console.log("📊 THỐNG KÊ USERS THEO ROLE:");
    stats.forEach((stat) => {
      console.log(
        `   - ${stat._id.toUpperCase()}: ${stat.count} users (${
          stat.active
        } active, ${stat.inactive} inactive)`
      );
    });

    // 4. Test permissions
    console.log("\n4️⃣ Test permissions cho từng role...");

    const testAdmin = await User.findOne({ role: "admin" });
    const testModerator = await User.findOne({ role: "moderator" });
    const testUser = await User.findOne({ role: "user" });

    if (testAdmin) {
      console.log(
        `   ✅ Admin permissions (${testAdmin.name}): ${testAdmin.permissions.length} quyền`
      );
      console.log(
        `      - Can manage roles: ${testAdmin.hasPermission("manage_roles")}`
      );
      console.log(
        `      - Can delete users: ${testAdmin.hasPermission("delete_users")}`
      );
    }

    if (testModerator) {
      console.log(
        `   ✅ Moderator permissions (${testModerator.name}): ${testModerator.permissions.length} quyền`
      );
      console.log(
        `      - Can moderate content: ${testModerator.hasPermission(
          "moderate_content"
        )}`
      );
      console.log(
        `      - Can delete users: ${testModerator.hasPermission(
          "delete_users"
        )}`
      );
    }

    if (testUser) {
      console.log(
        `   ✅ User permissions (${testUser.name}): ${testUser.permissions.length} quyền`
      );
      console.log(
        `      - Can read users: ${testUser.hasPermission("read_users")}`
      );
      console.log(
        `      - Can delete users: ${testUser.hasPermission("delete_users")}`
      );
    }

    // 5. Test methods
    console.log("\n5️⃣ Test user methods...");
    if (testAdmin) {
      console.log(`   - ${testAdmin.name} is admin: ${testAdmin.isAdmin()}`);
      console.log(
        `   - ${testAdmin.name} is moderator: ${testAdmin.isModerator()}`
      );
    }
    if (testModerator) {
      console.log(
        `   - ${testModerator.name} is admin: ${testModerator.isAdmin()}`
      );
      console.log(
        `   - ${
          testModerator.name
        } is moderator: ${testModerator.isModerator()}`
      );
    }
    if (testUser) {
      console.log(`   - ${testUser.name} is admin: ${testUser.isAdmin()}`);
      console.log(
        `   - ${testUser.name} is moderator: ${testUser.isModerator()}`
      );
    }

    console.log("\n🎉 SEED DỮ LIỆU RBAC HOÀN TẤT!");
    console.log("\n📋 THÔNG TIN ĐĂNG NHẬP:");
    console.log("👑 ADMIN:");
    console.log("   Email: admin@group11.com | Password: admin123456");
    console.log("   Email: sysadmin@group11.com | Password: sysadmin123");
    console.log("\n👮 MODERATOR:");
    console.log("   Email: moderator1@group11.com | Password: mod123456");
    console.log("   Email: moderator2@group11.com | Password: mod123456");
    console.log("   Email: senior.mod@group11.com | Password: seniormod123");
    console.log("\n👤 USER:");
    console.log("   Email: user1@group11.com | Password: user123456");
    console.log("   Email: user2@group11.com | Password: user123456");
    console.log("   Email: user3@group11.com | Password: user123456");
  } catch (error) {
    console.error("❌ Lỗi seed data:", error.message);
    throw error;
  }
}

// Main execution
async function main() {
  const connected = await connectDB();
  if (!connected) {
    console.error("❌ Không thể kết nối database. Dừng seed.");
    process.exit(1);
  }

  try {
    await seedRBACData();
    console.log("\n✅ Seed RBAC data hoàn thành thành công!");
  } catch (error) {
    console.error("\n❌ Seed RBAC data thất bại:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Đã đóng kết nối database");
    process.exit(0);
  }
}

// Chạy seed
if (require.main === module) {
  main().catch((error) => {
    console.error("❌ Lỗi chạy seed RBAC:", error);
    process.exit(1);
  });
}

module.exports = { seedRBACData };
