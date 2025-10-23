# 🗄️ MongoDB Atlas Setup Guide cho Deployment

## 📋 Bước 1: Truy cập MongoDB Atlas

1. Mở browser và vào: https://cloud.mongodb.com
2. Đăng nhập với tài khoản hiện có hoặc tạo mới

## ⚙️ Bước 2: Kiểm tra Cluster hiện tại

Cluster hiện tại: `cluster0.ve0bn28.mongodb.net`

- Database: `groupDB`
- User: `anhbuinhatt_db_user`

## 🔧 Bước 3: Cấu hình cho Production

### 3.1 Tạo Database mới cho Production

```
Database Name: groupDB_production
Collections:
- users
- refreshtokens
- useractivitylogs
```

### 3.2 Network Access (Quan trọng!)

1. Vào **Network Access** > **IP Access List**
2. Thêm IP addresses cho deployment platforms:

**Render.com IPs:**

```
0.0.0.0/0 (Allow access from anywhere - cho đơn giản)
```

**Railway.app IPs:**

```
0.0.0.0/0 (Allow access from anywhere)
```

⚠️ **Lưu ý**: Trong production thực tế, nên restrict IP cụ thể

### 3.3 Database Users

Kiểm tra user hiện tại có quyền:

- Read and write to any database
- Username: `anhbuinhatt_db_user`
- Password: `nhom11`

## 📝 Bước 4: Connection Strings

### Development:

```
mongodb+srv://anhbuinhatt_db_user:nhom11@cluster0.ve0bn28.mongodb.net/groupDB?retryWrites=true&w=majority&appName=Cluster0
```

### Production:

```
mongodb+srv://anhbuinhatt_db_user:nhom11@cluster0.ve0bn28.mongodb.net/groupDB_production?retryWrites=true&w=majority&appName=Cluster0
```

## 🚀 Bước 5: Environment Variables cho Deployment

### Render.com:

```
MONGODB_URI=mongodb+srv://anhbuinhatt_db_user:nhom11@cluster0.ve0bn28.mongodb.net/groupDB_production?retryWrites=true&w=majority&appName=Cluster0
NODE_ENV=production
PORT=5000
JWT_SECRET=your_super_secure_jwt_secret_for_production
CLOUDINARY_CLOUD_NAME=dqrepahwc
CLOUDINARY_API_KEY=114119963135476
CLOUDINARY_API_SECRET=hyNVYLxRuPSci2Tv9l2DhQqNdgA
EMAIL_USER=group11.project2025@gmail.com
EMAIL_PASS=your_gmail_app_password
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

### Railway.app:

```
MONGODB_URI=mongodb+srv://anhbuinhatt_db_user:nhom11@cluster0.ve0bn28.mongodb.net/groupDB_production?retryWrites=true&w=majority&appName=Cluster0
NODE_ENV=production
PORT=5000
JWT_SECRET=your_super_secure_jwt_secret_for_production
CLOUDINARY_CLOUD_NAME=dqrepahwc
CLOUDINARY_API_KEY=114119963135476
CLOUDINARY_API_SECRET=hyNVYLxRuPSci2Tv9l2DhQqNdgA
EMAIL_USER=group11.project2025@gmail.com
EMAIL_PASS=your_gmail_app_password
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

## ✅ Bước 6: Test Connection

Test local với production database:

```bash
cd backend
NODE_ENV=production node server.js
```

## 🔍 Bước 7: Monitoring

Trong MongoDB Atlas Dashboard:

1. **Metrics** - Monitor performance
2. **Real Time** - View live connections
3. **Profiler** - Query performance
4. **Alerts** - Set up notifications

## 🛡️ Security Best Practices

1. **Strong Password**: Đã có password mạnh
2. **IP Whitelist**: Cấu hình đúng IPs
3. **Database User Roles**: Chỉ cấp quyền cần thiết
4. **Connection String Security**: Không commit vào git
5. **SSL/TLS**: Luôn enabled (mặc định)

## 📊 Performance Tips

1. **Indexes**: Đã có indexes trên email, isActive
2. **Connection Pooling**: Mongoose tự động handle
3. **Query Optimization**: Sử dụng lean(), select()
4. **Aggregation**: Cho reports và analytics

## 🚨 Troubleshooting

### Connection Issues:

- Kiểm tra IP whitelist
- Verify user credentials
- Check network connectivity

### Performance Issues:

- Monitor Atlas metrics
- Check query performance
- Review indexes

### Common Errors:

- `MongoNetworkError`: IP không được phép
- `Authentication failed`: Sai user/password
- `Connection timeout`: Network issues
