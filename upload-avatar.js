// Avatar Upload Logic for Group 11
// Không đụng gì tới giao diện và đăng nhập

const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const previewSection = document.getElementById('previewSection');
const previewImage = document.getElementById('previewImage');
const progressSection = document.getElementById('progressSection');
const progressBar = document.getElementById('progressBar');
const notification = document.getElementById('notification');
const currentAvatar = document.getElementById('currentAvatar');
const currentAvatarContainer = document.getElementById('currentAvatarContainer');
const userName = document.getElementById('userName');

// Load user info
const user = JSON.parse(localStorage.getItem('user') || '{}');
if (userName) userName.textContent = user.name || user.fullname || 'Người dùng';
if (currentAvatar && user.avatar) currentAvatar.src = user.avatar;

// Click avatar to upload
if (currentAvatarContainer) {
  currentAvatarContainer.onclick = () => fileInput.click();
}

// Upload zone click
if (uploadZone) {
  uploadZone.onclick = () => fileInput.click();
  uploadZone.ondragover = (e) => {
    e.preventDefault();
    uploadZone.classList.add('upload-zone-hover');
  };
  uploadZone.ondragleave = () => uploadZone.classList.remove('upload-zone-hover');
  uploadZone.ondrop = (e) => {
    e.preventDefault();
    uploadZone.classList.remove('upload-zone-hover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect({ target: { files: e.dataTransfer.files } });
    }
  };
}

// Handle file select
window.handleFileSelect = function(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    showNotification('❌ File không phải ảnh!', 'danger');
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    showNotification('❌ File quá lớn (max 5MB)', 'danger');
    return;
  }
  const reader = new FileReader();
  reader.onload = function(e) {
    previewImage.src = e.target.result;
    previewSection.style.display = 'block';
  };
  reader.readAsDataURL(file);
  previewSection.style.display = 'block';
  previewImage.file = file;
};

// Cancel upload
window.cancelUpload = function() {
  previewSection.style.display = 'none';
  previewImage.src = '';
  fileInput.value = '';
};

// Upload to Cloudinary
window.uploadToCloudinary = async function() {
  const file = previewImage.file;
  if (!file) return showNotification('❌ Chưa chọn file!', 'danger');
  progressSection.style.display = 'block';
  progressBar.style.width = '0%';
  notification.style.display = 'none';

  // Get token
  const token = localStorage.getItem('token');
  if (!token) return showNotification('❌ Bạn chưa đăng nhập!', 'danger');

  // Prepare form data
  const formData = new FormData();
  formData.append('avatar', file);

  try {
    const response = await fetch('http://localhost:5000/api/avatar/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    const data = await response.json();
    if (data.success && data.user && data.user.avatar) {
      showNotification('✅ Upload thành công!', 'success');
      currentAvatar.src = data.user.avatar;
      // Update user avatar in localStorage
      user.avatar = data.user.avatar;
      localStorage.setItem('user', JSON.stringify(user));
      previewSection.style.display = 'none';
      fileInput.value = '';
    } else {
      showNotification('❌ Upload thất bại: ' + (data.message || 'Lỗi không xác định'), 'danger');
    }
  } catch (err) {
    showNotification('❌ Lỗi kết nối server!', 'danger');
  } finally {
    progressSection.style.display = 'none';
    progressBar.style.width = '0%';
  }
};

// Notification
function showNotification(msg, type) {
  notification.textContent = msg;
  notification.className = 'alert alert-' + (type === 'success' ? 'success' : 'danger');
  notification.style.display = 'block';
  setTimeout(() => notification.style.display = 'none', 3000);
}

// Go back to dashboard
window.goBack = function() {
  window.location.href = 'dashboard-desktop.html';
};
