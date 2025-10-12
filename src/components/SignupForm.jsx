import React, { useState } from "react";
import axios from "axios";

export default function SignupForm({ onMessage }) {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/signup", formData);
      onMessage(res.data.message || "Đăng ký thành công!");
      setFormData({ name: "", email: "", password: "" });
    } catch (err) {
      onMessage(err.response?.data?.message || "Đăng ký thất bại!");
    }
  };

  return (
    <div style={styles.container}>
      <h2>Đăng ký tài khoản</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input type="text" name="name" placeholder="Họ tên" value={formData.name} onChange={handleChange} required style={styles.input} />
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required style={styles.input} />
        <input type="password" name="password" placeholder="Mật khẩu" value={formData.password} onChange={handleChange} required style={styles.input} />
        <button type="submit" style={styles.button}>Đăng ký</button>
      </form>
    </div>
  );
}

const styles = {
  container: { textAlign: "center", marginTop: "40px" },
  form: { display: "inline-block", flexDirection: "column" },
  input: { display: "block", margin: "10px auto", padding: "10px", width: "250px" },
  button: { padding: "10px 20px", background: "#007bff", color: "#fff", border: "none", cursor: "pointer" },
};
