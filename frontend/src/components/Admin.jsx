import React, { useEffect, useState, useCallback } from 'react';

export default function Admin({ token, currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const base = 'http://localhost:3000';

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await fetch(`${base}/users`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Status ${res.status} - ${txt}`);
      }
      const data = await res.json();
      setUsers(data);
    } catch (e) {
      console.error('admin fetch users error', e);
      setErr(e.message || 'Error fetching users (need admin)');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetchUsers();
  }, [token, fetchUsers]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      const res = await fetch(`${base}/users/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Delete failed: ${res.status} ${txt}`);
      }
      // refresh
      fetchUsers();
    } catch (e) {
      console.error(e);
      setErr(e.message || 'Delete failed');
    }
  };

  const handleChangeRole = async (id, newRole) => {
    if (!window.confirm(`Change role to '${newRole}' for this user?`)) return;
    setUpdatingId(id);
    try {
      const res = await fetch(`${base}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Update role failed: ${res.status} ${txt}`);
      }
      // refresh list
      await fetchUsers();
    } catch (e) {
      console.error(e);
      setErr(e.message || 'Update role failed');
    } finally {
      setUpdatingId(null);
    }
  };

  if (!token) return <div className="card">Please log in as admin to view this panel.</div>;
  return (
    <div className="card admin-panel">
      <h3>Admin — User list</h3>
      {err && <div className="err">{err}</div>}
      {loading ? (
        <div className="small">Loading users...</div>
      ) : (
        <ul>
          {users.map((u) => (
            <li key={u._id}>
              <div>
                <strong>{u.name}</strong>
                <div className="meta">{u.email}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {currentUser && currentUser.role === 'admin' ? (
                  <>
                    <select
                      value={u.role}
                      onChange={(e) => handleChangeRole(u._id, e.target.value)}
                      disabled={updatingId === u._id}
                    >
                      <option value="user">user</option>
                      <option value="moderator">moderator</option>
                      <option value="admin">admin</option>
                    </select>
                    <button onClick={() => handleDelete(u._id)} disabled={updatingId === u._id}>Delete</button>
                  </>
                ) : (
                  <>
                    <span className="small">{u.role}</span>
                    <button onClick={() => handleDelete(u._id)}>Delete</button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
