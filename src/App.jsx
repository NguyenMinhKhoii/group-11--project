import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import AdminUsers from "./pages/AdminUsers";

function App() {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", margin: "20px" }}>
      <nav
        style={{
          marginBottom: "20px",
          display: "flex",
          gap: "20px",
          borderBottom: "2px solid #eee",
          paddingBottom: "10px",
        }}
      >
        <Link to="/" style={{ textDecoration: "none", color: "#007bff" }}>🏠 Trang chủ</Link>
        <Link to="/profile" style={{ textDecoration: "none", color: "#007bff" }}>👤 Hồ sơ cá nhân</Link>
        <Link to="/admin" style={{ textDecoration: "none", color: "#007bff" }}>🛠 Quản lý User</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminUsers />} />
      </Routes>
    </div>
  );
}

export default App;
