console.log("✅ File userController.js đã được load!");

// Mảng tạm lưu user
let users = [
  { id: 1, name: "Khôi", email: "khôi@gmail.com" },
  { id: 2, name: "Khởi", email: "khởi@gmail.com" },
  { id: 3, name: "Anh", email: "Anh@gmail.com" },
];
exports.getUsers = (req, res) => {
  console.log("📡 GET /users được gọi");
  res.json(users);
};

// Lấy danh sách user
exports.getUsers = (req, res) => {
  res.status(200).json(users);
};

// Thêm user mới
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
