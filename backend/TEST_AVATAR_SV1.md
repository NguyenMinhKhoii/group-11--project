# Test Avatar Upload - SV1

## 🎯 Mục tiêu Test
Chứng minh API upload avatar hoạt động với **Multer + Sharp + Cloudinary**

## 🔧 Chuẩn bị
1. **Tạo tài khoản Cloudinary** tại: https://cloudinary.com
2. **Lấy API credentials** từ Cloudinary Dashboard
3. **Cập nhật .env file:**
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key  
CLOUDINARY_API_SECRET=your_api_secret
```

## 📸 **ẢNH CẦN CHỤP CHO SV1 (7 ảnh)**

### **Ảnh 1: Cấu hình Cloudinary thành công** ⚙️
**Test server khởi động:**
- Start server: `cd backend && node server.js`
- **Chụp ảnh:** Console log hiển thị "✅ Cloudinary connected successfully"

### **Ảnh 2: Login để lấy JWT token** 🔑
```
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "123456"
}
```
**📸 Chụp ảnh:** Response có accessToken

### **Ảnh 3: Upload avatar thành công** ✅
```
POST http://localhost:3000/users/avatar
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: multipart/form-data

Form Data:
- Key: avatar
- Type: File
- Value: [Select một file ảnh JPG/PNG < 5MB]
```

**✅ Response mong đợi:**
```json
{
  "message": "Upload avatar thành công!",
  "data": {
    "user": {...},
    "avatar": {
      "url": "https://res.cloudinary.com/...",
      "thumbnail_url": "https://res.cloudinary.com/.../w_100,h_100,c_fill/...",
      "upload_date": "2025-10-16T...",
      "cloudinary_info": {
        "public_id": "avatars/user_1/...",
        "format": "jpg",
        "width": 400,
        "height": 400
      }
    }
  }
}
```

**📸 Chụp ảnh:** 
- Request với file attached
- Response 200 OK với Cloudinary URL
- Headers có Authorization Bearer

### **Ảnh 4: Kiểm tra ảnh trên Cloudinary** 🌤️
- **Vào Cloudinary Dashboard** → Media Library
- **📸 Chụp ảnh:** Ảnh avatar xuất hiện trong folder `avatars/user_1/`
- **Verify:** Ảnh đã được resize 400x400px

### **Ảnh 5: Lấy thông tin avatar** 📋
```
GET http://localhost:3000/users/avatar
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**✅ Response mong đợi:**
```json
{
  "message": "Thông tin avatar",
  "data": {
    "user": {...},
    "avatar": {
      "url": "https://res.cloudinary.com/...",
      "thumbnail_url": "https://res.cloudinary.com/.../w_100,h_100,c_fill/...",
      "upload_date": "2025-10-16T...",
      "dimensions": {
        "width": 400,
        "height": 400
      }
    }
  }
}
```

**📸 Chụp ảnh:** GET request thành công với avatar info

### **Ảnh 6: Test validation lỗi** ❌

**6a - File không phải ảnh:**
```
POST http://localhost:3000/users/avatar
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: multipart/form-data

Form Data:
- Key: avatar  
- Value: [File PDF/TXT]
```

**❌ Response mong đợi:**
```json
{
  "message": "Chỉ chấp nhận file ảnh (jpg, png, gif, webp)!",
  "error": "INVALID_FILE_TYPE"
}
```

**6b - File quá lớn (>5MB):**
**❌ Response mong đợi:**
```json
{
  "message": "File quá lớn! Tối đa 5MB.",
  "error": "FILE_TOO_LARGE"
}
```

**📸 Chụp ảnh:** Cả 2 test cases validation lỗi

### **Ảnh 7: Xóa avatar** 🗑️
```
DELETE http://localhost:3000/users/avatar
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**✅ Response mong đợi:**
```json
{
  "message": "Xóa avatar thành công!",
  "data": {
    "user": {...},
    "deleted_avatar": {
      "url": "https://res.cloudinary.com/...",
      "deleted_at": "2025-10-16T..."
    }
  }
}
```

**📸 Chụp ảnh:** 
- DELETE request thành công
- Verify ảnh đã biến mất khỏi Cloudinary

## 🔍 **Điểm quan trọng khi chụp ảnh:**

### **✅ Phải có trong ảnh:**
1. **URL đầy đủ** của API endpoint
2. **Method** (POST/GET/DELETE)
3. **Authorization header** với Bearer token
4. **Content-Type** (multipart/form-data cho upload)
5. **File attachment** trong Form Data
6. **Response status** (200/400/500)
7. **Cloudinary URL** trong response
8. **Image dimensions** (400x400)

### **🌟 Bonus points:**
- **Postman Collection** export
- **Environment variables** cho token
- **Pre-request scripts** để auto-login
- **Test scripts** để validate response

## 📂 **Cách tổ chức ảnh nộp:**

```
SV1_Avatar_Upload/
├── 1_Cloudinary_Connected.png
├── 2_Login_Get_Token.png
├── 3_Upload_Avatar_Success.png
├── 4_Cloudinary_Dashboard.png
├── 5_Get_Avatar_Info.png
├── 6a_Validation_Wrong_Type.png
├── 6b_Validation_File_Too_Large.png
└── 7_Delete_Avatar.png
```

## 🚀 **Test Flow Complete:**
1. ✅ **Setup Cloudinary** → connection success
2. ✅ **Login** → get JWT token  
3. ✅ **Upload** → image processed & stored
4. ✅ **Verify** → check Cloudinary dashboard
5. ✅ **Get info** → retrieve avatar data
6. ✅ **Validation** → test error cases
7. ✅ **Delete** → cleanup & verify removal

## 🎯 **SV1 Requirements Completed:**
- ✅ **API /users/avatar** với JWT authentication
- ✅ **Multer** cho file upload handling
- ✅ **Sharp** cho image processing & resize  
- ✅ **Cloudinary** integration cho cloud storage
- ✅ **Middleware** validation & error handling
- ✅ **Complete CRUD** operations cho avatar

**Ready to test! Server: http://localhost:3000** 🚀