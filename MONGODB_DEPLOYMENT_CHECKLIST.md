# 🚀 DEPLOYMENT CHECKLIST - MongoDB Atlas

## ✅ Đã hoàn thành:

### 1. MongoDB Atlas Setup

- ✅ Cluster đã có: `cluster0.ve0bn28.mongodb.net`
- ✅ Database user: `anhbuinhatt_db_user`
- ✅ Connection string available

### 2. Connection Strings

#### Development:

```
MONGO_URI=mongodb+srv://anhbuinhatt_db_user:nhom11@cluster0.ve0bn28.mongodb.net/groupDB?retryWrites=true&w=majority&appName=Cluster0
```

#### Production:

```
MONGODB_URI=mongodb+srv://anhbuinhatt_db_user:nhom11@cluster0.ve0bn28.mongodb.net/groupDB_production?retryWrites=true&w=majority&appName=Cluster0
```

### 3. Environment Variables cho Deployment Platforms

#### 📦 Render.com Environment Variables:

```
MONGODB_URI=mongodb+srv://anhbuinhatt_db_user:nhom11@cluster0.ve0bn28.mongodb.net/groupDB_production?retryWrites=true&w=majority&appName=Cluster0
NODE_ENV=production
PORT=5000
JWT_SECRET=group11_super_secure_jwt_secret_2025
CLOUDINARY_CLOUD_NAME=dqrepahwc
CLOUDINARY_API_KEY=114119963135476
CLOUDINARY_API_SECRET=hyNVYLxRuPSci2Tv9l2DhQqNdgA
EMAIL_USER=group11.project2025@gmail.com
EMAIL_PASS=your_gmail_app_password_here
FRONTEND_URL=https://your-app.vercel.app
CORS_ORIGIN=https://your-app.vercel.app
```

#### 🚂 Railway.app Environment Variables:

```
MONGODB_URI=mongodb+srv://anhbuinhatt_db_user:nhom11@cluster0.ve0bn28.mongodb.net/groupDB_production?retryWrites=true&w=majority&appName=Cluster0
NODE_ENV=production
PORT=5000
JWT_SECRET=group11_super_secure_jwt_secret_2025
CLOUDINARY_CLOUD_NAME=dqrepahwc
CLOUDINARY_API_KEY=114119963135476
CLOUDINARY_API_SECRET=hyNVYLxRuPSci2Tv9l2DhQqNdgA
EMAIL_USER=group11.project2025@gmail.com
EMAIL_PASS=your_gmail_app_password_here
FRONTEND_URL=https://your-app.vercel.app
CORS_ORIGIN=https://your-app.vercel.app
```

## 🔧 Cần làm trong MongoDB Atlas Dashboard:

### 1. Network Access

1. Vào **Network Access** tab
2. Click **ADD IP ADDRESS**
3. Chọn **ALLOW ACCESS FROM ANYWHERE** (0.0.0.0/0)
4. Click **Confirm**

### 2. Database Access

1. Vào **Database Access** tab
2. Verify user `anhbuinhatt_db_user` có:
   - Password: `nhom11`
   - Database User Privileges: **Atlas admin**
   - Built-in Role: **Read and write to any database**

### 3. Database

1. Vào **Browse Collections**
2. Tạo database mới: `groupDB_production`
3. Collections sẽ được tự động tạo khi app chạy:
   - `users`
   - `refreshtokens`
   - `useractivitylogs`

## 📋 Deploy Steps:

### Render.com:

1. Connect GitHub repo
2. Choose **Web Service**
3. Build Command: `cd backend && npm install`
4. Start Command: `cd backend && npm start`
5. Add all environment variables above
6. Deploy

### Railway.app:

1. Connect GitHub repo
2. Select backend folder as root
3. Add all environment variables above
4. Deploy

## 🧪 Test Commands:

```bash
# Test current connection
npm run test:db

# Start production mode locally
npm run start:prod

# Fix test users
npm run fix:users
```

## 🔍 Troubleshooting:

### Connection Issues:

- Check IP whitelist in Atlas
- Verify user credentials
- Check connection string format

### Common Errors:

- **MongoNetworkError**: Add 0.0.0.0/0 to IP whitelist
- **Authentication failed**: Check username/password
- **ENOTFOUND**: DNS issue, check connection string

## 📊 Final Checklist:

- [ ] MongoDB Atlas cluster running
- [ ] IP whitelist configured (0.0.0.0/0)
- [ ] Database user has proper permissions
- [ ] Connection string tested
- [ ] Environment variables ready for deployment
- [ ] Server.js configured for production
- [ ] CORS properly configured

## 🎯 Ready for Deployment! 🚀
