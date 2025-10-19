# HOẠT ĐỘNG 6 - REDUX & PROTECTED ROUTES
## 📋 CHECKLIST TEST & DOCUMENTATION

**Sinh viên:** SV2  
**Ngày test:** $(date)  
**Server URL:** http://localhost:5173  
**Branch:** feature/redux-protected

---

## 🔧 1. KIỂM TRA SETUP REDUX

### ✅ Redux Store Configuration
- [ ] Redux store được khởi tạo thành công
- [ ] Auth slice hoạt động với createSlice và createAsyncThunk
- [ ] Store persist state trong localStorage
- [ ] Redux DevTools Extension kết nối (nếu có)

**Files kiểm tra:**
- `src/redux/store.js`
- `src/redux/slices/authSlice.js`
- `public/js/redux-store.js`

---

## 🔐 2. TEST AUTHENTICATION FLOW

### Test Case 1: Đăng ký tài khoản mới
1. **Truy cập:** http://localhost:5173/signup.html
2. **Thực hiện:** Đăng ký với thông tin:
   ```
   Họ tên: [Tên của bạn]
   Email: [email-test@gmail.com]
   Mật khẩu: 123456
   Role: user/admin
   ```
3. **Verify:** 
   - [ ] Hiển thị thông báo "Đăng ký thành công"
   - [ ] Redux state monitor hiển thị đúng
   - [ ] Server log ghi nhận đăng ký

### Test Case 2: Đăng nhập bằng Redux
1. **Truy cập:** http://localhost:5173/login.html
2. **Thực hiện:** Đăng nhập với tài khoản vừa tạo
3. **Verify:**
   - [ ] Redux loading state hiển thị "Đang đăng nhập..."
   - [ ] Login thành công → redirect về dashboard
   - [ ] Token được lưu trong localStorage
   - [ ] Redux state cập nhật isAuthenticated = true

### Test Case 3: Đăng nhập Pre-registered Accounts
**Admin Test:**
```
Email: admin@test.com
Password: 123456
```
**User Test:**
```
Email: user@test.com  
Password: 123456
```

---

## 🛡️ 3. TEST PROTECTED ROUTES

### Test Case 4: Truy cập Dashboard không login
1. **Thực hiện:** Mở http://localhost:5173/dashboard.html (chưa login)
2. **Verify:**
   - [ ] Tự động redirect về login.html
   - [ ] Hiển thị thông báo "Vui lòng đăng nhập"
   - [ ] Redux state isAuthenticated = false

### Test Case 5: Truy cập Dashboard đã login  
1. **Tiền đề:** Đã login thành công
2. **Thực hiện:** Truy cập dashboard.html
3. **Verify:**
   - [ ] Dashboard hiển thị đúng thông tin user
   - [ ] Tên, email, role hiển thị từ Redux state
   - [ ] Redux State Monitor hiển thị đầy đủ thông tin

---

## 👥 4. TEST ROLE-BASED ACCESS

### Test Case 6: Admin Dashboard
1. **Login as:** admin@test.com / 123456
2. **Verify Dashboard:**
   - [ ] Hiển thị "Admin Panel - User Management"
   - [ ] Admin stats (5 Total Users, 3 Active Sessions, 156 Activities)
   - [ ] Admin buttons: Quản lý User, Phân quyền, Upload Avatar, Advanced Panel
   - [ ] Role badge hiển thị "Admin User (admin)"

### Test Case 7: User Dashboard
1. **Login as:** user@test.com / 123456  
2. **Verify Dashboard:**
   - [ ] Hiển thị "User Dashboard"
   - [ ] User stats (12 Hoạt động, 8 Mục tiêu, 4.5⭐ Điểm)
   - [ ] User buttons: Xem hồ sơ, Hoạt động, Upload Avatar, Đổi mật khẩu
   - [ ] Role badge hiển thị "Regular User (user)"

---

## 🔄 5. TEST SESSION MANAGEMENT

### Test Case 8: Redux State Persistence
1. **Thực hiện:** Login → Refresh trang dashboard
2. **Verify:**
   - [ ] Vẫn ở trạng thái đăng nhập
   - [ ] User info vẫn hiển thị đúng  
   - [ ] localStorage chứa token và user data

### Test Case 9: Activity Tracking
1. **Kiểm tra:** Redux State Monitor → Last Activity
2. **Thực hiện:** Click, scroll, move mouse
3. **Verify:**
   - [ ] Last Activity timestamp cập nhật real-time
   - [ ] Session Duration tính toán đúng

### Test Case 10: Logout Functionality
1. **Thực hiện:** Click nút Logout trên dashboard
2. **Verify:**
   - [ ] Hiển thị confirm dialog
   - [ ] Redux state được clear
   - [ ] localStorage được xóa
   - [ ] Redirect về login.html
   - [ ] Hiển thị "Đăng xuất thành công"

---

## 📊 6. TEST REDUX STATE MONITOR

### Test Case 11: Real-time State Display
**Kiểm tra các thông tin hiển thị:**
- [ ] Authentication State (isAuthenticated, user, loading, error)
- [ ] Session Information (Last Activity, Session Duration, Tokens)
- [ ] Protected Routes Status (Dashboard, Admin, Profile Access)
- [ ] Redux Integration Status (Store, Activity Tracking, Auto Logout)

---

## 🔍 7. DEMO FEATURES 

### Test Case 12: Token Management Demo
1. **Truy cập:** Dashboard → Demo Refresh Token section
2. **Verify:**
   - [ ] Hiển thị Access Token: "Hết hạn sau 15 phút"
   - [ ] Hiển thị Refresh Token: "Hết hạn sau 7 ngày"
   - [ ] Buttons: "Test Refresh Token", "Test Session"

### Test Case 13: API Endpoints
**Test các endpoint:**
- [ ] POST /api/auth/login - Login functionality
- [ ] POST /api/auth/register - Registration  
- [ ] POST /api/auth/logout - Logout
- [ ] GET /api/users - View registered users

---

## 📸 8. SCREENSHOTS FOR SUBMISSION

**Required Screenshots:**
1. **Login Page** với Redux State Monitor
2. **Registration Success** với thông báo
3. **Admin Dashboard** với đầy đủ admin features
4. **User Dashboard** với user interface
5. **Redux State Monitor** hiển thị đầy đủ thông tin
6. **Protected Route Test** (redirect khi chưa login)
7. **Browser Developer Tools** hiển thị localStorage tokens
8. **Server Console Log** với login/register logs

---

## 📂 9. FILES SUBMISSION

**Code Files:**
```
src/
├── redux/
│   ├── store.js
│   └── slices/
│       └── authSlice.js
├── pages/
│   ├── Login/LoginPage.jsx
│   ├── Register/RegisterPage.jsx  
│   ├── Dashboard/DashboardPage.jsx
│   ├── Profile/ProfilePage.jsx
│   └── Admin/AdminPage.jsx
├── components/
│   └── ProtectedRoute/ProtectedRoute.jsx
└── App.jsx

public/js/
├── redux-store.js
├── redux-login.js  
└── redux-dashboard.js

Root files:
├── login.html (Redux enhanced)
├── dashboard.html (Redux enhanced)
├── signup.html
└── redux-test-server.js
```

**Package Dependencies:**
```json
{
  "@reduxjs/toolkit": "^1.9.7",
  "react-redux": "^8.1.3", 
  "react-router-dom": "^6.17.0"
}
```

---

## ✅ 10. COMPLETION CRITERIA

**Hoạt động 6 hoàn thành khi:**
- [ ] ✅ Redux store setup và hoạt động
- [ ] ✅ Authentication flow với Redux actions
- [ ] ✅ Protected routes block unauthorized access
- [ ] ✅ Role-based dashboard content
- [ ] ✅ Session management và activity tracking
- [ ] ✅ State persistence trong localStorage  
- [ ] ✅ Real-time Redux state monitoring
- [ ] ✅ Clean logout và state cleanup
- [ ] ✅ Registration → Login workflow
- [ ] ✅ Server API integration

---

## 🚀 FINAL COMMIT & PUSH

```bash
git add .
git commit -m "Hoạt động 6: Redux & Protected Routes - Complete
- Redux store với auth state management
- Protected routes với role-based access  
- Session management và activity tracking
- Integration với existing HTML interface
- Dynamic user registration và login
- Real-time state monitoring"
git push origin feature/redux-protected
```

---

**Test Results:** ✅ PASS / ❌ FAIL  
**Completion Date:** ___________  
**Notes:** ________________________________