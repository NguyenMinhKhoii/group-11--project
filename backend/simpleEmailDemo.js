// Simple Email Demo - SV3 Activity 4
// Chạy: node simpleEmailDemo.js

const dotenv = require('dotenv');
dotenv.config();

const emailService = require('./config/email');
const crypto = require('crypto');

console.log('🧪 SV3: Simple Email Demo - Activity 4\n');

async function demoEmail() {
  try {
    // 1. Test connection
    console.log('1️⃣ Testing email connection...');
    const connectionTest = await emailService.testEmailConnection();
    
    if (connectionTest.success) {
      console.log('✅ Email connection successful!');
      
      // 2. Demo test email
      console.log('\n2️⃣ Sending test email...');
      const testResult = await emailService.sendTestEmail(
        process.env.EMAIL_USER, // Send to self
        'SV3 Activity 4 Demo - ' + new Date().toISOString()
      );
      
      if (testResult.success) {
        console.log('✅ Test email sent successfully!');
        console.log('   - Message ID:', testResult.data.messageId);
        console.log('   - Check your inbox!');
      } else {
        console.log('❌ Test email failed:', testResult.error);
      }
      
      // 3. Demo reset password email
      console.log('\n3️⃣ Sending reset password demo...');
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetResult = await emailService.sendResetPasswordEmail(
        process.env.EMAIL_USER,
        resetToken,
        'SV3 Demo User'
      );
      
      if (resetResult.success) {
        console.log('✅ Reset password email sent!');
        console.log('   - Message ID:', resetResult.data.messageId);
        console.log('   - Reset Token:', resetToken.substring(0, 20) + '...');
        console.log('   - Reset URL:', resetResult.data.resetURL);
      }
      
    } else {
      console.log('❌ Email connection failed:', connectionTest.error);
      console.log('\n🔧 Setup Instructions:');
      console.log('1. Use Gmail account: group11.project2025@gmail.com');
      console.log('2. Enable 2-Factor Authentication');
      console.log('3. Generate App Password (not regular password)');
      console.log('4. Update .env with real credentials');
    }
    
  } catch (error) {
    console.error('❌ Demo failed:', error.message);
  }
}

// Kiểm tra config
console.log('📧 Email Configuration:');
console.log('   - EMAIL_USER:', process.env.EMAIL_USER || 'Not set');
console.log('   - EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Not set');
console.log('   - FRONTEND_URL:', process.env.FRONTEND_URL || 'http://localhost:3000');

console.log('\n🎯 Starting Email Demo...\n');
demoEmail().then(() => {
  console.log('\n🎉 Demo completed!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Demo error:', error);
  process.exit(1);
});
