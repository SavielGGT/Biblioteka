// === Налаштування ===
const API_URL = 'http://localhost:8000/api';

// === Токени ===
function saveTokens(access, refresh) {
  localStorage.setItem('access', access);
  localStorage.setItem('refresh', refresh);
}

function clearTokens() {
  localStorage.clear();
  window.location.href = '/pages/login.html';
}

async function refreshToken() {
  const refresh = localStorage.getItem('refresh');
  if (!refresh) return clearTokens();

  const res = await fetch(`${API_URL}/users/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });

  if (res.ok) {
    const data = await res.json();
    localStorage.setItem('access', data.access);
    return data.access;
  } else {
    clearTokens();
  }
}

// === Запити з авторизацією ===
async function fetchWithAuth(url, options = {}) {
  let access = localStorage.getItem('access');
  let res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${access}`,
      'Content-Type': 'application/json',
    },
  });

  if (res.status === 401) {
    access = await refreshToken();
    if (!access) return;
    res = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${access}`,
        'Content-Type': 'application/json',
      },
    });
  }

  return res;
}

// === Авторизація перед завантаженням сторінок ===
function requireAuth() {
  const access = localStorage.getItem('access');
  if (!access) {
    window.location.href = '/pages/login.html';
  }
}

// === Логін ===
async function loginUser(email, password) {
  const res = await fetch(`${API_URL}/users/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (res.ok) {
    const data = await res.json();
    saveTokens(data.access, data.refresh);
    window.location.href = '/pages/index.html';
  } else {
    alert('Невірні дані для входу');
  }
}

// === Отримання книг ===
async function fetchBooks() {
  const res = await fetchWithAuth(`${API_URL}/books/`);
  if (res && res.ok) {
    const books = await res.json();
    renderBooks(books);
  }
}

function renderBooks(books) {
  const container = document.getElementById('book-list');
  container.innerHTML = '';
  books.forEach(book => {
    const div = document.createElement('div');
    div.className = 'book';
    div.innerHTML = `
      <h3>${book.title}</h3>
      <p>${book.author}</p>
      <a href="/pages/book_detail.html?id=${book.id}">Деталі</a>
    `;
    container.appendChild(div);
  });
}

// === Деталі книги ===
async function fetchBookDetail() {
  const params = new URLSearchParams(window.location.search);
  const bookId = params.get('id');
  const res = await fetchWithAuth(`${API_URL}/books/${bookId}/`);
  if (res && res.ok) {
    const book = await res.json();
    document.getElementById('title').textContent = book.title;
    document.getElementById('author').textContent = book.author;
    document.getElementById('description').textContent = book.description || '—';
  }
}

// === Профіль ===
async function fetchProfile() {
  const res = await fetchWithAuth(`${API_URL}/users/profile/`);
  if (res && res.ok) {
    const user = await res.json();
    document.getElementById('user-email').textContent = user.email;
    document.getElementById('user-name').textContent = user.name || '—';
    document.getElementById('user-role').textContent = user.is_staff ? 'Адміністратор' : 'Користувач';
    sessionStorage.setItem('user_role', user.is_staff ? 'admin' : 'user');
    toggleAdminElements();
  } else {
    clearTokens();
  }
}

// === Адмін-панель ===
async function fetchAdminData() {
  const role = sessionStorage.getItem('user_role');
  if (role !== 'admin') {
    alert('Доступ лише для адміністратора');
    return (window.location.href = '/pages/index.html');
  }

  const res = await fetchWithAuth(`${API_URL}/users/`);
  if (res && res.ok) {
    const users = await res.json();
    renderAdminUsers(users);
  }
}

function renderAdminUsers(users) {
  const list = document.getElementById('user-list');
  list.innerHTML = '';
  users.forEach(u => {
    const li = document.createElement('li');
    li.textContent = `${u.name} — ${u.email}`;
    list.appendChild(li);
  });
}

// === Показати елементи для адміна ===
function toggleAdminElements() {
  const isAdmin = sessionStorage.getItem('user_role') === 'admin';
  document.querySelectorAll('.admin-only').forEach(el => {
    el.style.display = isAdmin ? 'block' : 'none';
  });
}

// === DOMContentLoaded ===
document.addEventListener('DOMContentLoaded', async () => {
  const path = window.location.pathname;

  if (path.includes('login.html')) {
    const form = document.getElementById('login-form');
    form?.addEventListener('submit', e => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      loginUser(email, password);
    });
  }

  if (path.includes('index.html')) {
    requireAuth();
    await fetchBooks();
  }

  if (path.includes('book_detail.html')) {
    requireAuth();
    await fetchBookDetail();
  }

  if (path.includes('profile.html')) {
    requireAuth();
    await fetchProfile();
  }

  if (path.includes('admin_panel.html')) {
    requireAuth();
    await fetchProfile(); // щоб дізнатись роль
    await fetchAdminData();
  }
});
