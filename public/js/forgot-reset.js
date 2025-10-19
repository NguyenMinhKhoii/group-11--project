// Handle forgot password and reset password forms
(function (){
  const apiBase = '/api/auth'; // authRoutes exposes /forgot-password and /reset-password/:token

  function showAlert(el, msg, isError){
    // Clear previous content
    el.innerHTML = '';
    
    // Create Bootstrap alert
    const alertDiv = document.createElement('div');
    alertDiv.className = isError ? 'alert alert-danger' : 'alert alert-success';
    alertDiv.innerHTML = `
      <i class="fas ${isError ? 'fa-exclamation-triangle' : 'fa-check-circle'}"></i>
      ${msg}
    `;
    el.appendChild(alertDiv);
  }

  // Forgot form
  const forgotForm = document.getElementById('forgotForm');
  if (forgotForm) {
    forgotForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const resultEl = document.getElementById('result');
      const debugEl = document.getElementById('debug');
      const submitButton = forgotForm.querySelector('button[type="submit"]');
      
      // Disable button and show loading
      submitButton.disabled = true;
      submitButton.innerHTML = '⏳ Đang gửi...';
      showAlert(resultEl, '📤 Đang gửi email reset password...', false);
      
      try {
        const resp = await fetch(apiBase + '/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type':'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await resp.json();
        
        if (resp.ok) {
          showAlert(resultEl, '✅ Đã gửi email reset password! Vui lòng kiểm tra hộp thư của bạn.', false);
          debugEl.textContent = data.resetToken ? ('Debug token: ' + data.resetToken) : (data.resetUrl || '');
          // Reset form
          forgotForm.reset();
        } else {
          showAlert(resultEl, `❌ ${data.message || 'Lỗi khi gửi email'}`, true);
        }
      } catch (err) {
        showAlert(resultEl, '❌ Lỗi kết nối. Vui lòng thử lại sau.', true);
      } finally {
        // Re-enable button
        submitButton.disabled = false;
        submitButton.innerHTML = '📤 Gửi link đặt lại';
      }
    });
  }

  // Reset form
  const resetForm = document.getElementById('resetForm');
  if (resetForm) {
    // Token may be passed in URL as /reset-password.html?token=xxx or path /reset-password/:token
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromQuery = urlParams.get('token');

    // Add password confirmation validation
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    function validatePasswordMatch() {
      if (confirmPasswordInput.value && newPasswordInput.value !== confirmPasswordInput.value) {
        confirmPasswordInput.setCustomValidity('Mật khẩu xác nhận không khớp');
      } else {
        confirmPasswordInput.setCustomValidity('');
      }
    }
    
    newPasswordInput.addEventListener('input', validatePasswordMatch);
    confirmPasswordInput.addEventListener('input', validatePasswordMatch);

    resetForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newPassword = document.getElementById('newPassword').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      const resultEl = document.getElementById('result');
      const submitButton = resetForm.querySelector('button[type="submit"]');
      
      // Validate password match
      if (newPassword !== confirmPassword) {
        showAlert(resultEl, '❌ Mật khẩu xác nhận không khớp!', true);
        return;
      }
      
      // Disable button and show loading
      submitButton.disabled = true;
      submitButton.innerHTML = '⏳ Đang xử lý...';
      showAlert(resultEl, '🔄 Đang đặt lại mật khẩu...', false);

      // Determine token: try query param first, otherwise extract from path
      let token = tokenFromQuery;
      console.log('🔍 Debug token from query:', tokenFromQuery);
      console.log('🔍 Debug full URL:', window.location.href);
      
      if (!token) {
        // If URL is /reset-password/<token> or /reset-password.html/<token>
        const pathParts = window.location.pathname.split('/').filter(Boolean);
        if (pathParts.length >= 2 && pathParts[pathParts.length-2].startsWith('reset-password')) {
          token = pathParts[pathParts.length-1];
        }
      }

      console.log('🔍 Final token to use:', token);

      if (!token) {
        showAlert(resultEl, '❌ Không tìm thấy token trong URL. Vui lòng sử dụng link từ email.', true);
        submitButton.disabled = false;
        submitButton.innerHTML = '✅ Đặt lại mật khẩu';
        return;
      }

      try {
        const resp = await fetch(apiBase + '/reset-password/' + token, {
          method: 'POST',
          headers: { 'Content-Type':'application/json' },
          body: JSON.stringify({ newPassword, confirmPassword })
        });
        const data = await resp.json();
        
        if (resp.ok) {
          showAlert(resultEl, '✅ Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.', false);
          // Clear form
          resetForm.reset();
          // Redirect to login after 3 seconds
          setTimeout(() => {
            window.location.href = '/login.html';
          }, 3000);
        } else {
          showAlert(resultEl, `❌ ${data.message || 'Lỗi khi đặt lại mật khẩu'}`, true);
        }
      } catch (err) {
        showAlert(resultEl, '❌ Lỗi kết nối. Vui lòng thử lại sau.', true);
      } finally {
        // Re-enable button
        submitButton.disabled = false;
        submitButton.innerHTML = '✅ Đặt lại mật khẩu';
      }
    });
  }

})();
