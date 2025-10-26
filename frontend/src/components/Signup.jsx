import React, { useState } from 'react';

export default function Signup({ onAuth }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [role, setRole] = useState('user');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      // if user selected elevated role, require invite code
      if (role !== 'user' && !inviteCode) {
        throw new Error('Invite code required for moderator/admin');
      }

      const body = { name, email, password };
      // send selected role as hint (server still validates via inviteCode)
      body.role = role;
      if (inviteCode) body.inviteCode = inviteCode;
      const res = await fetch('http://localhost:3000/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data && data.message ? data.message : 'Signup failed');
      setSuccess('Signup successful');
      // store token if provided
      if (data.token) {
        localStorage.setItem('token', data.token);
        if (typeof onAuth === 'function') onAuth(data.token);
      }
      setName('');
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err.message || 'Error');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="card auth-card">
      <h3>Sign Up</h3>
      <form className="user-form" onSubmit={handleSubmit}>
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="user">user</option>
          <option value="moderator">moderator</option>
          <option value="admin">admin</option>
        </select>
        {role !== 'user' && (
          <input placeholder="Invite code (required for moderator/admin)" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} />
        )}
        <div>
          <button type="submit" disabled={loading}>{loading ? 'Signing...' : 'Sign Up'}</button>
        </div>
      </form>
      {error && <div className="err" style={{ marginTop: 8 }}>{error}</div>}
      {success && <div style={{ color: '#6ee7b7', marginTop: 8 }}>{success}</div>}
    </div>
  );
}
