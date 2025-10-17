// [GET] /profile - Xem thông tin cá nhân
exports.getProfile = (req, res) => {
  const user = global.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng!" });

  const { password, ...profile } = user;
  res.json(profile);
};

// [PUT] /profile - Cập nhật thông tin cá nhân
exports.updateProfile = (req, res) => {
  const user = global.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng!" });

  const { name, email, password } = req.body;

  if (name) user.name = name;
  if (email) user.email = email;
  if (password) user.password = password; // chỉ nên đổi khi xác nhận cũ, demo nên giữ vậy

  const { password: _, ...updatedProfile } = user;
  res.json({ message: "Cập nhật thành công!", user: updatedProfile });
};
