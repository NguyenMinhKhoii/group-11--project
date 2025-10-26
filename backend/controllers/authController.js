const jwt = require("jsonwebtoken");
const fs = require("fs");
const bcrypt = require("bcrypt");
const User = require("../models/User");

// Đăng ký
exports.signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body; // ✅ Đã thêm role

    // Kiểm tra email trùng
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email đã tồn tại!" });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user mới
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role, // ✅ Đã thêm role vào object
    });

    await newUser.save();
    // Vấn đề phụ: newUser có chứa password đã hash, nên dùng getPublicInfo
    res.status(201).json({ message: "Đăng ký thành công!", user: newUser.getPublicInfo() });
  } catch (err) {
    // ... (Không thay đổi)
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  // Logic này đã đúng, vì nó sử dụng user.role từ DB:
  // const token = jwt.sign({ id: user._id, role: user.role }, "SECRET_KEY", { expiresIn: "1h" });
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Email không tồn tại!" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Sai mật khẩu!" });
    
    // Tận dụng phương thức getPublicInfo() để loại bỏ thông tin nhạy cảm
    const publicInfo = user.getPublicInfo();

    // Tạo JWT token
    // Phần này đã đúng vì bạn lấy role từ đối tượng user (đã được lưu đúng role trong DB sau khi sửa signup)
    const token = jwt.sign({ id: user._id, role: user.role }, "SECRET_KEY", {
      expiresIn: "1h",
    });

    res.json({ message: "Đăng nhập thành công!", token, user: publicInfo }); // ✅ Trả về user public info
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Đăng xuất (Không thay đổi)
exports.logout = (req, res) => {
  res.status(200).json({ success: true, message: "Đăng xuất thành công!" });
};