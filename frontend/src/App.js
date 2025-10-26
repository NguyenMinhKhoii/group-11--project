import React, { useEffect, useState, useCallback } from "react";
import Signup from './components/Signup';
import Login from './components/Login';
import Profile from './components/Profile';
import Admin from './components/Admin';
import AddUser from './components/AddUser';
import UserList from './components/UserList';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import './App.css';

const ROLE_HIERARCHY = ['user', 'moderator', 'admin'];

function App() {
  // State
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [resetToken, setResetToken] = useState('');
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState('user');
  const [editingUser, setEditingUser] = useState(null);

  const canViewUsers = useCallback((cu) => {
    if (!cu || !cu.role) return false;
    const idx = ROLE_HIERARCHY.indexOf(cu.role);
    return idx >= ROLE_HIERARCHY.indexOf('moderator');
  }, []);

  const fetchUsers = useCallback(async (useAuth = false) => {
    try {
      const headers = {};
      if (useAuth && token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch("http://localhost:3000/users", { headers });
      if (!res.ok) {
        console.error('fetchUsers failed, status:', res.status);
        setUsers([]);
        return;
      }
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error('fetchUsers error', err);
      setUsers([]);
    }
  }, [token]);

  // fetch profile when token changes
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return setCurrentUser(null);
      try {
        const res = await fetch('http://localhost:3000/profile', { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) {
          setCurrentUser(null);
          return;
        }
        const data = await res.json();
        setCurrentUser(data);
        // if the current user can view users, fetch the users list
        if (data && canViewUsers(data)) {
          fetchUsers(true);
        } else {
          setUsers([]);
        }
      } catch (e) {
        console.error('fetch profile in App error', e);
        setCurrentUser(null);
      }
    };
    fetchProfile();
  }, [token, fetchUsers, canViewUsers]);

  // Auth helpers
  const handleAuth = (newToken) => {
    setToken(newToken || '');
    if (newToken) localStorage.setItem('token', newToken);
    else localStorage.removeItem('token');
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3000/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (e) {
      // ignore
    }
    handleAuth('');
  };

  // Thêm hoặc cập nhật user
  const handleSubmit = async (e) => {
    e.preventDefault();

    const headers = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    if (editingUser) {
      await fetch(`http://localhost:3000/users/${editingUser._id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ name, email, role }),
      });
      setEditingUser(null);
    } else {
      await fetch("http://localhost:3000/users", {
        method: "POST",
        headers,
        body: JSON.stringify({ name, email, password, role }),
      });
    }

    setName("");
    setEmail("");
    setPassword("");
    setRole('user');
    fetchUsers();
  };

  // Xóa user
  const handleDelete = async (id) => {
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    await fetch(`http://localhost:3000/users/${id}`, {
      method: "DELETE",
      headers,
    });
    fetchUsers();
  };

  // Sửa user
  const handleEdit = (user) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setRole(user.role || 'user');
    setPassword('');
  };

  return (
    <div className="app">
      <div className="header-row">
        <h1>Quản lý người dùng</h1>
        <div className="small">Demo Admin Panel</div>
      </div>

      <div className="auth-row">
        {!token ? (
          <>
            <Login onAuth={handleAuth} />
            <Signup onAuth={handleAuth} />
            <div style={{ marginLeft: 12 }}>
              <ForgotPassword onToken={(t) => setResetToken(t)} />
            </div>
            <div style={{ marginLeft: 12 }}>
              <ResetPassword initialToken={resetToken} />
            </div>
          </>
        ) : (
          <div className="card auth-card">
            <strong>Logged in</strong> — token stored in localStorage.
            <div style={{ marginTop: 8 }}>
              <button onClick={handleLogout}>Logout</button>
            </div>
            <div className="token">{token}</div>
          </div>
        )}
      </div>

      {/* Profile panel */}
      {token && <Profile token={token} onProfileUpdated={() => { /* refresh if needed */ }} />}

  {/* Admin/Moderator panel (show to moderator and admin) */}
  {currentUser && canViewUsers(currentUser) && <Admin token={token} currentUser={currentUser} />}

      <div style={{ marginTop: 12 }}>
        <AddUser token={token} editingUser={editingUser} onCreated={() => fetchUsers(true)} onUpdated={() => fetchUsers(true)} onCancel={() => setEditingUser(null)} />
      </div>

      <div style={{ marginTop: 12 }}>
        <UserList token={token} onEdit={(u) => handleEdit(u)} />
      </div>
    </div>
  );
}

export default App;
