// 📌 src/App.js
import React, { useEffect, useState } from "react";

function App() {
  // 1️⃣ State để lưu danh sách user
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // 2️⃣ Gọi API backend khi component load lần đầu
  useEffect(() => {
    fetch("http://localhost:3000/api/users") // backend port 3000
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error("API error:", err));
  }, []);

  // 3️⃣ Hàm thêm user mới
  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3000/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const newUser = await res.json();
      setUsers([...users, newUser]); // Thêm user mới vào danh sách
      setName("");
      setEmail("");
    } catch (err) {
      console.error("POST error:", err);
    }
  };

  // 4️⃣ Render danh sách user và form thêm user
  return (
    <div style={{ padding: 20 }}>
      <h1>Danh sách User</h1>
      <ul>
        {users.map((u) => (
          <li key={u._id}>
            {u.name} - {u.email}
          </li>
        ))}
      </ul>

      <h2>Thêm User mới</h2>
      <form onSubmit={handleAddUser}>
        <input
          type="text"
          placeholder="Tên"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Thêm</button>
      </form>
    </div>
  );
}

export default App;
