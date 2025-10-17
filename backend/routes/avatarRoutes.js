const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { upload, processImage, validateImageUpload, handleUploadError } = require('../middleware/uploadMiddleware');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryConfig');

// Dữ liệu test user avatars (trong thực tế sẽ lưu trong database)
let USER_AVATARS = {};

// === SV1: API Upload Avatar ===

// Test endpoint debug
router.post('/test', authenticateToken, (req, res) => {
  console.log('🔧 Test endpoint hit by user:', req.user);
  res.json({ message: 'Test successful!', user: req.user });
});

// POST /users/avatar - Upload avatar mới
router.post('/avatar', 
  authenticateToken,           // Xác thực JWT
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

// GET /users/avatar - Lấy thông tin avatar hiện tại
router.get('/avatar', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const avatar = USER_AVATARS[userId];

  if (!avatar) {
    return res.status(404).json({
      message: 'Người dùng chưa có avatar!',
      error: 'NO_AVATAR_FOUND',
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name
      }
    });
  }

  res.json({
    message: 'Thông tin avatar',
    data: {
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name
      },
      avatar: {
        url: avatar.url,
        thumbnail_url: avatar.url.replace('/upload/', '/upload/w_100,h_100,c_fill/'),
        upload_date: avatar.upload_date,
        original_filename: avatar.original_filename,
        size: avatar.size,
        format: avatar.format,
        dimensions: {
          width: avatar.width,
          height: avatar.height
        }
      }
    }
  });
});

// DELETE /users/avatar - Xóa avatar
router.delete('/avatar', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const avatar = USER_AVATARS[userId];

    if (!avatar) {
      return res.status(404).json({
        message: 'Người dùng chưa có avatar để xóa!',
        error: 'NO_AVATAR_FOUND'
      });
    }

    // Xóa khỏi Cloudinary
    await deleteFromCloudinary(avatar.cloudinary_public_id);

    // Xóa khỏi database (tạm thời là memory)
    delete USER_AVATARS[userId];

    console.log(`✅ Avatar deleted for user ${userId}`);

    res.json({
      message: 'Xóa avatar thành công!',
      data: {
        user: {
          id: req.user.id,
          email: req.user.email,
          name: req.user.name
        },
        deleted_avatar: {
          url: avatar.url,
          deleted_at: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error('❌ Error deleting avatar:', error);
    
    res.status(500).json({
      message: 'Lỗi xóa avatar!',
      error: 'DELETE_AVATAR_FAILED',
      details: error.message
    });
  }
});

// GET /users/avatars/all - Debug: Xem tất cả avatars (Admin only)
router.get('/avatars/all', authenticateToken, (req, res) => {
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