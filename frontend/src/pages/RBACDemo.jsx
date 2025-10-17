// pages/RBACDemo.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { AdminOnly, ModeratorOnly, ProtectedByRole, RoleBasedComponent } from '../components/RoleBasedComponent';
import { ROLES } from '../utils/rbac';
import { useRBAC } from '../hooks/useRBAC';

const RBACDemo = () => {
  const { user } = useSelector((state) => state.auth);
  const { hasRole, canAccess } = useRBAC();

  const demoFeatures = [
    { 
      name: 'View Dashboard', 
      roles: [ROLES.USER, ROLES.MODERATOR, ROLES.ADMIN],
      description: 'Basic dashboard access for all users'
    },
    { 
      name: 'Moderate Content', 
      roles: [ROLES.MODERATOR, ROLES.ADMIN],
      description: 'Content moderation capabilities'
    },
    { 
      name: 'User Management', 
      roles: [ROLES.ADMIN],
      description: 'Full user management system'
    },
    { 
      name: 'System Settings', 
      roles: [ROLES.ADMIN],
      description: 'System-wide configuration access'
    },
    { 
      name: 'Ban Users', 
      roles: [ROLES.ADMIN],
      description: 'Permanent user banning (Admin only)'
    }
  ];

  const getAccessStatus = (requiredRoles) => {
    return hasRole(requiredRoles);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case ROLES.ADMIN: return 'danger';
      case ROLES.MODERATOR: return 'warning';
      case ROLES.USER: return 'primary';
      default: return 'secondary';
    }
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <h1 className="h3 mb-4">
            <i className="fas fa-shield-alt me-2 text-info"></i>
            RBAC (Role-Based Access Control) Demo
          </h1>
        </div>
      </div>

      {/* Current User Info */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card bg-light">
            <div className="card-body">
              <h5 className="card-title">
                <i className="fas fa-user me-2"></i>Current User Information
              </h5>
              <div className="row">
                <div className="col-md-6">
                  <p><strong>Name:</strong> {user?.name || 'N/A'}</p>
                  <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
                </div>
                <div className="col-md-6">
                  <p>
                    <strong>Role:</strong> 
                    <span className={`badge bg-${getRoleColor(user?.role)} ms-2`}>
                      {user?.role || 'USER'}
                    </span>
                  </p>
                  <p><strong>Permissions:</strong> Based on role hierarchy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Access Matrix */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-list-check me-2"></i>Feature Access Matrix
              </h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Feature</th>
                      <th>Description</th>
                      <th>Required Roles</th>
                      <th>Your Access</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demoFeatures.map((feature, index) => (
                      <tr key={index}>
                        <td><strong>{feature.name}</strong></td>
                        <td>{feature.description}</td>
                        <td>
                          {feature.roles.map(role => (
                            <span key={role} className={`badge bg-${getRoleColor(role)} me-1`}>
                              {role}
                            </span>
                          ))}
                        </td>
                        <td>
                          {getAccessStatus(feature.roles) ? (
                            <span className="badge bg-success">
                              <i className="fas fa-check me-1"></i>Allowed
                            </span>
                          ) : (
                            <span className="badge bg-danger">
                              <i className="fas fa-times me-1"></i>Denied
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Role-Based Components Demo */}
      <div className="row">
        <div className="col-md-4">
          <AdminOnly fallback={
            <div className="card border-danger">
              <div className="card-header bg-danger text-white">
                <h6 className="mb-0">Admin Only Content</h6>
              </div>
              <div className="card-body">
                <p className="text-danger">Access Denied: Admin privileges required</p>
              </div>
            </div>
          }>
            <div className="card border-success">
              <div className="card-header bg-success text-white">
                <h6 className="mb-0">Admin Only Content</h6>
              </div>
              <div className="card-body">
                <p className="text-success">Welcome Admin! You can see this content.</p>
                <button className="btn btn-danger">
                  <i className="fas fa-user-times me-2"></i>Ban User
                </button>
              </div>
            </div>
          </AdminOnly>
        </div>

        <div className="col-md-4">
          <ModeratorOnly fallback={
            <div className="card border-warning">
              <div className="card-header bg-warning text-dark">
                <h6 className="mb-0">Moderator Only Content</h6>
              </div>
              <div className="card-body">
                <p className="text-warning">Access Denied: Moderator privileges required</p>
              </div>
            </div>
          }>
            <div className="card border-success">
              <div className="card-header bg-success text-white">
                <h6 className="mb-0">Moderator Only Content</h6>
              </div>
              <div className="card-body">
                <p className="text-success">Welcome Moderator! You can moderate content.</p>
                <button className="btn btn-warning">
                  <i className="fas fa-flag me-2"></i>Review Reports
                </button>
              </div>
            </div>
          </ModeratorOnly>
        </div>

        <div className="col-md-4">
          <ProtectedByRole allowedRoles={[ROLES.USER, ROLES.MODERATOR, ROLES.ADMIN]} fallback={
            <div className="card border-info">
              <div className="card-header bg-info text-white">
                <h6 className="mb-0">All Users Content</h6>
              </div>
              <div className="card-body">
                <p className="text-info">Please log in to see this content</p>
              </div>
            </div>
          }>
            <div className="card border-success">
              <div className="card-header bg-success text-white">
                <h6 className="mb-0">All Users Content</h6>
              </div>
              <div className="card-body">
                <p className="text-success">Welcome! All authenticated users can see this.</p>
                <button className="btn btn-primary">
                  <i className="fas fa-edit me-2"></i>Edit Profile
                </button>
              </div>
            </div>
          </ProtectedByRole>
        </div>
      </div>

      {/* Dynamic Component Demo */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-cogs me-2"></i>Dynamic Role-Based Rendering
              </h5>
            </div>
            <div className="card-body">
              <RoleBasedComponent
                roles={{
                  [ROLES.USER]: (
                    <div className="alert alert-primary">
                      <h6><i className="fas fa-user me-2"></i>User View</h6>
                      <p>You are viewing this as a regular user with basic permissions.</p>
                    </div>
                  ),
                  [ROLES.MODERATOR]: (
                    <div className="alert alert-warning">
                      <h6><i className="fas fa-shield-alt me-2"></i>Moderator View</h6>
                      <p>You have moderator privileges with additional content management tools.</p>
                    </div>
                  ),
                  [ROLES.ADMIN]: (
                    <div className="alert alert-danger">
                      <h6><i className="fas fa-crown me-2"></i>Administrator View</h6>
                      <p>You have full administrative access to all system features.</p>
                    </div>
                  )
                }}
                fallback={
                  <div className="alert alert-secondary">
                    <h6><i className="fas fa-question-circle me-2"></i>Unknown Role</h6>
                    <p>Your role is not recognized by the system.</p>
                  </div>
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Test Different Roles Section */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-flask me-2"></i>Test Different Roles
              </h5>
            </div>
            <div className="card-body">
              <p className="text-muted">
                To test different role behaviors, you would need to:
              </p>
              <ol>
                <li>Create test users with different roles (USER, MODERATOR, ADMIN)</li>
                <li>Log in with each user to see different UI behaviors</li>
                <li>Navigate to different protected routes to see access control</li>
                <li>Try accessing admin/moderator features with different roles</li>
              </ol>
              
              <div className="alert alert-info mt-3">
                <h6><i className="fas fa-lightbulb me-2"></i>Demo Instructions</h6>
                <p className="mb-0">
                  This page demonstrates how the RBAC system works. 
                  Different content is shown/hidden based on your current role: <strong>{user?.role || 'USER'}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RBACDemo;