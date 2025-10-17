import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import AdminUsers from "./pages/AdminUsers";
import ShareData from "./pages/ShareData";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import UploadAvatar from "./pages/UploadAvatar";
import TestRefresh from "./pages/TestRefresh";
import LoginPage from "./features/auth/LoginPage";
import SignupPage from "./features/auth/SignupPage";
import ProtectedRoute from "./features/auth/ProtectedRoute";

function App() {
  return (
    <div style={{ fontFamily:"Arial, sans-serif", margin:"20px" }}>
      <nav style={{ marginBottom:"20px", display:"flex", gap:"20px", borderBottom:"2px solid #eee", paddingBottom:"10px" }}>
        <Link to="/">🏠 Trang chủ</Link>
        <Link to="/login">🔐 Đăng nhập</Link>
        <Link to="/signup">📝 Đăng ký</Link>
        <Link to="/profile">👤 Hồ sơ cá nhân</Link>
        <Link to="/admin">🛠 Quản lý User</Link>
        <Link to="/test-refresh">🔄 Test Refresh Token</Link>
        <Link to="/share-data">📤 Share Data</Link>
        <Link to="/forgot-password">Quên mật khẩu</Link>
        <Link to="/reset-password">Đổi mật khẩu</Link>
        <Link to="/upload-avatar">Upload Avatar</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminUsers />
            </ProtectedRoute>
          } 
        />
        <Route path="/test-refresh" element={<TestRefresh />} />
        <Route path="/share-data" element={<ShareData />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/upload-avatar" element={<UploadAvatar />} />
      </Routes>
    </div>
  );
}

export default App;
