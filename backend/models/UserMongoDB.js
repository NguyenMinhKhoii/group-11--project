const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      message: 'Email không hợp lệ'
    }
  },
  
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  
  fullname: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  
  role: {
    type: String,
    enum: ['user', 'moderator', 'admin'],
    default: 'user'
  },
  
  avatar: {
    type: String,
    default: null
  },
  
  cloudinaryPublicId: {
    type: String,
    default: null
  },
  
  phone: {
    type: String,
    default: null,
    validate: {
      validator: function(phone) {
        return !phone || /^[0-9+\-\s()]+$/.test(phone);
      },
      message: 'Số điện thoại không hợp lệ'
    }
  },
  
  address: {
    type: String,
    maxlength: 200,
    default: null
  },
  
  bio: {
    type: String,
    maxlength: 500,
    default: null
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  lastLogin: {
    type: Date,
    default: null
  },
  
  loginAttempts: {
    type: Number,
    default: 0
  },
  
  lockUntil: {
    type: Date,
    default: null
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash password if it's new or modified
  if (!this.isModified('password')) return next();
  
  try {
    const saltRounds = 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Instance method to increment login attempts
userSchema.methods.incLoginAttempts = async function() {
  const maxAttempts = 5;
  const lockTime = 30 * 60 * 1000; // 30 minutes
  
  // Reset attempts if lock expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after max attempts
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + lockTime };
  }
  
  return this.updateOne(updates);
};

// Instance method to reset login attempts
userSchema.methods.resetLoginAttempts = async function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
    $set: { lastLogin: new Date() }
  });
};

// Static method to find user by email with error handling
userSchema.statics.findByEmail = async function(email) {
  try {
    return await this.findOne({ email: email.toLowerCase() });
  } catch (error) {
    throw new Error('Database query failed');
  }
};

// Static method for user creation with validation
userSchema.statics.createUser = async function(userData) {
  try {
    const user = new this(userData);
    return await user.save();
  } catch (error) {
    if (error.code === 11000) {
      throw new Error('Email đã tồn tại');
    }
    throw error;
  }
};

// Transform output to remove sensitive data
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.loginAttempts;
  delete user.lockUntil;
  delete user.__v;
  return user;
};

// Export model
module.exports = mongoose.model('User', userSchema);