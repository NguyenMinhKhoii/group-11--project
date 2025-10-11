import React, { useState } from "react";
import SignupForm from "./components/SignupForm";
import LoginForm from "./components/LoginForm";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [message, setMessage] = useState("");

  const handleLogin = (jwt) => {
    localStorage.setItem("token", jwt);
    setToken(jwt);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
    setMessage("Đăng xuất thành công!");
  };

  return (
    <div style={{ padding: 20 }}>
      {!token && (
        <>
          <SignupForm onMessage={setMessage} />
          <LoginForm onLogin={handleLogin} onMessage={setMessage} />
        </>
      )}

      {token && (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <p>JWT Token: {token}</p>
          <button onClick={handleLogout} style={{ padding: "10px 20px", cursor: "pointer" }}>Đăng xuất</button>
        </div>
      )}

      {message && <p style={{ textAlign: "center", marginTop: "20px" }}>{message}</p>}
    </div>
  );
}

export default App;
