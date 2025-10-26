import React, { useEffect, useState, useCallback } from 'react';

export default function UserList({ token, onEdit }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const base = 'http://localhost:3000';

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setErr('');
    try {
      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(`${base}/users`, { headers });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Status ${res.status} - ${txt}`);
      }
      const data = await res.json();
      setUsers(data);
    } catch (e) {
      console.error('userlist fetch error', e);
      setErr(e.message || 'Error fetching users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(`${base}/users/${id}`, { method: 'DELETE', headers });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Delete failed: ${res.status} ${txt}`);
      }
      await fetchUsers();
    } catch (e) {
      console.error(e);
      setErr(e.message || 'Delete failed');
    }
  };

  if (loading) return <div className="card small">Loading users...</div>;
  return (
    <div className="card user-list">
      <h3>Danh sách người dùng</h3>
      {err && <div className="err">{err}</div>}
      <ul>
        {users.map((u) => (
          <li key={u._id}>
            <div>
              <strong>{u.name}</strong>
              <div className="meta">{u.email}</div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className="small">{u.role}</span>
              <button onClick={() => onEdit && onEdit(u)}>Edit</button>
              <button onClick={() => handleDelete(u._id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
