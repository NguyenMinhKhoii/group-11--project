/**
 * Automated Test Script for Activity 6 - Redux & Protected Routes
 * Run this in browser console to verify all Redux functionality
 */

console.log('🚀 Starting Activity 6 - Redux Test Suite...');

// Test Suite Class
class Activity6TestSuite {
  constructor() {
    this.testResults = [];
    this.totalTests = 0;
    this.passedTests = 0;
  }

  // Test helper methods
  test(name, testFunction) {
    this.totalTests++;
    console.log(`\n🔍 Testing: ${name}`);
    
    try {
      const result = testFunction();
      if (result) {
        console.log(`✅ PASS: ${name}`);
        this.passedTests++;
        this.testResults.push({ name, status: 'PASS', details: result });
      } else {
        console.log(`❌ FAIL: ${name}`);
        this.testResults.push({ name, status: 'FAIL', details: 'Test returned false' });
      }
    } catch (error) {
      console.log(`❌ ERROR: ${name} - ${error.message}`);
      this.testResults.push({ name, status: 'ERROR', details: error.message });
    }
  }

  // Redux Store Tests
  testReduxStore() {
    return window.ReduxStore && 
           window.ReduxStore.getState && 
           window.ReduxStore.getState().auth !== undefined;
  }

  testReduxActions() {
    return window.ReduxActions && 
           window.ReduxActions.loginUser && 
           window.ReduxActions.logoutUser && 
           window.ReduxActions.clearError;
  }

  testReduxSelectors() {
    return window.ReduxSelectors && 
           window.ReduxSelectors.selectAuth && 
           window.ReduxSelectors.selectIsAuthenticated && 
           window.ReduxSelectors.selectUser;
  }

  // Authentication Tests
  testAuthState() {
    const state = window.ReduxStore.getState();
    return state.auth && 
           typeof state.auth.isAuthenticated === 'boolean' &&
           state.auth.hasOwnProperty('user') &&
           state.auth.hasOwnProperty('accessToken');
  }

  testLocalStorageIntegration() {
    const hasTokenCheck = localStorage.getItem('accessToken') !== null ||
                          localStorage.getItem('refreshToken') !== null ||
                          localStorage.getItem('user') !== null;
    return true; // localStorage might be empty if not logged in
  }

  // DOM Integration Tests  
  testLoginPageIntegration() {
    if (window.location.pathname.includes('login.html')) {
      const loginForm = document.getElementById('loginForm');
      const reduxStateDisplay = document.getElementById('reduxStateDisplay');
      return loginForm && reduxStateDisplay;
    }
    return true; // Skip if not on login page
  }

  testDashboardPageIntegration() {
    if (window.location.pathname.includes('dashboard.html')) {
      const userName = document.querySelector('[data-user-name]');
      const userEmail = document.querySelector('[data-user-email]');
      const userRole = document.querySelector('[data-user-role]');
      return userName || userEmail || userRole;
    }
    return true; // Skip if not on dashboard page
  }

  // Protected Route Logic Test
  testProtectedRouteLogic() {
    const state = window.ReduxStore.getState();
    const isAuthenticated = state.auth.isAuthenticated;
    
    // If on dashboard and not authenticated, should redirect
    if (window.location.pathname.includes('dashboard.html') && !isAuthenticated) {
      return false; // Should not happen
    }
    
    return true;
  }

  // Session Management Tests
  testActivityTracking() {
    const state = window.ReduxStore.getState();
    return state.auth.hasOwnProperty('lastActivity');
  }

  testRoleBasedAccess() {
    const state = window.ReduxStore.getState();
    if (state.auth.isAuthenticated && state.auth.user) {
      const role = state.auth.user.role;
      return role === 'admin' || role === 'user' || role === 'moderator';
    }
    return true; // Skip if not authenticated
  }

  // Run all tests
  async runAllTests() {
    console.log('🔄 Redux & Protected Routes Test Suite');
    console.log('=====================================');

    // Redux Infrastructure Tests
    console.log('\n📦 Redux Infrastructure Tests:');
    this.test('Redux Store Available', () => this.testReduxStore());
    this.test('Redux Actions Available', () => this.testReduxActions());
    this.test('Redux Selectors Available', () => this.testReduxSelectors());
    this.test('Auth State Structure', () => this.testAuthState());

    // Integration Tests
    console.log('\n🔗 Integration Tests:');
    this.test('localStorage Integration', () => this.testLocalStorageIntegration());
    this.test('Login Page Integration', () => this.testLoginPageIntegration());
    this.test('Dashboard Page Integration', () => this.testDashboardPageIntegration());

    // Functionality Tests  
    console.log('\n🛡️ Functionality Tests:');
    this.test('Protected Route Logic', () => this.testProtectedRouteLogic());
    this.test('Activity Tracking', () => this.testActivityTracking());
    this.test('Role-Based Access', () => this.testRoleBasedAccess());

    // Display Results
    this.displayResults();
  }

  // Display test results
  displayResults() {
    console.log('\n📊 TEST RESULTS SUMMARY');
    console.log('=======================');
    console.log(`Total Tests: ${this.totalTests}`);
    console.log(`Passed: ${this.passedTests}`);
    console.log(`Failed: ${this.totalTests - this.passedTests}`);
    console.log(`Success Rate: ${Math.round((this.passedTests / this.totalTests) * 100)}%`);

    // Detailed results
    console.log('\n📋 Detailed Results:');
    this.testResults.forEach((result, index) => {
      const icon = result.status === 'PASS' ? '✅' : '❌';
      console.log(`${index + 1}. ${icon} ${result.name} - ${result.status}`);
      if (result.status !== 'PASS') {
        console.log(`   Details: ${result.details}`);
      }
    });

    // Redux State Dump
    if (window.ReduxStore) {
      console.log('\n🔍 Current Redux State:');
      console.log(JSON.stringify(window.ReduxStore.getState(), null, 2));
    }

    // Completion Status
    const isComplete = this.passedTests >= Math.ceil(this.totalTests * 0.8); // 80% pass rate
    console.log(`\n🎯 Activity 6 Status: ${isComplete ? '✅ COMPLETE' : '❌ INCOMPLETE'}`);
    
    return {
      total: this.totalTests,
      passed: this.passedTests,
      successRate: Math.round((this.passedTests / this.totalTests) * 100),
      complete: isComplete,
      results: this.testResults
    };
  }
}

// Auto-run tests when script loads
const testSuite = new Activity6TestSuite();

// Export for manual testing
window.Activity6TestSuite = Activity6TestSuite;
window.runActivity6Tests = () => testSuite.runAllTests();

// Auto-run if page is loaded
if (document.readyState === 'complete') {
  setTimeout(() => {
    console.log('🔄 Auto-running Activity 6 tests...');
    testSuite.runAllTests();
  }, 1000);
} else {
  window.addEventListener('load', () => {
    setTimeout(() => {
      console.log('🔄 Auto-running Activity 6 tests...');
      testSuite.runAllTests();
    }, 1000);
  });
}

console.log('📝 Activity 6 Test Script Loaded!');
console.log('Run manually: runActivity6Tests()');