import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';

export default function LogoutButton({ onMessage }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      onMessage && onMessage("Đăng xuất thành công!");
      navigate('/login');
    } catch (error) {
      onMessage && onMessage("Đăng xuất thất bại!");
    }
  };

  return (
    <button 
      onClick={handleLogout} 
      style={styles.button}
      disabled={isLoading}
    >
      {isLoading ? "Đang đăng xuất..." : "Đăng xuất"}
    </button>
  );
}

const styles = {
  button: {
    padding: "10px 20px",
    background: "#dc3545",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    borderRadius: "4px",
  },
};
