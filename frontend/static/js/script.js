// === Налаштування ===
const API_URL = 'http://localhost:8000/api'; // змінити при потребі

// === Збереження токенів ===
function saveTokens(access, refresh) {
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
}

// === Декодування JWT ===
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

// === Редирект при помилці ===
function redirectToLogin() {
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = 'login.html';
}

// === Отримати access або оновити ===
async function getAccessToken() {
  let access = localStorage.getItem('access_token');
  const payload = parseJwt(access);
  const isExpired = payload?.exp * 1000 < Date.now();

  if (!access || isExpired) {
    access = await refreshToken();
  }

  return access;
}

// === Оновити access через refresh ===
async function refreshToken() {
  const refresh = localStorage.getItem('refresh_token');
  if (!refresh) {
    redirectToLogin();
    return null;
  }

  const response = await fetch(`${API_URL}/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });

  if (!response.ok) {
    redirectToLogin();
    return null;
  }

  const data = await response.json();
  localStorage.setItem('access_token', data.access);
  return data.access;
}

// === Загальна fetch-функція з авторизацією ===
async function fetchWithAuth(url, options = {}) {
  const token = await getAccessToken();
  if (!token) return;

  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
}

// === Вхід (login) ===
async function login(email, password) {
  const response = await fetch(`${API_URL}/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (response.ok) {
    const data = await response.json();
    saveTokens(data.access, data.refresh);
    window.location.href = 'index.html';
  } else {
    const error = await response.json();
    alert(error.detail || 'Невірні дані для входу');
  }
}

// === Показати елементи лише для адміністратора ===
function toggleAdminElements() {
  const role = sessionStorage.getItem('user_role');
  const isAdmin = role === 'admin';

  const adminEls = document.querySelectorAll('.admin-only, #admin-button');
  adminEls.forEach(el => {
    el.style.display = isAdmin ? 'block' : 'none';
  });
}

// === ініціалізація login.html ===
function initLoginPage() {
  const form = document.getElementById('login-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    await login(email, password);
  });
}

// === ініціалізація profile.html ===
async function initProfilePage() {
  const access = await getAccessToken();
  if (!access) return;

  const res = await fetchWithAuth(`${API_URL}/profile/`);
  if (res && res.ok) {
    const data = await res.json();
    document.getElementById('profile-name').textContent = data.name || '—';
    document.getElementById('profile-email').textContent = data.email || '—';

    // Зберегти роль
    sessionStorage.setItem('user_role', data.is_staff ? 'admin' : 'user');
    toggleAdminElements();
  } else {
    redirectToLogin();
  }

  const form = document.getElementById('password-form');
  form.addEventListener('submit', handleChangePassword);
}

// === Зміна пароля ===
async function handleChangePassword(e) {
  e.preventDefault();
  const oldPassword = document.getElementById('old-password').value;
  const newPassword = document.getElementById('new-password').value;
  const msg = document.getElementById('password-message');

  const response = await fetchWithAuth(`${API_URL}/password-change/`, {
    method: 'POST',
    body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
  });

  if (response && response.ok) {
    msg.textContent = 'Пароль успішно змінено';
    msg.style.color = 'green';
    e.target.reset();
  } else {
    const error = await response.json();
    msg.textContent = error.detail || 'Помилка зміни пароля';
    msg.style.color = 'red';
  }
}

// === Автозапуск на кожній сторінці ===
document.addEventListener('DOMContentLoaded', async () => {
  const page = window.location.pathname;

  if (page.includes('login.html')) {
    initLoginPage();
  }

  if (page.includes('profile.html')) {
    await initProfilePage();
  }

  // Можна додати перевірку доступу для інших сторінок:
  const protectedPages = ['profile.html', 'index.html', 'admin_panel.html'];
  if (protectedPages.some(p => page.includes(p))) {
    const access = await getAccessToken();
    if (!access) return;
    toggleAdminElements();
  }
});
