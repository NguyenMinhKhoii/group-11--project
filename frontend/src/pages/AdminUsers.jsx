import React, { useState, useEffect } from "react";
import axios from "axios";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load danh sách users khi component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:3001/api/users");
      console.log("Users data received:", response.data);
      setUsers(response.data);
      setError("");
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Không thể tải danh sách users. Kiểm tra kết nối backend.");
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId, userName) => {
    if (!window.confirm(`Bạn có chắc muốn xóa user "${userName}"?`)) {
      return;
    }

    try {
      await axios.delete(`http://localhost:3001/api/users/${userId}`);
      setUsers(users.filter(user => user._id !== userId));
      alert(`✅ Đã xóa user "${userName}" thành công!`);
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("❌ Không thể xóa user. Vui lòng thử lại!");
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <h2>🛠 Quản lý Users</h2>
        <div style={styles.loading}>⏳ Đang tải danh sách users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <h2>🛠 Quản lý Users</h2>
        <div style={styles.error}>❌ {error}</div>
        <button onClick={fetchUsers} style={styles.retryButton}>
          🔄 Thử lại
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2>🛠 Quản lý Users</h2>
      <div style={styles.summary}>
        <p>📊 Tổng số users: <strong>{users.length}</strong></p>
      </div>

      {users.length === 0 ? (
        <div style={styles.noData}>
          <p>📭 Chưa có users nào trong hệ thống</p>
        </div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Tên</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Trạng thái</th>
                <th style={styles.th}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} style={styles.tr}>
                  <td style={styles.td}>{user.id}</td>
                  <td style={styles.td}>{user.name}</td>
                  <td style={styles.td}>{user.email}</td>
                  <td style={styles.td}>
                    <span style={styles.active}>🟢 Hoạt động</span>
                  </td>
                  <td style={styles.td}>
                    <button style={styles.viewButton}>👁️ Xem</button>
                    <button style={styles.editButton}>✏️ Sửa</button>
                    <button 
                      onClick={() => deleteUser(user._id, user.name)}
                      style={styles.deleteButton}
                    >
                      🗑️ Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={styles.actions}>
        <button onClick={fetchUsers} style={styles.refreshButton}>
          🔄 Làm mới
        </button>
        <button style={styles.addButton}>
          ➕ Thêm user mới
        </button>
      </div>

      {/* Thông tin API cho dev */}
      <div style={styles.apiInfo}>
        <h3>🔗 API Information:</h3>
        <div style={styles.codeBlock}>
          <strong>GET</strong> http://localhost:3001/api/users<br/>
          <strong>Response:</strong> Array of user objects
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "20px", maxWidth: "1200px", margin: "0 auto" },
  loading: { textAlign: "center", padding: "50px", fontSize: "18px", color: "#666" },
  error: { padding: "15px", backgroundColor: "#f8d7da", color: "#721c24", borderRadius: "5px", marginBottom: "15px" },
  retryButton: { padding: "10px 20px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" },
  summary: { backgroundColor: "#f8f9fa", padding: "15px", borderRadius: "5px", marginBottom: "20px" },
  noData: { textAlign: "center", padding: "50px", fontSize: "16px", color: "#666" },
  tableContainer: { overflowX: "auto", marginBottom: "20px" },
  table: { width: "100%", borderCollapse: "collapse", backgroundColor: "white", borderRadius: "5px", overflow: "hidden", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" },
  th: { padding: "12px", backgroundColor: "#007bff", color: "white", textAlign: "left", fontWeight: "bold" },
  td: { padding: "12px", borderBottom: "1px solid #eee" },
  tr: { ":hover": { backgroundColor: "#f8f9fa" } },
  active: { color: "#28a745", fontWeight: "bold" },
  viewButton: { padding: "5px 10px", backgroundColor: "#17a2b8", color: "white", border: "none", borderRadius: "3px", marginRight: "5px", cursor: "pointer", fontSize: "12px" },
  editButton: { padding: "5px 10px", backgroundColor: "#ffc107", color: "black", border: "none", borderRadius: "3px", marginRight: "5px", cursor: "pointer", fontSize: "12px" },
  deleteButton: { padding: "5px 10px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "3px", cursor: "pointer", fontSize: "12px" },
  actions: { display: "flex", gap: "10px", marginBottom: "30px" },
  refreshButton: { padding: "10px 20px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" },
  addButton: { padding: "10px 20px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" },
  apiInfo: { marginTop: "40px", padding: "15px", backgroundColor: "#e9ecef", borderRadius: "5px", fontSize: "14px" },
  codeBlock: { backgroundColor: "#f1f3f4", padding: "10px", borderRadius: "4px", fontFamily: "monospace", marginTop: "10px" }
};