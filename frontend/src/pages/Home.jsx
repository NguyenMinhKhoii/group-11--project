import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setAuthFromStorage } from "../features/auth/authSlice";
import LogoutButton from "../components/LogoutButton";

function Home() {
  const dispatch = useDispatch();
  const { user, isAuthenticated, accessToken } = useSelector((state) => state.auth);

  useEffect(() => {
    // Initialize auth state from localStorage on page load
    dispatch(setAuthFromStorage());
  }, [dispatch]);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🏠 Chào mừng đến với Group 11</h2>
      
      <div style={styles.statusCard}>
        <h3>🔐 Trạng thái đăng nhập</h3>
        {isAuthenticated ? (
          <div style={styles.loggedIn}>
            <p><strong>✅ Đã đăng nhập</strong></p>
            <p><strong>👤 Tên:</strong> {user?.name}</p>
            <p><strong>📧 Email:</strong> {user?.email}</p>
            <p><strong>🔑 Access Token:</strong> {accessToken ? `${accessToken.substring(0, 20)}...` : 'Không có'}</p>
            <LogoutButton />
          </div>
        ) : (
          <div style={styles.loggedOut}>
            <p><strong>❌ Chưa đăng nhập</strong></p>
            <p>Vui lòng <a href="/login" style={styles.link}>đăng nhập</a> hoặc <a href="/signup" style={styles.link}>đăng ký</a></p>
          </div>
        )}
      </div>

      <div style={styles.infoCard}>
        <h3>🎯 Demo Refresh Token</h3>
        <p>Ứng dụng này demo tính năng <strong>Refresh Token & Session Management</strong>:</p>
        <ul style={styles.featureList}>
          <li>✅ <strong>Access Token</strong>: Hết hạn sau 15 phút</li>
          <li>✅ <strong>Refresh Token</strong>: Hết hạn sau 7 ngày</li>
          <li>✅ <strong>Auto Refresh</strong>: Tự động làm mới token khi hết hạn</li>
          <li>✅ <strong>Token Rotation</strong>: Tạo token mới mỗi lần refresh</li>
          <li>✅ <strong>Secure Logout</strong>: Thu hồi token khi đăng xuất</li>
        </ul>
      </div>

      <div style={styles.testCard}>
        <h3>🧪 Hướng dẫn test</h3>
        <ol style={styles.testSteps}>
          <li>Đăng ký/Đăng nhập để lấy tokens</li>
          <li>Vào <strong>Protected Routes</strong> (Profile, Admin)</li>
          <li>Mở Developer Tools → Network tab</li>
          <li>Đợi 15 phút hoặc thay đổi thời gian expire trong code</li>
          <li>Thực hiện action cần auth → sẽ thấy auto refresh</li>
        </ol>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  title: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '30px',
  },
  statusCard: {
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #dee2e6',
  },
  loggedIn: {
    color: '#155724',
  },
  loggedOut: {
    color: '#721c24',
  },
  infoCard: {
    backgroundColor: '#e3f2fd',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #bbdefb',
  },
  testCard: {
    backgroundColor: '#fff3e0',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #ffcc02',
  },
  featureList: {
    paddingLeft: '20px',
  },
  testSteps: {
    paddingLeft: '20px',
  },
  link: {
    color: '#007bff',
    textDecoration: 'none',
  },
};

export default Home;
