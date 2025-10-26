// pages/UserDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { ProtectedByRole } from '../components/RoleBasedComponent';
import { ROLES } from '../utils/rbac';

const UserDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [userStats, setUserStats] = useState({
    joinDate: new Date().toISOString(),
    postsCount: 0,
    commentsCount: 0,
    likesReceived: 0,
    profileViews: 0
  });

  const [recentActivity, setRecentActivity] = useState([
    { id: 1, action: 'Logged in', timestamp: new Date().toISOString(), type: 'login' },
    { id: 2, action: 'Updated profile', timestamp: new Date(Date.now() - 300000).toISOString(), type: 'profile' },
    { id: 3, action: 'Posted a comment', timestamp: new Date(Date.now() - 600000).toISOString(), type: 'comment' },
    { id: 4, action: 'Liked a post', timestamp: new Date(Date.now() - 900000).toISOString(), type: 'like' }
  ]);

  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Welcome to our platform!', type: 'info', read: false, timestamp: new Date().toISOString() },
    { id: 2, message: 'Your profile has been updated successfully', type: 'success', read: false, timestamp: new Date(Date.now() - 180000).toISOString() },
    { id: 3, message: 'New features are available', type: 'info', read: true, timestamp: new Date(Date.now() - 360000).toISOString() }
  ]);

  const [quickActions] = useState([
    { id: 1, title: 'Update Profile', icon: 'fas fa-user-edit', color: 'primary', action: 'profile' },
    { id: 2, title: 'Change Password', icon: 'fas fa-key', color: 'warning', action: 'password' },
    { id: 3, title: 'Privacy Settings', icon: 'fas fa-shield-alt', color: 'info', action: 'privacy' },
    { id: 4, title: 'Help & Support', icon: 'fas fa-question-circle', color: 'secondary', action: 'help' }
  ]);

  useEffect(() => {
    // Simulate loading user stats from API
    setUserStats({
      joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
      postsCount: 15,
      commentsCount: 42,
      likesReceived: 128,
      profileViews: 89
    });
  }, []);

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatJoinDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'login': return 'fas fa-sign-in-alt text-success';
      case 'profile': return 'fas fa-user-edit text-primary';
      case 'comment': return 'fas fa-comment text-info';
      case 'like': return 'fas fa-heart text-danger';
      case 'post': return 'fas fa-file-alt text-warning';
      default: return 'fas fa-circle text-secondary';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return 'fas fa-check-circle text-success';
      case 'warning': return 'fas fa-exclamation-triangle text-warning';
      case 'error': return 'fas fa-times-circle text-danger';
      default: return 'fas fa-info-circle text-info';
    }
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === notificationId 
        ? { ...notification, read: true }
        : notification
    ));
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'profile':
        // Navigate to profile page
        console.log('Navigate to profile');
        break;
      case 'password':
        // Open change password modal
        console.log('Open change password modal');
        break;
      case 'privacy':
        // Navigate to privacy settings
        console.log('Navigate to privacy settings');
        break;
      case 'help':
        // Open help center
        console.log('Open help center');
        break;
      default:
        break;
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'ADMIN': return 'bg-danger';
      case 'MODERATOR': return 'bg-warning text-dark';
      default: return 'bg-primary';
    }
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="h3">
              <i className="fas fa-tachometer-alt me-2 text-primary"></i>
              Dashboard
            </h1>
            <div className="text-muted">
              Welcome back, <strong>{user?.name || user?.email}</strong>
              <span className={`badge ms-2 ${getRoleBadgeClass(user?.role)}`}>
                {user?.role || 'USER'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* User Overview Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body text-center">
              <i className="fas fa-calendar-alt fa-2x mb-2"></i>
              <h6>Member Since</h6>
              <p className="mb-0">{formatJoinDate(userStats.joinDate)}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body text-center">
              <i className="fas fa-file-alt fa-2x mb-2"></i>
              <h3>{userStats.postsCount}</h3>
              <h6>Posts Created</h6>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body text-center">
              <i className="fas fa-comments fa-2x mb-2"></i>
              <h3>{userStats.commentsCount}</h3>
              <h6>Comments Made</h6>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-white">
            <div className="card-body text-center">
              <i className="fas fa-heart fa-2x mb-2"></i>
              <h3>{userStats.likesReceived}</h3>
              <h6>Likes Received</h6>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="fas fa-bolt me-2"></i>Quick Actions
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                {quickActions.map((action) => (
                  <div key={action.id} className="col-md-3 mb-3">
                    <button 
                      className={`btn btn-${action.color} w-100 h-100`}
                      onClick={() => handleQuickAction(action.action)}
                    >
                      <i className={`${action.icon} fa-2x mb-2`}></i>
                      <br />
                      {action.title}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Recent Activity */}
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="fas fa-history me-2"></i>Recent Activity
              </h5>
            </div>
            <div className="card-body">
              {recentActivity.length === 0 ? (
                <div className="text-center py-4">
                  <i className="fas fa-clock fa-3x text-muted mb-3"></i>
                  <h6 className="text-muted">No recent activity</h6>
                  <p className="text-muted">Your activities will appear here</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="list-group-item d-flex align-items-center">
                      <i className={`${getActivityIcon(activity.type)} me-3`}></i>
                      <div className="flex-grow-1">
                        <div>{activity.action}</div>
                        <small className="text-muted">{formatTimestamp(activity.timestamp)}</small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="fas fa-bell me-2"></i>Notifications
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="badge bg-danger ms-2">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </h5>
            </div>
            <div className="card-body">
              {notifications.length === 0 ? (
                <div className="text-center py-3">
                  <i className="fas fa-bell-slash fa-2x text-muted mb-2"></i>
                  <p className="text-muted mb-0">No notifications</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`list-group-item ${!notification.read ? 'bg-light' : ''}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => markNotificationAsRead(notification.id)}
                    >
                      <div className="d-flex align-items-start">
                        <i className={`${getNotificationIcon(notification.type)} me-2 mt-1`}></i>
                        <div className="flex-grow-1">
                          <div className={`${!notification.read ? 'fw-bold' : ''}`}>
                            {notification.message}
                          </div>
                          <small className="text-muted">
                            {formatTimestamp(notification.timestamp)}
                          </small>
                        </div>
                        {!notification.read && (
                          <div className="badge bg-primary rounded-pill ms-2">New</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Role-based additional content */}
      <div className="row mt-4">
        <div className="col-12">
          <ProtectedByRole allowedRoles={[ROLES.MODERATOR, ROLES.ADMIN]}>
            <div className="alert alert-info">
              <h6><i className="fas fa-info-circle me-2"></i>Staff Information</h6>
              <p className="mb-0">
                You have elevated privileges as a {user?.role}. 
                {user?.role === 'MODERATOR' && (
                  <> Access the <strong>Moderator Panel</strong> to manage content and user reports.</>
                )}
                {user?.role === 'ADMIN' && (
                  <> Access the <strong>Admin Dashboard</strong> for complete system management.</>
                )}
              </p>
            </div>
          </ProtectedByRole>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;