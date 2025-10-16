# Test Refresh Token APIs

## 1. Login để lấy tokens
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "123456"
}

### Expected Response:
```json
{
  "message": "Đăng nhập thành công!",
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

## 2. Kiểm tra debug tokens
GET http://localhost:3000/auth/debug/tokens

### Expected Response:
```json
{
  "message": "Debug: Refresh tokens info",
  "count": 1,
  "tokens": ["eyJ..."]
}
```

## 3. Sử dụng access token để truy cập protected route
GET http://localhost:3000/protected
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE

### Expected Response (if token valid):
```json
{
  "message": "Xin chào Test User, bạn đã truy cập thành công!"
}
```

### Expected Response (if token expired):
```json
{
  "message": "Access Token expired!",
  "error": "TOKEN_EXPIRED"
}
```

## 4. Refresh access token
POST http://localhost:3000/auth/refresh
Content-Type: application/json

{
  "refreshToken": "YOUR_REFRESH_TOKEN_HERE"
}

### Expected Response:
```json
{
  "message": "Token refreshed successfully!",
  "accessToken": "eyJ..."
}
```

## 5. Logout (revoke refresh token)
POST http://localhost:3000/auth/logout
Content-Type: application/json

{
  "refreshToken": "YOUR_REFRESH_TOKEN_HERE"
}

### Expected Response:
```json
{
  "message": "Đăng xuất thành công!"
}
```

## Test với cURL commands:

### 1. Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "123456"}'
```

### 2. Debug tokens
```bash
curl -X GET http://localhost:3000/auth/debug/tokens
```

### 3. Protected route (replace TOKEN with actual access token)
```bash
curl -X GET http://localhost:3000/protected \
  -H "Authorization: Bearer TOKEN"
```

### 4. Refresh token (replace REFRESH_TOKEN with actual refresh token)
```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "REFRESH_TOKEN"}'
```

### 5. Logout (replace REFRESH_TOKEN with actual refresh token)
```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "REFRESH_TOKEN"}'
```