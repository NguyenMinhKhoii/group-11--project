// API Testing for Redux Support - SV3 Activity 6
const mongoose = require('mongoose');
const axios = require('axios');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

// API Base URL
const API_BASE = 'http://localhost:5000/api';

// Test data
const testUser = {
  username: 'redux_test_user',
  name: 'Redux Test User',
  email: 'redux.test@example.com',
  password: 'testpassword123',
  role: 'user'
};

const adminUser = {
  username: 'redux_admin',
  name: 'Redux Admin User', 
  email: 'redux.admin@example.com',
  password: 'adminpassword123',
  role: 'admin'
};

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/group11project');
    console.log('✅ MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    return false;
  }
}

async function setupTestUsers() {
  console.log('\n🔧 Setting up test users...');
  
  try {
    // Delete existing test users
    await User.deleteMany({ 
      email: { $in: [testUser.email, adminUser.email] } 
    });

    // Create test users
    const hashedPassword = require('bcryptjs').hashSync('testpassword123', 10);
    const hashedAdminPassword = require('bcryptjs').hashSync('adminpassword123', 10);

    await User.create([
      {
        ...testUser,
        password: hashedPassword,
        isActive: true
      },
      {
        ...adminUser,
        password: hashedAdminPassword,
        isActive: true
      }
    ]);

    console.log('✅ Test users created successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to setup test users:', error.message);
    return false;
  }
}

async function testAuthAPI() {
  console.log('\n🧪 TESTING AUTH API FOR REDUX');
  console.log('='.repeat(60));

  const results = {
    signup: false,
    login: false,
    verifyToken: false,
    getCurrentUser: false,
    updateProfile: false,
    changePassword: false,
    logout: false
  };

  let userToken = null;
  let adminToken = null;

  try {
    // Test 1: Login
    console.log('\n1️⃣ Testing Login API...');
    
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });

    if (loginResponse.data.success && loginResponse.data.token) {
      userToken = loginResponse.data.token;
      console.log('✅ Login successful');
      console.log(`   - Token received: ${userToken.substring(0, 20)}...`);
      console.log(`   - User data:`, {
        id: loginResponse.data.user.id,
        username: loginResponse.data.user.username,
        email: loginResponse.data.user.email,
        role: loginResponse.data.user.role
      });
      results.login = true;
    } else {
      console.log('❌ Login failed - no token received');
    }

    // Test admin login
    const adminLoginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: adminUser.email,
      password: adminUser.password
    });

    if (adminLoginResponse.data.success) {
      adminToken = adminLoginResponse.data.token;
      console.log('✅ Admin login successful');
    }

    // Test 2: Verify Token
    console.log('\n2️⃣ Testing Token Verification...');
    
    if (userToken) {
      const verifyResponse = await axios.get(`${API_BASE}/auth/verify`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });

      if (verifyResponse.data.success && verifyResponse.data.user) {
        console.log('✅ Token verification successful');
        console.log(`   - User verified:`, {
          id: verifyResponse.data.user.id,
          username: verifyResponse.data.user.username,
          role: verifyResponse.data.user.role
        });
        results.verifyToken = true;
      } else {
        console.log('❌ Token verification failed');
      }
    }

    // Test 3: Get Current User
    console.log('\n3️⃣ Testing Get Current User...');
    
    if (userToken) {
      const getCurrentUserResponse = await axios.get(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });

      if (getCurrentUserResponse.data.success && getCurrentUserResponse.data.user) {
        console.log('✅ Get current user successful');
        console.log(`   - User data:`, getCurrentUserResponse.data.user);
        results.getCurrentUser = true;
      } else {
        console.log('❌ Get current user failed');
      }
    }

    // Test 4: Update Profile
    console.log('\n4️⃣ Testing Update Profile...');
    
    if (userToken) {
      const updateData = {
        name: 'Redux Test User Updated',
        bio: 'Updated bio for Redux testing',
        phone: '+84123456789',
        address: 'Ho Chi Minh City, Vietnam'
      };

      const updateResponse = await axios.put(`${API_BASE}/auth/profile`, updateData, {
        headers: { Authorization: `Bearer ${userToken}` }
      });

      if (updateResponse.data.success && updateResponse.data.user) {
        console.log('✅ Profile update successful');
        console.log(`   - Updated user:`, {
          name: updateResponse.data.user.name,
          profile: updateResponse.data.user.profile
        });
        results.updateProfile = true;
      } else {
        console.log('❌ Profile update failed');
      }
    }

    // Test 5: Change Password
    console.log('\n5️⃣ Testing Change Password...');
    
    if (userToken) {
      const changePasswordResponse = await axios.put(`${API_BASE}/auth/change-password`, {
        currentPassword: testUser.password,
        newPassword: 'newpassword123'
      }, {
        headers: { Authorization: `Bearer ${userToken}` }
      });

      if (changePasswordResponse.data.success) {
        console.log('✅ Password change successful');
        results.changePassword = true;

        // Test login with new password
        const newLoginResponse = await axios.post(`${API_BASE}/auth/login`, {
          email: testUser.email,
          password: 'newpassword123'
        });

        if (newLoginResponse.data.success) {
          console.log('✅ Login with new password successful');
          userToken = newLoginResponse.data.token; // Update token
        }
      } else {
        console.log('❌ Password change failed');
      }
    }

    // Test 6: Logout
    console.log('\n6️⃣ Testing Logout...');
    
    if (userToken) {
      const logoutResponse = await axios.post(`${API_BASE}/auth/logout`, {}, {
        headers: { Authorization: `Bearer ${userToken}` }
      });

      if (logoutResponse.data.success) {
        console.log('✅ Logout successful');
        results.logout = true;
      } else {
        console.log('❌ Logout failed');
      }
    }

    return results;

  } catch (error) {
    console.error('❌ API Test Error:', error.response?.data || error.message);
    return results;
  }
}

async function testProtectedRoutes() {
  console.log('\n🔐 TESTING PROTECTED ROUTES');
  console.log('='.repeat(60));

  try {
    // Test without token
    console.log('\n1️⃣ Testing access without token...');
    
    try {
      await axios.get(`${API_BASE}/auth/me`);
      console.log('❌ Should have been blocked!');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly blocked unauthorized access');
      } else {
        console.log('❌ Unexpected error:', error.response?.status);
      }
    }

    // Test with invalid token
    console.log('\n2️⃣ Testing access with invalid token...');
    
    try {
      await axios.get(`${API_BASE}/auth/me`, {
        headers: { Authorization: 'Bearer invalid_token_here' }
      });
      console.log('❌ Should have been blocked!');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly blocked invalid token');
      } else {
        console.log('❌ Unexpected error:', error.response?.status);
      }
    }

    // Test activity logs API
    console.log('\n3️⃣ Testing Activity Logs API...');
    
    // Login as admin for logs access
    const adminLoginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: adminUser.email,
      password: adminUser.password
    });

    if (adminLoginResponse.data.success) {
      const adminToken = adminLoginResponse.data.token;
      
      // Test analytics endpoint
      const analyticsResponse = await axios.get(`${API_BASE}/logs/analytics`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      if (analyticsResponse.data.success) {
        console.log('✅ Admin can access analytics');
        console.log(`   - Found ${analyticsResponse.data.data.length} analytics entries`);
      }

      // Test dashboard endpoint
      const dashboardResponse = await axios.get(`${API_BASE}/logs/dashboard`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      if (dashboardResponse.data.success) {
        console.log('✅ Admin can access dashboard');
        console.log(`   - Dashboard data:`, {
          totalActivities: dashboardResponse.data.data.summary.totalActivities,
          uniqueUsers: dashboardResponse.data.data.summary.uniqueUsers,
          uniqueIPs: dashboardResponse.data.data.summary.uniqueIPs
        });
      }
    }

    return true;
  } catch (error) {
    console.error('❌ Protected Routes Test Error:', error.response?.data || error.message);
    return false;
  }
}

async function testRateLimiting() {
  console.log('\n⚡ TESTING RATE LIMITING');
  console.log('='.repeat(60));

  try {
    console.log('Attempting multiple rapid login requests...');
    
    const promises = [];
    for (let i = 0; i < 10; i++) {
      promises.push(
        axios.post(`${API_BASE}/auth/login`, {
          email: 'nonexistent@example.com',
          password: 'wrongpassword'
        }).catch(error => ({ error: error.response }))
      );
    }

    const results = await Promise.all(promises);
    
    let rateLimited = false;
    results.forEach((result, index) => {
      if (result.error?.status === 429) {
        console.log(`✅ Request ${index + 1}: Rate limited (429)`);
        rateLimited = true;
      } else if (result.error?.status === 401) {
        console.log(`📝 Request ${index + 1}: Failed login (401)`);
      } else {
        console.log(`❓ Request ${index + 1}: Unexpected result`);
      }
    });

    if (rateLimited) {
      console.log('✅ Rate limiting is working correctly');
      return true;
    } else {
      console.log('⚠️ Rate limiting might not be working as expected');
      return false;
    }

  } catch (error) {
    console.error('❌ Rate Limiting Test Error:', error.message);
    return false;
  }
}

async function runReduxAPITests() {
  console.log('🧪 SV3: Redux & Protected Routes API Testing');
  console.log('='.repeat(70));

  // Connect to database
  const connected = await connectDB();
  if (!connected) {
    process.exit(1);
  }

  // Setup test users
  const usersSetup = await setupTestUsers();
  if (!usersSetup) {
    console.log('❌ Failed to setup test users');
    process.exit(1);
  }

  const testResults = {
    authAPI: null,
    protectedRoutes: false,
    rateLimiting: false
  };

  try {
    // Test auth API
    testResults.authAPI = await testAuthAPI();
    
    // Test protected routes
    testResults.protectedRoutes = await testProtectedRoutes();
    
    // Test rate limiting
    testResults.rateLimiting = await testRateLimiting();

    // Final results
    console.log('\n🎉 REDUX API TEST RESULTS');
    console.log('='.repeat(60));

    // Auth API results
    console.log('\n📋 Auth API Tests:');
    Object.entries(testResults.authAPI).forEach(([test, passed]) => {
      const status = passed ? '✅ PASSED' : '❌ FAILED';
      console.log(`   ${status} - ${test}`);
    });

    // Other tests
    console.log('\n🔐 Protected Routes:', testResults.protectedRoutes ? '✅ PASSED' : '❌ FAILED');
    console.log('⚡ Rate Limiting:', testResults.rateLimiting ? '✅ PASSED' : '❌ FAILED');

    const authPassed = Object.values(testResults.authAPI).every(result => result === true);
    const allPassed = authPassed && testResults.protectedRoutes && testResults.rateLimiting;

    console.log(`\n📊 OVERALL RESULT: ${allPassed ? '🎉 ALL TESTS PASSED!' : '⚠️ SOME TESTS FAILED'}`);

    if (allPassed) {
      console.log('\n🎯 SV3 ACTIVITY 6 - BACKEND API READY FOR REDUX:');
      console.log('   ✅ Enhanced auth endpoints implemented');
      console.log('   ✅ Token verification working');
      console.log('   ✅ User data APIs ready for Redux state');
      console.log('   ✅ Protected routes properly secured');
      console.log('   ✅ Rate limiting active');
      console.log('   ✅ Activity logging integrated');
      console.log('   ✅ Ready for frontend Redux integration');
    }

  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n🔐 Database connection closed');
  }
}

// Helper function to start server for testing
async function startTestServer() {
  console.log('🚀 Starting test server...');
  
  // This would typically start your Express server
  // For now, we assume the server is already running
  console.log('💡 Make sure your server is running on http://localhost:5000');
  
  // Wait a bit for server to be ready
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  try {
    const response = await axios.get(`${API_BASE}/auth/verify`, {
      headers: { Authorization: 'Bearer test' }
    });
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Server is not running! Please start the server first:');
      console.log('   cd backend && npm run dev');
      process.exit(1);
    }
    // 401 is expected for invalid token, means server is running
  }
  
  console.log('✅ Server is running and ready for testing');
}

// Run tests if this file is executed directly
if (require.main === module) {
  startTestServer()
    .then(() => runReduxAPITests())
    .catch(console.error);
}

module.exports = {
  runReduxAPITests,
  testAuthAPI,
  testProtectedRoutes,
  testRateLimiting
};
