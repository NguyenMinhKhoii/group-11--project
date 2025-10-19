const express = require('express');
const router = express.Router();
const User = require('../models/UserMongoDB');
const { authenticateJWT, requireRole } = require('../middleware/jwtAuth');
const { avatarUpload, deleteFromCloudinary } = require('../utils/cloudinaryConfig');

/**
 * SV1: Advanced Avatar Upload API với Multer + Sharp + Cloudinary + JWT
 * Endpoint: POST /api/avatar/upload
 * Features: JWT Auth, File Validation, Image Processing, Cloudinary Upload
 */

// Middleware functions for the complex upload route
const validateImageUpload = (req, res, next) => {
  // Basic validation middleware
  console.log('🔍 Validating image upload request...');
  next();
};

const upload = avatarUpload.single('avatar');

const handleUploadError = (err, req, res, next) => {
  if (err) {
    console.error('❌ Upload error:', err);
    return res.status(400).json({
      success: false,
      message: 'Upload failed: ' + err.message,
      error: err.code || 'UPLOAD_ERROR'
    });
  }
  next();
};

const processImage = (req, res, next) => {
  // Image processing would happen here
  // For now, just pass through since Cloudinary handles processing
  console.log('🖼️ Processing image...');
  next();
};

const uploadToCloudinary = async (buffer, userId) => {
  // This function would handle Cloudinary upload
  // For now, return a mock result
  return {
    secure_url: `https://res.cloudinary.com/demo/image/upload/avatar_${userId}.jpg`,
    public_id: `avatar_${userId}_${Date.now()}`
  };
};

// Upload avatar endpoint
router.post('/upload', authenticateJWT, (req, res) => {
  console.log('🚀 Avatar upload request received');
  console.log('📊 User:', req.user.email);

  // Use multer middleware for file upload
  avatarUpload.single('avatar')(req, res, async (err) => {
    try {
      // Handle multer errors
      if (err) {
        console.error('❌ Multer error:', err);
        
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File quá lớn. Kích thước tối đa là 5MB.',
            code: 'FILE_TOO_LARGE',
            maxSize: '5MB'
          });
        }
        
        if (err.code === 'INVALID_FILE_TYPE' || err.code === 'INVALID_FILE_EXTENSION') {
          return res.status(400).json({
            success: false,
            message: err.message,
            code: err.code,
            allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
          });
        }
        
        return res.status(400).json({
          success: false,
          message: 'Lỗi upload file: ' + err.message,
          code: 'UPLOAD_ERROR'
        });
      }

      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Không có file nào được upload.',
          code: 'NO_FILE'
        });
      }

      console.log('📎 File uploaded to Cloudinary:', {
        filename: req.file.filename,
        originalname: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype
      });

      // Get current user
      const userId = req.user._id;
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Người dùng không tồn tại.',
          code: 'USER_NOT_FOUND'
        });
      }

      // Delete old avatar from Cloudinary if exists
      if (user.cloudinaryPublicId) {
        try {
          console.log('🗑️ Deleting old avatar:', user.cloudinaryPublicId);
          await deleteFromCloudinary(user.cloudinaryPublicId);
        } catch (deleteError) {
          console.error('⚠️ Failed to delete old avatar (continuing):', deleteError.message);
        }
      }

      // Update user with new avatar
      user.avatar = req.file.path; // Cloudinary secure URL
      user.cloudinaryPublicId = req.file.filename; // Cloudinary public ID
      await user.save();

      console.log('✅ Avatar updated successfully for user:', user.email);

      // Return success response
      res.status(200).json({
        success: true,
        message: 'Avatar đã được cập nhật thành công!',
        data: {
          user: {
            id: user._id,
            email: user.email,
            fullname: user.fullname,
            role: user.role,
            avatar: user.avatar,
            updatedAt: user.updatedAt
          },
          upload: {
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size,
            url: req.file.path,
            mimetype: req.file.mimetype
          }
        }
      });

    } catch (error) {
      console.error('❌ Avatar upload error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi upload avatar.',
        code: 'SERVER_ERROR',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });
});

/**
 * Get current user avatar
 * Endpoint: GET /api/avatar
 */
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('avatar cloudinaryPublicId fullname');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Người dùng không tồn tại.',
        code: 'USER_NOT_FOUND'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        avatar: user.avatar,
        publicId: user.cloudinaryPublicId,
        fullname: user.fullname,
        hasAvatar: !!user.avatar
      }
    });

  } catch (error) {
    console.error('❌ Get avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy avatar.',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * Delete current user avatar
 * Endpoint: DELETE /api/avatar
 */
router.delete('/', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Người dùng không tồn tại.',
        code: 'USER_NOT_FOUND'
      });
    }

    if (!user.avatar) {
      return res.status(400).json({
        success: false,
        message: 'Người dùng chưa có avatar.',
        code: 'NO_AVATAR'
      });
    }

    // Delete from Cloudinary
    if (user.cloudinaryPublicId) {
      try {
        await deleteFromCloudinary(user.cloudinaryPublicId);
        console.log('✅ Avatar deleted from Cloudinary');
      } catch (deleteError) {
        console.error('⚠️ Failed to delete from Cloudinary:', deleteError.message);
      }
    }

    // Update user
    user.avatar = null;
    user.cloudinaryPublicId = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Avatar đã được xóa thành công!',
      data: {
        user: {
          id: user._id,
          email: user.email,
          fullname: user.fullname,
          avatar: null
        }
      }
    });

  } catch (error) {
    console.error('❌ Delete avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa avatar.',
      code: 'SERVER_ERROR'
    });
  }
});

// === SV1: API Upload Avatar ===

// Test endpoint debug
router.get('/test', (req, res) => {
  console.log('🔧 Test endpoint hit');
  res.json({ 
    message: 'Avatar API is working!',
    endpoints: [
      'POST /api/avatar/upload - Upload avatar with JWT',
      'GET /api/avatar - Get current avatar',
      'DELETE /api/avatar - Delete current avatar'
    ]
  });
});

// POST /users/avatar - Upload avatar mới
router.post('/avatar', 
  authenticateJWT,             // Xác thực JWT
  validateImageUpload,         // Validate request
  upload,                      // Multer upload
  handleUploadError,           // Handle upload errors
  processImage,               // Sharp processing
  async (req, res) => {
    try {
      const userId = req.user.id;
      
      console.log(`🔄 Uploading avatar for user ${userId}...`);

      // Upload ảnh đã xử lý lên Cloudinary
      const cloudinaryResult = await uploadToCloudinary(
        req.processedImage.buffer,
        `avatars/user_${userId}`
      );

      // Xóa avatar cũ nếu có
      if (USER_AVATARS[userId] && USER_AVATARS[userId].cloudinary_public_id) {
        try {
          await deleteFromCloudinary(USER_AVATARS[userId].cloudinary_public_id);
          console.log('🗑️ Old avatar deleted from Cloudinary');
        } catch (error) {
          console.warn('⚠️ Could not delete old avatar:', error.message);
        }
      }

      // Lưu thông tin avatar mới
      USER_AVATARS[userId] = {
        url: cloudinaryResult.secure_url,
        cloudinary_public_id: cloudinaryResult.public_id,
        original_filename: req.file.originalname,
        upload_date: new Date().toISOString(),
        size: req.processedImage.size,
        format: cloudinaryResult.format,
        width: cloudinaryResult.width,
        height: cloudinaryResult.height
      };

      console.log('✅ Avatar uploaded successfully:', cloudinaryResult.secure_url);

      res.status(200).json({
        message: 'Upload avatar thành công!',
        data: {
          user: {
            id: req.user.id,
            email: req.user.email,
            name: req.user.name
          },
          avatar: {
            url: cloudinaryResult.secure_url,
            thumbnail_url: cloudinaryResult.secure_url.replace('/upload/', '/upload/w_100,h_100,c_fill/'),
            upload_date: USER_AVATARS[userId].upload_date,
            original_filename: req.file.originalname,
            processed_size: req.processedImage.size,
            cloudinary_info: {
              public_id: cloudinaryResult.public_id,
              format: cloudinaryResult.format,
              width: cloudinaryResult.width,
              height: cloudinaryResult.height,
              bytes: cloudinaryResult.bytes
            }
          }
        }
      });

    } catch (error) {
      console.error('❌ Avatar upload failed:', error);
      
      res.status(500).json({
        message: 'Lỗi upload avatar lên Cloudinary!',
        error: 'CLOUDINARY_UPLOAD_FAILED',
        details: error.message
      });
    }
  }
);

// GET /users/avatar - Lấy thông tin avatar hiện tại từ MongoDB
router.get('/avatar', authenticateJWT, async (req, res) => {
  try {
    console.log('🔍 Đang lấy avatar cho user:', req.user.email);
    
    // Tìm user trong MongoDB
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng!',
        error: 'USER_NOT_FOUND'
      });
    }

    if (!user.avatar || !user.cloudinaryPublicId) {
      return res.status(404).json({
        success: false,
        message: 'Người dùng chưa có avatar!',
        error: 'NO_AVATAR_FOUND',
        user: {
          id: user._id,
          email: user.email,
          name: user.name
        }
      });
    }

    // Trả về thông tin avatar từ MongoDB
    res.json({
      success: true,
      message: 'Lấy thông tin avatar thành công!',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name
        },
        avatar: {
          url: user.avatar,
          thumbnail_url: user.avatar.replace('/upload/', '/upload/w_150,h_150,c_fill,g_face/'),
          cloudinary_id: user.cloudinaryPublicId,
          upload_date: user.updatedAt,
          size_note: 'Đã được tối ưu thành 300x300px'
        }
      }
    });

  } catch (error) {
    console.error('❌ Lỗi lấy avatar:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy avatar!',
      error: 'DATABASE_ERROR',
      details: error.message
    });
  }
});

// DELETE /users/avatar - Xóa avatar từ MongoDB và Cloudinary
router.delete('/avatar', authenticateJWT, async (req, res) => {
  try {
    console.log('🗑️ Đang xóa avatar cho user:', req.user.email);
    
    // Tìm user trong MongoDB
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng!',
        error: 'USER_NOT_FOUND'
      });
    }

    if (!user.avatar || !user.cloudinaryPublicId) {
      return res.status(404).json({
        success: false,
        message: 'Người dùng chưa có avatar để xóa!',
        error: 'NO_AVATAR_FOUND'
      });
    }

    const oldAvatar = {
      url: user.avatar,
      cloudinaryId: user.cloudinaryPublicId
    };

    try {
      // Xóa khỏi Cloudinary nếu có deleteFromCloudinary function
      if (typeof deleteFromCloudinary === 'function') {
        await deleteFromCloudinary(user.cloudinaryPublicId);
        console.log('✅ Đã xóa avatar khỏi Cloudinary');
      }
    } catch (cloudinaryError) {
      console.warn('⚠️ Lỗi xóa khỏi Cloudinary (tiếp tục xóa khỏi database):', cloudinaryError);
    }

    // Xóa avatar khỏi MongoDB
    user.avatar = null;
    user.cloudinaryPublicId = null;
    await user.save();

    console.log('✅ Đã xóa avatar khỏi database cho user:', user.email);

    res.json({
      success: true,
      message: 'Xóa avatar thành công!',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name
        },
        deleted_avatar: {
          url: oldAvatar.url,
          cloudinary_id: oldAvatar.cloudinaryId,
          deleted_at: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error('❌ Lỗi xóa avatar:', error);
    
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa avatar!',
      error: 'DELETE_AVATAR_FAILED',
      details: error.message
    });
  }
});

// GET /users/avatars/all - Debug: Xem tất cả avatars (Admin only)
router.get('/avatars/all', authenticateJWT, (req, res) => {
  // Chỉ admin mới được xem
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      message: 'Chỉ admin mới được xem tất cả avatars!',
      error: 'ADMIN_ONLY'
    });
  }

  const avatars = Object.entries(USER_AVATARS).map(([userId, avatar]) => ({
    userId: parseInt(userId),
    ...avatar
  }));

  res.json({
    message: 'Tất cả avatars trong hệ thống',
    count: avatars.length,
    data: avatars,
    requester: req.user
  });
});

module.exports = router;