import React, { useState } from 'react';

export default function AddUser({ token, onCreated, editingUser, onUpdated, onCancel }) {
  const [name, setName] = useState(editingUser ? editingUser.name : '');
  const [email, setEmail] = useState(editingUser ? editingUser.email : '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(editingUser ? (editingUser.role || 'user') : 'user');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const base = 'http://localhost:3000';

  const submit = async (e) => {
    e && e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      if (editingUser) {
        const res = await fetch(`${base}/users/${editingUser._id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ name, email, role }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data && data.message ? data.message : 'Update failed');
        if (typeof onUpdated === 'function') onUpdated(data);
      } else {
        const body = { name, email, password, role };
        const res = await fetch(`${base}/users`, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data && data.message ? data.message : 'Create failed');
        if (typeof onCreated === 'function') onCreated(data);
        setName(''); setEmail(''); setPassword(''); setRole('user');
      }
    } catch (e) {
      setErr(e.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3>{editingUser ? 'Edit user' : 'Add user'}</h3>
      <form className="user-form" onSubmit={submit}>
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        {!editingUser && <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />}
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="user">user</option>
          <option value="moderator">moderator</option>
          <option value="admin">admin</option>
        </select>
        <div>
          <button type="submit" disabled={loading}>{loading ? 'Saving...' : (editingUser ? 'Save' : 'Add')}</button>
          {editingUser && <button type="button" onClick={onCancel} style={{ marginLeft: 8 }}>Cancel</button>}
        </div>
      </form>
      {err && <div className="err" style={{ marginTop: 8 }}>{err}</div>}
    </div>
  );
}
