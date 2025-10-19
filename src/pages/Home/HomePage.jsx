/**
 * Home Page Component
 * Hoạt động 6 - Frontend Redux & Protected Routes
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { selectAuth } from '../../redux/slices/authSlice';

const HomePage = () => {
  const { isAuthenticated, user } = useSelector(selectAuth);

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="card bg-primary text-white p-5" style={{ borderRadius: '10px' }}>
            <h1 className="display-4">🚀 Redux Protected Routes Demo</h1>
            <p className="lead">
              Hoạt động 6 - Frontend Redux & Protected Routes implementation
            </p>
            <hr className="my-4" style={{ borderColor: 'rgba(255,255,255,0.3)' }} />
            <p>
              This application demonstrates Redux state management with protected routing.
              Try accessing protected pages to see the authentication system in action.
            </p>
          </div>

          {/* Authentication Status */}
          <div className="row mt-4">
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  🔐 Authentication Status
                </div>
                <div className="card-body">
                  {isAuthenticated ? (
                    <div>
                      <div className="alert alert-success">
                        <h6>✅ You are logged in!</h6>
                        <p className="mb-1"><strong>Email:</strong> {user?.email}</p>
                        <p className="mb-0"><strong>Role:</strong> 
                          <span className={`badge ms-2 ${user?.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                            {user?.role}
                          </span>
                        </p>
                      </div>
                      <div className="d-grid gap-2">
                        <Link to="/profile" className="btn btn-success">
                          👤 Go to Profile
                        </Link>
                        {user?.role === 'admin' && (
                          <Link to="/admin" className="btn btn-danger">
                            👑 Admin Panel
                          </Link>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="alert alert-warning">
                        <h6>⚠️ You are not logged in</h6>
                        <p className="mb-0">Login to access protected pages.</p>
                      </div>
                      <div className="d-grid gap-2">
                        <Link to="/login" className="btn btn-primary">
                          🔐 Login
                        </Link>
                        <Link to="/register" className="btn btn-outline-secondary">
                          📝 Register
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  🛡️ Protected Routes
                </div>
                <div className="card-body">
                  <h6>Try accessing these protected routes:</h6>
                  <div className="list-group">
                    <Link 
                      to="/profile" 
                      className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                    >
                      👤 Profile Page
                      <span className="badge bg-success">User</span>
                    </Link>
                    <Link 
                      to="/admin" 
                      className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                    >
                      👑 Admin Panel
                      <span className="badge bg-danger">Admin</span>
                    </Link>
                  </div>
                  <div className="mt-3">
                    <small className="text-muted">
                      🔒 These routes will redirect to login if not authenticated,
                      or show access denied if you don't have the required role.
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Overview */}
          <div className="row mt-4">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  ⚡ Features Implemented
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-4">
                      <h6>🔄 Redux State Management</h6>
                      <ul className="list-unstyled">
                        <li>✅ Redux Toolkit</li>
                        <li>✅ Auth Slice</li>
                        <li>✅ Async Thunks</li>
                        <li>✅ Persistent State</li>
                      </ul>
                    </div>
                    <div className="col-md-4">
                      <h6>🛡️ Protected Routes</h6>
                      <ul className="list-unstyled">
                        <li>✅ Authentication Check</li>
                        <li>✅ Role-based Access</li>
                        <li>✅ Automatic Redirects</li>
                        <li>✅ State Preservation</li>
                      </ul>
                    </div>
                    <div className="col-md-4">
                      <h6>🎨 UI/UX Features</h6>
                      <ul className="list-unstyled">
                        <li>✅ Responsive Design</li>
                        <li>✅ Loading States</li>
                        <li>✅ Error Handling</li>
                        <li>✅ Bootstrap Styling</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;