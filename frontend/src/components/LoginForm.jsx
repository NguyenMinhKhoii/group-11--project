import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, clearAuthError } from "../features/auth/authSlice";

export default function LoginForm({ onLogin, onMessage }) {
  const dispatch = useDispatch();
  const { isLoginLoading, loginError } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear errors khi user thay đổi input
    if (loginError) {
      dispatch(clearAuthError());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const result = await dispatch(loginUser(formData));
    
    if (loginUser.fulfilled.match(result)) {
      onMessage && onMessage("Đăng nhập thành công!");
      onLogin && onLogin(result.payload.data.accessToken);
      setFormData({ email: "", password: "" });
    } else {
      onMessage && onMessage(result.payload || "Đăng nhập thất bại!");
    }
  };

  return (
    <div style={styles.container}>
      <h2>Đăng nhập</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input 
          type="email" 
          name="email" 
          placeholder="Email" 
          value={formData.email} 
          onChange={handleChange} 
          required 
          style={styles.input} 
          disabled={isLoginLoading}
        />
        <input 
          type="password" 
          name="password" 
          placeholder="Mật khẩu" 
          value={formData.password} 
          onChange={handleChange} 
          required 
          style={styles.input}
          disabled={isLoginLoading}
        />
        <button 
          type="submit" 
          style={{...styles.button, opacity: isLoginLoading ? 0.6 : 1}}
          disabled={isLoginLoading}
        >
          {isLoginLoading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
        {loginError && (
          <div style={styles.error}>{loginError}</div>
        )}
      </form>
    </div>
  );
}

const styles = {
  container: { textAlign: "center", marginTop: "20px" },
  form: { display: "inline-block", flexDirection: "column" },
  input: { display: "block", margin: "10px auto", padding: "10px", width: "250px" },
  button: { padding: "10px 20px", background: "#28a745", color: "#fff", border: "none", cursor: "pointer" },
  error: { color: "red", marginTop: "10px", fontSize: "14px" },
};
