import React, { useEffect, useState } from "react";

function App() {
  // State
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [editingUser, setEditingUser] = useState(null);

  // Lấy danh sách user
  const fetchUsers = async () => {
    const res = await fetch("http://localhost:5000/api/users");
    const data = await res.json();
    setUsers(data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Thêm hoặc cập nhật user
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingUser) {
      await fetch(`http://localhost:5000/api/users/${editingUser._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      setEditingUser(null);
    } else {
      await fetch("http://localhost:5000/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
    }

    setName("");
    setEmail("");
    fetchUsers();
  };

  // Xóa user
  const handleDelete = async (id) => {
    await fetch(`http://localhost:5000/api/users/${id}`, {
      method: "DELETE",
    });
    fetchUsers();
  };

  // Sửa user
  const handleEdit = (user) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Quản lý người dùng</h1>

      <form onSubmit={handleSubmit}>
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
        <button type="submit">{editingUser ? "Cập nhật" : "Thêm"}</button>
      </form>

      <h2>Danh sách người dùng</h2>
      <ul>
        {users.map((u) => (
          <li key={u._id}>
            {u.name} - {u.email}{" "}
            <button onClick={() => handleEdit(u)}>✏️ Sửa</button>{" "}
            <button onClick={() => handleDelete(u._id)}>🗑️ Xóa</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
