// pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { AdminOnly } from '../components/RoleBasedComponent';
import { ROLES } from '../utils/rbac';

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalModerators: 0,
    totalAdmins: 0,
    activeUsers: 0,
    newUsersToday: 0,
    systemHealth: 'Good'
  });

  const [recentActivities, setRecentActivities] = useState([
    { id: 1, user: 'john@example.com', action: 'Login', timestamp: new Date().toISOString(), type: 'info' },
    { id: 2, user: 'admin@example.com', action: 'Created new user', timestamp: new Date(Date.now() - 300000).toISOString(), type: 'success' },
    { id: 3, user: 'moderator@example.com', action: 'Deleted post', timestamp: new Date(Date.now() - 600000).toISOString(), type: 'warning' },
    { id: 4, user: 'jane@example.com', action: 'Updated profile', timestamp: new Date(Date.now() - 900000).toISOString(), type: 'info' }
  ]);

  const [systemLogs, setSystemLogs] = useState([
    { id: 1, level: 'INFO', message: 'Server started successfully', timestamp: new Date().toISOString() },
    { id: 2, level: 'WARN', message: 'High CPU usage detected', timestamp: new Date(Date.now() - 180000).toISOString() },
    { id: 3, level: 'ERROR', message: 'Failed login attempt from 192.168.1.100', timestamp: new Date(Date.now() - 360000).toISOString() },
    { id: 4, level: 'INFO', message: 'Database backup completed', timestamp: new Date(Date.now() - 720000).toISOString() }
  ]);

  useEffect(() => {
    // Simulate loading stats from API
    const loadStats = async () => {
      // In real app, this would be an API call
      setStats({
        totalUsers: 156,
        totalModerators: 8,
        totalAdmins: 3,
        activeUsers: 42,
        newUsersToday: 12,
        systemHealth: 'Excellent'
      });
    };

    loadStats();
  }, []);

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getLogBadgeClass = (level) => {
    switch (level) {
      case 'ERROR': return 'bg-danger';
      case 'WARN': return 'bg-warning';
      case 'INFO': return 'bg-info';
      default: return 'bg-secondary';
    }
  };

  const getActivityBadgeClass = (type) => {
    switch (type) {
      case 'success': return 'bg-success';
      case 'warning': return 'bg-warning';
      case 'error': return 'bg-danger';
      default: return 'bg-info';
    }
  };

  return (
    <AdminOnly fallback={
      <div className="container mt-5">
        <div className="alert alert-danger">
          <h4>Access Denied</h4>
          <p>You need Admin privileges to access this page.</p>
        </div>
      </div>
    }>
      <div className="container mt-4">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="h3">
                <i className="fas fa-tachometer-alt me-2 text-primary"></i>
                Admin Dashboard
              </h1>
              <div className="text-muted">
                Welcome back, <strong>{user?.name}</strong>
                <span className="badge bg-danger ms-2">ADMIN</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row mb-4">
          <div className="col-md-2">
            <div className="card bg-primary text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h5 className="card-title">Total Users</h5>
                    <h2>{stats.totalUsers}</h2>
                  </div>
                  <div className="align-self-center">
                    <i className="fas fa-users fa-2x"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="card bg-success text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h5 className="card-title">Active Users</h5>
                    <h2>{stats.activeUsers}</h2>
                  </div>
                  <div className="align-self-center">
                    <i className="fas fa-user-check fa-2x"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="card bg-warning text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h5 className="card-title">Moderators</h5>
                    <h2>{stats.totalModerators}</h2>
                  </div>
                  <div className="align-self-center">
                    <i className="fas fa-user-shield fa-2x"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="card bg-danger text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h5 className="card-title">Admins</h5>
                    <h2>{stats.totalAdmins}</h2>
                  </div>
                  <div className="align-self-center">
                    <i className="fas fa-user-cog fa-2x"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="card bg-info text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h5 className="card-title">New Today</h5>
                    <h2>{stats.newUsersToday}</h2>
                  </div>
                  <div className="align-self-center">
                    <i className="fas fa-user-plus fa-2x"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="card bg-secondary text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h5 className="card-title">System Health</h5>
                    <h6>{stats.systemHealth}</h6>
                  </div>
                  <div className="align-self-center">
                    <i className="fas fa-heartbeat fa-2x"></i>
                  </div>
                </div>
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
                  <div className="col-md-3">
                    <button className="btn btn-primary w-100 mb-2">
                      <i className="fas fa-user-plus me-2"></i>Create User
                    </button>
                  </div>
                  <div className="col-md-3">
                    <button className="btn btn-warning w-100 mb-2">
                      <i className="fas fa-user-shield me-2"></i>Manage Roles
                    </button>
                  </div>
                  <div className="col-md-3">
                    <button className="btn btn-info w-100 mb-2">
                      <i className="fas fa-cog me-2"></i>System Settings
                    </button>
                  </div>
                  <div className="col-md-3">
                    <button className="btn btn-success w-100 mb-2">
                      <i className="fas fa-database me-2"></i>Backup Data
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          {/* Recent Activities */}
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  <i className="fas fa-history me-2"></i>Recent Activities
                </h5>
              </div>
              <div className="card-body">
                <div className="list-group list-group-flush">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{activity.user}</strong>
                        <div className="text-muted">{activity.action}</div>
                        <small className="text-muted">{formatTimestamp(activity.timestamp)}</small>
                      </div>
                      <span className={`badge ${getActivityBadgeClass(activity.type)} rounded-pill`}>
                        {activity.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* System Logs */}
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  <i className="fas fa-file-alt me-2"></i>System Logs
                </h5>
              </div>
              <div className="card-body">
                <div className="list-group list-group-flush">
                  {systemLogs.map((log) => (
                    <div key={log.id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <span className={`badge ${getLogBadgeClass(log.level)} me-2`}>
                            {log.level}
                          </span>
                          {log.message}
                        </div>
                        <small className="text-muted">{formatTimestamp(log.timestamp)}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminOnly>
  );
};

export default AdminDashboard;