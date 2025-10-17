# 🚀 ACTIVITY 7 - COMPLETE APPLICATION TESTING GUIDE
## Tổng hợp & Test Toàn Bộ Features

### 🎯 **Mục tiêu:**
- ✅ Test toàn bộ flow application từ A-Z
- ✅ Verify tích hợp tất cả features đã develop
- ✅ Document complete user journey
- ✅ Tạo demo materials cho presentation

---

## 📋 **COMPLETE FEATURES CHECKLIST**

### **✅ Activity 1-2: Basic Setup**
- [x] **Backend Server** - Express.js + Node.js
- [x] **Frontend Pages** - HTML/CSS/JS
- [x] **Database Connection** - MongoDB/File storage
- [x] **Basic Authentication** - Login/Register

### **✅ Activity 3: Role-Based Access Control (RBAC)**  
- [x] **User Roles**: USER, MODERATOR, ADMIN
- [x] **Protected Routes** với role validation
- [x] **Admin Panel** cho management features
- [x] **Permission System** theo hierarchy

### **✅ Activity 4: Forgot Password & Reset**
- [x] **Email Simulation** cho password reset
- [x] **Reset Token Generation** với expiration
- [x] **Secure Password Update** flow
- [x] **Email Templates** và validation

### **✅ Activity 5: Activity Logging & Rate Limiting**
- [x] **Activity Logger**: userId, action, timestamp, metadata
- [x] **Rate Limiting**: 5 attempts/15 minutes cho login
- [x] **Log Storage**: In-memory với auto cleanup
- [x] **Statistics API** cho admin dashboard

### **✅ Activity 6: Redux & Protected Routes (Backend Support)**
- [x] **Token Verification API**: /auth/me
- [x] **Protected Profile APIs**: /profile, /profile/dashboard  
- [x] **Admin Route Access**: Role-based /admin endpoint
- [x] **Rich Test Data** cho frontend integration

---

## 🧪 **COMPREHENSIVE TESTING WORKFLOW**

### **📸 TEST SCENARIO 1: Complete User Journey (8 Screenshots)**

#### **📸 Ảnh 1: User Registration**
```
POST /auth/register
Content-Type: application/json

{
  "name": "Activity 7 User",
  "email": "activity7@example.com",
  "password": "test123",
  "role": "user"  
}

Expected: 201 Created
- User registered successfully
- Email validation working
- Role assignment correct
```

#### **📸 Ảnh 2: User Login Success**
```
POST /auth/login  
Content-Type: application/json

{
  "email": "activity7@example.com", 
  "password": "test123"
}

Expected: 200 OK + Rate Limit Headers
- Login successful với accessToken + refreshToken
- X-RateLimit-* headers present
- User object với correct role
```

#### **📸 Ảnh 3: Token Verification**
```
GET /auth/me
Authorization: Bearer ACCESS_TOKEN

Expected: 200 OK
- Token validation successful
- User info returned correctly
- isAuthenticated: true
```

#### **📸 Ảnh 4: Protected Profile Access**
```
GET /profile
Authorization: Bearer ACCESS_TOKEN  

Expected: 200 OK
- Rich profile data returned
- Avatar URL, preferences, stats included
- User-specific information correct
```

#### **📸 Ảnh 5: Profile Dashboard**
```
GET /profile/dashboard
Authorization: Bearer ACCESS_TOKEN

Expected: 200 OK
- Dashboard data với recent activity  
- Notifications array populated
- Statistics và user metrics
```

#### **📸 Ảnh 6: Admin Access Control (403)**
```
GET /admin
Authorization: Bearer USER_TOKEN (non-admin)

Expected: 403 Forbidden
- "Cần quyền admin, nhưng bạn chỉ có quyền user"
- Proper role-based access control
- Security validation working
```

#### **📸 Ảnh 7: Activity Logs View**
```  
GET /activities/my
Authorization: Bearer ACCESS_TOKEN

Expected: 200 OK
- Personal activity logs displayed
- LOGIN_SUCCESS, REGISTER_SUCCESS entries
- Proper timestamp và metadata
```

#### **📸 Ảnh 8: Rate Limiting Demo**
```
POST /auth/login (with wrong password x5)
Expected: 429 Too Many Requests on 5th attempt
- Rate limiting working correctly
- Proper error message và retry time
- IP-based restriction active
```

---

### **📸 TEST SCENARIO 2: Admin Features (4 Screenshots)**

#### **📸 Ảnh 9: Admin Login**
```
POST /auth/login
{
  "email": "admin@example.com",
  "password": "123456" 
}

Expected: Admin user login successful
- Admin role token obtained
- Higher permission level confirmed
```

#### **📸 Ảnh 10: Admin Dashboard Access**
```
GET /admin
Authorization: Bearer ADMIN_TOKEN

Expected: 200 OK
- Admin dashboard data returned
- System statistics available
- Admin actions menu present
```

#### **📸 Ảnh 11: All Activity Logs (Admin View)**
```
GET /activities
Authorization: Bearer ADMIN_TOKEN

Expected: 200 OK  
- All users' activity logs visible
- Admin privilege để xem system-wide logs
- Filter và pagination working
```

#### **📸 Ảnh 12: Activity Statistics**
```
GET /activities/stats
Authorization: Bearer ADMIN_TOKEN

Expected: 200 OK
- Complete system statistics
- User counts, action summaries
- Rate limiting statistics included
```

---

### **📸 TEST SCENARIO 3: Error Handling & Security (4 Screenshots)**

#### **📸 Ảnh 13: Unauthorized Access**
```
GET /profile
(No Authorization header)

Expected: 401 Unauthorized
- Proper authentication required message
- Security middleware working
```

#### **📸 Ảnh 14: Invalid Token**
```
GET /auth/me
Authorization: Bearer INVALID_TOKEN

Expected: 401 Unauthorized  
- Token validation failed
- Clear error message returned
```

#### **📸 Ảnh 15: Refresh Token Usage**
```
POST /auth/refresh
{
  "refreshToken": "VALID_REFRESH_TOKEN"
}

Expected: 200 OK
- New access token generated
- Token refresh mechanism working
```

#### **📸 Ảnh 16: Password Reset Flow**
```
POST /auth/forgot-password
{
  "email": "activity7@example.com"
}

Expected: 200 OK  
- Password reset initiated
- Email simulation working
- Reset token generated
```

---

## 📊 **PERFORMANCE & MONITORING TESTS**

### **Server Performance**
- [ ] **Startup Time**: < 5 seconds
- [ ] **Memory Usage**: Reasonable cho development
- [ ] **Response Times**: < 200ms cho basic endpoints
- [ ] **Concurrent Requests**: Handle multiple users

### **Security Validation**  
- [ ] **JWT Expiration**: Tokens expire properly
- [ ] **Rate Limiting**: Prevents brute force attacks
- [ ] **Input Validation**: SQL injection prevention
- [ ] **CORS Setup**: Proper cross-origin handling

### **Feature Integration**
- [ ] **All APIs Working**: No 404/500 errors
- [ ] **Middleware Chain**: Authentication → Authorization → Logging
- [ ] **Data Consistency**: Logs accurate với user actions
- [ ] **Error Handling**: Graceful error responses

---

## 🎬 **VIDEO DEMO SCRIPT (5-10 minutes)**

### **Demo Flow:**
1. **Overview** (30s): Show project structure, technologies used
2. **Registration** (1min): Create new user, show validation
3. **Login + Rate Limiting** (1min): Demo successful login, show rate limiting
4. **Protected Routes** (1min): Access profile, show authentication working
5. **Admin Features** (1.5min): Login as admin, view dashboard, all logs
6. **Activity Logging** (1min): Show real-time logs, activity tracking
7. **Security Features** (1min): Show unauthorized access, role restrictions  
8. **API Documentation** (30s): Quick overview of endpoint documentation
9. **Conclusion** (30s): Summarize features, next steps

### **Key Points to Highlight:**
- ✅ **Complete Authentication System**: Register, Login, JWT tokens
- ✅ **Advanced Security**: Rate limiting, role-based access, activity tracking
- ✅ **Admin Dashboard**: System monitoring, user management capabilities
- ✅ **API-First Design**: Ready cho frontend integration
- ✅ **Professional Features**: Forgot password, refresh tokens, logging

---

## 📋 **FINAL DELIVERABLES CHECKLIST**

### **GitHub Repository:**
- [ ] **All branches merged** to main/master
- [ ] **Clean commit history** với meaningful messages  
- [ ] **Updated README.md** với setup instructions
- [ ] **API Documentation** complete và accurate
- [ ] **Environment setup** instructions included

### **Screenshots Package:**
- [ ] **16 Postman screenshots** covering all scenarios
- [ ] **Frontend screenshots** (nếu có React/Vue implementation)
- [ ] **Admin dashboard** screenshots
- [ ] **Error handling** examples

### **Video Demo:**
- [ ] **Screen recording** của complete flow
- [ ] **Audio narration** explaining features
- [ ] **High quality** (1080p recommended)
- [ ] **5-10 minutes duration**
- [ ] **Professional presentation**

### **Documentation:**
- [ ] **Setup guide** từ scratch
- [ ] **API endpoints** documentation
- [ ] **Testing procedures** 
- [ ] **Troubleshooting** common issues
- [ ] **Architecture overview**

---

## 🚀 **QUICK START TESTING COMMANDS**

```bash
# 1. Clone repository
git clone https://github.com/NguyenMinhKhoii/group-11--project.git
cd group-11--project

# 2. Install dependencies  
npm install
cd backend && npm install

# 3. Setup environment
cp .env.example .env
# Update environment variables

# 4. Start server
cd backend
node server.js

# 5. Test endpoints
# Use Postman collection hoặc curl commands
```

## 🎯 **SUCCESS CRITERIA**

✅ **Technical Requirements:**
- All 6 Activities implemented và working
- No critical bugs hoặc security issues
- Proper error handling và validation
- Clean, documented code

✅ **Demo Quality:**
- Professional presentation
- Clear feature demonstration  
- Complete user flow coverage
- Good audio/video quality

✅ **Documentation:**  
- Setup instructions clear
- API documentation complete
- Testing procedures documented
- Architecture explained

**🏆 GOAL: Deliver a professional-grade application với complete features và excellent documentation!**