import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { loginUser, clearAuthError } from './authSlice';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { isLoginLoading, loginError, isAuthenticated } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [message, setMessage] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Clear errors when component mounts
  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user types
    if (loginError) {
      dispatch(clearAuthError());
    }
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🔄 Đang gửi login request:', formData);
    const result = await dispatch(loginUser(formData));
    console.log('📨 Login result:', result);
    
    if (loginUser.fulfilled.match(result)) {
      setMessage('Đăng nhập thành công!');
      // Navigation will be handled by useEffect above
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formWrapper}>
        <h2 style={styles.title}>Đăng nhập</h2>
        
        {message && (
          <div style={{...styles.message, color: 'green'}}>
            {message}
          </div>
        )}
        
        {loginError && (
          <div style={{...styles.message, color: 'red'}}>
            {loginError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={styles.input}
              disabled={isLoginLoading}
              placeholder="Nhập email của bạn"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Mật khẩu:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={styles.input}
              disabled={isLoginLoading}
              placeholder="Nhập mật khẩu"
            />
          </div>

          <button
            type="submit"
            disabled={isLoginLoading}
            style={{
              ...styles.button,
              opacity: isLoginLoading ? 0.6 : 1,
              cursor: isLoginLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoginLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div style={styles.links}>
          <p>
            Chưa có tài khoản?{' '}
            <Link to="/signup" style={styles.link}>
              Đăng ký ngay
            </Link>
          </p>
          <Link to="/forgot-password" style={styles.link}>
            Quên mật khẩu?
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '80vh',
    padding: '20px',
  },
  formWrapper: {
    backgroundColor: '#fff',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '400px',
  },
  title: {
    textAlign: 'center',
    marginBottom: '30px',
    color: '#333',
    fontSize: '24px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#555',
  },
  input: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
    transition: 'border-color 0.3s',
  },
  button: {
    padding: '12px 20px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: 'background-color 0.3s',
    marginTop: '10px',
  },
  message: {
    textAlign: 'center',
    marginBottom: '15px',
    padding: '10px',
    borderRadius: '4px',
    fontSize: '14px',
  },
  links: {
    textAlign: 'center',
    marginTop: '25px',
  },
  link: {
    color: '#007bff',
    textDecoration: 'none',
  },
};

export default LoginPage;
