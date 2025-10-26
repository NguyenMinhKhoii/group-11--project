import React, { useState, useEffect } from 'react';

export default function ResetPassword({ initialToken }) {
  const [token, setToken] = useState(initialToken || '');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const base = 'http://localhost:3000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setLoading(true);
    try {
      const res = await fetch(`${base}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data && data.message ? data.message : 'Reset failed');
      setMsg(data.message || 'Password reset successful');
    } catch (err) {
      console.error('reset password error', err);
      setMsg(err.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  // update token when parent provides a new one
  useEffect(() => {
    if (initialToken) setToken(initialToken);
  }, [initialToken]);

  return (
    <div className="card">
      <h3>Reset Password (token)</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <input placeholder="Reset token" value={token} onChange={(e) => setToken(e.target.value)} />
        </div>
        <div style={{ marginTop: 8 }}>
          <input placeholder="New password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div style={{ marginTop: 8 }}>
          <button type="submit" disabled={loading}>{loading ? 'Resetting...' : 'Reset password'}</button>
        </div>
      </form>
      {msg && <div style={{ marginTop: 8 }}>{msg}</div>}
    </div>
  );
}
