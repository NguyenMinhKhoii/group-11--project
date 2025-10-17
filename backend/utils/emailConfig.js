const nodemailer = require('nodemailer');
require('dotenv').config();

// Cấu hình nodemailer với Gmail SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER, // Gmail address
      pass: process.env.EMAIL_PASS, // Gmail App Password
    },
  });
};

// Test email connection
const testEmailConnection = async () => {
  try {
    // Nếu chưa có email config, chỉ log warning thay vì error
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('⚠️ Email config not found, will simulate email sending');
      return true;
    }
    
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email server connection successful');
    return true;
  } catch (error) {
    console.log('⚠️ Email server not configured, will simulate email sending');
    console.log('💡 For real email, configure EMAIL_USER and EMAIL_PASS in .env');
    return true; // Return true để không block server
  }
};

// Gửi email forgot password
const sendPasswordResetEmail = async (to, resetToken, userName = 'User') => {
  try {
    // Nếu chưa có email config, simulate gửi email
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || 
        process.env.EMAIL_USER === 'email_that_ban_vua_tao_app_password@gmail.com') {
      console.log('📧 SIMULATED EMAIL SENDING:');
      console.log('📨 To:', to);
      console.log('🔑 Reset Token:', resetToken);
      console.log('🔗 Reset URL:', `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`);
      console.log('📧 Email subject: 🔐 Reset Your Password - Group 11 Project');
      console.log('✅ Email simulation successful (check console for token)');
      
      return {
        success: true,
        messageId: 'simulated-' + Date.now(),
        resetUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`,
        simulated: true
      };
    }
    
    // Chỉ tạo transporter khi có email config thật
    const transporter = createTransporter();
    
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
    
    const mailOptions = {
      from: {
        name: 'Group 11 Project',
        address: process.env.EMAIL_USER
      },
      to: to,
      subject: '🔐 Reset Your Password - Group 11 Project',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; margin-bottom: 10px;">🔐 Password Reset Request</h1>
            <p style="color: #666; font-size: 16px;">Group 11 Project</p>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-top: 0;">Hello ${userName}!</h2>
            <p style="color: #555; line-height: 1.6;">
              You requested to reset your password. Click the button below to reset your password:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #777; font-size: 14px; margin-bottom: 10px;">
              Or copy and paste this link into your browser:
            </p>
            <p style="color: #007bff; word-break: break-all; font-size: 14px;">
              ${resetUrl}
            </p>
          </div>
          
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin-bottom: 20px;">
            <p style="color: #856404; margin: 0; font-size: 14px;">
              ⚠️ <strong>Security Notice:</strong> This reset link will expire in 15 minutes for your security.
            </p>
          </div>
          
          <div style="background-color: #f8d7da; padding: 15px; border-radius: 8px; border-left: 4px solid #dc3545; margin-bottom: 20px;">
            <p style="color: #721c24; margin: 0; font-size: 14px;">
              🚨 If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              This is an automated email from Group 11 Project.<br>
              Please do not reply to this email.
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent:', info.messageId);
    console.log('📧 Email sent to:', to);
    console.log('🔗 Reset URL:', resetUrl);
    
    return {
      success: true,
      messageId: info.messageId,
      resetUrl: resetUrl
    };
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  createTransporter,
  testEmailConnection,
  sendPasswordResetEmail
};