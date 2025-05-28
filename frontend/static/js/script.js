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

// === ініціалізація index.html ===
async function initIndexPage() {
  const listContainer = document.getElementById('book-list');
  const search = document.getElementById('search');
  const genre = document.getElementById('genre');
  const yearFrom = document.getElementById('year-from');
  const yearTo = document.getElementById('year-to');

  async function loadBooks() {
    const params = new URLSearchParams();
    if (search.value) params.append('search', search.value);
    if (genre.value) params.append('genre', genre.value);
    if (yearFrom.value) params.append('year_from', yearFrom.value);
    if (yearTo.value) params.append('year_to', yearTo.value);

    const res = await fetchWithAuth(`${API_URL}/books/?${params.toString()}`);
    const data = await res.json();

    listContainer.innerHTML = '';
    data.forEach(book => {
      const el = document.createElement('div');
      el.className = 'book-item';
      el.innerHTML = `<a href="book_detail.html?id=${book.id}"><h3>${book.title}</h3><p>${book.author}</p></a>`;
      listContainer.appendChild(el);
    });
  }

  document.getElementById('filter-form').addEventListener('submit', e => {
    e.preventDefault();
    loadBooks();
  });

  await loadBooks();
}

// === ініціалізація book_detail.html ===
async function initBookDetailPage() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const res = await fetchWithAuth(`${API_URL}/books/${id}/`);
  const data = await res.json();

  document.getElementById('book-title').textContent = data.title;
  document.getElementById('book-author').textContent = data.author;
  document.getElementById('book-description').textContent = data.description;
  document.getElementById('book-cover').src = data.cover_url;
}

// === ініціалізація admin_panel.html ===
async function initAdminPanelPage() {
  const list = document.getElementById('admin-book-list');
  const form = document.getElementById('book-form');
  const title = document.getElementById('book-title-input');
  const author = document.getElementById('book-author-input');
  const description = document.getElementById('book-description-input');

  async function loadBooks() {
    const res = await fetchWithAuth(`${API_URL}/books/`);
    const data = await res.json();
    list.innerHTML = '';
    data.forEach(book => {
      const item = document.createElement('div');
      item.innerHTML = `
        <h4>${book.title}</h4>
        <button data-id="${book.id}" class="delete-btn">Видалити</button>
      `;
      list.appendChild(item);
    });
  }

  list.addEventListener('click', async (e) => {
    if (e.target.classList.contains('delete-btn')) {
      const id = e.target.dataset.id;
      await fetchWithAuth(`${API_URL}/books/${id}/`, { method: 'DELETE' });
      await loadBooks();
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      title: title.value,
      author: author.value,
      description: description.value,
    };
    await fetchWithAuth(`${API_URL}/books/`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    form.reset();
    await loadBooks();
  });

  await loadBooks();
}

// === Автозапуск ===
document.addEventListener('DOMContentLoaded', async () => {
  const page = window.location.pathname;

  if (page.includes('login.html')) {
    initLoginPage();
  }

  if (page.includes('profile.html')) {
    await initProfilePage();
  }

  if (page.includes('index.html')) {
    await initIndexPage();
  }

  if (page.includes('book_detail.html')) {
    await initBookDetailPage();
  }

  if (page.includes('admin_panel.html')) {
    await initAdminPanelPage();
  }

  const protectedPages = ['profile.html', 'index.html', 'admin_panel.html'];
  if (protectedPages.some(p => page.includes(p))) {
    const access = await getAccessToken();
    if (!access) return;
    toggleAdminElements();
  }
});
