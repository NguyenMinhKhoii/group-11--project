/**
 * Dashboard Component - Giống y hệt dashboard.html với Redux
 * Hoạt động 6 - Frontend Redux & Protected Routes 
 */

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutUser, selectAuth } from '../../redux/slices/authSlice';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector(selectAuth);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/redux-login');
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/redux-login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h3>🔐 Please login to access dashboard</h3>
        <button 
          onClick={() => navigate('/redux-login')}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Go to Login
        </button>
      </div>
    );
  }

  const styles = `
    body { 
      background: #f8f9fa;
      min-height: 100vh; 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 0;
      padding: 0;
    }
    .navbar { 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
      backdrop-filter: blur(10px);
      box-shadow: 0 2px 20px rgba(0,0,0,0.15);
      padding: 1rem 0;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
    }
    .container {
      max-width: 1400px;
      padding: 0 2rem;
      margin: 0 auto;
    }
    .card { 
      border-radius: 20px; 
      box-shadow: 0 15px 35px rgba(0,0,0,0.1);
      border: none;
      margin-bottom: 2rem;
      transition: transform 0.3s ease;
      background: white;
    }
    .card:hover {
      transform: translateY(-5px);
    }
    .card-success { background: linear-gradient(135deg, #10b981, #047857); color: white; }
    .card-danger { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; }
    .card-body {
      padding: 2.5rem;
    }
    .avatar-container {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      border: 4px solid #dc3545;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f8f9fa;
      overflow: hidden;
    }
    .stats-card {
      text-align: center;
      padding: 1.5rem;
    }
    .stats-number {
      font-size: 2.5rem;
      font-weight: bold;
      margin-bottom: 0.5rem;
    }
    .btn-custom {
      border-radius: 30px;
      padding: 15px 35px;
      font-weight: 700;
      margin: 8px;
      font-size: 1rem;
      min-width: 180px;
      transition: all 0.3s ease;
      border: none;
      cursor: pointer;
    }
    .btn-custom:hover { 
      transform: translateY(-3px); 
      box-shadow: 0 10px 25px rgba(0,0,0,0.2); 
    }
    .welcome-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 25px;
      padding: 3rem 2rem;
      margin-bottom: 3rem;
      text-align: center;
    }
    .dashboard-title {
      font-size: 2.5rem;
      font-weight: 800;
      margin-bottom: 1rem;
    }
    .role-badge { 
      background: #fbbf24; 
      color: #92400e; 
      padding: 4px 12px; 
      border-radius: 12px; 
      font-size: 0.875rem;
      font-weight: 500;
    }
  `;

  return (
    <div>
      <style>{styles}</style>
      
      {/* Fixed Navigation */}
      <nav className="navbar">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <h1 style={{ color: 'white', margin: 0, fontSize: '1.8rem' }}>
              🔥 Group 11 Dashboard
            </h1>
            <div style={{
              background: '#fbbf24',
              color: '#92400e',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '0.875rem',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              {user?.role === 'admin' ? 'Admin User' : 'Regular User'} ({user?.role})
              <button 
                onClick={handleLogout}
                style={{
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '4px 8px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ paddingTop: '100px' }}>
        <div className="container">
          {/* Welcome Section */}
          <div className="welcome-section">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ textAlign: 'left' }}>
                <h2 className="dashboard-title">Chào mừng, {user?.fullname || user?.name || 'User'}!</h2>
                <p style={{ margin: '5px 0', opacity: '0.9', fontSize: '1.1rem' }}>
                  Email: {user?.email} | Role: <span className="role-badge">{user?.role}</span> | ID: {user?.id || 'N/A'}
                </p>
                <p style={{ margin: '10px 0', opacity: '0.8' }}>
                  Chào mừng bạn trở lại và hệ thống quản lý Group 11
                </p>
              </div>
              <div className="avatar-container">
                <div style={{ fontSize: '60px' }}>👤</div>
              </div>
            </div>
          </div>

          {/* Dashboard Cards */}
          <div style={{ marginBottom: '2rem' }}>
            {user?.role === 'admin' ? (
              // Admin Dashboard
              <div className="card card-danger">
                <div className="card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h4 style={{ margin: 0, color: 'white' }}>
                      � Admin Panel - User Management
                    </h4>
                    <button 
                      className="btn-custom" 
                      style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}
                    >
                      🔄 Làm mới
                    </button>
                  </div>

                  {/* Admin Stats Row */}
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                    <div className="stats-card" style={{ flex: 1, background: 'rgba(255,255,255,0.2)', borderRadius: '15px' }}>
                      <div className="stats-number" style={{ color: 'white' }}>5</div>
                      <div style={{ color: 'rgba(255,255,255,0.8)' }}>Total Users</div>
                    </div>
                    <div className="stats-card" style={{ flex: 1, background: 'rgba(255,255,255,0.2)', borderRadius: '15px' }}>
                      <div className="stats-number" style={{ color: 'white' }}>3</div>
                      <div style={{ color: 'rgba(255,255,255,0.8)' }}>Active Sessions</div>
                    </div>
                    <div className="stats-card" style={{ flex: 1, background: 'rgba(255,255,255,0.2)', borderRadius: '15px' }}>
                      <div className="stats-number" style={{ color: 'white' }}>156</div>
                      <div style={{ color: 'rgba(255,255,255,0.8)' }}>System Activities</div>
                    </div>
                  </div>

                  {/* Admin Action Buttons */}
                  <div style={{ textAlign: 'center' }}>
                    <button className="btn-custom" style={{ background: 'rgba(255,255,255,0.9)', color: '#ef4444' }}>
                      👥 Quản lý User
                    </button>
                    <button className="btn-custom" style={{ background: '#fbbf24', color: '#92400e' }}>
                      🛡️ Phân quyền
                    </button>
                    <button className="btn-custom" style={{ background: '#06b6d4', color: 'white' }}>
                      📷 Upload Avatar
                    </button>
                    <button 
                      onClick={() => navigate('/admin-redux')}
                      className="btn-custom" 
                      style={{ background: '#6b7280', color: 'white' }}
                    >
                      🚀 Advanced Panel
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // User Dashboard
              <div className="card card-success">
                <div className="card-body">
                  <h4 style={{ margin: '0 0 2rem 0', color: 'white' }}>
                    👤 User Dashboard
                  </h4>

                  {/* User Stats */}
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                    <div className="stats-card" style={{ flex: 1, background: 'rgba(255,255,255,0.2)', borderRadius: '15px' }}>
                      <div className="stats-number" style={{ color: 'white' }}>12</div>
                      <div style={{ color: 'rgba(255,255,255,0.8)' }}>Hoạt động</div>
                    </div>
                    <div className="stats-card" style={{ flex: 1, background: 'rgba(255,255,255,0.2)', borderRadius: '15px' }}>
                      <div className="stats-number" style={{ color: 'white' }}>8</div>
                      <div style={{ color: 'rgba(255,255,255,0.8)' }}>Mục tiêu hoàn thành</div>
                    </div>
                    <div className="stats-card" style={{ flex: 1, background: 'rgba(255,255,255,0.2)', borderRadius: '15px' }}>
                      <div className="stats-number" style={{ color: 'white' }}>4.5</div>
                      <div style={{ color: 'rgba(255,255,255,0.8)' }}>⭐ Điểm đánh giá</div>
                    </div>
                  </div>

                  {/* User Action Buttons */}
                  <div style={{ textAlign: 'center' }}>
                    <button 
                      onClick={() => navigate('/profile-redux')}
                      className="btn-custom" 
                      style={{ background: '#065f46', color: 'white' }}
                    >
                      📝 Xem hồ sơ
                    </button>
                    <button className="btn-custom" style={{ background: '#1d4ed8', color: 'white' }}>
                      🎯 Hoạt động
                    </button>
                    <button className="btn-custom" style={{ background: '#0891b2', color: 'white' }}>
                      📷 Upload Avatar
                    </button>
                    <button className="btn-custom" style={{ background: '#ca8a04', color: 'white' }}>
                      🔄 Đổi mật khẩu
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Demo Refresh Token Section */}
          <div className="card" style={{ background: '#cce7ff', border: '2px solid #007bff' }}>
            <div className="card-body">
              <h4 style={{ color: '#0056b3', margin: '0 0 1rem 0' }}>
                🔧 Demo Refresh Token & Session Management (Redux Enhanced)
              </h4>
              <p style={{ color: '#495057', margin: '10px 0' }}>
                Ứng dụng này demo tính năng <strong>Refresh Token & Session Management</strong> với Redux state management.
              </p>
              
              <div style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <p><strong>Access Token:</strong> Hết hạn sau 15 phút</p>
                  <p><strong>Refresh Token:</strong> Hết hạn sau 7 ngày</p>
                  <p><strong>Auto Refresh:</strong> Tự động làm mới token khi hết hạn</p>
                  <p><strong>Secure Logout:</strong> Thu hồi token khi đăng xuất</p>
                </div>
                <div style={{ flex: 1 }}>
                  <p><strong>Token Rotation:</strong> Tạo token mới mỗi lần refresh</p>
                  <p><strong>Token Rotation:</strong> Tạo token mới mỗi lần refresh</p>
                  <p><strong>Redux State:</strong> Persistent authentication state</p>
                  <p><strong>Protected Routes:</strong> Role-based access control</p>
                </div>
                <div>
                  <button 
                    className="btn-custom" 
                    style={{ background: '#007bff', color: 'white', minWidth: '120px' }}
                  >
                    🔄 Test Refresh Token
                  </button>
                  <button 
                    className="btn-custom" 
                    style={{ background: '#28a745', color: 'white', minWidth: '120px' }}
                  >
                    ✅ Test Session
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;