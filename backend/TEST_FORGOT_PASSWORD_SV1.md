# Test Forgot Password & Reset Password - SV1

## 🎯 Mục tiêu Test
Chứng minh **forgot password** và **reset password** hoạt động với email thật

## 🔧 Chuẩn bị
1. **Cấu hình Gmail SMTP** trong `.env`
2. **Lấy App Password** từ Google Account
3. **Update .env file:**
```env
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here
FRONTEND_URL=http://localhost:3000
```

## 📸 **ẢNH CẦN CHỤP CHO SV1 (5 ảnh)**

### **Ảnh 1: Cấu hình email thành công** ⚙️
**Test server khởi động:**
- Start server: `cd backend && node server.js`
- **Chụp ảnh:** Console log hiển thị "✅ Email server connection successful"

### **Ảnh 2: API Forgot Password thành công** 📧
```
POST http://localhost:3000/auth/forgot-password
Content-Type: application/json

{
  "email": "your_real_email@gmail.com"
}
```

**✅ Response mong đợi:**
```json
{
  "message": "Email reset password đã được gửi!",
  "email": "your_real_email@gmail.com",
  "resetToken": "abc123...",
  "expiresIn": "15 minutes"
}
```
**📸 Chụp ảnh:** Response thành công

### **Ảnh 3: Email nhận được token** 📨
- **Mở email** của bạn
- **Kiểm tra hộp thư đến** (có thể trong spam)
- **📸 Chụp ảnh:** Email với subject "🔐 Reset Your Password - Group 11 Project"

### **Ảnh 4: Reset Password thành công** ✅
**Copy token từ email hoặc response, thay thế YOUR_TOKEN:**
```
POST http://localhost:3000/auth/reset-password/YOUR_TOKEN
Content-Type: application/json

{
  "newPassword": "newpass123",
  "confirmPassword": "newpass123"
}
```

**✅ Response mong đợi:**
```json
{
  "message": "Đặt lại mật khẩu thành công!",
  "user": {
    "id": 1,
    "email": "user@example.com", 
    "name": "Test User"
  }
}
```
**📸 Chụp ảnh:** Response reset password thành công

### **Ảnh 5: Login với password mới** 🔑
```
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "newpass123"
}
```

**✅ Response mong đợi:**
```json
{
  "message": "Đăng nhập thành công!",
  "user": {...},
  "accessToken": "...",
  "refreshToken": "..."
}
```
**📸 Chụp ảnh:** Login thành công với password mới

## 🔍 **APIs để test**

### **1. Forgot Password**
- **URL**: `POST /auth/forgot-password`
- **Body**: `{ "email": "user@example.com" }`
- **Response**: Thông báo gửi email thành công

### **2. Reset Password**  
- **URL**: `POST /auth/reset-password/:token`
- **Body**: `{ "newPassword": "newpass123", "confirmPassword": "newpass123" }`
- **Response**: Thông báo reset thành công

### **3. Debug Active Tokens**
- **URL**: `GET /auth/debug/reset-tokens`
- **Response**: Danh sách tokens đang active

## ⚠️ **Lưu ý quan trọng**

### **Cấu hình Gmail App Password:**
1. Vào **Google Account** > **Security**
2. Bật **2-Step Verification** 
3. Tạo **App Password** cho "Mail"
4. Copy password 16 ký tự vào `.env`

### **Test với email thật:**
- Dùng email Gmail thật của bạn
- Kiểm tra cả hộp thư đến và spam
- Token hết hạn sau 15 phút

### **Security features:**
- ✅ Token chỉ dùng được 1 lần
- ✅ Token tự động hết hạn sau 15 phút  
- ✅ Cleanup tokens đã hết hạn/đã dùng
- ✅ Validate email tồn tại trước khi gửi

## 🚀 **Cách chạy test**

1. **Cấu hình email** trong `.env`
2. **Start server**: `cd backend && node server.js`
3. **Test forgot password** với Postman
4. **Kiểm tra email** nhận token
5. **Test reset password** với token
6. **Verify login** với password mới
7. **Chụp ảnh** từng bước để nộp báo cáo

## 🎯 **Kết quả mong đợi**
- Email gửi thành công với token
- Token verify được và reset password thành công  
- Login được với password mới
- Tất cả có ảnh chụp màn hình làm bằng chứng