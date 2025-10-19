const mongoose = require("mongoose");
require('dotenv').config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/group11_rbac';
    
    console.log('🔄 Connecting to MongoDB...');
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Maximum number of connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close connections after 45 seconds of inactivity
      family: 4 // Use IPv4, skip trying IPv6
    });

    console.log(`✅ MongoDB connected successfully: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔒 MongoDB connection closed through app termination');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    
    // Fallback to local MongoDB if cloud fails
    if (error.message.includes('ENOTFOUND') || error.message.includes('timeout')) {
      console.log('🔄 Trying local MongoDB fallback...');
      try {
        await mongoose.connect('mongodb://localhost:27017/group11_rbac_local');
        console.log('✅ Connected to local MongoDB fallback');
      } catch (localError) {
        console.error('❌ Local MongoDB also failed:', localError.message);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
