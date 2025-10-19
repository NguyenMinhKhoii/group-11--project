const fs = require('fs');
const path = require('path');

const USERS_FILE = path.join(__dirname, '../data/users.json');

// Đọc users từ file
function readUsers() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('❌ Error reading users file:', error);
    return [];
  }
}

// Ghi users vào file
function writeUsers(users) {
  try {
    // Tạo thư mục data nếu chưa tồn tại
    const dataDir = path.dirname(USERS_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
    console.log('✅ Users data saved successfully');
    return true;
  } catch (error) {
    console.error('❌ Error writing users file:', error);
    return false;
  }
}

// Thêm user mới
function addUser(user) {
  const users = readUsers();
  const newUser = {
    id: (Math.max(...users.map(u => parseInt(u.id)), 0) + 1).toString(),
    ...user,
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  writeUsers(users);
  return newUser;
}

// Tìm user theo email
function findUserByEmail(email) {
  const users = readUsers();
  return users.find(u => u.email === email);
}

// Tìm user theo ID
function findUserById(id) {
  const users = readUsers();
  return users.find(u => u.id === id);
}

// Cập nhật user
function updateUser(id, updateData) {
  const users = readUsers();
  const userIndex = users.findIndex(u => u.id === id);
  
  if (userIndex === -1) {
    return null;
  }
  
  users[userIndex] = { ...users[userIndex], ...updateData };
  writeUsers(users);
  return users[userIndex];
}

// Xóa user
function deleteUser(id) {
  const users = readUsers();
  const userIndex = users.findIndex(u => u.id === id);
  
  if (userIndex === -1) {
    return null;
  }
  
  const deletedUser = users.splice(userIndex, 1)[0];
  writeUsers(users);
  return deletedUser;
}

// Lấy tất cả users
function getAllUsers() {
  return readUsers();
}

module.exports = {
  readUsers,
  writeUsers,
  addUser,
  findUserByEmail,
  findUserById,
  updateUser,
  deleteUser,
  getAllUsers
};