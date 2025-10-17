// Email Configuration - SV3
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

// Cấu hình Gmail SMTP transporter
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER, // Gmail address
      pass: process.env.EMAIL_PASS, // Gmail App Password
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

// Test email connection
const testEmailConnection = async () => {
  try {
    const transporter = createEmailTransporter();
    await transporter.verify();
    return {
      success: true,
      message: "Email connection verified successfully",
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

// Gửi email reset password
const sendResetPasswordEmail = async (email, resetToken, userName = "User") => {
  try {
    const transporter = createEmailTransporter();

    // Frontend reset URL (cập nhật theo domain thực tế)
    const resetURL = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/reset-password/${resetToken}`;

    const mailOptions = {
      from: {
        name: "Group 11 Project",
        address: process.env.EMAIL_USER,
      },
      to: email,
      subject: "🔐 Reset Password Request - Group 11 Project",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Password</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              padding: 0;
              border-radius: 10px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 600;
            }
            .content {
              padding: 40px 30px;
            }
            .greeting {
              font-size: 18px;
              color: #333;
              margin-bottom: 20px;
            }
            .message {
              font-size: 16px;
              color: #555;
              line-height: 1.6;
              margin-bottom: 30px;
            }
            .reset-button {
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white !important;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 25px;
              font-weight: 600;
              font-size: 16px;
              margin: 20px 0;
              transition: transform 0.2s;
            }
            .reset-button:hover {
              transform: translateY(-2px);
            }
            .token-info {
              background-color: #f8f9fa;
              border-left: 4px solid #667eea;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .token {
              font-family: 'Courier New', monospace;
              font-size: 14px;
              background-color: #e9ecef;
              padding: 10px;
              border-radius: 4px;
              word-break: break-all;
              margin: 10px 0;
            }
            .warning {
              background-color: #fff3cd;
              border: 1px solid #ffeaa7;
              color: #856404;
              padding: 15px;
              border-radius: 4px;
              margin: 20px 0;
            }
            .footer {
              background-color: #f8f9fa;
              padding: 20px 30px;
              text-align: center;
              color: #666;
              font-size: 14px;
              border-top: 1px solid #e9ecef;
            }
            .security-tips {
              margin-top: 20px;
              padding: 15px;
              background-color: #e7f3ff;
              border-radius: 4px;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Reset Your Password</h1>
            </div>
            
            <div class="content">
              <div class="greeting">
                Hello ${userName}! 👋
              </div>
              
              <div class="message">
                We received a request to reset your password for your Group 11 Project account. 
                If you made this request, click the button below to reset your password:
              </div>
              
              <div style="text-align: center;">
                <a href="${resetURL}" class="reset-button">
                  🔑 Reset My Password
                </a>
              </div>
              
              <div class="token-info">
                <strong>🎫 Reset Token:</strong>
                <div class="token">${resetToken}</div>
                <small>You can also use this token manually if the button doesn't work.</small>
              </div>
              
              <div class="warning">
                <strong>⚠️ Security Notice:</strong><br>
                • This link expires in <strong>1 hour</strong><br>
                • If you didn't request this reset, please ignore this email<br>
                • Never share this token with anyone
              </div>
              
              <div class="security-tips">
                <strong>🛡️ Security Tips:</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>Use a strong password with at least 8 characters</li>
                  <li>Include uppercase, lowercase, numbers, and symbols</li>
                  <li>Don't reuse passwords from other accounts</li>
                  <li>Consider using a password manager</li>
                </ul>
              </div>
            </div>
            
            <div class="footer">
              <p>
                <strong>Group 11 Project Team</strong><br>
                This email was sent automatically. Please don't reply to this email.
              </p>
              <p style="margin-top: 15px; font-size: 12px; color: #999;">
                If you're having trouble with the button above, copy and paste this URL into your browser:<br>
                <span style="word-break: break-all;">${resetURL}</span>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      // Fallback text version
      text: `
        Hello ${userName}!
        
        We received a request to reset your password for your Group 11 Project account.
        
        Reset Token: ${resetToken}
        Reset URL: ${resetURL}
        
        This link expires in 1 hour.
        
        If you didn't request this reset, please ignore this email.
        
        Group 11 Project Team
      `,
    };

    const result = await transporter.sendMail(mailOptions);

    return {
      success: true,
      data: {
        messageId: result.messageId,
        response: result.response,
        email: email,
        resetToken: resetToken,
        resetURL: resetURL,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

// Gửi email xác nhận reset password thành công
const sendPasswordResetConfirmation = async (email, userName = "User") => {
  try {
    const transporter = createEmailTransporter();

    const mailOptions = {
      from: {
        name: "Group 11 Project",
        address: process.env.EMAIL_USER,
      },
      to: email,
      subject: "✅ Password Reset Successful - Group 11 Project",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 0; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { background: linear-gradient(135deg, #10ac84 0%, #1dd1a1 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 40px 30px; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Password Reset Successful</h1>
            </div>
            <div class="content">
              <h2>Hello ${userName}! 👋</h2>
              <p>Your password has been successfully reset.</p>
              <p>You can now log in with your new password.</p>
              <p><strong>Security Tip:</strong> Keep your password safe and don't share it with anyone.</p>
            </div>
            <div class="footer">
              <p>Group 11 Project Team</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Hello ${userName}!
        
        Your password has been successfully reset.
        You can now log in with your new password.
        
        Group 11 Project Team
      `,
    };

    const result = await transporter.sendMail(mailOptions);

    return {
      success: true,
      data: {
        messageId: result.messageId,
        response: result.response,
        email: email,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

// Gửi email test
const sendTestEmail = async (email, testMessage = "This is a test email") => {
  try {
    const transporter = createEmailTransporter();

    const mailOptions = {
      from: {
        name: "Group 11 Project - Test",
        address: process.env.EMAIL_USER,
      },
      to: email,
      subject: "🧪 Test Email - Group 11 Project",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>🧪 Test Email</h2>
          <p>Hello! This is a test email from Group 11 Project.</p>
          <p><strong>Message:</strong> ${testMessage}</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong>✅ If you received this email, your email configuration is working correctly!</strong>
          </div>
          <p>Best regards,<br>Group 11 Project Team</p>
        </div>
      `,
      text: `
        Test Email - Group 11 Project
        
        Hello! This is a test email from Group 11 Project.
        Message: ${testMessage}
        Timestamp: ${new Date().toISOString()}
        
        If you received this email, your email configuration is working correctly!
        
        Best regards,
        Group 11 Project Team
      `,
    };

    const result = await transporter.sendMail(mailOptions);

    return {
      success: true,
      data: {
        messageId: result.messageId,
        response: result.response,
        email: email,
        testMessage: testMessage,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

module.exports = {
  createEmailTransporter,
  testEmailConnection,
  sendResetPasswordEmail,
  sendPasswordResetConfirmation,
  sendTestEmail,
};
