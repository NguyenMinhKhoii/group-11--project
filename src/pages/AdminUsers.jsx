import React, { useState } from "react";

export default function AdminUsers() {
  // Dummy data
  const [users, setUsers] = useState([
    { _id: "1", name: "Nguyen Van A", email: "a@gmail.com", role: "User" },
    { _id: "2", name: "Tran Thi B", email: "b@gmail.com", role: "Admin" },
  ]);

  const deleteUser = (id) => {
    if (window.confirm("Bạn có chắc muốn xóa user này?")) {
      setUsers(users.filter(u => u._id !== id));
      alert("Xóa user thành công!");
    }
  };

  return (
    <div>
      <h2>🛠 Quản lý User</h2>
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>ID</th><th>Tên</th><th>Email</th><th>Role</th><th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u._id}>
              <td>{u._id}</td>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td><button onClick={() => deleteUser(u._id)}>Xóa</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
