// components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { useRBAC } from '../hooks/useRBAC';
import { ROLES } from '../utils/rbac';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { hasRole, canAccess } = useRBAC();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  if (!isAuthenticated) {
    return (
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <Link className="navbar-brand" to="/">Group 11 Project</Link>
          <div className="navbar-nav ms-auto">
            <Link className="nav-link" to="/login">Login</Link>
            <Link className="nav-link" to="/signup">Sign Up</Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand" to="/">
          Group 11 Project
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            {/* Home - Available to all authenticated users */}
            <li className="nav-item">
              <Link className="nav-link" to="/dashboard">Dashboard</Link>
            </li>

            {/* User Dashboard - Available to all roles */}
            {hasRole([ROLES.USER, ROLES.MODERATOR, ROLES.ADMIN]) && (
              <li className="nav-item">
                <Link className="nav-link" to="/profile">Profile</Link>
              </li>
            )}

            {/* Moderator Panel - Moderator and Admin only */}
            {hasRole([ROLES.MODERATOR, ROLES.ADMIN]) && (
              <li className="nav-item dropdown">
                <a 
                  className="nav-link dropdown-toggle" 
                  href="#" 
                  role="button" 
                  data-bs-toggle="dropdown"
                >
                  Moderator
                </a>
                <ul className="dropdown-menu">
                  <li><Link className="dropdown-item" to="/moderator/panel">Moderator Panel</Link></li>
                  <li><Link className="dropdown-item" to="/moderator/reports">User Reports</Link></li>
                  <li><Link className="dropdown-item" to="/moderator/content">Content Management</Link></li>
                </ul>
              </li>
            )}

            {/* Admin Panel - Admin only */}
            {hasRole([ROLES.ADMIN]) && (
              <li className="nav-item dropdown">
                <a 
                  className="nav-link dropdown-toggle" 
                  href="#" 
                  role="button" 
                  data-bs-toggle="dropdown"
                >
                  Admin
                </a>
                <ul className="dropdown-menu">
                  <li><Link className="dropdown-item" to="/admin/dashboard">Admin Dashboard</Link></li>
                  <li><Link className="dropdown-item" to="/admin/users">User Management</Link></li>
                  <li><Link className="dropdown-item" to="/admin/roles">Role Management</Link></li>
                  <li><Link className="dropdown-item" to="/admin/system">System Settings</Link></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><Link className="dropdown-item" to="/admin/logs">System Logs</Link></li>
                </ul>
              </li>
            )}

            {/* Test Features - Available for demo */}
            <li className="nav-item dropdown">
              <a 
                className="nav-link dropdown-toggle" 
                href="#" 
                role="button" 
                data-bs-toggle="dropdown"
              >
                Test
              </a>
              <ul className="dropdown-menu">
                <li><Link className="dropdown-item" to="/test/refresh-token">Test Refresh Token</Link></li>
                <li><Link className="dropdown-item" to="/test/rbac">Test RBAC</Link></li>
              </ul>
            </li>
          </ul>

          {/* User Info and Logout */}
          <div className="navbar-nav">
            <div className="nav-item dropdown">
              <a 
                className="nav-link dropdown-toggle" 
                href="#" 
                role="button" 
                data-bs-toggle="dropdown"
              >
                <i className="fas fa-user me-1"></i>
                {user?.name || user?.email}
                <span className="badge bg-secondary ms-2">{user?.role || 'USER'}</span>
              </a>
              <ul className="dropdown-menu dropdown-menu-end">
                <li><h6 className="dropdown-header">Welcome, {user?.name}</h6></li>
                <li><span className="dropdown-item-text">Role: <strong>{user?.role || 'USER'}</strong></span></li>
                <li><hr className="dropdown-divider" /></li>
                <li><Link className="dropdown-item" to="/profile">
                  <i className="fas fa-user-edit me-2"></i>Edit Profile
                </Link></li>
                <li><Link className="dropdown-item" to="/settings">
                  <i className="fas fa-cog me-2"></i>Settings
                </Link></li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button 
                    className="dropdown-item text-danger" 
                    onClick={handleLogout}
                  >
                    <i className="fas fa-sign-out-alt me-2"></i>Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;