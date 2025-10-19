/**
 * Login Page Component
 * Hoạt động 6 - Frontend Redux & Protected Routes
 */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { loginUser, clearError, selectAuth } from '../../redux/slices/authSlice';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { loading, error, isAuthenticated } = useSelector(selectAuth);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/profile';
      console.log('✅ Already authenticated, redirecting to:', from);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Clear error when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🔐 Login form submitted:', formData.email);
    
    try {
      const result = await dispatch(loginUser(formData));
      
      if (loginUser.fulfilled.match(result)) {
        console.log('✅ Login successful, redirecting...');
        const from = location.state?.from?.pathname || '/profile';
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error('❌ Login failed:', err);
    }
  };

  // Quick login buttons for testing
  const quickLogin = (email, password, role) => {
    setFormData({ email, password });
    dispatch(loginUser({ email, password }));
  };

  return (
    <div className="container">
      <div className="row justify-content-center mt-5">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0 text-center">
                🔐 Login to System
              </h3>
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  <i className="bi bi-exclamation-triangle"></i> {error}
                </div>
              )}

              {location.state?.from && (
                <div className="alert alert-info">
                  <i className="bi bi-info-circle"></i> Please login to access <strong>{location.state.from.pathname}</strong>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    placeholder="Enter your email"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    placeholder="Enter your password"
                  />
                </div>

                <div className="d-grid">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Logging in...
                      </>
                    ) : (
                      'Login'
                    )}
                  </button>
                </div>
              </form>

              {/* Quick Login Buttons for Testing */}
              <div className="mt-4">
                <h6 className="text-muted">Quick Login (For Testing):</h6>
                <div className="d-grid gap-2">
                  <button 
                    className="btn btn-outline-success btn-sm"
                    onClick={() => quickLogin('admin@example.com', '123456', 'admin')}
                    disabled={loading}
                  >
                    👑 Login as Admin
                  </button>
                  <button 
                    className="btn btn-outline-info btn-sm"
                    onClick={() => quickLogin('user@example.com', '123456', 'user')}
                    disabled={loading}
                  >
                    👤 Login as User
                  </button>
                </div>
              </div>

              <div className="text-center mt-3">
                <p className="mb-0">
                  Don't have an account? <Link to="/register" className="text-decoration-none">Register here</Link>
                </p>
                <p className="mb-0 mt-1">
                  <Link to="/forgot-password" className="text-decoration-none text-muted">
                    Forgot password?
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;