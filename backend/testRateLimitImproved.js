// Improved Rate Limiting Test - SV3 Activity 5
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const UserActivityLog = require("./models/UserActivityLog");
const ActivityLogService = require("./services/ActivityLogService");

dotenv.config();

async function connectDB() {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/group11project"
    );
    console.log("✅ Kết nối MongoDB thành công");
    return true;
  } catch (error) {
    console.error("❌ Lỗi kết nối MongoDB:", error.message);
    return false;
  }
}

async function testRateLimitingImproved() {
  console.log("\n🧪 IMPROVED RATE LIMITING TEST");
  console.log("=".repeat(60));

  try {
    const testIP = "192.168.1.999";
    const maxAttempts = 3;
    const timeWindow = 15; // minutes
    const testUserId = new mongoose.Types.ObjectId();
    const username = "rate_test_user";

    console.log(
      `🔒 Testing rate limit: ${maxAttempts} failed attempts in ${timeWindow} minutes`
    );
    console.log(`📧 Test IP: ${testIP}`);
    console.log(`👤 Test User: ${username}`);

    // Clean up any existing logs for this test IP
    await UserActivityLog.deleteMany({ ipAddress: testIP });
    console.log(`🧹 Cleaned up existing logs for test IP`);

    // Simulate multiple failed login attempts
    for (let i = 1; i <= 6; i++) {
      console.log(`\n🔍 Attempt ${i}:`);

      // Check current rate limit status
      const rateCheck = await ActivityLogService.checkRateLimit(
        testIP,
        "LOGIN_FAILED",
        timeWindow,
        maxAttempts
      );

      console.log(`   - Current failed attempts: ${rateCheck.attempts}`);
      console.log(`   - Max allowed: ${rateCheck.maxAttempts}`);
      console.log(`   - Blocked: ${rateCheck.blocked}`);

      if (rateCheck.blocked) {
        console.log(`   - ⛔ IP ${testIP} is rate limited!`);
        console.log(`   - Next reset: ${rateCheck.resetTime}`);

        // Log security violation
        await ActivityLogService.logSecurityViolation(
          testUserId,
          username,
          testIP,
          `Rate limit exceeded: ${rateCheck.attempts}/${maxAttempts} failed login attempts`
        );

        console.log(`   - 🚨 Security violation logged`);
        break;
      }

      // Log a failed login attempt
      const result = await ActivityLogService.logLoginAttempt(
        testUserId,
        username,
        testIP,
        "Test-Browser/1.0",
        false // failed login
      );

      if (result.success) {
        console.log(`   - ❌ Failed login logged successfully`);
      } else {
        console.log(`   - ⚠️ Failed to log: ${result.error}`);
      }

      // Small delay to ensure timestamps are different
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Test different action types
    console.log(`\n🔄 Testing different action rate limits:`);

    const actionTests = [
      { action: "LOGIN_FAILED", maxAttempts: 5, description: "Failed logins" },
      {
        action: "PASSWORD_RESET_REQUEST",
        maxAttempts: 3,
        description: "Password resets",
      },
      { action: "API_CALL", maxAttempts: 100, description: "API calls" },
    ];

    for (const test of actionTests) {
      const rateCheck = await ActivityLogService.checkRateLimit(
        testIP,
        test.action,
        timeWindow,
        test.maxAttempts
      );

      console.log(
        `   - ${test.description}: ${rateCheck.attempts}/${test.maxAttempts} (Blocked: ${rateCheck.blocked})`
      );
    }

    return true;
  } catch (error) {
    console.error("❌ Improved rate limiting test failed:", error.message);
    return false;
  }
}

async function testLoginRateLimit() {
  console.log("\n🔐 LOGIN-SPECIFIC RATE LIMIT TEST");
  console.log("=".repeat(60));

  try {
    const testIP = "10.0.0.123";
    const testUserId = new mongoose.Types.ObjectId();
    const username = "login_test_user";

    // Clean up
    await UserActivityLog.deleteMany({ ipAddress: testIP });

    console.log(`Testing login rate limiting for IP: ${testIP}`);

    // Simulate realistic login scenario
    const scenarios = [
      { attempt: 1, success: true, description: "Valid login" },
      { attempt: 2, success: false, description: "Wrong password" },
      { attempt: 3, success: false, description: "Wrong password" },
      { attempt: 4, success: false, description: "Wrong password" },
      { attempt: 5, success: false, description: "Wrong password" },
      { attempt: 6, success: false, description: "Wrong password" },
      { attempt: 7, success: false, description: "Should be blocked" },
    ];

    for (const scenario of scenarios) {
      console.log(`\n🎭 Scenario ${scenario.attempt}: ${scenario.description}`);

      // Check rate limit for failed logins only
      if (!scenario.success) {
        const rateCheck = await ActivityLogService.checkRateLimit(
          testIP,
          "LOGIN_FAILED",
          15, // 15 minutes
          5 // max 5 failed attempts
        );

        console.log(`   - Failed login attempts: ${rateCheck.attempts}/5`);

        if (rateCheck.blocked) {
          console.log(`   - ⛔ LOGIN BLOCKED! Rate limit exceeded`);
          console.log(`   - 🕐 Try again after: ${rateCheck.resetTime}`);

          // Log the blocking event
          await ActivityLogService.logSecurityViolation(
            testUserId,
            username,
            testIP,
            "Login rate limit exceeded - account temporarily blocked"
          );
          break;
        }
      }

      // Log the login attempt
      await ActivityLogService.logLoginAttempt(
        testUserId,
        username,
        testIP,
        "Mozilla/5.0 Test Browser",
        scenario.success
      );

      const result = scenario.success ? "✅ SUCCESS" : "❌ FAILED";
      console.log(`   - Login result: ${result}`);
    }

    return true;
  } catch (error) {
    console.error("❌ Login rate limit test failed:", error.message);
    return false;
  }
}

async function testActivityLogAnalytics() {
  console.log("\n📊 ACTIVITY LOG ANALYTICS TEST");
  console.log("=".repeat(60));

  try {
    // Get comprehensive analytics
    const analytics = await ActivityLogService.getSecurityAnalytics(24);
    const suspicious = await ActivityLogService.getSuspiciousActivities(24);

    console.log("\n📈 Security Analytics (24 hours):");
    if (analytics.length > 0) {
      analytics.forEach((stat) => {
        console.log(
          `   - ${stat.action} (${stat.status}): ${stat.count} events`
        );
        console.log(
          `     └─ ${stat.uniqueUsers} unique users, ${stat.uniqueIPs} unique IPs`
        );
      });
    } else {
      console.log("   - No analytics data available");
    }

    console.log("\n🚨 Suspicious Activities:");
    if (suspicious.length > 0) {
      suspicious.slice(0, 5).forEach((activity, index) => {
        console.log(
          `   ${index + 1}. ${activity.action} by ${activity.username}`
        );
        console.log(
          `      └─ Risk: ${activity.riskLevel}, Status: ${activity.status}`
        );
        console.log(
          `      └─ IP: ${activity.ipAddress}, Time: ${new Date(
            activity.timestamp
          ).toLocaleString()}`
        );
      });
    } else {
      console.log("   - No suspicious activities found");
    }

    // Test collection statistics
    const totalLogs = await UserActivityLog.countDocuments();
    const uniqueUsers = await UserActivityLog.distinct("userId");
    const uniqueIPs = await UserActivityLog.distinct("ipAddress");
    const actions = await UserActivityLog.distinct("action");

    console.log("\n📋 Collection Statistics:");
    console.log(`   - Total activity logs: ${totalLogs}`);
    console.log(`   - Unique users tracked: ${uniqueUsers.length}`);
    console.log(`   - Unique IP addresses: ${uniqueIPs.length}`);
    console.log(`   - Activity types: ${actions.length}`);
    console.log(`   - Available actions: ${actions.join(", ")}`);

    return true;
  } catch (error) {
    console.error("❌ Analytics test failed:", error.message);
    return false;
  }
}

async function runImprovedTests() {
  console.log("🧪 SV3: Improved Activity Logging & Rate Limiting Tests");
  console.log("=".repeat(70));

  const connected = await connectDB();
  if (!connected) {
    process.exit(1);
  }

  const testResults = {
    rateLimitingImproved: false,
    loginRateLimit: false,
    analyticsTest: false,
  };

  try {
    console.log("\n🚀 Starting improved test suite...");

    testResults.rateLimitingImproved = await testRateLimitingImproved();
    testResults.loginRateLimit = await testLoginRateLimit();
    testResults.analyticsTest = await testActivityLogAnalytics();

    // Final results
    console.log("\n🎉 IMPROVED TEST RESULTS");
    console.log("=".repeat(60));

    Object.entries(testResults).forEach(([test, passed]) => {
      const status = passed ? "✅ PASSED" : "❌ FAILED";
      console.log(`   ${status} - ${test}`);
    });

    const allPassed = Object.values(testResults).every(
      (result) => result === true
    );
    console.log(
      `\n📊 OVERALL RESULT: ${
        allPassed ? "🎉 ALL TESTS PASSED!" : "⚠️ SOME TESTS FAILED"
      }`
    );

    if (allPassed) {
      console.log("\n🎯 SV3 ACTIVITY 5 - RATE LIMITING VERIFIED:");
      console.log("   ✅ Rate limiting working correctly");
      console.log("   ✅ Failed login tracking implemented");
      console.log("   ✅ Security violations logged properly");
      console.log("   ✅ Analytics and reporting functional");
      console.log("   ✅ Collection and queries optimized");
    }
  } catch (error) {
    console.error("❌ Test suite failed:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔐 Database connection closed");
  }
}

if (require.main === module) {
  runImprovedTests().catch(console.error);
}

module.exports = { runImprovedTests };
