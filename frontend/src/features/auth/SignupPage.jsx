import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { signupUser, clearAuthError } from './authSlice';

const SignupPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { isSignupLoading, signupError, isAuthenticated } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [message, setMessage] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

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
    if (signupError) {
      dispatch(clearAuthError());
    }
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    setMessage('');
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Tên không được để trống';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email không được để trống';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email không hợp lệ';
    }
    
    if (!formData.password) {
      errors.password = 'Mật khẩu không được để trống';
    } else if (formData.password.length < 6) {
      errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const { confirmPassword, ...signupData } = formData;
    const result = await dispatch(signupUser(signupData));
    
    if (signupUser.fulfilled.match(result)) {
      setMessage('Đăng ký thành công! Bây giờ bạn có thể đăng nhập.');
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
      // Optionally redirect to login page after a delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formWrapper}>
        <h2 style={styles.title}>Đăng ký tài khoản</h2>
        
        {message && (
          <div style={{...styles.message, color: 'green'}}>
            {message}
          </div>
        )}
        
        {signupError && (
          <div style={{...styles.message, color: 'red'}}>
            {signupError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Tên:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={styles.input}
              disabled={isSignupLoading}
              placeholder="Nhập tên của bạn"
            />
            {formErrors.name && (
              <span style={styles.error}>{formErrors.name}</span>
            )}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={styles.input}
              disabled={isSignupLoading}
              placeholder="Nhập email của bạn"
            />
            {formErrors.email && (
              <span style={styles.error}>{formErrors.email}</span>
            )}
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
              disabled={isSignupLoading}
              placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
            />
            {formErrors.password && (
              <span style={styles.error}>{formErrors.password}</span>
            )}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Xác nhận mật khẩu:</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              style={styles.input}
              disabled={isSignupLoading}
              placeholder="Nhập lại mật khẩu"
            />
            {formErrors.confirmPassword && (
              <span style={styles.error}>{formErrors.confirmPassword}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSignupLoading}
            style={{
              ...styles.button,
              opacity: isSignupLoading ? 0.6 : 1,
              cursor: isSignupLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isSignupLoading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>

        <div style={styles.links}>
          <p>
            Đã có tài khoản?{' '}
            <Link to="/login" style={styles.link}>
              Đăng nhập ngay
            </Link>
          </p>
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
    backgroundColor: '#28a745',
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
  error: {
    color: 'red',
    fontSize: '12px',
    marginTop: '4px',
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

export default SignupPage;
