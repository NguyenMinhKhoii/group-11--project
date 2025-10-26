import React, { useEffect, useState } from 'react';

export default function Profile({ token, onProfileUpdated }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const base = 'http://localhost:3000';
  const fetchProfile = async () => {
    if (!token) return setUser(null);
    setLoading(true);
    try {
      const res = await fetch(`${base}/profile`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to fetch profile');
      const data = await res.json();
      setUser(data);
      setName(data.name || '');
    } catch (err) {
      console.error('fetch profile error', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, [token]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      const body = {};
      if (name) body.name = name;
      if (password) body.password = password;
      const res = await fetch(`${base}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data && data.message ? data.message : 'Update failed');
      setMsg('Profile updated');
      // refresh local profile
      await fetchProfile();
      if (typeof onProfileUpdated === 'function') onProfileUpdated();
    } catch (err) {
      console.error(err);
      setMsg(err.message || 'Error');
    }
  };

  const handleAvatar = async (e) => {
    e.preventDefault();
    if (!avatarFile) return setMsg('Select a file');
    setMsg('');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('avatar', avatarFile);
      const res = await fetch(`${base}/profile/upload-avatar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data && data.message ? data.message : 'Upload failed');
      setMsg('Avatar uploaded');
      // update UI immediately with returned avatar URL
      if (data && data.avatar) {
        setUser((prev) => ({ ...prev, avatar: data.avatar }));
      } else if (data && data._id) {
        // If controller returned full user object
        setUser(data);
      }
      // clear chosen file and preview
      setAvatarFile(null);
      if (preview) {
        try { URL.revokeObjectURL(preview); } catch (e) { }
        setPreview(null);
      }
      // refresh profile from server to ensure consistency
      await fetchProfile();
      if (typeof onProfileUpdated === 'function') onProfileUpdated();
    } catch (err) {
      console.error(err);
      setMsg(err.message || 'Error');
    } finally {
      setUploading(false);
    }
  };

  if (!token) return <div>Please log in to view profile.</div>;
  if (loading) return <div>Loading profile...</div>;
  if (!user) return <div>Unable to load profile.</div>;

  return (
    <div className="card profile-card" style={{ marginBottom: 12 }}>
      <h3>Profile</h3>
      <div className="profile-grid">
        <div className="profile-left">
          <div style={{ fontWeight: 700 }}>{user.name}</div>
          <div className="small">{user.email}</div>
          <div className="small" style={{ marginTop: 6 }}>Role: {user.role || 'user'}</div>
          <div style={{ marginTop: 12 }}>
            {(preview || user.avatar) && (
              <img src={preview || user.avatar} alt="avatar-preview" className="avatar-large" />
            )}
          </div>
        </div>
        <div className="profile-right">
          <form onSubmit={handleUpdate} className="profile-section">
            <h4>Update</h4>
            <div>
              <label className="small">Name</label>
              <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div style={{ marginTop: 8 }}>
              <label className="small">New password</label>
              <input placeholder="New password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div style={{ marginTop: 12 }}>
              <button type="submit">Update Profile</button>
            </div>
          </form>

          <form onSubmit={handleAvatar} className="profile-section" style={{ marginTop: 12 }}>
            <h4>Upload Avatar</h4>
            <div>
              <input type="file" accept="image/*" onChange={(e) => {
                const f = e.target.files && e.target.files[0];
                if (!f) return setAvatarFile(null);
                setAvatarFile(f);
                try {
                  const url = URL.createObjectURL(f);
                  if (preview) try { URL.revokeObjectURL(preview); } catch (e) { }
                  setPreview(url);
                } catch (e) { setPreview(null); }
              }} />
            </div>
            <div style={{ marginTop: 8 }}>
              <button type="submit" disabled={uploading}>{uploading ? 'Uploading...' : 'Upload'}</button>
            </div>
          </form>

          {msg && <div style={{ marginTop: 8 }}>{msg}</div>}
        </div>
      </div>
    </div>
  );
}
