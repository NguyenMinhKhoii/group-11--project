import React, { useState } from "react";
import axios from "axios";

export default function ResetPassword() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = e => {
    e.preventDefault();
    axios.post("/reset-password", { token, password })
      .then(res => alert(res.data.message))
      .catch(err => console.log(err));
  };

  return (
    <div>
      <h2>Đổi mật khẩu</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Token reset" 
          value={token} 
          onChange={e => setToken(e.target.value)} 
          required 
        /><br />
        <input 
          type="password" 
          placeholder="Mật khẩu mới" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          required 
        /><br />
        <button type="submit">Đổi mật khẩu</button>
      </form>
    </div>
  );
}
