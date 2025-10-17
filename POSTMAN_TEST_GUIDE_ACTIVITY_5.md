# 📋 HƯỚNG DẪN TEST POSTMAN - ACTIVITY 5 (SV1)
## User Activity Logging & Rate Limiting

### 🎯 **Mục tiêu:**
- Test middleware logActivity(userId, action, timestamp)
- Demo rate limiting chống brute force login  
- Test các API xem activity logs
- Chụp 6 ảnh theo yêu cầu SV1

---

## 📸 **6 ẢNH CẦN CHỤP:**

### **📸 Ảnh 1: Login Success với Rate Limit Headers**
**🔧 Setup Postman:**
1. **Method**: `POST`
2. **URL**: `http://localhost:3000/auth/login`
3. **Headers**: 
   - `Content-Type`: `application/json`
4. **Body** (raw JSON):
```json
{
  "email": "user@example.com",
  "password": "123456"
}
```

**✅ Expected Response:**
```json
{
  "message": "Đăng nhập thành công!",
  "user": {
    "id": 1,
    "email": "user@example.com", 
    "name": "Test User",
    "role": "user"
  },
  "accessToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**📋 Headers Response (quan trọng):**
- `X-RateLimit-Limit`: 5
- `X-RateLimit-Remaining`: 4  
- `X-RateLimit-Reset`: 2025-10-17T10:36:45.000Z

**📸 CHỤP**: Response body + Headers tab hiển thị rate limit headers

---

### **📸 Ảnh 2: Xem Activity Logs Cá Nhân**
**🔧 Setup:**
1. **Method**: `GET` 
2. **URL**: `http://localhost:3000/activity/my`
3. **Authorization**: 
   - Type: `Bearer Token`
   - Token: `[COPY ACCESS_TOKEN từ ảnh 1]`

**✅ Expected Response:**
```json
{
  "message": "Lấy activity logs cá nhân thành công",
  "logs": [
    {
      "id": 1729150123456.789,
      "userId": 1,
      "action": "LOGIN_SUCCESS", 
      "timestamp": "2025-10-17T02:55:23.456Z",
      "ip": "::1",
      "userAgent": "PostmanRuntime/7.35.0",
      "metadata": {
        "success": true,
        "statusCode": 200,
        "email": "user@example.com"
      }
    },
    {
      "action": "LOGIN_ATTEMPT",
      "timestamp": "2025-10-17T02:55:23.400Z"
    }
  ],
  "total": 2
}
```

**📸 CHỤP**: Response hiển thị activity logs của user

---

### **📸 Ảnh 3: Rate Limiting Demo - Bị Block sau 5 lần**
**🔧 Setup (Thực hiện 6 lần):**
1. **Method**: `POST`
2. **URL**: `http://localhost:3000/auth/login`
3. **Body** (lần 1-5):
```json
{
  "email": "user@example.com",
  "password": "wrongpassword"
}
```
4. **Body** (lần 6 - sẽ bị block):
```json  
{
  "email": "user@example.com", 
  "password": "wrongpassword"
}
```

**❌ Expected Response (lần 6):**
```json
{
  "message": "Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 10:40:23",
  "error": "RATE_LIMITED",
  "details": {
    "attempts": 5,
    "maxAttempts": 5,
    "resetTime": "2025-10-17T03:40:23.789Z",
    "retryAfter": 897
  }
}
```

**📋 Status Code**: `429 Too Many Requests`

**📸 CHỤP**: Response body + Status 429 + Headers rate limit

---

### **📸 Ảnh 4: Admin Xem Tất Cả Activity Logs**
**🔧 Setup:**
1. **Login Admin trước**:
   - URL: `POST http://localhost:3000/auth/login`
   - Body: `{"email": "admin@example.com", "password": "123456"}`
   - Lấy admin access token

2. **Xem All Logs**:
   - **Method**: `GET`
   - **URL**: `http://localhost:3000/activity/?limit=20`
   - **Authorization**: Bearer `[ADMIN_ACCESS_TOKEN]`

**✅ Expected Response:**
```json
{
  "message": "Lấy activity logs thành công",
  "logs": [
    {
      "id": 1729150456.789,
      "userId": 3,
      "action": "LOGIN_SUCCESS",
      "ip": "::1",
      "metadata": {"email": "admin@example.com"}
    },
    {
      "userId": 1, 
      "action": "UNAUTHORIZED_ACCESS",
      "metadata": {"reason": "RATE_LIMITED"}
    },
    {
      "userId": 1,
      "action": "LOGIN_FAILED", 
      "metadata": {"email": "user@example.com", "error": "Sai email hoặc mật khẩu!"}
    }
  ],
  "total": 15,
  "limit": 20
}
```

**📸 CHỤP**: Response hiển thị logs của tất cả users (chỉ admin thấy được)

---

### **📸 Ảnh 5: Activity Statistics**
**🔧 Setup:**
1. **Method**: `GET`
2. **URL**: `http://localhost:3000/activity/stats`  
3. **Authorization**: Bearer `[ADMIN_ACCESS_TOKEN]`

**✅ Expected Response:**
```json
{
  "message": "Lấy thống kê activity thành công",
  "stats": {
    "totalLogs": 25,
    "last24h": 25,
    "uniqueUsers": 3,
    "topActions": {
      "LOGIN_ATTEMPT": 8,
      "LOGIN_SUCCESS": 3, 
      "LOGIN_FAILED": 5,
      "UNAUTHORIZED_ACCESS": 2,
      "API_ACCESS": 7
    },
    "failedLogins": 5,
    "successfulLogins": 3
  },
  "timestamp": "2025-10-17T03:15:45.789Z"
}
```

**📸 CHỤP**: Response thống kê activity với các metrics

---

### **📸 Ảnh 6: Console Activity Logs Real-time** 
**🖥️ Trong Terminal/CMD chạy server:**

**Expected Console Output:**
```
🔍 Login attempt 1/5 from IP: ::1
📝 Activity Log: LOGIN_ATTEMPT by user 1 from ::1
📝 Activity Log: LOGIN_FAILED by user 1 from ::1
🔍 Login attempt 2/5 from IP: ::1
📝 Activity Log: LOGIN_ATTEMPT by user 1 from ::1
📝 Activity Log: LOGIN_FAILED by user 1 from ::1
...
🚫 Rate limited: IP ::1 exceeded 5 login attempts
📝 Activity Log: UNAUTHORIZED_ACCESS by user null from ::1
✅ Login successful, reset attempts for IP: ::1
📝 Activity Log: LOGIN_SUCCESS by user 3 from ::1
📝 Activity Log: API_ACCESS by user 3 from ::1
```

**📸 CHỤP**: Terminal window hiển thị real-time activity logs

---

## 🚀 **WORKFLOW TESTING:**

### **Bước 1: Khởi động Server**
```cmd
cd D:\group-11--project\backend
node server.js
```

### **Bước 2: Test Sequence** 
1. **Login Success** → Lấy token → Chụp ảnh 1
2. **Xem My Logs** → Dùng token → Chụp ảnh 2  
3. **Login Fail 6 lần** → Rate limited → Chụp ảnh 3
4. **Admin Login** → Lấy admin token → Chụp ảnh 4 
5. **Admin Stats** → Dùng admin token → Chụp ảnh 5
6. **Console Logs** → Chụp terminal → Chụp ảnh 6

### **Bước 3: Test Users**
```json
// Regular User
{"email": "user@example.com", "password": "123456"}

// Admin User  
{"email": "admin@example.com", "password": "123456"}

// Moderator User
{"email": "moderator@example.com", "password": "123456"}
```

---

## ⚙️ **POSTMAN SETTINGS:**

### **Environment Variables:**
- `base_url`: `http://localhost:3000`
- `user_token`: `{{access_token_from_login}}`
- `admin_token`: `{{admin_access_token}}`

### **Collection Structure:**
```
Activity 5 Testing/
├── 1. User Login Success
├── 2. View My Activity Logs  
├── 3. Rate Limiting Demo
├── 4. Admin View All Logs
├── 5. Activity Statistics
└── 6. Console Logs (manual)
```

### **Headers Template:**
```
Content-Type: application/json
Authorization: Bearer {{token_variable}}
```

---

## 🎯 **EXPECTED RESULTS:**

✅ **Activity Logging**: Mọi action được log tự động  
✅ **Rate Limiting**: Block sau 5 lần login sai  
✅ **Role-based Access**: Admin/Moderator xem được all logs  
✅ **Real-time Logs**: Console hiển thị live activity  
✅ **Statistics**: Metrics về user activity  
✅ **Security Headers**: Rate limit info trong response headers

---

**🚨 Lưu ý quan trọng:**
- Server phải chạy từ thư mục `backend`
- Dùng Postman để test, không dùng browser
- Chụp ảnh cả Response body và Headers
- Test theo đúng sequence để có đủ data
- Console logs phải để terminal visible khi chụp ảnh