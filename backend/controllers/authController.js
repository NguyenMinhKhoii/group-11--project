const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ActivityLogService = require("../services/ActivityLogService");

// Đăng ký
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Kiểm tra email trùng
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email đã tồn tại!" });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user mới
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: "Đăng ký thành công!", user: newUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Đăng nhập - Enhanced for Redux
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    // Validate input
    if (!email || !password) {
      await ActivityLogService.logActivity(null, 'LOGIN_FAILED', {
        username: email || 'Unknown',
        ipAddress,
        userAgent,
        status: 'FAILED',
        additionalData: { reason: 'Missing credentials' }
      });
      return res.status(400).json({ 
        success: false,
        message: "Email và password không được để trống!" 
      });
    }

    // Tìm user theo email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      await ActivityLogService.logActivity(null, 'LOGIN_FAILED', {
        username: email,
        ipAddress,
        userAgent,
        status: 'FAILED',
        additionalData: { reason: 'User not found' }
      });
      return res.status(401).json({ 
        success: false,
        message: "Email hoặc mật khẩu không đúng!" 
      });
    }

    // Check if account is active
    if (!user.isActive) {
      await ActivityLogService.logActivity(user._id, 'LOGIN_FAILED', {
        username: user.username,
        ipAddress,
        userAgent,
        status: 'FAILED',
        additionalData: { reason: 'Account deactivated' }
      });
      return res.status(401).json({ 
        success: false,
        message: "Tài khoản đã bị vô hiệu hóa!" 
      });
    }

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await ActivityLogService.logActivity(user._id, 'LOGIN_FAILED', {
        username: user.username,
        ipAddress,
        userAgent,
        status: 'FAILED',
        additionalData: { reason: 'Invalid password' }
      });
      return res.status(401).json({ 
        success: false,
        message: "Email hoặc mật khẩu không đúng!" 
      });
    }

    // Tạo JWT token với thông tin đầy đủ
    const tokenPayload = { 
      id: user._id,
      userId: user._id, 
      username: user.username,
      email: user.email,
      role: user.role 
    };

    const token = jwt.sign(
      tokenPayload, 
      process.env.JWT_SECRET || "SECRET_KEY", 
      { expiresIn: "24h" }
    );

    // Prepare user data for Redux (exclude password)
    const userData = {
      id: user._id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      isActive: user.isActive,
      profile: {
        bio: user.profile?.bio,
        phone: user.profile?.phone,
        address: user.profile?.address
      },
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    // Log successful login
    await ActivityLogService.logLoginAttempt(
      user._id,
      user.username,
      ipAddress,
      userAgent,
      true
    );

    res.json({ 
      success: true,
      message: "Đăng nhập thành công!", 
      token,
      user: userData,
      expiresIn: "24h"
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Verify token and get current user - For Redux auth state
exports.verifyToken = async (req, res) => {
  try {
    // req.user is set by verifyToken middleware
    const user = await User.findById(req.user.id);
    
    if (!user || !user.isActive) {
      return res.status(401).json({ 
        success: false,
        message: "Token không hợp lệ hoặc user không tồn tại!" 
      });
    }

    // Prepare user data for Redux
    const userData = {
      id: user._id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      isActive: user.isActive,
      profile: {
        bio: user.profile?.bio,
        phone: user.profile?.phone,
        address: user.profile?.address
      },
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    // Log token verification
    await ActivityLogService.logActivity(user._id, 'API_CALL', {
      username: user.username,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      additionalData: { action: 'TOKEN_VERIFICATION' }
    });

    res.json({ 
      success: true,
      user: userData,
      message: "Token hợp lệ"
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ 
      success: false,
      message: "Token verification failed",
      error: error.message 
    });
  }
};

// Refresh user data - For Redux to update user info
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User không tồn tại!" 
      });
    }

    const userData = {
      id: user._id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      isActive: user.isActive,
      profile: {
        bio: user.profile?.bio,
        phone: user.profile?.phone,
        address: user.profile?.address
      },
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.json({ 
      success: true,
      user: userData
    });

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ 
      success: false,
      message: "Lỗi khi lấy thông tin user",
      error: error.message 
    });
  }
};

// Logout - For Redux to clear state
exports.logout = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Log logout activity
    await ActivityLogService.logLogout(
      req.user.id,
      user?.username || 'Unknown',
      req.ip,
      req.sessionID || 'unknown'
    );

    res.json({ 
      success: true,
      message: "Đăng xuất thành công!" 
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false,
      message: "Lỗi khi đăng xuất",
      error: error.message 
    });
  }
};

// Update profile - For Redux state updates
exports.updateProfile = async (req, res) => {
  try {
    const { name, bio, phone, address } = req.body;
    const userId = req.user.id;

    const updateData = {};
    if (name) updateData.name = name;
    if (bio || phone || address) {
      updateData.profile = {};
      if (bio !== undefined) updateData.profile.bio = bio;
      if (phone !== undefined) updateData.profile.phone = phone;
      if (address !== undefined) updateData.profile.address = address;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ 
        success: false,
        message: "User không tồn tại!" 
      });
    }

    // Log profile update
    await ActivityLogService.logProfileUpdate(
      userId,
      updatedUser.username,
      req.ip,
      Object.keys(updateData)
    );

    // Return updated user data
    const userData = {
      id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      avatar: updatedUser.avatar,
      isActive: updatedUser.isActive,
      profile: {
        bio: updatedUser.profile?.bio,
        phone: updatedUser.profile?.phone,
        address: updatedUser.profile?.address
      },
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt
    };

    res.json({ 
      success: true,
      message: "Cập nhật profile thành công!",
      user: userData
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false,
      message: "Lỗi khi cập nhật profile",
      error: error.message 
    });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false,
        message: "Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới!" 
      });
    }

    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User không tồn tại!" 
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      await ActivityLogService.logActivity(userId, 'PASSWORD_CHANGE', {
        username: user.username,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'FAILED',
        additionalData: { reason: 'Invalid current password' }
      });

      return res.status(400).json({ 
        success: false,
        message: "Mật khẩu hiện tại không đúng!" 
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await User.findByIdAndUpdate(userId, { 
      password: hashedNewPassword 
    });

    // Log successful password change
    await ActivityLogService.logActivity(userId, 'PASSWORD_CHANGE', {
      username: user.username,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      status: 'SUCCESS'
    });

    res.json({ 
      success: true,
      message: "Đổi mật khẩu thành công!" 
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      success: false,
      message: "Lỗi khi đổi mật khẩu",
      error: error.message 
    });
  }
};
