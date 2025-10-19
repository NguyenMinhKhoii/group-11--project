const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Debug environment variables
console.log('🔧 Debug Cloudinary Config:');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key:', process.env.CLOUDINARY_API_KEY);
console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? '***hidden***' : 'undefined');

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Test kết nối Cloudinary
const testCloudinaryConnection = async () => {
  try {
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary connected successfully:', result);
    return true;
  } catch (error) {
    console.error('❌ Cloudinary connection failed:', error.message);
    return false;
  }
};

// Upload ảnh lên Cloudinary
const uploadToCloudinary = async (buffer, folder = 'avatars') => {
  console.log('🔧 Upload config check:', {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET ? '***set***' : 'undefined'
  });
  
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: folder,
        transformation: [
          { width: 200, height: 200, crop: 'fill', gravity: 'face' },
          { quality: 'auto:good' },
          { format: 'webp' }
        ]
      },
      (error, result) => {
        if (error) {
          console.error('❌ Cloudinary upload error:', error);
          console.error('❌ Error details:', JSON.stringify(error, null, 2));
          reject(error);
        } else {
          console.log('✅ Image uploaded to Cloudinary:', result.secure_url);
          resolve(result);
        }
      }
    );
    
    uploadStream.end(buffer);
  });
};

// Xóa ảnh khỏi Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('✅ Image deleted from Cloudinary:', result);
    return result;
  } catch (error) {
    console.error('❌ Error deleting from Cloudinary:', error);
    throw error;
  }
};

/**
 * Multer + Cloudinary Integration for Direct Upload
 */
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Cloudinary Storage Configuration for Avatar Upload
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'group11_avatars', // Folder in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    public_id: (req, file) => {
      // Generate unique filename: user_id_timestamp
      const userId = req.user ? req.user._id : 'anonymous';
      const timestamp = Date.now();
      return `avatar_${userId}_${timestamp}`;
    },
    transformation: [
      {
        width: 300,
        height: 300,
        crop: 'fill',
        gravity: 'face', // Focus on face if detected
        quality: 'auto:good',
        fetch_format: 'auto'
      }
    ]
  }
});

// Multer Configuration for Avatar Upload
const avatarUpload = multer({
  storage: avatarStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Only one file
  },
  fileFilter: (req, file, cb) => {
    console.log('📎 File received:', {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (!allowedTypes.includes(file.mimetype)) {
      const error = new Error(`Unsupported file type: ${file.mimetype}. Allowed: ${allowedTypes.join(', ')}`);
      error.code = 'INVALID_FILE_TYPE';
      return cb(error, false);
    }

    // Check file extension
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    
    if (!allowedExtensions.includes(fileExtension)) {
      const error = new Error(`Unsupported file extension: ${fileExtension}. Allowed: ${allowedExtensions.join(', ')}`);
      error.code = 'INVALID_FILE_EXTENSION';
      return cb(error, false);
    }

    cb(null, true);
  }
});

module.exports = {
  cloudinary,
  testCloudinaryConnection,
  uploadToCloudinary,
  deleteFromCloudinary,
  avatarUpload,
  avatarStorage
};