import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Profile from "./pages/Profile";

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
        <Link to="/" style={{ textDecoration: "none", color: "#007bff" }}>
          🏠 Trang chủ
        </Link>
        <Link to="/profile" style={{ textDecoration: "none", color: "#007bff" }}>
          👤 Hồ sơ cá nhân
        </Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </div>
  );
}

export default App;
