const multer = require('multer');
const sharp = require('sharp');

// Cấu hình Multer để lưu file trong memory
const storage = multer.memoryStorage();

// File filter để chỉ cho phép upload ảnh
const fileFilter = (req, file, cb) => {
  // Kiểm tra MIME type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh (jpg, png, gif, webp)!'), false);
  }
};

// Cấu hình Multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: fileFilter,
});

// Middleware xử lý resize ảnh với Sharp
const processImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'Không có file ảnh được upload!',
        error: 'NO_FILE_UPLOADED'
      });
    }

    console.log('📁 Processing image:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Resize và optimize ảnh với Sharp
    const processedBuffer = await sharp(req.file.buffer)
      .resize(400, 400, { 
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ 
        quality: 85,
        progressive: true 
      })
      .toBuffer();

    // Thêm buffer đã xử lý vào req để middleware tiếp theo sử dụng
    req.processedImage = {
      buffer: processedBuffer,
      originalname: req.file.originalname,
      mimetype: 'image/jpeg',
      size: processedBuffer.length
    };

    console.log('✅ Image processed successfully:', {
      originalSize: req.file.size,
      processedSize: processedBuffer.length,
      compression: `${((req.file.size - processedBuffer.length) / req.file.size * 100).toFixed(1)}%`
    });

    next();
  } catch (error) {
    console.error('❌ Image processing error:', error);
    return res.status(400).json({
      message: 'Lỗi xử lý ảnh!',
      error: 'IMAGE_PROCESSING_FAILED',
      details: error.message
    });
  }
};

// Middleware validation file upload
const validateImageUpload = (req, res, next) => {
  // Kiểm tra Content-Type header
  const contentType = req.headers['content-type'];
  if (!contentType || !contentType.includes('multipart/form-data')) {
    return res.status(400).json({
      message: 'Request phải có Content-Type: multipart/form-data',
      error: 'INVALID_CONTENT_TYPE'
    });
  }

  next();
};

// Error handler cho Multer
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          message: 'File quá lớn! Tối đa 5MB.',
          error: 'FILE_TOO_LARGE',
          maxSize: '5MB'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          message: 'Chỉ được upload 1 file!',
          error: 'TOO_MANY_FILES'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          message: 'Field name không đúng! Sử dụng "avatar".',
          error: 'INVALID_FIELD_NAME'
        });
      default:
        return res.status(400).json({
          message: 'Lỗi upload file!',
          error: 'UPLOAD_ERROR',
          details: error.message
        });
    }
  } else if (error.message.includes('ảnh')) {
    return res.status(400).json({
      message: error.message,
      error: 'INVALID_FILE_TYPE'
    });
  }

  next(error);
};

module.exports = {
  upload: upload.single('avatar'), // Expect field name 'avatar'
  processImage,
  validateImageUpload,
  handleUploadError
};