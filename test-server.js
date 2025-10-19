// Server test đơn giản cho forgot password
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Mock users data
const users = [
  { id: 1, email: 'user@example.com', password: '123456', name: 'Test User' },
  { id: 2, email: 'admin@example.com', password: 'admin123', name: 'Admin User' }
];

// Mock token storage
let resetTokens = {};

// Generate simple token
function generateToken(email) {
  return Buffer.from(`${email}-${Date.now()}`).toString('base64');
}

// API Routes
app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  
  console.log('📧 Forgot password request for:', email);
  
  // Check if user exists
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(404).json({
      message: 'Email không tồn tại trong hệ thống!'
    });
  }
  
  // Generate reset token
  const resetToken = generateToken(email);
  resetTokens[resetToken] = {
    email: email,
    expires: Date.now() + 15 * 60 * 1000 // 15 minutes
  };
  
  console.log('🔑 Generated reset token:', resetToken);
  
  // In real app, send email here
  // For demo, we'll just return the token
  res.json({
    message: 'Email reset password đã được gửi!',
    resetToken: resetToken, // Only for testing
    resetUrl: `http://localhost:${PORT}/reset-password.html?token=${resetToken}`
  });
});

app.post('/api/auth/reset-password/:token', (req, res) => {
  const { token } = req.params;
  const { newPassword, confirmPassword } = req.body;
  
  console.log('🔐 Reset password request with token:', token);
  
  // Validate input
  if (!newPassword || !confirmPassword) {
    return res.status(400).json({
      message: 'Vui lòng nhập mật khẩu mới và xác nhận!'
    });
  }
  
  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      message: 'Mật khẩu xác nhận không khớp!'
    });
  }
  
  // Check token
  const tokenData = resetTokens[token];
  if (!tokenData) {
    return res.status(400).json({
      message: 'Token không hợp lệ!'
    });
  }
  
  if (Date.now() > tokenData.expires) {
    delete resetTokens[token];
    return res.status(400).json({
      message: 'Token đã hết hạn!'
    });
  }
  
  // Find and update user
  const user = users.find(u => u.email === tokenData.email);
  if (!user) {
    return res.status(404).json({
      message: 'Người dùng không tồn tại!'
    });
  }
  
  // Update password (in real app, hash it)
  user.password = newPassword;
  
  // Delete used token
  delete resetTokens[token];
  
  console.log('✅ Password reset successful for:', user.email);
  
  res.json({
    message: 'Đặt lại mật khẩu thành công!',
    user: {
      email: user.email,
      name: user.name
    }
  });
});

// Serve HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/forgot-password.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'forgot-password.html'));
});

app.get('/reset-password.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'reset-password.html'));
});

// Debug endpoint
app.get('/api/debug/tokens', (req, res) => {
  res.json({
    message: 'Active reset tokens',
    tokens: Object.keys(resetTokens).map(token => ({
      token: token,
      email: resetTokens[token].email,
      expires: new Date(resetTokens[token].expires).toISOString()
    }))
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Test server running at http://localhost:${PORT}`);
  console.log(`📧 Test forgot password: http://localhost:${PORT}/forgot-password.html`);
  console.log(`🔐 Test reset password: http://localhost:${PORT}/reset-password.html`);
  console.log(`📋 Debug tokens: http://localhost:${PORT}/api/debug/tokens`);
  console.log('\n📝 Test users:');
  users.forEach(user => {
    console.log(`   - ${user.email} (${user.name})`);
  });
});