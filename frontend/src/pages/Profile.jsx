import React, { useEffect, useState } from "react";
import axios from "axios";

function Profile() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [editing, setEditing] = useState(false);

  // 🟢 Giả sử API backend chạy ở localhost:3000
  const API_URL = "http://localhost:3000/api/profile";

  // GET user info
  useEffect(() => {
    axios
      .get(API_URL)
      .then((res) => setUser(res.data))
      .catch((err) => console.error(err));
  }, []);

  // PUT update user info
  const handleSave = () => {
    axios
      .put(API_URL, user)
      .then((res) => {
        alert("Cập nhật thành công!");
        setEditing(false);
      })
      .catch((err) => console.error(err));
  };

  return (
    <div style={{ maxWidth: "500px", margin: "auto" }}>
      <h2>👤 Thông tin cá nhân</h2>

      <label>Họ và tên:</label>
      <input
        type="text"
        value={user.name}
        onChange={(e) => setUser({ ...user, name: e.target.value })}
        disabled={!editing}
        style={{ width: "100%", marginBottom: "10px" }}
      />

      <label>Email:</label>
      <input
        type="email"
        value={user.email}
        onChange={(e) => setUser({ ...user, email: e.target.value })}
        disabled={!editing}
        style={{ width: "100%", marginBottom: "10px" }}
      />

      <label>Số điện thoại:</label>
      <input
        type="text"
        value={user.phone}
        onChange={(e) => setUser({ ...user, phone: e.target.value })}
        disabled={!editing}
        style={{ width: "100%", marginBottom: "10px" }}
      />

      {!editing ? (
        <button onClick={() => setEditing(true)}>✏️ Chỉnh sửa</button>
      ) : (
        <button onClick={handleSave}>💾 Lưu thay đổi</button>
      )}
    </div>
  );
}

export default Profile;
