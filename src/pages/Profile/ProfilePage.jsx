/**
 * Profile Page Component - Protected Route
 * Hoạt động 6 - Frontend Redux & Protected Routes
 */

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutUser, selectAuth } from '../../redux/slices/authSlice';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector(selectAuth);

  const handleLogout = () => {
    console.log('🚪 Logging out...');
    dispatch(logoutUser());
    navigate('/login');
  };

  const navigateToAdmin = () => {
    navigate('/admin');
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-header bg-success text-white">
              <h3 className="mb-0">
                👤 User Profile (Protected Route)
              </h3>
            </div>
            <div className="card-body">
              <div className="alert alert-success">
                <h5>🎉 Welcome to Protected Profile Page!</h5>
                <p className="mb-0">This page is only accessible after login with Redux authentication.</p>
              </div>

              {/* User Information */}
              <div className="row">
                <div className="col-md-6">
                  <h5>👤 User Information</h5>
                  <table className="table table-borderless">
                    <tbody>
                      <tr>
                        <td><strong>Name:</strong></td>
                        <td>{user?.fullname || user?.name || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td><strong>Email:</strong></td>
                        <td>{user?.email}</td>
                      </tr>
                      <tr>
                        <td><strong>Role:</strong></td>
                        <td>
                          <span className={`badge ${user?.role === 'admin' ? 'bg-danger' : user?.role === 'moderator' ? 'bg-warning' : 'bg-success'}`}>
                            {user?.role}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td><strong>User ID:</strong></td>
                        <td>{user?.id || user?.userId || 'N/A'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="col-md-6">
                  <h5>🔐 Session Information</h5>
                  <table className="table table-borderless">
                    <tbody>
                      <tr>
                        <td><strong>Auth Status:</strong></td>
                        <td><span className="badge bg-success">✅ Authenticated</span></td>
                      </tr>
                      <tr>
                        <td><strong>Token:</strong></td>
                        <td>
                          <code className="text-muted" style={{ fontSize: '0.8rem' }}>
                            {token ? `${token.substring(0, 20)}...` : 'No token'}
                          </code>
                        </td>
                      </tr>
                      <tr>
                        <td><strong>Login Time:</strong></td>
                        <td>{new Date().toLocaleString('vi-VN')}</td>
                      </tr>
                      <tr>
                        <td><strong>Redux State:</strong></td>
                        <td><span className="badge bg-info">🔄 Active</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4">
                <h5>⚡ Actions</h5>
                <div className="d-flex gap-2 flex-wrap">
                  {user?.role === 'admin' && (
                    <button 
                      className="btn btn-danger"
                      onClick={navigateToAdmin}
                    >
                      👑 Admin Panel
                    </button>
                  )}
                  <button className="btn btn-primary">
                    ✏️ Edit Profile
                  </button>
                  <button className="btn btn-info">
                    📷 Upload Avatar
                  </button>
                  <button className="btn btn-secondary">
                    📊 View Activity
                  </button>
                  <button 
                    className="btn btn-warning"
                    onClick={handleLogout}
                  >
                    🚪 Logout
                  </button>
                </div>
              </div>

              {/* Redux State Debug Info */}
              <div className="mt-4">
                <h6 className="text-muted">🔍 Redux State Debug (for development)</h6>
                <div className="card bg-light">
                  <div className="card-body">
                    <pre className="mb-0" style={{ fontSize: '0.8rem' }}>
                      {JSON.stringify({ 
                        user, 
                        hasToken: !!token,
                        tokenLength: token?.length 
                      }, null, 2)}
                    </pre>
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

export default ProfilePage;