import React, { useState } from 'react';

export default function Login({ onAuth }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data && data.message ? data.message : 'Login failed');
      if (data.token) {
        localStorage.setItem('token', data.token);
        if (typeof onAuth === 'function') onAuth(data.token);
      }
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
      <h3>Login</h3>
      <form className="user-form" onSubmit={handleSubmit}>
        <input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <div>
          <button type="submit" disabled={loading}>{loading ? 'Logging...' : 'Login'}</button>
        </div>
      </form>
      {error && <div className="err" style={{ marginTop: 8 }}>{error}</div>}
    </div>
  );
}
