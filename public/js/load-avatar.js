// load-avatar.js (browser-friendly)
// Fetch the current user's avatar (from /api/avatar) and inject into a container element.
// Usage: include this script on a page and call `loadAvatarInto('#avatarContainer')`.

async function fetchCurrentAvatar(token) {
  if (!token) return null;
  try {
    const res = await fetch('/api/avatar', {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (!res.ok) return null;
    const data = await res.json();
    // Normalize common shapes:
    // - { success, data: { avatar: '/public/..' } }
    // - { success, data: { avatar: { url: 'https://...' }, user } }
    // - { avatar: '/public/..' }
    if (data && data.success && data.data) return data.data;
    if (data && data.avatar) return { avatar: data.avatar };
    return null;
  } catch (err) {
    console.error('fetchCurrentAvatar error:', err);
    return null;
  }
}

async function loadAvatarInto(selector) {
  try {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    const el = document.querySelector(selector);
    if (!el) return false;

    // Try to fetch from API if token is available
    let payload = null;
    if (token) {
      payload = await fetchCurrentAvatar(token).catch(() => null);
    }

    // Determine avatar URL from payload or localStorage
    let avatarUrl = null;
    let altText = 'Avatar';

    if (payload) {
      // payload.avatar might be a string or an object { url }
      if (typeof payload.avatar === 'string') avatarUrl = payload.avatar;
      else if (payload.avatar && typeof payload.avatar.url === 'string') avatarUrl = payload.avatar.url;
      if (payload.user) altText = payload.user.name || payload.user.email || altText;
    }

    // Fallback: localStorage user object
    if (!avatarUrl) {
      try {
        const stored = JSON.parse(localStorage.getItem('user') || '{}');
        if (stored && stored.avatar) avatarUrl = stored.avatar;
        if (stored && (stored.fullname || stored.name || stored.email)) altText = stored.fullname || stored.name || stored.email;
      } catch (e) {
        // ignore
      }
    }

    if (!avatarUrl) return false;

    // Normalize relative paths
    if (avatarUrl.startsWith('/')) avatarUrl = window.location.origin + avatarUrl;

    // If the selector points to an <img>, set src directly
    if (el.tagName && el.tagName.toLowerCase() === 'img') {
      el.src = avatarUrl;
      el.alt = altText;
      // Inline SVG data URI fallback (always available)
      const svgFallback = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="100%" height="100%" fill="#e9ecef" rx="60" ry="60"/><text x="50%" y="50%" font-size="20" dominant-baseline="middle" text-anchor="middle" fill="#6c757d">Avatar</text></svg>');
      el.onerror = function() { this.src = svgFallback; };
      return true;
    }

    // Otherwise create an img element and insert
    const img = document.createElement('img');
    img.src = avatarUrl;
    img.alt = altText;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    img.style.borderRadius = '50%';
    el.innerHTML = '';
    el.appendChild(img);
    return true;
  } catch (err) {
    console.error('loadAvatarInto error:', err);
    return false;
  }
}

// Expose globally for non-module pages
window.loadAvatarInto = loadAvatarInto;