# Test RBAC (Role-Based Access Control) - SV1

## 🎯 Mục tiêu Test
Chứng minh hệ thống phân quyền hoạt động đúng với 3 roles: **User**, **Moderator**, **Admin**

## 👥 Test Users

### 1. User (Quyền thấp nhất)
```json
{
  "email": "user@example.com",
  "password": "123456"
}
```

### 2. Moderator (Quyền trung bình)  
```json
{
  "email": "moderator@example.com",
  "password": "123456"
}
```

### 3. Admin (Quyền cao nhất)
```json
{
  "email": "admin@example.com", 
  "password": "123456"
}
```

## 🧪 Test Cases cho SV1

### Test 1: Login với các roles khác nhau

**Request:**
```
POST http://localhost:3000/auth/login
Content-Type: application/json

Body: (thử từng user ở trên)
```

**📸 Chụp ảnh:** Login thành công cho cả 3 roles (User, Moderator, Admin)

### Test 2: Test middleware checkRole - Admin Only APIs

#### 2.1 GET /admin/users (Chỉ Admin)

**Request:**
```
GET http://localhost:3000/admin/users
Authorization: Bearer <ADMIN_TOKEN>
```
**✅ Kết quả:** Thành công (200)
**📸 Chụp ảnh:** Admin truy cập thành công

**Request:**
```
GET http://localhost:3000/admin/users  
Authorization: Bearer <USER_TOKEN>
```
**❌ Kết quả:** Thất bại (403) - "Cần quyền admin, nhưng bạn chỉ có quyền user!"
**📸 Chụp ảnh:** User bị từ chối truy cập

#### 2.2 PUT /admin/users/:id/role (Thay đổi role)

**Request:**
```
PUT http://localhost:3000/admin/users/1/role
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "role": "moderator"
}
```
**✅ Kết quả:** Thành công (200)
**📸 Chụp ảnh:** Admin thay đổi role thành công

### Test 3: Test Routes theo Role

#### 3.1 User-only Route
```
GET http://localhost:3000/user-only
Authorization: Bearer <USER_TOKEN>
```
**✅ User:** Thành công (200)
**❌ Admin:** Thất bại (403)

#### 3.2 Admin-only Route  
```
GET http://localhost:3000/admin-only
Authorization: Bearer <ADMIN_TOKEN>
```
**✅ Admin:** Thành công (200)
**❌ User:** Thất bại (403)

#### 3.3 Moderator-Admin Route (Hierarchical)
```
GET http://localhost:3000/mod-admin
Authorization: Bearer <MODERATOR_TOKEN>
```
**✅ Moderator:** Thành công (200)
**✅ Admin:** Thành công (200)
**❌ User:** Thất bại (403)

**📸 Chụp ảnh:** Cả 3 test cases trên

### Test 4: API Quản lý Users (Admin)

#### 4.1 Lấy danh sách users
```
GET http://localhost:3000/admin/users?page=1&limit=5
Authorization: Bearer <ADMIN_TOKEN>
```

#### 4.2 Xem thông tin user cụ thể
```
GET http://localhost:3000/admin/users/1
Authorization: Bearer <ADMIN_TOKEN>
```

#### 4.3 Thay đổi trạng thái user
```
PUT http://localhost:3000/admin/users/4/status
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "isActive": true
}
```

#### 4.4 Xóa user
```
DELETE http://localhost:3000/admin/users/4
Authorization: Bearer <ADMIN_TOKEN>
```

**📸 Chụp ảnh:** Các API quản lý users thành công

### Test 5: Stats API (Moderator & Admin)

```
GET http://localhost:3000/admin/users/stats
Authorization: Bearer <MODERATOR_TOKEN>
```
**✅ Moderator:** Thành công
**✅ Admin:** Thành công  
**❌ User:** Thất bại

**📸 Chụp ảnh:** Moderator và Admin đều truy cập được stats

## 📋 Checklist Ảnh cần chụp cho SV1:

1. **✅ Login thành công** - cả 3 roles có token với role khác nhau
2. **✅ Admin truy cập /admin/users thành công** - status 200
3. **❌ User bị từ chối /admin/users** - status 403 với message rõ ràng
4. **✅ Admin thay đổi role user** - PUT /admin/users/:id/role thành công
5. **✅ Test routes theo role** - user-only, admin-only, mod-admin
6. **✅ API quản lý users** - CRUD operations thành công
7. **✅ Stats API** - Moderator và Admin truy cập được, User không được

## 🔍 Điều cần chú ý:

1. **Token phải chứa role** - check trong payload JWT
2. **Message lỗi rõ ràng** - cho biết role hiện tại và role cần thiết
3. **Hierarchical permissions** - Admin > Moderator > User
4. **Security rules** - không thể sửa/xóa chính mình

## 🚀 Cách chạy test:

1. Start server: `cd backend && node server.js`
2. Mở Postman
3. Test theo thứ tự ở trên
4. Chụp ảnh từng test case
5. Tạo collection Postman để export (bonus)