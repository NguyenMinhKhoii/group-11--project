console.log("✅ File userController.js đã được load!");

// Mảng tạm lưu user
let users = [
  { id: 1, name: "Khôi", email: "khoi@gmail.com" },
  { id: 2, name: "Khởi", email: "khoi2@gmail.com" },
  { id: 3, name: "Anh", email: "anh@gmail.com" },
];

// GET: lấy danh sách user
exports.getUsers = (req, res) => {
  res.status(200).json(users);
};

// POST: thêm user mới
exports.createUser = (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ message: "Thiếu name hoặc email!" });
  }

  const newUser = {
    id: users.length + 1,
    name,
    email,
  };

  users.push(newUser);
  res.status(201).json(newUser);
};

// PUT: cập nhật user theo id
exports.updateUser = (req, res) => {
  const { id } = req.params;
  const index = users.findIndex((u) => u.id == id);

  if (index !== -1) {
    users[index] = { ...users[index], ...req.body };
    res.json(users[index]);
  } else {
    res.status(404).json({ message: "User not found" });
  }
};

// DELETE: xóa user theo id
exports.deleteUser = (req, res) => {
  const { id } = req.params;
  users = users.filter((u) => u.id != id);
  res.json({ message: "User deleted" });
};
