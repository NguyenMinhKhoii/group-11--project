/**
 * Navigation Component
 * Hoạt động 6 - Frontend Redux & Protected Routes
 */

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logoutUser, selectAuth } from '../../redux/slices/authSlice';

const Navigation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { isAuthenticated, user } = useSelector(selectAuth);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">
          🚀 Redux Protected Routes
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
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/')}`} to="/">
                🏠 Home
              </Link>
            </li>
            
            {isAuthenticated && (
              <>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/profile')}`} to="/profile">
                    👤 Profile
                  </Link>
                </li>
                
                {user?.role === 'admin' && (
                  <li className="nav-item">
                    <Link className={`nav-link ${isActive('/admin')}`} to="/admin">
                      👑 Admin
                    </Link>
                  </li>
                )}
              </>
            )}
          </ul>

          <ul className="navbar-nav">
            {isAuthenticated ? (
              <li className="nav-item dropdown">
                <a 
                  className="nav-link dropdown-toggle" 
                  href="#" 
                  id="navbarDropdown" 
                  role="button" 
                  data-bs-toggle="dropdown"
                >
                  {user?.email} 
                  <span className={`badge ms-1 ${user?.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                    {user?.role}
                  </span>
                </a>
                <ul className="dropdown-menu">
                  <li>
                    <Link className="dropdown-item" to="/profile">
                      👤 Profile
                    </Link>
                  </li>
                  {user?.role === 'admin' && (
                    <li>
                      <Link className="dropdown-item" to="/admin">
                        👑 Admin Panel
                      </Link>
                    </li>
                  )}
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button 
                      className="dropdown-item" 
                      onClick={handleLogout}
                    >
                      🚪 Logout
                    </button>
                  </li>
                </ul>
              </li>
            ) : (
              <>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/login')}`} to="/login">
                    🔐 Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/register')}`} to="/register">
                    📝 Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;