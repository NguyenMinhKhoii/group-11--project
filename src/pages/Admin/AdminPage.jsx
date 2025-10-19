/**
 * Admin Page Component - Role-based Protected Route
 * Hoạt động 6 - Frontend Redux & Protected Routes
 */

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutUser, selectAuth } from '../../redux/slices/authSlice';

const AdminPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(selectAuth);
  
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogout = () => {
    console.log('🚪 Admin logging out...');
    dispatch(logoutUser());
    navigate('/login');
  };

  const navigateToProfile = () => {
    navigate('/profile');
  };

  return (
    <div className="container-fluid mt-4">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3">
          <div className="card">
            <div className="card-header bg-danger text-white">
              <h5 className="mb-0">👑 Admin Panel</h5>
            </div>
            <div className="list-group list-group-flush">
              <button 
                className={`list-group-item list-group-item-action ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                📊 Dashboard
              </button>
              <button 
                className={`list-group-item list-group-item-action ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => setActiveTab('users')}
              >
                👥 User Management
              </button>
              <button 
                className={`list-group-item list-group-item-action ${activeTab === 'logs' ? 'active' : ''}`}
                onClick={() => setActiveTab('logs')}
              >
                📝 Activity Logs
              </button>
              <button 
                className={`list-group-item list-group-item-action ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                ⚙️ Settings
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-md-9">
          <div className="card shadow">
            <div className="card-header bg-danger text-white d-flex justify-content-between align-items-center">
              <h4 className="mb-0">
                🛡️ Admin Dashboard (Role-Protected)
              </h4>
              <div>
                <button 
                  className="btn btn-light btn-sm me-2"
                  onClick={navigateToProfile}
                >
                  👤 Profile
                </button>
                <button 
                  className="btn btn-outline-light btn-sm"
                  onClick={handleLogout}
                >
                  🚪 Logout
                </button>
              </div>
            </div>
            <div className="card-body">
              <div className="alert alert-warning">
                <h5>🚨 Admin Access Granted!</h5>
                <p className="mb-0">
                  This page requires <strong>admin</strong> role. 
                  Redux Protected Routes successfully validated your permissions.
                </p>
              </div>

              {/* Tab Content */}
              {activeTab === 'dashboard' && (
                <div>
                  <h5>📊 Admin Dashboard</h5>
                  <div className="row">
                    <div className="col-md-3">
                      <div className="card bg-primary text-white">
                        <div className="card-body text-center">
                          <h3>156</h3>
                          <p>Total Users</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card bg-success text-white">
                        <div className="card-body text-center">
                          <h3>89</h3>
                          <p>Active Sessions</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card bg-warning text-white">
                        <div className="card-body text-center">
                          <h3>23</h3>
                          <p>Pending Actions</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card bg-danger text-white">
                        <div className="card-body text-center">
                          <h3>5</h3>
                          <p>Security Alerts</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <div>
                  <h5>👥 User Management</h5>
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>1</td>
                          <td>Admin User</td>
                          <td>admin@example.com</td>
                          <td><span className="badge bg-danger">admin</span></td>
                          <td><span className="badge bg-success">Active</span></td>
                          <td>
                            <button className="btn btn-sm btn-outline-primary">Edit</button>
                          </td>
                        </tr>
                        <tr>
                          <td>2</td>
                          <td>Regular User</td>
                          <td>user@example.com</td>
                          <td><span className="badge bg-primary">user</span></td>
                          <td><span className="badge bg-success">Active</span></td>
                          <td>
                            <button className="btn btn-sm btn-outline-primary">Edit</button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'logs' && (
                <div>
                  <h5>📝 Activity Logs</h5>
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Time</th>
                          <th>User</th>
                          <th>Action</th>
                          <th>Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>{new Date().toLocaleString()}</td>
                          <td>{user?.email}</td>
                          <td><span className="badge bg-success">LOGIN</span></td>
                          <td>Admin panel access</td>
                        </tr>
                        <tr>
                          <td>{new Date(Date.now() - 300000).toLocaleString()}</td>
                          <td>user@example.com</td>
                          <td><span className="badge bg-info">PROFILE_VIEW</span></td>
                          <td>Accessed protected profile</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div>
                  <h5>⚙️ Admin Settings</h5>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="card">
                        <div className="card-header">
                          🔐 Security Settings
                        </div>
                        <div className="card-body">
                          <div className="form-check">
                            <input className="form-check-input" type="checkbox" id="twoFactorAuth" defaultChecked />
                            <label className="form-check-label" htmlFor="twoFactorAuth">
                              Enable Two-Factor Authentication
                            </label>
                          </div>
                          <div className="form-check">
                            <input className="form-check-input" type="checkbox" id="loginAlerts" defaultChecked />
                            <label className="form-check-label" htmlFor="loginAlerts">
                              Email Login Alerts
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card">
                        <div className="card-header">
                          🛡️ Access Control
                        </div>
                        <div className="card-body">
                          <div className="form-check">
                            <input className="form-check-input" type="checkbox" id="strictMode" defaultChecked />
                            <label className="form-check-label" htmlFor="strictMode">
                              Strict Role Checking
                            </label>
                          </div>
                          <div className="form-check">
                            <input className="form-check-input" type="checkbox" id="sessionTimeout" defaultChecked />
                            <label className="form-check-label" htmlFor="sessionTimeout">
                              Auto Session Timeout
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Admin Info */}
              <div className="mt-4">
                <div className="card bg-light">
                  <div className="card-body">
                    <h6 className="text-muted">👑 Admin Information</h6>
                    <div className="row">
                      <div className="col-md-6">
                        <p><strong>Name:</strong> {user?.fullname || user?.name}</p>
                        <p><strong>Email:</strong> {user?.email}</p>
                      </div>
                      <div className="col-md-6">
                        <p><strong>Role:</strong> <span className="badge bg-danger">{user?.role}</span></p>
                        <p><strong>Access Level:</strong> <span className="badge bg-success">Full Access</span></p>
                      </div>
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

export default AdminPage;