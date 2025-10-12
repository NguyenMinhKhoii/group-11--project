import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import AdminUsers from "./pages/AdminUsers";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import UploadAvatar from "./pages/UploadAvatar";

function App() {
  return (
    <div style={{ fontFamily:"Arial, sans-serif", margin:"20px" }}>
      <nav style={{ marginBottom:"20px", display:"flex", gap:"20px", borderBottom:"2px solid #eee", paddingBottom:"10px" }}>
        <Link to="/">🏠 Trang chủ</Link>
        <Link to="/profile">👤 Hồ sơ cá nhân</Link>
        <Link to="/admin">🛠 Quản lý User</Link>
        <Link to="/forgot-password">Quên mật khẩu</Link>
        <Link to="/reset-password">Đổi mật khẩu</Link>
        <Link to="/upload-avatar">Upload Avatar</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminUsers />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/upload-avatar" element={<UploadAvatar />} />
      </Routes>
    </div>
  );
}

export default App;
