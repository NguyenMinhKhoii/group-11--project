const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    const email = "admin@example.com";
    const newPassword = "123456"; // mk mới bạn muốn đặt
    const hashed = await bcrypt.hash(newPassword, 10);

    const updated = await User.findOneAndUpdate(
      { email },
      { password: hashed },
      { new: true }
    );

    if (updated) {
      console.log("✅ Đã cập nhật lại mật khẩu cho admin@example.com");
    } else {
      console.log("⚠️ Không tìm thấy tài khoản admin@example.com");
    }

    mongoose.connection.close();
  })
  .catch((err) => console.error(err));
