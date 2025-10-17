# 📋 ACTIVITY 6 - API DOCUMENTATION FOR REDUX FRONTEND
## Backend APIs hỗ trợ Redux & Protected Routes

### 🎯 **Mục tiêu SV1:**
- ✅ Cung cấp APIs cần thiết cho Redux integration
- ✅ Kiểm thử và validate dữ liệu
- ✅ Hỗ trợ SV2 trong việc frontend development

---

## 🔑 **1. AUTHENTICATION APIs**

### **POST /auth/login**
**Mục đích**: Đăng nhập và lấy token cho Redux store

**Request:**
```json
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "123456"
}
```

**Response (200):**
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

**Redux Usage:**
```javascript
// Lưu vào Redux store:
dispatch(loginSuccess({ user, accessToken, refreshToken }))
// Lưu token vào localStorage để persist
localStorage.setItem('accessToken', accessToken)
```

---

### **GET /auth/me**
**Mục đích**: Verify token và lấy user info (cho Redux rehydration)

**Request:**
```json
GET http://localhost:3000/auth/me
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

**Response (200):**
```json
{
  "message": "User info retrieved successfully",
  "user": {
    "id": 1,
    "email": "user@example.com", 
    "name": "Test User",
    "role": "user"
  },
  "isAuthenticated": true
}
```

**Redux Usage:**
```javascript
// Khi app khởi động, verify token từ localStorage
const token = localStorage.getItem('accessToken')
if (token) {
  dispatch(verifyToken(token)) // Gọi API /auth/me
}
```

**Response (401) - Token invalid:**
```json
{
  "message": "Unauthorized access!",
  "error": "INVALID_TOKEN"
}
```

---

## 🛡️ **2. PROTECTED ROUTE APIs**

### **GET /profile**
**Mục đích**: Protected route cho user profile

**Request:**
```json
GET http://localhost:3000/profile
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

**Response (200):**
```json
{
  "message": "Profile retrieved successfully",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "Test User", 
    "role": "user",
    "profile": {
      "avatar": "https://ui-avatars.com/api/?name=Test%20User&background=0D8ABC&color=fff",
      "joinDate": "2024-01-15",
      "lastLogin": "2025-10-17T10:30:00.000Z",
      "preferences": {
        "theme": "light",
        "language": "vi",
        "notifications": true
      },
      "stats": {
        "loginCount": 45,
        "activeDays": 120
      }
    }
  }
}
```

---

### **GET /profile/dashboard**
**Mục đích**: Dashboard data cho protected route

**Request:**
```json
GET http://localhost:3000/profile/dashboard
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

**Response (200):**
```json
{
  "message": "Dashboard data retrieved successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "Test User",
      "role": "user"
    },
    "recentActivity": [
      {
        "id": 1,
        "action": "Profile Updated",
        "timestamp": "2025-10-17T08:30:00.000Z",
        "description": "Updated profile preferences"
      }
    ],
    "notifications": [
      {
        "id": 1,
        "type": "info",
        "title": "Welcome to Activity 6!",
        "message": "Redux và Protected Routes đã được cài đặt thành công.",
        "timestamp": "2025-10-17T10:30:00.000Z",
        "read": false
      }
    ],
    "stats": {
      "totalLogins": 75,
      "activeDays": 20,
      "profileViews": 150,
      "lastActivity": "2025-10-17T10:30:00.000Z"
    }
  }
}
```

---

### **GET /admin** 
**Mục đích**: Admin-only protected route

**Request:**
```json
GET http://localhost:3000/admin
Authorization: Bearer ADMIN_TOKEN
```

**Response (200) - Admin access:**
```json
{
  "message": "Admin dashboard access granted",
  "data": {
    "adminInfo": "Only admins can see this",
    "systemStats": { ... }
  }
}
```

**Response (403) - Non-admin:**
```json
{
  "message": "Cần quyền admin, nhưng bạn chỉ có quyền user!",
  "error": "INSUFFICIENT_PERMISSIONS"
}
```

---

## 🧪 **3. TEST DATA & SCENARIOS**

### **Test Users có sẵn:**
```javascript
// User thường
{
  "email": "user@example.com",
  "password": "123456",
  "role": "user"
}

// Admin user  
{
  "email": "admin@example.com",
  "password": "123456", 
  "role": "admin"
}

// Test user cho Activity 6
{
  "email": "redux@example.com",
  "password": "redux123",
  "role": "user"
}
```

### **Frontend Testing Scenarios:**

**Scenario 1: Login Flow**
1. User login → Lưu token vào Redux store + localStorage
2. Redirect tới protected route (/profile)
3. Verify có thể access profile data

**Scenario 2: Token Verification**
1. Refresh page → Redux store bị clear
2. Check localStorage có token → Gọi /auth/me
3. Restore user state vào Redux

**Scenario 3: Protected Routes**
1. Chưa login → Truy cập /profile → Redirect về /login
2. Đã login → Truy cập /profile → Hiển thị data
3. User role → Truy cập /admin → 403 Forbidden

**Scenario 4: Logout**
1. Clear Redux store
2. Clear localStorage  
3. Redirect về login page

---

## 📸 **4. SCREENSHOTS CẦN CHỤP (SV1)**

### **📸 Ảnh 1: API /auth/me Success**
- URL: GET /auth/me
- Headers: Authorization Bearer token
- Response: 200 OK với user info
- Mục đích: Verify token validation hoạt động

### **📸 Ảnh 2: Protected Route /profile Success**  
- URL: GET /profile
- Headers: Authorization Bearer token
- Response: 200 OK với profile data
- Mục đích: Protected route cho authenticated user

### **📸 Ảnh 3: Protected Route /profile Unauthorized**
- URL: GET /profile  
- Headers: Không có Authorization hoặc token invalid
- Response: 401 Unauthorized
- Mục đích: Protected route chặn unauthenticated access

### **📸 Ảnh 4: Admin Route Access Control**
- URL: GET /admin
- Headers: Authorization với user token (không phải admin)
- Response: 403 Forbidden
- Mục đích: Role-based access control

### **📸 Ảnh 5: Dashboard Data API**
- URL: GET /profile/dashboard
- Headers: Authorization Bearer token
- Response: 200 OK với dashboard data
- Mục đích: Rich data cho protected dashboard

### **📸 Ảnh 6: Token Refresh API** 
- URL: POST /auth/refresh
- Body: { "refreshToken": "..." }
- Response: 200 OK với new accessToken
- Mục đích: Token refresh cho persistent login

---

## 🚀 **5. HƯỚNG DẪN CHO SV2**

### **Redux Store Structure:**
```javascript
// store/authSlice.js
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    loading: false,
    error: null
  },
  reducers: {
    loginStart: (state) => { state.loading = true },
    loginSuccess: (state, action) => {
      state.user = action.payload.user
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
      state.isAuthenticated = true
      state.loading = false
    },
    loginFailure: (state, action) => {
      state.error = action.payload
      state.loading = false
    },
    logout: (state) => {
      state.user = null
      state.accessToken = null
      state.refreshToken = null
      state.isAuthenticated = false
    }
  }
})
```

### **Protected Route Component:**
```javascript
// components/ProtectedRoute.jsx
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useSelector(state => state.auth)
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }
  
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" />
  }
  
  return children
}
```

### **API Integration với Redux Thunk:**
```javascript
// store/authThunks.js
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }) => {
    const response = await api.post('/auth/login', { email, password })
    localStorage.setItem('accessToken', response.data.accessToken)
    return response.data
  }
)

export const verifyToken = createAsyncThunk(
  'auth/verify',
  async (token) => {
    api.defaults.headers.Authorization = `Bearer ${token}`
    const response = await api.get('/auth/me')
    return response.data
  }
)
```

---

## ✅ **6. TESTING CHECKLIST**

- [ ] Login API returns correct token format
- [ ] /auth/me validates token properly  
- [ ] Protected routes require authentication
- [ ] Admin routes enforce role restrictions
- [ ] Token refresh works correctly
- [ ] Logout clears all auth state
- [ ] Error handling for invalid tokens
- [ ] CORS headers allow frontend requests

**🎯 SV1 Mission: Đảm bảo tất cả APIs hoạt động ổn định cho SV2 có thể implement Redux frontend thành công!**