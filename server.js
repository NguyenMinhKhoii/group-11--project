const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

console.log('Starting server...');

try {
  const authRoutes = require("./backend/routes/auth"); // ✅ Đường dẫn chính xác
  console.log('✅ Auth routes loaded successfully');

  const app = express();
  
  app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    credentials: true
  }));
  app.use(bodyParser.json());

  // Add a test route
  app.get('/', (req, res) => {
    res.json({ message: 'Server is running!' });
  });

  // ✅ Đăng ký route auth
  app.use("/api/auth", authRoutes);
  
  // ✅ Đăng ký route user (để chia sẻ data)
  const userRoutes = require("./backend/routes/user");
  app.use("/api", userRoutes);

  const PORT = 3001;
  const server = app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🌐 Test URL: http://localhost:${PORT}`);
  });
  
  server.on('error', (error) => {
    console.error('❌ Server error:', error);
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
  });

  process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled Rejection:', error);
  });

} catch (error) {
  console.error('❌ Server startup error:', error.message);
  console.error('Stack:', error.stack);
}
