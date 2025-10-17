# TEST ACTIVITY 5 - User Activity Logging & Rate Limiting (SV1)

## 🎯 **Mục tiêu test**
- Middleware logActivity(userId, action, timestamp) 
- Rate limiting login chống brute force
- APIs xem activity logs
- Demo rate limiting khi login quá nhiều lần

## 📸 **6 ảnh cần chụp cho SV1:**

### **Ảnh 1: Login thành công với Activity Log** ✅
**Request:**
```
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "123456"
}
```
**📸 Chụp:** Response thành công + Rate limit headers (X-RateLimit-Limit, X-RateLimit-Remaining)

### **Ảnh 2: Xem Activity Logs của chính mình** 📋
**Request:**
```
POST http://localhost:3000/auth/login (để lấy token)
GET http://localhost:3000/activity/my
Authorization: Bearer YOUR_ACCESS_TOKEN
```
**📸 Chụp:** Response hiển thị activity logs của user đã login

### **Ảnh 3: Rate Limiting - Login thất bại 5 lần** 🚫
**Thực hiện 5 lần:**
```
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "wrongpassword"
}
```
**📸 Chụp:** Lần thứ 6 bị rate limited với error "RATE_LIMITED"

### **Ảnh 4: Admin xem tất cả Activity Logs** 👨‍💼
**Request:**
```
POST http://localhost:3000/auth/login (với admin@example.com / 123456)
GET http://localhost:3000/activity/
Authorization: Bearer ADMIN_ACCESS_TOKEN
```
**📸 Chụp:** Response hiển thị tất cả activity logs (chỉ admin được xem)

### **Ảnh 5: Activity Statistics** 📊
**Request:**
```
GET http://localhost:3000/activity/stats
Authorization: Bearer ADMIN_ACCESS_TOKEN
```
**📸 Chụp:** Response thống kê activity (total logs, failed logins, successful logins, top actions)

### **Ảnh 6: Console Log Activity** 🖥️
**📸 Chụp:** Terminal/Console hiển thị activity logs real-time:
- `📝 Activity Log: LOGIN_ATTEMPT by user 1 from [IP]`
- `🔍 Login attempt 1/5 from IP: [IP]`
- `✅ Login successful, reset attempts for IP: [IP]`

---

## 🚀 **Hướng dẫn test step-by-step:**

### **Bước 1: Khởi động server**
```bash
cd backend
node server.js
```

### **Bước 2: Test Users có sẵn**
```javascript
// Regular User
{
  "email": "user@example.com", 
  "password": "123456",
  "role": "user"
}

// Admin User  
{
  "email": "admin@example.com",
  "password": "123456", 
  "role": "admin"
}
```

### **Bước 3: Test Flow**
1. **Login thành công** → Chụp ảnh 1
2. **Xem logs cá nhân** → Chụp ảnh 2  
3. **Login sai 6 lần** → Chụp ảnh 3 (lần 6 bị block)
4. **Admin login & xem all logs** → Chụp ảnh 4
5. **Admin xem stats** → Chụp ảnh 5
6. **Console logs** → Chụp ảnh 6

---

## 🔧 **Rate Limiting Configuration:**
- **Max attempts**: 5 lần / IP
- **Window time**: 15 phút
- **Reset**: Sau login thành công hoặc hết thời gian
- **Headers**: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset

## 📝 **Activity Actions được log:**
- `LOGIN_ATTEMPT` - Mỗi lần thử login
- `LOGIN_SUCCESS` - Login thành công  
- `LOGIN_FAILED` - Login thất bại
- `PASSWORD_RESET_REQUEST` - Yêu cầu reset password
- `PASSWORD_RESET_SUCCESS` - Reset password thành công
- `API_ACCESS` - Truy cập API
- `UNAUTHORIZED_ACCESS` - Truy cập trái phép/rate limited

## ✅ **Expected Results:**
- Activity logs được tạo tự động cho mọi hành động
- Rate limiting hoạt động sau 5 lần login sai
- APIs activity chỉ admin/moderator được truy cập
- Console hiển thị real-time activity logs
- Headers rate limiting được trả về trong mọi login request

---
**Lưu ý**: Server phải chạy từ thư mục `backend` để tránh lỗi module not found.

# TEST ACTIVITY 5 - User Activity Logging & Rate Limiting (SV1)

## 🎯 **Mục tiêu SV1**
- ✅ Middleware logActivity(userId, action, timestamp)
- ✅ Rate limit login để chống brute force
- ✅ Test và chụp ảnh với Postman

## 🔧 **Các tính năng đã triển khai**

### 1. **Activity Logging System**
- **File**: `backend/utils/activityLogger.js`
- **Chức năng**: Lưu trữ và quản lý logs hoạt động
- **Actions**: LOGIN_ATTEMPT, LOGIN_SUCCESS, LOGIN_FAILED, PASSWORD_RESET, etc.

### 2. **Activity Middleware**
- **File**: `backend/middleware/activityMiddleware.js`
- **Chức năng**: Middleware tự động log mọi hoạt động
- **Features**: Track user ID, IP, user agent, response time

### 3. **Rate Limiting Middleware**
- **File**: `backend/middleware/rateLimitMiddleware.js`
- **Chức năng**: Chống brute force login
- **Cấu hình**: 5 attempts / 15 minutes window

### 4. **Activity Routes**
- **File**: `backend/routes/activityRoutes.js`
- **APIs**: Xem logs, thống kê, filter theo action

## 📋 **APIs cần test**

### **API 1: Login bình thường** ✅
```http
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "123456"
}
```
**Expected**: Login thành công + log activity

### **API 2: Login sai password (5 lần)** 🚫
```http
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "user@example.com", 
  "password": "wrong_password"
}
```
**Expected**: Lần thứ 6 bị rate limit

### **API 3: Xem activity logs (Admin)** 📊
```http
GET http://localhost:3000/activity/
Authorization: Bearer {admin_token}
```
**Expected**: Danh sách tất cả logs

### **API 4: Xem logs của user cụ thể** 👤
```http
GET http://localhost:3000/activity/user/1
Authorization: Bearer {admin_token}
```
**Expected**: Logs của user ID 1

### **API 5: Xem personal logs** 🔍
```http
GET http://localhost:3000/activity/my
Authorization: Bearer {user_token}
```
**Expected**: Logs của chính mình

### **API 6: Activity statistics** 📈
```http
GET http://localhost:3000/activity/stats
Authorization: Bearer {admin_token}
```
**Expected**: Thống kê hoạt động

## 📸 **6 ảnh cần chụp cho SV1**

### **Ảnh 1: Login thành công + Activity Log**
- **Action**: Postman login thành công
- **Chụp**: Response thành công + headers rate limit
- **Log**: Console hiển thị activity log được tạo

### **Ảnh 2: Login sai 5 lần liên tiếp** 
- **Action**: Login sai password 5 lần
- **Chụp**: Response lần thứ 5 vẫn cho phép
- **Headers**: X-RateLimit-Remaining: 0

### **Ảnh 3: Rate Limited (lần thứ 6)**
- **Action**: Login lần thứ 6
- **Chụp**: Response 429 "Quá nhiều lần đăng nhập thất bại"
- **Details**: retryAfter, resetTime

### **Ảnh 4: Xem Activity Logs (Admin)**
- **Action**: GET /activity/ với admin token
- **Chụp**: Danh sách logs với các actions khác nhau
- **Content**: LOGIN_SUCCESS, LOGIN_FAILED, API_ACCESS

### **Ảnh 5: Activity Statistics**
- **Action**: GET /activity/stats
- **Chụp**: Thống kê totalLogs, last24h, uniqueUsers, topActions
- **Data**: Số liệu thống kê chi tiết

### **Ảnh 6: Personal Activity Logs**
- **Action**: GET /activity/my với user token
- **Chụp**: Logs cá nhân của user
- **Filter**: Chỉ hiển thị logs của user đó

## 🚀 **Hướng dẫn test step by step**

### **Bước 1: Khởi động server**
```bash
cd backend
node server.js
```

### **Bước 2: Lấy admin token**
```http
POST http://localhost:3000/auth/login
{
  "email": "admin@example.com",
  "password": "123456"
}
```

### **Bước 3: Test rate limiting**
- Login sai 5 lần với cùng 1 IP
- Lần thứ 6 sẽ bị chặn

### **Bước 4: Xem activity logs**
- Dùng admin token để xem tất cả logs
- Xem stats và personal logs

## ⚠️ **Lưu ý quan trọng**
- Rate limiting dựa trên IP address
- Logs được lưu in-memory (sẽ mất khi restart server)
- Mỗi action đều được log tự động
- Admin có thể xem tất cả logs
- User chỉ xem được logs của mình

## 🎯 **Demo scenario cho ảnh**
1. **Setup**: Start server, login admin để lấy token
2. **Demo Rate Limit**: Login sai 6 lần liên tiếp
3. **Demo Logging**: Xem logs, stats, personal logs
4. **Chụp ảnh**: Theo đúng thứ tự 6 ảnh trên