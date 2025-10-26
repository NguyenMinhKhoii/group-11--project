import React, { useState } from 'react';

export default function ForgotPassword({ onToken }) {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [debugToken, setDebugToken] = useState(null);
  const base = 'http://localhost:3000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setLoading(true);
    setDebugToken(null);
    try {
      const res = await fetch(`${base}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data && data.message ? data.message : 'Request failed');
      setMsg(data.message || 'If the email exists, a reset link was sent');
      // If backend returned resetToken (dev mode), expose it here and call callback
      if (data && data.resetToken) {
        setDebugToken(data.resetToken);
        if (typeof onToken === 'function') onToken(data.resetToken);
      }
    } catch (err) {
      console.error('forgot password error', err);
      setMsg(err.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3>Forgot Password</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div style={{ marginTop: 8 }}>
          <button type="submit" disabled={loading}>{loading ? 'Sending...' : 'Send reset email'}</button>
        </div>
      </form>
      {msg && <div style={{ marginTop: 8 }}>{msg}</div>}
      {debugToken && (
        <div style={{ marginTop: 8 }}>
          <strong>Dev reset token:</strong>
          <div style={{ wordBreak: 'break-all', marginTop: 6 }}>{debugToken}</div>
        </div>
      )}
    </div>
  );
}
