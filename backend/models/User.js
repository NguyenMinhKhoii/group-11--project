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
      default: true
    },
    bio: {
      type: String,
      maxlength: [500, "Giới thiệu không được quá 500 ký tự"],
      default: ""
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
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ lastLogin: -1 });

// Tự động hash password khi tạo/sửa
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Tự động set permissions theo role
userSchema.pre("save", function (next) {
  if (this.isModified("role")) {
    this.permissions = ROLE_PERMISSIONS[this.role] || [];
  }
  next();
});

// Phương thức để loại bỏ dữ liệu nhạy cảm
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

// So sánh mật khẩu khi đăng nhập
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


// ... (các userSchema.methods và userSchema.statics khác)

// Export constants để sử dụng ở các file khác
userSchema.statics.ROLES = ROLES;
userSchema.statics.PERMISSIONS = PERMISSIONS;
userSchema.statics.ROLE_PERMISSIONS = ROLE_PERMISSIONS;

module.exports = mongoose.model("User", userSchema);