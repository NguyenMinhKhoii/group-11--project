const express = require('express');
const User = require('../models/UserMongoDB');
const { generateToken, generateRefreshToken, verifyRefreshToken, authenticateJWT } = require('../middleware/jwtAuth');
const router = express.Router();

/**
 * Updated Auth Routes with MongoDB + JWT for Activity 3
 */

// Register/Signup endpoint with MongoDB
router.post('/register', async (req, res) => {
  try {
    const { fullname, name, email, password, role = 'user' } = req.body;
    const userName = fullname || name;
    
    console.log('📝 Registration attempt:', { email, fullname: userName, role });

    // Validation
    if (!userName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin: họ tên, email, mật khẩu',
        code: 'MISSING_FIELDS'
      });
    }

    // Check if user exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email đã tồn tại trong hệ thống',
        code: 'EMAIL_EXISTS'
      });
    }

    // Create new user
    const userData = {
      email,
      password,
      fullname: userName,
      role,
      avatar: `https://via.placeholder.com/300/667eea/white?text=${encodeURIComponent(userName.substring(0, 2).toUpperCase())}`
    };

    const newUser = await User.createUser(userData);
    console.log('✅ User created successfully:', newUser.email);

    // Generate JWT token
    const token = generateToken({
      id: newUser._id,
      email: newUser.email,
      role: newUser.role
    });

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công!',
      data: {
        user: newUser.toJSON(),
        token,
        expiresIn: '24h'
      }
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server khi đăng ký',
      code: 'REGISTRATION_ERROR'
    });
  }
});

// Signup endpoint (alias)
router.post('/signup', async (req, res) => {
  // Redirect to register
  req.url = '/register';
  router.handle(req, res);
});

// Login endpoint with MongoDB + JWT
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔐 Login attempt:', email);

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập email và mật khẩu',
        code: 'MISSING_CREDENTIALS'
      });
    }

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Tài khoản đã bị khóa do đăng nhập sai quá nhiều lần',
        code: 'ACCOUNT_LOCKED'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản đã bị vô hiệu hóa',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    // Verify password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      await user.incLoginAttempts();
      
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    // Generate tokens
    const tokenPayload = {
      id: user._id,
      email: user.email,
      role: user.role
    };

    const token = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    console.log('✅ Login successful:', user.email);

    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công!',
      data: {
        user: user.toJSON(),
        token,
        refreshToken,
        expiresIn: '24h'
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đăng nhập',
      code: 'LOGIN_ERROR'
    });
  }
});

// Get all users (Admin only)
router.get('/users', authenticateJWT, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ admin mới có quyền xem danh sách người dùng',
        code: 'ADMIN_REQUIRED'
      });
    }

    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 });

    const stats = {
      total: users.length,
      active: users.filter(u => u.isActive).length,
      inactive: users.filter(u => !u.isActive).length,
      byRole: {}
    };

    users.forEach(user => {
      stats.byRole[user.role] = (stats.byRole[user.role] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      data: {
        users,
        statistics: stats
      }
    });

  } catch (error) {
    console.error('❌ Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách người dùng',
      code: 'GET_USERS_ERROR'
    });
  }
});

// Update user (Admin or self)
router.put('/users/:id', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { fullname, role, isActive } = req.body;
    const currentUser = req.user;

    // Check permissions
    const isAdmin = currentUser.role === 'admin';
    const isOwner = currentUser._id.toString() === id;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền cập nhật thông tin này',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    // Find user to update
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
        code: 'USER_NOT_FOUND'
      });
    }

    // Update fields
    if (fullname !== undefined) user.fullname = fullname;
    
    // Only admin can change role and active status
    if (isAdmin) {
      if (role !== undefined) user.role = role;
      if (isActive !== undefined) user.isActive = isActive;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật thành công!',
      data: {
        user: user.toJSON()
      }
    });

  } catch (error) {
    console.error('❌ Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật người dùng',
      code: 'UPDATE_USER_ERROR'
    });
  }
});

// Delete user (Admin only)
router.delete('/users/:id', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ admin mới có quyền xóa người dùng',
        code: 'ADMIN_REQUIRED'
      });
    }

    // Prevent admin from deleting themselves
    if (req.user._id.toString() === id) {
      return res.status(400).json({
        success: false,
        message: 'Không thể tự xóa tài khoản của mình',
        code: 'CANNOT_DELETE_SELF'
      });
    }

    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
        code: 'USER_NOT_FOUND'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Xóa người dùng thành công!'
    });

  } catch (error) {
    console.error('❌ Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa người dùng',
      code: 'DELETE_USER_ERROR'
    });
  }
});

// Get user profile
router.get('/profile/:email', authenticateJWT, async (req, res) => {
  try {
    const { email } = req.params;
    
    // Users can only view their own profile unless they're admin
    if (req.user.email !== email && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền xem hồ sơ này',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    const user = await User.findByEmail(email);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
        code: 'USER_NOT_FOUND'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: user.toJSON()
      }
    });

  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy hồ sơ',
      code: 'GET_PROFILE_ERROR'
    });
  }
});

// Update user profile
router.put('/profile/:email', authenticateJWT, async (req, res) => {
  try {
    const { email } = req.params;
    const { fullname, phone, address, bio } = req.body;
    
    // Users can only update their own profile
    if (req.user.email !== email) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền cập nhật hồ sơ này',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    const user = await User.findByEmail(email);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
        code: 'USER_NOT_FOUND'
      });
    }

    // Update profile fields
    if (fullname !== undefined) user.fullname = fullname;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (bio !== undefined) user.bio = bio;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật hồ sơ thành công!',
      data: {
        user: user.toJSON()
      }
    });

  } catch (error) {
    console.error('❌ Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật hồ sơ',
      code: 'UPDATE_PROFILE_ERROR'
    });
  }
});

// Change password
router.put('/users/:email/password', authenticateJWT, async (req, res) => {
  try {
    const { email } = req.params;
    const { currentPassword, newPassword } = req.body;
    
    // Users can only change their own password
    if (req.user.email !== email) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền đổi mật khẩu này',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới',
        code: 'MISSING_PASSWORDS'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu mới phải có ít nhất 6 ký tự',
        code: 'PASSWORD_TOO_SHORT'
      });
    }

    const user = await User.findByEmail(email).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
        code: 'USER_NOT_FOUND'
      });
    }

    // Verify current password
    const isValidPassword = await user.comparePassword(currentPassword);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu hiện tại không đúng',
        code: 'INVALID_CURRENT_PASSWORD'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Đổi mật khẩu thành công!'
    });

  } catch (error) {
    console.error('❌ Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đổi mật khẩu',
      code: 'CHANGE_PASSWORD_ERROR'
    });
  }
});

// Refresh token endpoint
router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required',
        code: 'NO_REFRESH_TOKEN'
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    
    // Find user
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }

    // Generate new access token
    const newToken = generateToken({
      id: user._id,
      email: user.email,
      role: user.role
    });

    res.status(200).json({
      success: true,
      data: {
        token: newToken,
        expiresIn: '24h'
      }
    });

  } catch (error) {
    console.error('❌ Refresh token error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
      code: 'INVALID_REFRESH_TOKEN'
    });
  }
});

module.exports = router;