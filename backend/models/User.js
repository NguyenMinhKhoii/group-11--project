const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Định nghĩa các role và permissions
const ROLES = {
  USER: "user",
  MODERATOR: "moderator",
  ADMIN: "admin",
};

const PERMISSIONS = {
  READ_USERS: "read_users",
  CREATE_USERS: "create_users",
  UPDATE_USERS: "update_users",
  DELETE_USERS: "delete_users",
  MANAGE_ROLES: "manage_roles",
  VIEW_REPORTS: "view_reports",
  MODERATE_CONTENT: "moderate_content",
  SYSTEM_CONFIG: "system_config",
};

// Role permissions mapping
const ROLE_PERMISSIONS = {
  [ROLES.USER]: [PERMISSIONS.READ_USERS],
  [ROLES.MODERATOR]: [
    PERMISSIONS.READ_USERS,
    PERMISSIONS.UPDATE_USERS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.MODERATE_CONTENT,
  ],
  [ROLES.ADMIN]: [
    PERMISSIONS.READ_USERS,
    PERMISSIONS.CREATE_USERS,
    PERMISSIONS.UPDATE_USERS,
    PERMISSIONS.DELETE_USERS,
    PERMISSIONS.MANAGE_ROLES,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.MODERATE_CONTENT,
    PERMISSIONS.SYSTEM_CONFIG,
  ],
};

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tên là bắt buộc"],
      trim: true,
      minlength: [2, "Tên phải có ít nhất 2 ký tự"],
      maxlength: [50, "Tên không được quá 50 ký tự"],
    },
    email: {
      type: String,
      required: [true, "Email là bắt buộc"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Email không hợp lệ",
      ],
    },
    password: {
      type: String,
      required: [true, "Mật khẩu là bắt buộc"],
      minlength: [6, "Mật khẩu phải có ít nhất 6 ký tự"],
    },
    avatar: {
      type: String,
      default: "",
    },
    avatarMetadata: {
      public_id: { type: String, default: "" },
      format: { type: String, default: "" },
      width: { type: Number, default: 0 },
      height: { type: Number, default: 0 },
      bytes: { type: Number, default: 0 },
      uploaded_at: { type: Date, default: null },
    },
    role: {
      type: String,
      enum: {
        values: Object.values(ROLES),
        message: "Role phải là: user, moderator, hoặc admin",
      },
      default: ROLES.USER,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
    permissions: [
      {
        type: String,
        enum: Object.values(PERMISSIONS),
      },
    ],
    resetToken: String,
    resetTokenExpiry: Date,
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    phoneNumber: {
      type: String,
      default: "",
      validate: {
        validator: function (v) {
          return !v || /^[0-9]{10,11}$/.test(v);
        },
        message: "Số điện thoại không hợp lệ",
      },
    },
    address: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      country: { type: String, default: "Vietnam" },
    },
    preferences: {
      language: { type: String, default: "vi" },
      theme: { type: String, enum: ["light", "dark"], default: "light" },
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes để tối ưu hóa query
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ lastLogin: -1 });

// ✅ Tự động hash password khi tạo/sửa
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ✅ Tự động set permissions theo role
userSchema.pre("save", function (next) {
  if (this.isModified("role")) {
    this.permissions = ROLE_PERMISSIONS[this.role] || [];
  }
  next();
});

// ✅ So sánh mật khẩu khi đăng nhập
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ✅ Kiểm tra permission
userSchema.methods.hasPermission = function (permission) {
  return this.permissions.includes(permission);
};

// ✅ Kiểm tra role
userSchema.methods.hasRole = function (role) {
  return this.role === role;
};

// ✅ Kiểm tra có phải admin không
userSchema.methods.isAdmin = function () {
  return this.role === ROLES.ADMIN;
};

// ✅ Kiểm tra có phải moderator hoặc admin không
userSchema.methods.isModerator = function () {
  return this.role === ROLES.MODERATOR || this.role === ROLES.ADMIN;
};

// ✅ Kiểm tra account có bị lock không
userSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// ✅ Tăng số lần đăng nhập thất bại
userSchema.methods.incLoginAttempts = function () {
  // Nếu có lockUntil và đã hết hạn lock thì reset
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  // Nếu đăng nhập thất bại >= 5 lần thì lock account 2 tiếng
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }

  return this.updateOne(updates);
};

// ✅ Reset login attempts khi đăng nhập thành công
userSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
    $set: { lastLogin: new Date() },
  });
};

// ✅ Cập nhật role và permissions
userSchema.methods.updateRole = function (newRole) {
  this.role = newRole;
  this.permissions = ROLE_PERMISSIONS[newRole] || [];
  return this.save();
};

// ✅ Get user public info (loại bỏ sensitive data)
userSchema.methods.getPublicInfo = function () {
  const user = this.toObject();
  delete user.password;
  delete user.resetToken;
  delete user.resetTokenExpiry;
  delete user.emailVerificationToken;
  delete user.loginAttempts;
  delete user.lockUntil;
  return user;
};

// ✅ Static method - Tìm users theo role
userSchema.statics.findByRole = function (role) {
  return this.find({ role, isActive: true });
};

// ✅ Static method - Tìm admins
userSchema.statics.findAdmins = function () {
  return this.find({ role: ROLES.ADMIN, isActive: true });
};

// ✅ Static method - Tìm moderators
userSchema.statics.findModerators = function () {
  return this.find({ role: ROLES.MODERATOR, isActive: true });
};

// ✅ Static method - Thống kê users theo role
userSchema.statics.getUserStats = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: "$role",
        count: { $sum: 1 },
        active: { $sum: { $cond: ["$isActive", 1, 0] } },
        inactive: { $sum: { $cond: ["$isActive", 0, 1] } },
      },
    },
  ]);

  return stats;
};

// ✅ Static method - Tạo admin user
userSchema.statics.createAdmin = async function (userData) {
  const adminData = {
    ...userData,
    role: ROLES.ADMIN,
    permissions: ROLE_PERMISSIONS[ROLES.ADMIN],
    emailVerified: true,
  };

  const admin = new this(adminData);
  return await admin.save();
};

// Export constants để sử dụng ở các file khác
userSchema.statics.ROLES = ROLES;
userSchema.statics.PERMISSIONS = PERMISSIONS;
userSchema.statics.ROLE_PERMISSIONS = ROLE_PERMISSIONS;

module.exports = mongoose.model("User", userSchema);
