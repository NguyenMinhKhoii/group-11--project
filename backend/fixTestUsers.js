// Quick Fix Test Users - SV3 Activity 6
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

async function fixTestUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Hash correct passwords
    const testPassword = await bcrypt.hash('testpassword123', 10);
    const adminPassword = await bcrypt.hash('adminpassword123', 10);

    // Update test user
    await User.findOneAndUpdate(
      { email: 'redux.test@example.com' },
      { 
        password: testPassword,
        username: 'redux_test_user',
        name: 'Redux Test User'
      }
    );

    // Update admin user  
    await User.findOneAndUpdate(
      { email: 'redux.admin@example.com' },
      { 
        password: adminPassword,
        username: 'redux_admin',
        name: 'Redux Admin User'
      }
    );

    console.log('✅ Test users passwords updated');

    // Verify password works now
    const testUser = await User.findOne({ email: 'redux.test@example.com' });
    const isValid = await bcrypt.compare('testpassword123', testUser.password);
    console.log('✅ Password verification:', isValid ? 'SUCCESS' : 'FAILED');

    await mongoose.connection.close();
    console.log('🔐 Database connection closed');
  } catch (error) {
    console.error('❌ Fix error:', error.message);
  }
}

fixTestUsers().catch(console.error);
