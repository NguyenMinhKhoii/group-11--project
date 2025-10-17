const express = require("express");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");
const User = require("../models/User");
const verifyToken = require("../middlewares/verifyToken");
console.log("🚀 uploadRoutes loaded!");

const router = express.Router();

// ⚙️ Cấu hình lưu trữ trên Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "avatars",
    allowed_formats: ["jpg", "png", "jpeg"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});

const upload = multer({ storage });

// ✅ API upload avatar
router.post(
  "/avatar",
  verifyToken,
  upload.single("avatar"),
  async (req, res) => {
    try {
      console.log("📸 File nhận được từ Multer:", req.file);

      if (!req.file) {
        return res
          .status(400)
          .json({ message: "Không nhận được file nào từ client!" });
      }

      const user = await User.findById(req.user.id);
      if (!user)
        return res.status(404).json({ message: "Không tìm thấy user!" });

      user.avatar = req.file.path || req.file.url;
      await user.save();

      res.json({
        message: "✅ Upload avatar thành công!",
        avatarUrl: user.avatar,
      });
    } catch (error) {
      console.error("❌ Lỗi upload:", error);
      res.status(500).json({
        message: "Lỗi upload avatar!",
        error: error.message,
      });
    }
  }
);
module.exports = router;
