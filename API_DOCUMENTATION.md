# 🚀 GROUP 11 - API DOCUMENTATION

## 📋 Thông tin server
- **Base URL:** `http://localhost:3001`
- **Content-Type:** `application/json`

---

## 🔐 AUTHENTICATION APIS

### 1. Đăng ký (Sign Up)
**POST** `/api/auth/signup`

**Request Body:**
```json
{
  "name": "Nguyen Van A",
  "email": "test@example.com", 
  "password": "123456"
}
```

**Response Success (201):**
```json
{
  "message": "Đăng ký thành công!",
  "user": {
    "id": 1,
    "name": "Nguyen Van A",
    "email": "test@example.com"
  }
}
```

---

### 2. Đăng nhập (Login) 
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "test@example.com",
  "password": "123456"
}
```

**Response Success (200):**
```json
{
  "message": "Đăng nhập thành công!",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "8f2a5c1b-9e7d-4f3a-8b2c-1d5e6f7a8b9c",
  "user": {
    "id": 1,
    "name": "Nguyen Van A", 
    "email": "test@example.com"
  }
}
```

---

### 3. Quên mật khẩu (Forgot Password) - ⭐ CỦA BẠN
**POST** `/api/auth/forgot-password`

**Request Body:**
```json
{
  "email": "test@example.com"
}
```

**Response Success (200):**
```json
{
  "message": "✅ Gửi thành công! Token reset đã được tạo.",
  "resetToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwicHVycG9zZSI6InJlc2V0X3Bhc3N3b3JkIiwiaWF0IjoxNjk3NDU2Nzg5LCJleHAiOjE2OTc0NTg1ODl9...",
  "instructions": "Sử dụng token này để reset mật khẩu trong vòng 30 phút.",
  "user": {
    "id": 1,
    "name": "Nguyen Van A",
    "email": "test@example.com"
  }
}
```

**Response Error (404):**
```json
{
  "message": "Email không tồn tại trong hệ thống!"
}
```

---

### 4. Refresh Token
**POST** `/api/auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "8f2a5c1b-9e7d-4f3a-8b2c-1d5e6f7a8b9c"
}
```

**Response Success (200):**
```json
{
  "message": "Token làm mới thành công!",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "new-refresh-token-here",
  "user": {
    "id": 1,
    "name": "Nguyen Van A",
    "email": "test@example.com"
  }
}
```

---

### 5. Đăng xuất (Logout)
**POST** `/api/auth/logout`

**Request Body:**
```json
{
  "refreshToken": "8f2a5c1b-9e7d-4f3a-8b2c-1d5e6f7a8b9c"
}
```

**Response Success (200):**
```json
{
  "message": "Đăng xuất thành công!"
}
```

---

## 🧪 POSTMAN COLLECTION

### Collection Settings:
1. **Variable `baseUrl`:** `http://localhost:3001`
2. **Headers:** `Content-Type: application/json`

### Test Sequence:
1. **Đăng ký** → Tạo account mới
2. **Đăng nhập** → Lấy tokens  
3. **Quên mật khẩu** → Lấy reset token 📧
4. **Refresh** → Test auto-refresh
5. **Đăng xuất** → Clear session

---

## 📤 SHARE CHO BẠN NHÓM

**Gửi cho bạn:**
- File này: `API_DOCUMENTATION.md`
- Base URL: `http://localhost:3001` 
- Endpoint quan trọng: `/api/auth/forgot-password`

**Bạn có thể:**
1. Copy nội dung này gửi qua chat
2. Tạo Postman collection và export
3. Share link localhost (nếu cùng mạng)

---

## ⚡ QUICK TEST

```bash
# Test forgot password
curl -X POST http://localhost:3001/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

**Lưu ý:** Server phải chạy trước khi test!