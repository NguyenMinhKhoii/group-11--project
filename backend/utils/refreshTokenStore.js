// Quản lý refresh tokens trong memory (trong thực tế sẽ lưu trong database)
class RefreshTokenStore {
  constructor() {
    this.tokens = new Set();
  }

  // Thêm refresh token
  add(token) {
    this.tokens.add(token);
  }

  // Kiểm tra refresh token có tồn tại không
  has(token) {
    return this.tokens.has(token);
  }

  // Xóa refresh token
  remove(token) {
    return this.tokens.delete(token);
  }

  // Xóa tất cả token của user (logout all devices)
  removeAllByUser(userId) {
    // Trong thực tế sẽ query database để xóa theo userId
    // Hiện tại chưa implement vì chưa có userId trong token store
  }

  // Lấy tất cả tokens (for debugging)
  getAll() {
    return Array.from(this.tokens);
  }

  // Đếm số lượng tokens
  count() {
    return this.tokens.size;
  }
}

// Singleton instance
const refreshTokenStore = new RefreshTokenStore();

module.exports = refreshTokenStore;