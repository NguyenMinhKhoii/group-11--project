// Quick User Debug - SV3 Activity 6
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

async function debugUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Check if test users exist
    const testUser = await User.findOne({ email: "redux.test@example.com" });
    const adminUser = await User.findOne({ email: "redux.admin@example.com" });

    console.log("\n🔍 Test User Debug:");
    if (testUser) {
      console.log("✅ Test user exists:");
      console.log(`   - ID: ${testUser._id}`);
      console.log(`   - Username: ${testUser.username}`);
      console.log(`   - Email: ${testUser.email}`);
      console.log(`   - Name: ${testUser.name}`);
      console.log(`   - Role: ${testUser.role}`);
      console.log(`   - Active: ${testUser.isActive}`);
      console.log(`   - Has password: ${!!testUser.password}`);
    } else {
      console.log("❌ Test user not found");
    }

    console.log("\n🔍 Admin User Debug:");
    if (adminUser) {
      console.log("✅ Admin user exists:");
      console.log(`   - ID: ${adminUser._id}`);
      console.log(`   - Username: ${adminUser.username}`);
      console.log(`   - Email: ${adminUser.email}`);
      console.log(`   - Name: ${adminUser.name}`);
      console.log(`   - Role: ${adminUser.role}`);
      console.log(`   - Active: ${adminUser.isActive}`);
      console.log(`   - Has password: ${!!adminUser.password}`);
    } else {
      console.log("❌ Admin user not found");
    }

    // Check user schema
    console.log("\n📋 User Schema Fields:");
    const sampleUser = new User();
    const schemaFields = Object.keys(sampleUser.toObject());
    console.log("   - Available fields:", schemaFields);

    // Test password verification
    if (testUser) {
      console.log("\n🔐 Password Verification Test:");
      const bcrypt = require("bcryptjs");
      const isValidPassword = await bcrypt.compare(
        "testpassword123",
        testUser.password
      );
      console.log(`   - Password matches: ${isValidPassword}`);
    }

    await mongoose.connection.close();
    console.log("\n🔐 Database connection closed");
  } catch (error) {
    console.error("❌ Debug error:", error.message);
    process.exit(1);
  }
}

debugUsers().catch(console.error);
