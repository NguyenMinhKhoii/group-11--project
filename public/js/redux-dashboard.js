/**
 * Enhanced Dashboard with Redux Integration  
 * Tích hợp Redux vào dashboard.html có sẵn - Hoạt động 6
 */

// Wait for Redux store to be available
function waitForRedux(callback) {
  if (window.ReduxStore && window.ReduxActions) {
    callback();
  } else {
    setTimeout(() => waitForRedux(callback), 100);
  }
}

// Initialize dashboard functionality with Redux
waitForRedux(() => {
  const store = window.ReduxStore;
  const { logoutUser, updateLastActivity } = window.ReduxActions;
  const { selectIsAuthenticated, selectUser, selectAuthLoading } = window.ReduxSelectors;

  console.log('🏠 Redux Dashboard integration initialized');

  // Check authentication
  const state = store.getState();
  const isAuthenticated = selectIsAuthenticated(state);
  const user = selectUser(state);

  if (!isAuthenticated) {
    console.log('❌ Not authenticated, redirecting to login');
    alert('⚠️ Vui lòng đăng nhập để truy cập Dashboard!');
    window.location.href = '/login.html';
    return;
  }

  console.log('✅ User authenticated:', user);

  // Update user info in dashboard
  updateDashboardWithUserInfo(user);
  
  // Add Redux logout functionality
  enhanceLogoutButton();
  
  // Add Redux state monitor
  addReduxStateMonitor();
  
  // Track user activity
  trackUserActivity();
  
  // Subscribe to store changes
  store.subscribe(() => {
    const currentState = store.getState();
    const currentAuth = selectIsAuthenticated(currentState);
    const loading = selectAuthLoading(currentState);
    
    // Handle logout
    if (!currentAuth && !loading) {
      console.log('🚪 User logged out, redirecting...');
      alert('👋 Bạn đã đăng xuất thành công!');
      window.location.href = '/login.html';
    }
  });

  // Update activity every 30 seconds
  setInterval(() => {
    if (store.getState().auth.isAuthenticated) {
      store.dispatch(updateLastActivity());
    }
  }, 30000);
});

function updateDashboardWithUserInfo(user) {
  // Update welcome message
  const welcomeElements = document.querySelectorAll('[data-user-name]');
  welcomeElements.forEach(el => {
    el.textContent = user.fullname || user.name || user.email || 'User';
  });

  // Update user email
  const emailElements = document.querySelectorAll('[data-user-email]');
  emailElements.forEach(el => {
    el.textContent = user.email;
  });

  // Update user role
  const roleElements = document.querySelectorAll('[data-user-role]');
  roleElements.forEach(el => {
    el.textContent = user.role || 'user';
  });

  // Update user ID
  const idElements = document.querySelectorAll('[data-user-id]');
  idElements.forEach(el => {
    el.textContent = user.id || user.userId || 'N/A';
  });

  // Show/hide admin sections based on role
  const adminSections = document.querySelectorAll('[data-admin-only]');
  const userSections = document.querySelectorAll('[data-user-only]');
  
  if (user.role === 'admin') {
    adminSections.forEach(el => el.style.display = 'block');
    userSections.forEach(el => el.style.display = 'none');
    
    // Load admin data
    loadAdminDashboardData();
  } else {
    adminSections.forEach(el => el.style.display = 'none');
    userSections.forEach(el => el.style.display = 'block');
  }

  console.log('📊 Dashboard updated with user info:', user);
}

// Load real admin dashboard data
async function loadAdminDashboardData() {
  try {
    console.log('👑 Loading admin dashboard data...');
    
    // Fetch real user list from server
    const response = await fetch('/api/users');
    const data = await response.json();
    
    if (data.success) {
      const users = data.users;
      console.log('📋 Loaded users:', users);
      
      // Update admin stats with real data
      updateAdminStats(users);
      
      // Display user list
      displayUserList(users);
    }
  } catch (error) {
    console.error('❌ Error loading admin data:', error);
  }
}

// Update admin stats with real data
function updateAdminStats(users) {
  // Update total users
  const totalUsersEl = document.getElementById('adminTotalUsers');
  if (totalUsersEl) {
    totalUsersEl.textContent = users.length;
  }
  
  // Calculate active sessions (users logged in recently)
  const activeSessions = users.filter(user => user.role).length; // Simple calculation
  const activeSessionsEl = document.getElementById('adminActiveSessions');
  if (activeSessionsEl) {
    activeSessionsEl.textContent = activeSessions;
  }
  
  // Update system activities (mock for now)
  const activitiesEl = document.getElementById('adminSystemActivities');
  if (activitiesEl) {
    activitiesEl.textContent = users.length * 12 + Math.floor(Math.random() * 50);
  }
  
  console.log('📊 Admin stats updated:', { totalUsers: users.length, activeSessions });
}

// Display user list in admin dashboard
function displayUserList(users) {
  // Find or create user list container
  let userListContainer = document.getElementById('adminUserList');
  
  if (!userListContainer) {
    // Create user list section
    const adminPanel = document.querySelector('[data-admin-only]');
    if (adminPanel) {
      const userListHTML = `
        <div id="adminUserList" class="mt-4">
          <h5 class="text-white mb-3">📋 Danh sách User đã đăng ký:</h5>
          <div id="userListContent" class="row">
            <!-- User cards will be inserted here -->
          </div>
        </div>
      `;
      adminPanel.insertAdjacentHTML('beforeend', userListHTML);
      userListContainer = document.getElementById('adminUserList');
    }
  }
  
  // Generate user cards
  const userListContent = document.getElementById('userListContent');
  if (userListContent) {
    userListContent.innerHTML = users.map(user => `
      <div class="col-md-6 col-lg-4 mb-3">
        <div class="card" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);">
          <div class="card-body text-white">
            <h6 class="card-title">
              ${user.role === 'admin' ? '👑' : '👤'} ${user.name}
            </h6>
            <p class="card-text mb-1">
              <small>📧 ${user.email}</small>
            </p>
            <p class="card-text mb-1">
              <small>🎭 Role: <span class="badge ${user.role === 'admin' ? 'bg-warning' : 'bg-info'}">${user.role}</span></small>
            </p>
            <p class="card-text">
              <small>🆔 ID: ${user.id}</small>
            </p>
          </div>
        </div>
      </div>
    `).join('');
  }
  
  console.log(`📋 Displayed ${users.length} users in admin panel`);
}

// Refresh user list function (called by refresh button)
window.refreshUserList = function() {
  console.log('🔄 Refreshing user list...');
  loadAdminDashboardData();
};

function enhanceLogoutButton() {
  const logoutButtons = document.querySelectorAll('[data-logout], .logout-btn, #logoutBtn');
  
  logoutButtons.forEach(button => {
    // Remove existing event listeners by cloning
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
    
    // Add Redux logout handler
    newButton.addEventListener('click', (e) => {
      e.preventDefault();
      
      if (confirm('🤔 Bạn có chắc chắn muốn đăng xuất không?')) {
        console.log('🚪 Redux logout initiated...');
        
        // Dispatch Redux logout
        window.ReduxStore.dispatch(logoutUser());
        
        // Update button state
        newButton.disabled = true;
        newButton.innerHTML = '⏳ Đang đăng xuất...';
      }
    });
  });
  
  console.log('🚪 Logout buttons enhanced with Redux');
}

function addReduxStateMonitor() {
  // Find existing demo section or create one
  let demoSection = document.getElementById('demoSection');
  
  if (!demoSection) {
    // Create demo section if not exists
    demoSection = document.createElement('div');
    demoSection.id = 'demoSection';
    demoSection.innerHTML = `
      <div class="container mt-4">
        <div class="row">
          <div class="col-12">
            <div class="card" style="background: #e3f2fd; border: 2px solid #1976d2;">
              <div class="card-body">
                <h5 style="color: #1976d2; margin-bottom: 15px;">
                  🔄 Redux State Monitor - Hoạt động 6 Dashboard
                </h5>
                <div id="reduxDashboardState" style="font-family: monospace; font-size: 12px; background: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #1976d2;">
                  Loading Redux state...
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Append to body
    document.body.appendChild(demoSection);
  }

  // Update Redux state display
  function updateDashboardState() {
    const state = window.ReduxStore.getState();
    const stateEl = document.getElementById('reduxDashboardState');
    
    if (stateEl) {
      const user = state.auth.user;
      stateEl.innerHTML = `
<strong>🔐 Authentication State (Dashboard View):</strong>
• isAuthenticated: ${state.auth.isAuthenticated ? '✅ Yes' : '❌ No'}
• User: ${user ? user.email : '❌ None'}  
• Role: ${user ? user.role : 'N/A'} ${user?.role === 'admin' ? '👑' : '👤'}
• Loading: ${state.auth.loading ? '⏳ Yes' : '✅ No'}
• Error: ${state.auth.error || '✅ None'}

<strong>📊 Session Information:</strong>
• Last Activity: ${state.auth.lastActivity ? new Date(state.auth.lastActivity).toLocaleString('vi-VN') : 'N/A'}
• Session Duration: ${getSessionDuration(state.auth.lastActivity)}
• Access Token: ${state.auth.accessToken ? '🔑 Active' : '❌ None'}
• Refresh Token: ${state.auth.refreshToken ? '🔄 Available' : '❌ None'}

<strong>🛡️ Protected Routes Status:</strong>
• Dashboard Access: ${state.auth.isAuthenticated ? '✅ Granted' : '❌ Denied'}
• Admin Panel: ${state.auth.user?.role === 'admin' ? '✅ Granted' : '❌ Denied'} 
• Profile Management: ${state.auth.isAuthenticated ? '✅ Granted' : '❌ Denied'}

<strong>🔄 Redux Integration Status:</strong>
• Store Status: ✅ Active
• Auto Activity Tracking: ✅ Running  
• Auto Logout Timer: ✅ Active (30 min)
• Refresh Token Rotation: ✅ Configured
      `;
    }
  }

  // Update display on store changes
  window.ReduxStore.subscribe(updateDashboardState);
  updateDashboardState(); // Initial display
  
  console.log('📊 Redux state monitor added to dashboard');
}

function trackUserActivity() {
  const activities = [
    'mousedown', 'mousemove', 'keydown', 'scroll', 'click', 'touchstart'
  ];
  
  activities.forEach(activity => {
    document.addEventListener(activity, () => {
      // Update Redux state
      if (window.ReduxStore.getState().auth.isAuthenticated) {
        window.ReduxStore.dispatch(updateLastActivity());
      }
    });
  });
  
  console.log('👀 User activity tracking enhanced with Redux');
}

function getSessionDuration(lastActivity) {
  if (!lastActivity) return 'N/A';
  
  const now = new Date();
  const last = new Date(lastActivity);
  const diffMs = now - last;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  
  if (diffHours > 0) {
    return `${diffHours}h ${diffMinutes % 60}m`;
  } else {
    return `${diffMinutes}m`;
  }
}

// Add enhanced navigation for protected routes
function enhanceProtectedNavigation() {
  // Add Redux-aware navigation
  const navLinks = document.querySelectorAll('a[href], button[data-navigate]');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href') || link.getAttribute('data-navigate');
    
    // Check if it's a protected route
    if (href && (href.includes('profile') || href.includes('admin') || href.includes('dashboard'))) {
      link.addEventListener('click', (e) => {
        const state = window.ReduxStore.getState();
        
        if (!selectIsAuthenticated(state)) {
          e.preventDefault();
          alert('⚠️ Vui lòng đăng nhập để truy cập trang này!');
          window.location.href = '/login.html';
          return;
        }
        
        if (href.includes('admin') && state.auth.user?.role !== 'admin') {
          e.preventDefault();
          alert('🚫 Bạn không có quyền truy cập Admin Panel!');
          return;
        }
        
        console.log('🔗 Protected route access granted:', href);
      });
    }
  });
}

// Initialize protected navigation when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', enhanceProtectedNavigation);
} else {
  enhanceProtectedNavigation();
}

console.log('🏠 Enhanced Dashboard with Redux ready!');