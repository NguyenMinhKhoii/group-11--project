import React, { useState } from "react";
import axios from "axios";

export default function LoginForm({ onLogin, onMessage }) {
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/login", formData);
      onLogin(res.data.token);
      onMessage(res.data.message || "Đăng nhập thành công!");
      setFormData({ email: "", password: "" });
    } catch (err) {
      onMessage(err.response?.data?.message || "Đăng nhập thất bại!");
    }
  };

  return (
    <div style={styles.container}>
      <h2>Đăng nhập</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required style={styles.input} />
        <input type="password" name="password" placeholder="Mật khẩu" value={formData.password} onChange={handleChange} required style={styles.input} />
        <button type="submit" style={styles.button}>Đăng nhập</button>
      </form>
    </div>
  );
}

const styles = {
  container: { textAlign: "center", marginTop: "20px" },
  form: { display: "inline-block", flexDirection: "column" },
  input: { display: "block", margin: "10px auto", padding: "10px", width: "250px" },
  button: { padding: "10px 20px", background: "#28a745", color: "#fff", border: "none", cursor: "pointer" },
};
