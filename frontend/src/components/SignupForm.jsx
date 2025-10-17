import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { signupUser, clearAuthError } from "../features/auth/authSlice";

export default function SignupForm({ onMessage }) {
  const dispatch = useDispatch();
  const { isSignupLoading, signupError } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear errors when user types
    if (signupError) {
      dispatch(clearAuthError());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const result = await dispatch(signupUser(formData));
    
    if (signupUser.fulfilled.match(result)) {
      onMessage && onMessage("Đăng ký thành công!");
      setFormData({ name: "", email: "", password: "" });
    } else {
      onMessage && onMessage(result.payload || "Đăng ký thất bại!");
    }
  };

  return (
    <div style={styles.container}>
      <h2>Đăng ký tài khoản</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input 
          type="text" 
          name="name" 
          placeholder="Họ tên" 
          value={formData.name} 
          onChange={handleChange} 
          required 
          style={styles.input}
          disabled={isSignupLoading}
        />
        <input 
          type="email" 
          name="email" 
          placeholder="Email" 
          value={formData.email} 
          onChange={handleChange} 
          required 
          style={styles.input}
          disabled={isSignupLoading}
        />
        <input 
          type="password" 
          name="password" 
          placeholder="Mật khẩu" 
          value={formData.password} 
          onChange={handleChange} 
          required 
          style={styles.input}
          disabled={isSignupLoading}
        />
        <button 
          type="submit" 
          style={{...styles.button, opacity: isSignupLoading ? 0.6 : 1}}
          disabled={isSignupLoading}
        >
          {isSignupLoading ? "Đang đăng ký..." : "Đăng ký"}
        </button>
        {signupError && (
          <div style={styles.error}>{signupError}</div>
        )}
      </form>
    </div>
  );
}

const styles = {
  container: { textAlign: "center", marginTop: "40px" },
  form: { display: "inline-block", flexDirection: "column" },
  input: { display: "block", margin: "10px auto", padding: "10px", width: "250px" },
  button: { padding: "10px 20px", background: "#007bff", color: "#fff", border: "none", cursor: "pointer" },
  error: { color: "red", marginTop: "10px", fontSize: "14px" },
};
