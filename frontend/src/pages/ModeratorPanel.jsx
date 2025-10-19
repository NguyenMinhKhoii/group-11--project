// pages/ModeratorPanel.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { ModeratorOnly, ProtectedByRole } from '../components/RoleBasedComponent';
import { ROLES } from '../utils/rbac';

const ModeratorPanel = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('reports');
  
  const [userReports, setUserReports] = useState([
    { id: 1, reportedUser: 'john@example.com', reportedBy: 'jane@example.com', reason: 'Spam', status: 'pending', timestamp: new Date().toISOString(), severity: 'medium' },
    { id: 2, reportedUser: 'test@example.com', reportedBy: 'admin@example.com', reason: 'Inappropriate content', status: 'reviewed', timestamp: new Date(Date.now() - 300000).toISOString(), severity: 'high' },
    { id: 3, reportedUser: 'user@example.com', reportedBy: 'moderator@example.com', reason: 'Harassment', status: 'resolved', timestamp: new Date(Date.now() - 600000).toISOString(), severity: 'high' }
  ]);

  const [contentQueue, setContentQueue] = useState([
    { id: 1, type: 'Post', content: 'This is a sample post content...', author: 'user1@example.com', status: 'pending', flagged: false, timestamp: new Date().toISOString() },
    { id: 2, type: 'Comment', content: 'This comment needs review...', author: 'user2@example.com', status: 'flagged', flagged: true, timestamp: new Date(Date.now() - 180000).toISOString() },
    { id: 3, type: 'Post', content: 'Another post for moderation...', author: 'user3@example.com', status: 'approved', flagged: false, timestamp: new Date(Date.now() - 360000).toISOString() }
  ]);

  const [moderatorStats, setModeratorStats] = useState({
    pendingReports: 5,
    todayActions: 12,
    contentReviewed: 34,
    usersWarned: 3,
    usersBanned: 1,
    postsRemoved: 8
  });

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'bg-warning text-dark';
      case 'reviewed': return 'bg-info';
      case 'resolved': return 'bg-success';
      case 'rejected': return 'bg-secondary';
      case 'flagged': return 'bg-danger';
      case 'approved': return 'bg-success';
      default: return 'bg-secondary';
    }
  };

  const getSeverityBadgeClass = (severity) => {
    switch (severity) {
      case 'high': return 'bg-danger';
      case 'medium': return 'bg-warning text-dark';
      case 'low': return 'bg-info';
      default: return 'bg-secondary';
    }
  };

  const handleReportAction = (reportId, action) => {
    setUserReports(prev => prev.map(report => 
      report.id === reportId 
        ? { ...report, status: action }
        : report
    ));
    
    // Update stats
    setModeratorStats(prev => ({
      ...prev,
      todayActions: prev.todayActions + 1
    }));
  };

  const handleContentAction = (contentId, action) => {
    setContentQueue(prev => prev.map(content => 
      content.id === contentId 
        ? { ...content, status: action }
        : content
    ));
    
    // Update stats
    setModeratorStats(prev => ({
      ...prev,
      contentReviewed: prev.contentReviewed + 1
    }));
  };

  return (
    <ModeratorOnly fallback={
      <div className="container mt-5">
        <div className="alert alert-warning">
          <h4>Access Denied</h4>
          <p>You need Moderator or Admin privileges to access this panel.</p>
        </div>
      </div>
    }>
      <div className="container mt-4">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="h3">
                <i className="fas fa-shield-alt me-2 text-warning"></i>
                Moderator Panel
              </h1>
              <div className="text-muted">
                Welcome, <strong>{user?.name}</strong>
                <span className={`badge ms-2 ${user?.role === 'ADMIN' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Moderator Stats */}
        <div className="row mb-4">
          <div className="col-md-2">
            <div className="card bg-warning text-dark">
              <div className="card-body text-center">
                <h3>{moderatorStats.pendingReports}</h3>
                <small>Pending Reports</small>
              </div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="card bg-primary text-white">
              <div className="card-body text-center">
                <h3>{moderatorStats.todayActions}</h3>
                <small>Today's Actions</small>
              </div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="card bg-info text-white">
              <div className="card-body text-center">
                <h3>{moderatorStats.contentReviewed}</h3>
                <small>Content Reviewed</small>
              </div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="card bg-success text-white">
              <div className="card-body text-center">
                <h3>{moderatorStats.usersWarned}</h3>
                <small>Users Warned</small>
              </div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="card bg-danger text-white">
              <div className="card-body text-center">
                <h3>{moderatorStats.usersBanned}</h3>
                <small>Users Banned</small>
              </div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="card bg-secondary text-white">
              <div className="card-body text-center">
                <h3>{moderatorStats.postsRemoved}</h3>
                <small>Posts Removed</small>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              <i className="fas fa-flag me-2"></i>User Reports
              {moderatorStats.pendingReports > 0 && (
                <span className="badge bg-danger ms-2">{moderatorStats.pendingReports}</span>
              )}
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'content' ? 'active' : ''}`}
              onClick={() => setActiveTab('content')}
            >
              <i className="fas fa-eye me-2"></i>Content Review
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'actions' ? 'active' : ''}`}
              onClick={() => setActiveTab('actions')}
            >
              <i className="fas fa-tools me-2"></i>Quick Actions
            </button>
          </li>
        </ul>

        {/* Tab Content */}
        {activeTab === 'reports' && (
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-flag me-2"></i>User Reports Management
              </h5>
            </div>
            <div className="card-body">
              {userReports.length === 0 ? (
                <div className="text-center py-4">
                  <i className="fas fa-check-circle fa-3x text-success mb-3"></i>
                  <h5>No pending reports</h5>
                  <p className="text-muted">All reports have been handled!</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Reported User</th>
                        <th>Reported By</th>
                        <th>Reason</th>
                        <th>Severity</th>
                        <th>Status</th>
                        <th>Timestamp</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userReports.map(report => (
                        <tr key={report.id}>
                          <td><strong>{report.reportedUser}</strong></td>
                          <td>{report.reportedBy}</td>
                          <td>{report.reason}</td>
                          <td>
                            <span className={`badge ${getSeverityBadgeClass(report.severity)}`}>
                              {report.severity.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${getStatusBadgeClass(report.status)}`}>
                              {report.status.toUpperCase()}
                            </span>
                          </td>
                          <td><small>{formatTimestamp(report.timestamp)}</small></td>
                          <td>
                            {report.status === 'pending' && (
                              <div className="btn-group" role="group">
                                <button 
                                  className="btn btn-sm btn-success"
                                  onClick={() => handleReportAction(report.id, 'resolved')}
                                >
                                  Resolve
                                </button>
                                <button 
                                  className="btn btn-sm btn-warning"
                                  onClick={() => handleReportAction(report.id, 'reviewed')}
                                >
                                  Review
                                </button>
                                <button 
                                  className="btn btn-sm btn-danger"
                                  onClick={() => handleReportAction(report.id, 'rejected')}
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-eye me-2"></i>Content Moderation Queue
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                {contentQueue.map(content => (
                  <div key={content.id} className="col-md-6 mb-3">
                    <div className={`card ${content.flagged ? 'border-danger' : ''}`}>
                      <div className="card-header d-flex justify-content-between align-items-center">
                        <span>
                          <i className={`fas ${content.type === 'Post' ? 'fa-file-alt' : 'fa-comment'} me-2`}></i>
                          {content.type} by {content.author}
                        </span>
                        <div>
                          {content.flagged && <i className="fas fa-flag text-danger me-2" title="Flagged"></i>}
                          <span className={`badge ${getStatusBadgeClass(content.status)}`}>
                            {content.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="card-body">
                        <p className="card-text">{content.content}</p>
                        <small className="text-muted">
                          {formatTimestamp(content.timestamp)}
                        </small>
                      </div>
                      {content.status === 'pending' || content.status === 'flagged' ? (
                        <div className="card-footer">
                          <div className="btn-group w-100" role="group">
                            <button 
                              className="btn btn-success"
                              onClick={() => handleContentAction(content.id, 'approved')}
                            >
                              Approve
                            </button>
                            <button 
                              className="btn btn-warning"
                              onClick={() => handleContentAction(content.id, 'flagged')}
                            >
                              Flag
                            </button>
                            <button 
                              className="btn btn-danger"
                              onClick={() => handleContentAction(content.id, 'rejected')}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'actions' && (
          <div className="row">
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">
                    <i className="fas fa-tools me-2"></i>User Management
                  </h5>
                </div>
                <div className="card-body">
                  <div className="d-grid gap-2">
                    <button className="btn btn-warning">
                      <i className="fas fa-exclamation-triangle me-2"></i>Send Warning to User
                    </button>
                    <button className="btn btn-info">
                      <i className="fas fa-comment-slash me-2"></i>Mute User (24h)
                    </button>
                    <button className="btn btn-danger">
                      <i className="fas fa-ban me-2"></i>Temporary Ban (7 days)
                    </button>
                    
                    <ProtectedByRole allowedRoles={[ROLES.ADMIN]} fallback={null}>
                      <hr />
                      <button className="btn btn-dark">
                        <i className="fas fa-user-times me-2"></i>Permanent Ban (Admin Only)
                      </button>
                    </ProtectedByRole>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">
                    <i className="fas fa-cog me-2"></i>Content Actions
                  </h5>
                </div>
                <div className="card-body">
                  <div className="d-grid gap-2">
                    <button className="btn btn-primary">
                      <i className="fas fa-eye me-2"></i>Review Flagged Content
                    </button>
                    <button className="btn btn-warning">
                      <i className="fas fa-edit me-2"></i>Edit Content
                    </button>
                    <button className="btn btn-danger">
                      <i className="fas fa-trash me-2"></i>Remove Content
                    </button>
                    <button className="btn btn-info">
                      <i className="fas fa-archive me-2"></i>Archive Content
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ModeratorOnly>
  );
};

export default ModeratorPanel;