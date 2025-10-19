const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

// Import models
const User = require('./models/User');

// Import Cloudinary config
const { uploadToCloudinary, deleteFromCloudinary, testCloudinaryConnection } = require('./utils/cloudinaryConfig');

const app = express();
const PORT = process.env.PORT || 5173;

// ========================
// 🔧 MIDDLEWARE SETUP
// ========================
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ========================
// 🔧 MULTER CONFIG FOR AVATAR UPLOAD
// ========================
const upload = multer({
    storage: multer.memoryStorage(), // Lưu trong RAM để upload lên Cloudinary
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Chỉ chấp nhận file ảnh (JPEG, PNG, WebP)'), false);
        }
    }
});

// ========================
// 🔧 JWT MIDDLEWARE
// ========================
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Không có token, truy cập bị từ chối' 
        });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'SECRET_KEY', (err, user) => {
        if (err) {
            return res.status(403).json({ 
                success: false, 
                message: 'Token không hợp lệ' 
            });
        }
        req.user = user;
        next();
    });
};

// ========================
// 🔧 CONNECT TO MONGODB
// ========================
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/group11-project');
        console.log('✅ MongoDB connected successfully!');
        
        // Test Cloudinary connection
        await testCloudinaryConnection();
        
    } catch (err) {
        console.error('❌ MongoDB connection failed:', err.message);
        process.exit(1);
    }
};

// ========================
// 🔐 AUTH ROUTES
// ========================

// Đăng ký
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Tên, email và mật khẩu là bắt buộc!'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu phải có ít nhất 6 ký tự!'
            });
        }

        // Kiểm tra email trùng
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email đã tồn tại!'
            });
        }

        // Tạo user mới (password sẽ được hash tự động trong pre-save hook)
        const newUser = new User({
            name,
            email,
            password
        });

        await newUser.save();

        console.log('✅ User registered:', email);

        res.status(201).json({
            success: true,
            message: 'Đăng ký thành công!',
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (err) {
        console.error('❌ Signup error:', err);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi đăng ký!'
        });
    }
});

// Đăng nhập
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email và mật khẩu là bắt buộc!'
            });
        }

        // Tìm user theo email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Email không tồn tại!'
            });
        }

        // Kiểm tra account có bị khóa không
        if (user.isLocked()) {
            return res.status(423).json({
                success: false,
                message: 'Tài khoản bị khóa do đăng nhập sai quá nhiều lần!'
            });
        }

        // Kiểm tra mật khẩu
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            // Tăng số lần đăng nhập thất bại
            await user.incLoginAttempts();
            
            return res.status(400).json({
                success: false,
                message: 'Sai mật khẩu!'
            });
        }

        // Reset login attempts khi đăng nhập thành công
        await user.resetLoginAttempts();

        // Tạo JWT token
        const token = jwt.sign(
            { 
                id: user._id, 
                email: user.email,
                role: user.role 
            }, 
            process.env.JWT_SECRET || 'SECRET_KEY',
            { expiresIn: '24h' }
        );

        console.log('✅ User logged in:', email);

        res.json({
            success: true,
            message: 'Đăng nhập thành công!',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar || null, // 🔥 QUAN TRỌNG: Trả về avatar từ database
                avatarMetadata: user.avatarMetadata || null
            }
        });

    } catch (err) {
        console.error('❌ Login error:', err);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi đăng nhập!'
        });
    }
});

// Forgot Password
app.post('/api/auth/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email là bắt buộc!'
            });
        }

        // Tìm user trong database
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng với email này!'
            });
        }

        // Tạo reset token
        const resetToken = jwt.sign(
            { email: user.email, id: user._id },
            process.env.JWT_SECRET || 'RESET_SECRET',
            { expiresIn: '10m' }
        );

        // Lưu reset token vào database
        user.resetToken = resetToken;
        user.resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 phút
        await user.save();

        // Mock gửi email (hiển thị token trong console)
        console.log('📧 =================================');
        console.log(`📧 PASSWORD RESET REQUEST`);
        console.log(`📧 Email: ${email}`);
        console.log(`📧 Reset Token: ${resetToken}`);
        console.log(`📧 Reset Link: http://localhost:5173/reset-password.html?token=${resetToken}`);
        console.log('📧 =================================');

        res.json({
            success: true,
            message: 'Đã gửi link reset mật khẩu! (Kiểm tra console để lấy token)',
            email: email,
            // Trong production, không trả về token
            debug_token: resetToken // Chỉ để test
        });

    } catch (error) {
        console.error('❌ Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server!'
        });
    }
});

// Reset Password
app.post('/api/auth/reset-password/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword, confirmPassword } = req.body;

        if (!newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu mới và xác nhận mật khẩu là bắt buộc!'
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu xác nhận không khớp!'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu phải có ít nhất 6 ký tự!'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'RESET_SECRET');
        
        // Tìm user và kiểm tra token
        const user = await User.findOne({
            email: decoded.email,
            resetToken: token,
            resetTokenExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Token không hợp lệ hoặc đã hết hạn!'
            });
        }

        // Cập nhật mật khẩu mới (sẽ được hash tự động)
        user.password = newPassword;
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();

        console.log('✅ Password reset successful for:', user.email);

        res.json({
            success: true,
            message: 'Đặt lại mật khẩu thành công!',
            user: {
                email: user.email,
                name: user.name
            }
        });

    } catch (error) {
        console.error('❌ Reset password error:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(400).json({
                success: false,
                message: 'Token không hợp lệ!'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(400).json({
                success: false,
                message: 'Token đã hết hạn!'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Lỗi server!'
        });
    }
});

// ========================
// 🖼️ AVATAR ROUTES
// ========================

// Upload Avatar
app.post('/api/avatar/upload', authenticateToken, upload.single('avatar'), async (req, res) => {
    try {
        console.log('🚀 Avatar upload request from:', req.user.email);

        // Kiểm tra file
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Không có file nào được upload!'
            });
        }

        // Kiểm tra user trong database
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng!'
            });
        }

        console.log('📎 File info:', {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        });

        // Upload lên Cloudinary
        const cloudinaryResult = await uploadToCloudinary(req.file.buffer, 'avatars');

        console.log('☁️ Cloudinary result:', {
            secure_url: cloudinaryResult.secure_url,
            public_id: cloudinaryResult.public_id
        });

        // Xóa avatar cũ nếu có
        if (user.avatarMetadata && user.avatarMetadata.public_id) {
            try {
                await deleteFromCloudinary(user.avatarMetadata.public_id);
                console.log('🗑️ Deleted old avatar from Cloudinary');
            } catch (deleteError) {
                console.warn('⚠️ Could not delete old avatar:', deleteError.message);
            }
        }

        // Cập nhật user với avatar mới
        user.avatar = cloudinaryResult.secure_url;
        user.avatarMetadata = {
            public_id: cloudinaryResult.public_id,
            format: cloudinaryResult.format,
            width: cloudinaryResult.width,
            height: cloudinaryResult.height,
            bytes: cloudinaryResult.bytes,
            uploaded_at: new Date()
        };

        await user.save();

        console.log('✅ Avatar uploaded successfully for:', user.email);

        res.json({
            success: true,
            message: 'Upload avatar thành công!',
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                avatar: user.avatar,
                avatarMetadata: user.avatarMetadata
            }
        });

    } catch (error) {
        console.error('❌ Avatar upload error:', error);
        
        if (error.message.includes('File size')) {
            return res.status(400).json({
                success: false,
                message: 'File quá lớn! Kích thước tối đa là 5MB.'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Lỗi server khi upload avatar!'
        });
    }
});

// Get Avatar
app.get('/api/avatar', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('name email avatar avatarMetadata');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng!'
            });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar || null,
                avatarMetadata: user.avatarMetadata || null
            }
        });

    } catch (error) {
        console.error('❌ Get avatar error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server!'
        });
    }
});

// Delete Avatar
app.delete('/api/avatar', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng!'
            });
        }

        if (!user.avatar) {
            return res.status(400).json({
                success: false,
                message: 'Người dùng chưa có avatar!'
            });
        }

        // Xóa từ Cloudinary
        if (user.avatarMetadata && user.avatarMetadata.public_id) {
            try {
                await deleteFromCloudinary(user.avatarMetadata.public_id);
                console.log('✅ Avatar deleted from Cloudinary');
            } catch (deleteError) {
                console.warn('⚠️ Could not delete from Cloudinary:', deleteError.message);
            }
        }

        // Xóa từ database
        user.avatar = '';
        user.avatarMetadata = {};
        await user.save();

        console.log('✅ Avatar deleted for:', user.email);

        res.json({
            success: true,
            message: 'Xóa avatar thành công!',
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                avatar: null
            }
        });

    } catch (error) {
        console.error('❌ Delete avatar error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server!'
        });
    }
});

// ========================
// 🔧 DEBUG ROUTES
// ========================
app.get('/api/debug/token/:token', (req, res) => {
    try {
        const { token } = req.params;
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'RESET_SECRET');
        res.json({
            success: true,
            message: 'Token hợp lệ!',
            decoded: decoded,
            issued_at: new Date(decoded.iat * 1000),
            expires_at: new Date(decoded.exp * 1000),
            time_left: Math.max(0, decoded.exp * 1000 - Date.now()) + 'ms'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Token không hợp lệ!',
            error: error.message
        });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running!',
        timestamp: new Date().toISOString(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// ========================
// 🔧 STATIC ROUTES
// ========================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.get('/dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'dashboard.html'));
});

app.get('/forgot-password.html', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'forgot-password.html'));
});

app.get('/reset-password.html', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'reset-password.html'));
});

// ========================
// 🚀 START SERVER
// ========================
const startServer = async () => {
    try {
        // Connect to MongoDB first
        await connectDB();
        
        // Start Express server
        app.listen(PORT, () => {
            console.log('🚀 =====================================');
            console.log('🚀 MAIN SERVER WITH MONGODB + CLOUDINARY');
            console.log('🚀 =====================================');
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log('📋 Available endpoints:');
            console.log('   🔐 POST /api/auth/signup');
            console.log('   🔐 POST /api/auth/login');
            console.log('   🔐 POST /api/auth/forgot-password');
            console.log('   🔐 POST /api/auth/reset-password/:token');
            console.log('   🖼️  POST /api/avatar/upload (JWT required)');
            console.log('   🖼️  GET /api/avatar (JWT required)');
            console.log('   🖼️  DELETE /api/avatar (JWT required)');
            console.log('   🔧 GET /api/debug/token/:token');
            console.log('   ❤️  GET /api/health');
            console.log('🚀 =====================================');
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down server...');
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed.');
    process.exit(0);
});

// Start the server
startServer();

module.exports = app;