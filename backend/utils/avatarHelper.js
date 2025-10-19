// Avatar Upload Helper - SV3
const cloudinary = require("../config/cloudinary");
const User = require("../models/User");

class AvatarUploadHelper {
  // Upload avatar với options tối ưu
  static async uploadAvatar(imageBuffer, userId, options = {}) {
    try {
      const defaultOptions = {
        folder: "group11_avatars",
        public_id: `avatar_${userId}_${Date.now()}`,
        transformation: [
          { width: 200, height: 200, crop: "fill", gravity: "face" },
          { quality: "auto", format: "webp" },
        ],
        resource_type: "image",
        overwrite: true,
        invalidate: true,
      };

      const uploadOptions = { ...defaultOptions, ...options };

      // Convert buffer to base64 if needed
      let imageData;
      if (Buffer.isBuffer(imageBuffer)) {
        imageData = `data:image/jpeg;base64,${imageBuffer.toString("base64")}`;
      } else {
        imageData = imageBuffer;
      }

      const result = await cloudinary.uploader.upload(imageData, uploadOptions);

      return {
        success: true,
        data: {
          public_id: result.public_id,
          url: result.secure_url,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
          created_at: result.created_at,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Upload multiple sizes cho avatar
  static async uploadAvatarMultipleSizes(imageBuffer, userId) {
    try {
      const sizes = [
        { name: "thumbnail", width: 50, height: 50 },
        { name: "small", width: 100, height: 100 },
        { name: "medium", width: 200, height: 200 },
        { name: "large", width: 400, height: 400 },
      ];

      const results = {};

      for (const size of sizes) {
        const options = {
          folder: `group11_avatars/${size.name}`,
          public_id: `avatar_${userId}_${size.name}_${Date.now()}`,
          transformation: [
            {
              width: size.width,
              height: size.height,
              crop: "fill",
              gravity: "face",
            },
            { quality: "auto", format: "webp" },
          ],
        };

        const uploadResult = await this.uploadAvatar(
          imageBuffer,
          userId,
          options
        );

        if (uploadResult.success) {
          results[size.name] = uploadResult.data;
        } else {
          throw new Error(
            `Failed to upload ${size.name}: ${uploadResult.error}`
          );
        }
      }

      return {
        success: true,
        data: results,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Cập nhật avatar trong User database
  static async updateUserAvatar(userId, avatarUrl, avatarData = {}) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return {
          success: false,
          error: "User not found",
        };
      }

      // Xóa avatar cũ từ Cloudinary nếu có
      if (user.avatar && user.avatar.includes("cloudinary.com")) {
        try {
          const oldPublicId = this.extractPublicIdFromUrl(user.avatar);
          if (oldPublicId) {
            await cloudinary.uploader.destroy(oldPublicId);
          }
        } catch (deleteError) {
          console.warn(
            "Warning: Could not delete old avatar:",
            deleteError.message
          );
        }
      }

      // Cập nhật avatar URL
      user.avatar = avatarUrl;

      // Thêm metadata nếu có
      if (avatarData.public_id) {
        user.avatarMetadata = {
          public_id: avatarData.public_id,
          format: avatarData.format,
          width: avatarData.width,
          height: avatarData.height,
          bytes: avatarData.bytes,
          uploaded_at: new Date(),
        };
      }

      await user.save();

      return {
        success: true,
        data: {
          user: user.getPublicInfo(),
          avatar: avatarUrl,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Extract public_id từ Cloudinary URL
  static extractPublicIdFromUrl(url) {
    try {
      const matches = url.match(/\/v\d+\/(.+)\.\w+$/);
      return matches ? matches[1] : null;
    } catch (error) {
      return null;
    }
  }

  // Xóa avatar từ Cloudinary
  static async deleteAvatar(publicId) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return {
        success: result.result === "ok",
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Lấy danh sách avatars của user
  static async getUserAvatars(userId) {
    try {
      const result = await cloudinary.search
        .expression(`folder:group11_avatars AND public_id:*${userId}*`)
        .sort_by([["created_at", "desc"]])
        .max_results(20)
        .execute();

      return {
        success: true,
        data: result.resources.map((resource) => ({
          public_id: resource.public_id,
          url: resource.secure_url,
          width: resource.width,
          height: resource.height,
          format: resource.format,
          bytes: resource.bytes,
          created_at: resource.created_at,
        })),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Generate transformation URL
  static generateTransformedUrl(publicId, transformations) {
    try {
      return cloudinary.url(publicId, {
        transformation: transformations,
        secure: true,
      });
    } catch (error) {
      return null;
    }
  }

  // Validate image file
  static validateImage(file) {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.mimetype)) {
      return {
        valid: false,
        error: "File type not allowed. Only JPEG, PNG, and WebP are supported.",
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: "File too large. Maximum size is 5MB.",
      };
    }

    return { valid: true };
  }

  // Tạo avatar preset transformations
  static getAvatarPresets() {
    return {
      thumbnail: [
        { width: 50, height: 50, crop: "fill", gravity: "face" },
        { quality: "auto", format: "webp" },
      ],
      small: [
        { width: 100, height: 100, crop: "fill", gravity: "face" },
        { quality: "auto", format: "webp" },
      ],
      medium: [
        { width: 200, height: 200, crop: "fill", gravity: "face" },
        { quality: "auto", format: "webp" },
      ],
      large: [
        { width: 400, height: 400, crop: "fill", gravity: "face" },
        { quality: "auto", format: "webp" },
      ],
      circle: [
        { width: 200, height: 200, crop: "fill", gravity: "face" },
        { radius: "max" },
        { quality: "auto", format: "webp" },
      ],
      enhanced: [
        { width: 200, height: 200, crop: "fill", gravity: "auto" },
        { effect: "auto_brightness" },
        { effect: "auto_contrast" },
        { quality: "auto", format: "webp" },
      ],
    };
  }
}

module.exports = AvatarUploadHelper;
