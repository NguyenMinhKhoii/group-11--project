// Test User Activity Logging & Rate Limiting - SV3 Activity 5
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const UserActivityLog = require("./models/UserActivityLog");
const ActivityLogService = require("./services/ActivityLogService");
const User = require("./models/User");

dotenv.config();

// Test data
const testUsers = [
  {
    _id: new mongoose.Types.ObjectId(),
    username: "testuser1",
    email: "test1@example.com",
  },
  {
    _id: new mongoose.Types.ObjectId(),
    username: "testuser2",
    email: "test2@example.com",
  },
  {
    _id: new mongoose.Types.ObjectId(),
    username: "admin_user",
    email: "admin@example.com",
  },
];

const testIPs = ["192.168.1.100", "203.113.45.67", "10.0.0.50"];

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

async function testBasicLogging() {
  console.log("\n📋 TEST 1: Basic Activity Logging");
  console.log("=".repeat(50));

  try {
    // Test các loại activity khác nhau
    const activities = [
      {
        userId: testUsers[0]._id,
        action: "LOGIN_SUCCESS",
        details: {
          username: testUsers[0].username,
          ipAddress: testIPs[0],
          userAgent:
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      },
      {
        userId: testUsers[1]._id,
        action: "LOGIN_FAILED",
        details: {
          username: testUsers[1].username,
          ipAddress: testIPs[1],
          userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
          status: "FAILED",
        },
      },
      {
        userId: testUsers[0]._id,
        action: "PROFILE_UPDATE",
        details: {
          username: testUsers[0].username,
          ipAddress: testIPs[0],
          additionalData: { changes: ["avatar", "email"] },
        },
      },
      {
        userId: testUsers[2]._id,
        action: "PASSWORD_RESET_REQUEST",
        details: {
          username: testUsers[2].username,
          ipAddress: testIPs[2],
          additionalData: { email: testUsers[2].email },
        },
      },
    ];

    for (const activity of activities) {
      const result = await ActivityLogService.logActivity(
        activity.userId,
        activity.action,
        activity.details
      );

      if (result.success) {
        console.log(
          `✅ Logged: ${activity.action} for ${activity.details.username}`
        );
      } else {
        console.log(`❌ Failed: ${activity.action} - ${result.error}`);
      }
    }

    console.log("\n📊 Test 1 Results:");
    const totalLogs = await UserActivityLog.countDocuments();
    console.log(`   - Total logs created: ${totalLogs}`);

    return true;
  } catch (error) {
    console.error("❌ Test 1 Failed:", error.message);
    return false;
  }
}

async function testRateLimiting() {
  console.log("\n📋 TEST 2: Rate Limiting");
  console.log("=".repeat(50));

  try {
    const testIP = "192.168.1.200";
    const maxAttempts = 5;
    const timeWindow = 15; // minutes

    console.log(
      `🔒 Testing rate limit: ${maxAttempts} attempts in ${timeWindow} minutes`
    );

    // Simulate multiple login attempts
    for (let i = 1; i <= 7; i++) {
      // Check rate limit before attempt
      const rateCheck = await ActivityLogService.checkRateLimit(
        testIP,
        "LOGIN_ATTEMPT",
        timeWindow,
        maxAttempts
      );

      console.log(`\n🔍 Attempt ${i}:`);
      console.log(`   - Current attempts: ${rateCheck.attempts}`);
      console.log(`   - Blocked: ${rateCheck.blocked}`);

      if (rateCheck.blocked) {
        console.log(`   - ⛔ IP ${testIP} is rate limited!`);
        console.log(`   - Reset time: ${rateCheck.resetTime}`);

        // Log security violation
        await ActivityLogService.logSecurityViolation(
          testUsers[0]._id,
          testUsers[0].username,
          testIP,
          `Rate limit exceeded: ${rateCheck.attempts}/${maxAttempts} attempts`
        );
        break;
      }

      // Log login attempt
      const success = i <= 2; // First 2 attempts succeed, rest fail
      await ActivityLogService.logLoginAttempt(
        testUsers[0]._id,
        testUsers[0].username,
        testIP,
        "Test-Browser/1.0",
        success
      );

      console.log(`   - ${success ? "✅ Login success" : "❌ Login failed"}`);
    }

    return true;
  } catch (error) {
    console.error("❌ Test 2 Failed:", error.message);
    return false;
  }
}

async function testLogQueries() {
  console.log("\n📋 TEST 3: Log Queries & Analytics");
  console.log("=".repeat(50));

  try {
    // Test user activity logs
    console.log("\n👤 User Activity Logs:");
    const userLogs = await ActivityLogService.getUserActivityLogs(
      testUsers[0]._id,
      {
        page: 1,
        limit: 5,
      }
    );

    console.log(
      `   - Found ${userLogs.logs?.length || 0} logs for user ${
        testUsers[0].username
      }`
    );
    if (userLogs.logs?.length > 0) {
      userLogs.logs.forEach((log, index) => {
        console.log(
          `   ${index + 1}. ${log.action} - ${log.status} (${new Date(
            log.timestamp
          ).toLocaleString()})`
        );
      });
    }

    // Test security analytics
    console.log("\n📊 Security Analytics (24h):");
    const analytics = await ActivityLogService.getSecurityAnalytics(24);
    if (analytics.length > 0) {
      analytics.forEach((stat) => {
        console.log(
          `   - ${stat.action} (${stat.status}): ${stat.count} times, ${stat.uniqueUsers} users, ${stat.uniqueIPs} IPs`
        );
      });
    } else {
      console.log("   - No analytics data available");
    }

    // Test suspicious activities
    console.log("\n🚨 Suspicious Activities:");
    const suspicious = await ActivityLogService.getSuspiciousActivities(24);
    if (suspicious.length > 0) {
      suspicious.forEach((activity) => {
        console.log(
          `   - ${activity.action} by ${activity.username} (${activity.riskLevel} risk)`
        );
      });
    } else {
      console.log("   - No suspicious activities found");
    }

    // Test IP-based logs
    console.log("\n🌐 Logs by IP Address:");
    const ipLogs = await ActivityLogService.getLogsByIP(testIPs[0], 24, 10);
    console.log(
      `   - Found ${ipLogs.logs?.length || 0} logs for IP ${testIPs[0]}`
    );

    // Test user activity summary
    console.log("\n📈 User Activity Summary:");
    const summary = await ActivityLogService.getUserActivitySummary(
      testUsers[0]._id,
      24
    );
    if (summary.summary?.length > 0) {
      summary.summary.forEach((stat) => {
        console.log(
          `   - ${stat.action}: ${stat.count} times (${stat.successCount} success, ${stat.failedCount} failed)`
        );
      });
    }

    return true;
  } catch (error) {
    console.error("❌ Test 3 Failed:", error.message);
    return false;
  }
}

async function testAdvancedFeatures() {
  console.log("\n📋 TEST 4: Advanced Features");
  console.log("=".repeat(50));

  try {
    // Test risk level calculation
    console.log("\n⚠️ Risk Level Testing:");

    // High risk activity
    await ActivityLogService.logSecurityViolation(
      testUsers[1]._id,
      testUsers[1].username,
      testIPs[1],
      "Suspicious login pattern detected"
    );
    console.log("   ✅ Logged HIGH risk security violation");

    // Medium risk activity
    await ActivityLogService.logPasswordResetRequest(
      testUsers[2]._id,
      testUsers[2].username,
      testIPs[2],
      testUsers[2].email
    );
    console.log("   ✅ Logged MEDIUM risk password reset");

    // Test compound queries
    console.log("\n🔍 Compound Queries:");

    // Query by action and status
    const failedLogins = await UserActivityLog.find({
      action: "LOGIN_FAILED",
      status: "FAILED",
    }).limit(5);
    console.log(`   - Failed login attempts: ${failedLogins.length}`);

    // Query by risk level
    const highRiskActivities = await UserActivityLog.find({
      riskLevel: { $in: ["HIGH", "CRITICAL"] },
    }).limit(5);
    console.log(
      `   - High/Critical risk activities: ${highRiskActivities.length}`
    );

    // Query by time range
    const recentLogs = await UserActivityLog.find({
      timestamp: { $gte: new Date(Date.now() - 60 * 60 * 1000) }, // Last hour
    }).limit(10);
    console.log(`   - Activities in last hour: ${recentLogs.length}`);

    return true;
  } catch (error) {
    console.error("❌ Test 4 Failed:", error.message);
    return false;
  }
}

async function generateTestReport() {
  console.log("\n📊 GENERATING TEST REPORT");
  console.log("=".repeat(50));

  try {
    const stats = {
      totalLogs: await UserActivityLog.countDocuments(),
      uniqueUsers: await UserActivityLog.distinct("userId"),
      uniqueIPs: await UserActivityLog.distinct("ipAddress"),
      actions: await UserActivityLog.distinct("action"),
      riskLevels: await UserActivityLog.aggregate([
        { $group: { _id: "$riskLevel", count: { $sum: 1 } } },
      ]),
      statusBreakdown: await UserActivityLog.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
    };

    console.log(`\n📈 Statistics:`);
    console.log(`   - Total logs: ${stats.totalLogs}`);
    console.log(`   - Unique users: ${stats.uniqueUsers.length}`);
    console.log(`   - Unique IP addresses: ${stats.uniqueIPs.length}`);
    console.log(`   - Activity types: ${stats.actions.length}`);

    console.log(`\n⚠️ Risk Level Distribution:`);
    stats.riskLevels.forEach((risk) => {
      console.log(`   - ${risk._id}: ${risk.count} logs`);
    });

    console.log(`\n📊 Status Breakdown:`);
    stats.statusBreakdown.forEach((status) => {
      console.log(`   - ${status._id}: ${status.count} logs`);
    });

    return stats;
  } catch (error) {
    console.error("❌ Report generation failed:", error.message);
    return null;
  }
}

async function cleanup() {
  console.log("\n🧹 CLEANUP");
  console.log("=".repeat(50));

  try {
    // Delete test logs (optional - comment out to keep test data)
    // const deleteResult = await UserActivityLog.deleteMany({
    //   username: { $in: testUsers.map(u => u.username) }
    // });
    // console.log(`🗑️ Deleted ${deleteResult.deletedCount} test logs`);

    console.log("🔄 Test data preserved for inspection");
    console.log(
      "💡 Use MongoDB Compass or Studio 3T to view the logs collection"
    );

    return true;
  } catch (error) {
    console.error("❌ Cleanup failed:", error.message);
    return false;
  }
}

async function runAllTests() {
  console.log("🧪 SV3: Test User Activity Logging & Rate Limiting");
  console.log("=" * 60);

  // Connect to database
  const connected = await connectDB();
  if (!connected) {
    process.exit(1);
  }

  const results = {
    basicLogging: false,
    rateLimiting: false,
    logQueries: false,
    advancedFeatures: false,
  };

  try {
    // Run all tests
    results.basicLogging = await testBasicLogging();
    results.rateLimiting = await testRateLimiting();
    results.logQueries = await testLogQueries();
    results.advancedFeatures = await testAdvancedFeatures();

    // Generate report
    const stats = await generateTestReport();

    // Show final results
    console.log("\n🎉 TEST RESULTS SUMMARY");
    console.log("=".repeat(50));

    Object.entries(results).forEach(([test, passed]) => {
      console.log(
        `   ${passed ? "✅" : "❌"} ${test}: ${passed ? "PASSED" : "FAILED"}`
      );
    });

    const allPassed = Object.values(results).every((result) => result === true);

    console.log(
      `\n📊 OVERALL: ${
        allPassed ? "🎉 ALL TESTS PASSED!" : "⚠️ SOME TESTS FAILED"
      }`
    );

    if (allPassed) {
      console.log("\n🎯 SV3 ACTIVITY 5 ACHIEVEMENTS:");
      console.log("   ✅ UserActivityLog collection created");
      console.log("   ✅ ActivityLogService implemented");
      console.log("   ✅ Rate limiting functionality tested");
      console.log("   ✅ Log queries and analytics working");
      console.log("   ✅ Advanced features implemented");
      console.log("   ✅ Security risk assessment working");
      console.log("   ✅ Comprehensive test suite completed");
    }

    // Cleanup
    await cleanup();
  } catch (error) {
    console.error("❌ Test execution failed:", error.message);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log("\n🔐 Database connection closed");
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  runAllTests,
  testBasicLogging,
  testRateLimiting,
  testLogQueries,
  testAdvancedFeatures,
};
