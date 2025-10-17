import React, { useState } from "react";
import axios from "axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleSubmit = e => {
    e.preventDefault();
    // Gọi API backend
    axios.post("/forgot-password", { email })
      .then(res => alert(res.data.message))
      .catch(err => console.log(err));
  };

  return (
    <div>
      <h2>Quên mật khẩu</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="email" 
          placeholder="Nhập email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          required 
        /><br />
        <button type="submit">Gửi token reset</button>
      </form>
    </div>
  );
}
