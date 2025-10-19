const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require('multer');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require("path");
const authRoutes = require("./backend/routes/auth"); // ✅ Đường dẫn chính xác

const app = express();

// ✅ Enable CORS for all origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// ✅ Debug middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// ✅ Serve static files
app.use(express.static(path.join(__dirname)));

// Ensure uploads folder exists for dev-local avatar uploads
const uploadsDir = path.join(__dirname, 'public', 'uploads');
try { fs.mkdirSync(uploadsDir, { recursive: true }); } catch (e) { /* ignore */ }

// Simple multer disk storage for dev uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || '.png';
    const name = `avatar_${Date.now()}${Math.floor(Math.random()*1000)}${ext}`;
    cb(null, name);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// DEV-Fallback upload endpoint so frontend can work when backend/Cloudinary/Mongo are down
// Additionally: if client sends a form field 'email', update the in-memory TEST_USERS
// from backend/routes/auth (exported TEST_USERS) so mock login will return the avatar.
const authModule = require('./backend/routes/auth');
const TEST_USERS = authModule.TEST_USERS || [];
const http = require('http');

app.post('/api/avatar/upload', upload.single('avatar'), (req, res) => {
  try {
    // Try to decode bearer token (optional) to include user info if token valid
    let user = null;
    const auth = req.headers.authorization || req.headers.Authorization;
    if (auth && typeof auth === 'string' && auth.startsWith('Bearer ')) {
      const token = auth.split(' ')[1];
      try {
        user = jwt.verify(token, process.env.JWT_SECRET || 'group11_super_secret_jwt_key_2024_rbac_system');
      } catch (e) {
        // ignore invalid token in dev fallback
        user = null;
      }
    }

    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    // Build public URL relative to server static root
    const relPath = `/public/uploads/${req.file.filename}`;

    // If client provided email, try to update the mock TEST_USERS avatar (dev only)
    const emailField = (req.body && req.body.email) || null;
    if (emailField) {
      const mu = TEST_USERS.find(u => u.email === emailField);
      if (mu) {
        mu.avatar = relPath;
        console.log('✅ Dev-Fallback: updated TEST_USERS avatar for', emailField);

        // Also call the mock auth PUT endpoint to ensure the users listing reflects the change
        try {
          const postData = JSON.stringify({ avatar: relPath });
          const options = {
            hostname: '127.0.0.1',
            port: PORT,
            path: `/api/auth/users/${encodeURIComponent(emailField)}/avatar`,
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(postData)
            }
          };

          const reqInternal = http.request(options, (resInternal) => {
            let raw = '';
            resInternal.on('data', (chunk) => raw += chunk);
            resInternal.on('end', () => {
              try { console.log('✅ Dev-Fallback: internal PUT response', JSON.parse(raw)); } catch(e) { console.log('✅ Dev-Fallback: internal PUT raw', raw); }
            });
          });

          reqInternal.on('error', (e) => console.error('Dev-Fallback internal PUT error:', e));
          reqInternal.write(postData);
          reqInternal.end();
        } catch (e) {
          console.warn('Could not call internal auth PUT to persist avatar:', e.message);
        }
      }
    }

    return res.json({
      success: true,
      message: 'Uploaded (dev fallback)',
      data: {
        avatar: relPath,
        filename: req.file.filename,
        user: user || undefined
      }
    });
  } catch (err) {
    console.error('Dev upload error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// ✅ Đăng ký route auth
app.use("/api/auth", authRoutes);

const PORT = 5173;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
