/**
 * Enhanced App with Redux & Protected Routes 
 * Hoạt động 6 - Giữ giao diện cũ + thêm Redux
 */

import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from './redux/store';
import { initializeAuth, logoutUser, selectAuth } from './redux/slices/authSlice';

// Components
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

// Original Pages - commented out to use new Redux pages
// import Home from "./pages/Home";
// import Profile from "./pages/Profile";
// import AdminUsers from "./pages/AdminUsers";
// import ForgotPassword from "./pages/ForgotPassword";
// import ResetPassword from "./pages/ResetPassword";
// import UploadAvatar from "./pages/UploadAvatar";

// New Redux Pages
import LoginPage from './pages/Login/LoginPage';
import RegisterPage from './pages/Register/RegisterPage';
import ProfilePage from './pages/Profile/ProfilePage';
import AdminPage from './pages/Admin/AdminPage';
import DashboardPage from './pages/Dashboard/DashboardPage';

// App Layout with Redux
const AppLayout = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector(selectAuth);

  // Initialize auth from localStorage
  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <Router>
      <div style={{ fontFamily:"Arial, sans-serif", margin:"20px" }}>
        {/* Enhanced Navigation */}
        <nav style={{ 
        marginBottom:"20px", 
        display:"flex", 
        justifyContent: "space-between",
        alignItems: "center",
        gap:"20px", 
        borderBottom:"2px solid #eee", 
        paddingBottom:"10px" 
      }}>
        <div style={{ display: "flex", gap: "20px" }}>
          <Link to="/">🏠 Trang chủ</Link>
          <Link to="/profile">👤 Hồ sơ cá nhân</Link>
          <Link to="/admin">🛠 Quản lý User</Link>
          <Link to="/forgot-password">Quên mật khẩu</Link>
          <Link to="/reset-password">Đổi mật khẩu</Link>
          <Link to="/upload-avatar">Upload Avatar</Link>
        </div>

        {/* Redux Auth Section */}
        <div style={{ 
          display: "flex", 
          gap: "10px", 
          alignItems: "center",
          padding: "10px",
          backgroundColor: "#f8f9fa",
          borderRadius: "8px",
          border: "1px solid #ddd"
        }}>
          {isAuthenticated ? (
            <>
              <span style={{ color: "#28a745", fontWeight: "bold" }}>
                ✅ {user?.email} ({user?.role})
              </span>
              <Link 
                to="/profile-redux" 
                style={{ 
                  padding: "5px 10px", 
                  backgroundColor: "#007bff", 
                  color: "white", 
                  textDecoration: "none",
                  borderRadius: "4px",
                  fontSize: "12px"
                }}
              >
                🛡️ Protected Profile
              </Link>
              {user?.role === 'admin' && (
                <Link 
                  to="/admin-redux" 
                  style={{ 
                    padding: "5px 10px", 
                    backgroundColor: "#dc3545", 
                    color: "white", 
                    textDecoration: "none",
                    borderRadius: "4px",
                    fontSize: "12px"
                  }}
                >
                  👑 Admin Panel
                </Link>
              )}
              <button 
                onClick={handleLogout}
                style={{ 
                  padding: "5px 10px", 
                  backgroundColor: "#ffc107", 
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px"
                }}
              >
                🚪 Logout
              </button>
            </>
          ) : (
            <>
              <span style={{ color: "#dc3545" }}>❌ Not logged in</span>
              <Link 
                to="/redux-login" 
                style={{ 
                  padding: "5px 10px", 
                  backgroundColor: "#28a745", 
                  color: "white", 
                  textDecoration: "none",
                  borderRadius: "4px",
                  fontSize: "12px"
                }}
              >
                🔐 Login
              </Link>
              <Link 
                to="/redux-register" 
                style={{ 
                  padding: "5px 10px", 
                  backgroundColor: "#17a2b8", 
                  color: "white", 
                  textDecoration: "none",
                  borderRadius: "4px",
                  fontSize: "12px"
                }}
              >
                📝 Register
              </Link>
            </>
          )}
        </div>
      </nav>

      <Routes>
        {/* Main Dashboard Route */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        
        {/* New Redux Routes */}
        <Route path="/redux-login" element={<LoginPage />} />
        <Route path="/redux-register" element={<RegisterPage />} />
        
        {/* Protected Routes */}
        <Route 
          path="/profile-redux" 
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin-redux" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminPage />
            </ProtectedRoute>
          } 
        />
      </Routes>
      </div>
    </Router>
  );
};

// Main App with Redux Provider
function App() {
  return (
    <Provider store={store}>
      <AppLayout />
    </Provider>
  );
}

export default App;
