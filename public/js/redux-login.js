/**
 * Enhanced Login with Redux Integration
 * Tích hợp Redux vào login.html có sẵn - Hoạt động 6
 */

// Wait for Redux store to be available
function waitForRedux(callback) {
  if (window.ReduxStore && window.ReduxActions) {
    callback();
  } else {
    setTimeout(() => waitForRedux(callback), 100);
  }
}

// Initialize login functionality with Redux
waitForRedux(() => {
  const store = window.ReduxStore;
  const { loginUser, clearError } = window.ReduxActions;
  const { selectAuthLoading, selectAuthError, selectIsAuthenticated } = window.ReduxSelectors;

  console.log('🔐 Redux Login integration initialized');

  // Subscribe to store changes
  store.subscribe(() => {
    const state = store.getState();
    const isAuthenticated = selectIsAuthenticated(state);
    const loading = selectAuthLoading(state);
    const error = selectAuthError(state);

    // Handle authentication success
    if (isAuthenticated) {
      console.log('✅ Login successful, redirecting to dashboard');
      showAlert('success', '🎉 Đăng nhập thành công! Đang chuyển hướng...');
      setTimeout(() => {
        window.location.href = '/dashboard.html';
      }, 1000);
    }

    // Handle loading state
    const submitButton = document.querySelector('#loginForm button[type="submit"]');
    if (submitButton) {
      if (loading) {
        submitButton.disabled = true;
        submitButton.innerHTML = '⏳ Đang đăng nhập...';
      } else {
        submitButton.disabled = false;
        submitButton.innerHTML = '🚀 Đăng nhập';
      }
    }

    // Handle errors
    if (error) {
      showAlert('error', `❌ Lỗi: ${error}`);
      // Clear error after showing
      setTimeout(() => {
        store.dispatch(clearError());
      }, 100);
    }
  });

  // Enhanced login form handler
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      // Clear previous alerts
      clearAlerts();

      // Validation
      if (!email || !password) {
        showAlert('error', '⚠️ Vui lòng nhập đầy đủ email và mật khẩu!');
        return;
      }

      if (!isValidEmail(email)) {
        showAlert('error', '⚠️ Email không hợp lệ!');
        return;
      }

      console.log('🔄 Dispatching Redux login action...');
      
      // Dispatch Redux login action
      store.dispatch(loginUser({ email, password }));
    });
  }

  // Demo Redux functionality
  const demoSection = document.getElementById('demoSection');
  if (demoSection) {
    // Add Redux state display
    const stateDisplay = document.createElement('div');
    stateDisplay.innerHTML = `
      <div class="mt-4 p-3" style="background: #f8f9fa; border-radius: 10px; border: 2px solid #007bff;">
        <h6 style="color: #007bff; margin-bottom: 15px;">
          🔄 Redux State Monitor (Hoạt động 6)
        </h6>
        <div id="reduxStateDisplay" style="font-family: monospace; font-size: 12px; background: #e9ecef; padding: 10px; border-radius: 5px;">
          Loading Redux state...
        </div>
      </div>
    `;
    demoSection.appendChild(stateDisplay);

    // Update Redux state display
    function updateStateDisplay() {
      const state = store.getState();
      const stateEl = document.getElementById('reduxStateDisplay');
      if (stateEl) {
        stateEl.innerHTML = `
<strong>Authentication State:</strong>
• isAuthenticated: ${state.auth.isAuthenticated}
• user: ${state.auth.user ? state.auth.user.email : 'null'}
• loading: ${state.auth.loading}
• error: ${state.auth.error || 'null'}
• lastActivity: ${state.auth.lastActivity || 'null'}

<strong>Tokens:</strong>
• accessToken: ${state.auth.accessToken ? 'Present ✅' : 'None ❌'}
• refreshToken: ${state.auth.refreshToken ? 'Present ✅' : 'None ❌'}
        `;
      }
    }

    // Update display on store changes
    store.subscribe(updateStateDisplay);
    updateStateDisplay(); // Initial display
  }

  // Check if already authenticated
  const currentState = store.getState();
  if (selectIsAuthenticated(currentState)) {
    console.log('👤 User already authenticated, redirecting...');
    showAlert('info', '✅ Bạn đã đăng nhập rồi! Đang chuyển hướng...');
    setTimeout(() => {
      window.location.href = '/dashboard.html';
    }, 1500);
  }
});

// Helper functions (keep existing ones and enhance)
function showAlert(type, message) {
  const alertContainer = document.getElementById('alertContainer') || createAlertContainer();
  
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${getBootstrapAlertClass(type)} alert-dismissible fade show`;
  alertDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  
  alertContainer.appendChild(alertDiv);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (alertDiv.parentNode) {
      alertDiv.remove();
    }
  }, 5000);
}

function createAlertContainer() {
  let container = document.getElementById('alertContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'alertContainer';
    container.style.position = 'fixed';
    container.style.top = '20px';
    container.style.right = '20px';
    container.style.zIndex = '9999';
    container.style.maxWidth = '400px';
    document.body.appendChild(container);
  }
  return container;
}

function getBootstrapAlertClass(type) {
  const typeMap = {
    'success': 'success',
    'error': 'danger', 
    'warning': 'warning',
    'info': 'info'
  };
  return typeMap[type] || 'info';
}

function clearAlerts() {
  const container = document.getElementById('alertContainer');
  if (container) {
    container.innerHTML = '';
  }
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

console.log('🔐 Enhanced login with Redux ready!');