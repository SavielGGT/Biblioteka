const API = "http://localhost:8000/api";

// --- DOMContentLoaded ---
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("login-form")) {
    document.getElementById("login-form").addEventListener("submit", login);
  }

  if (document.getElementById("register-form")) {
    document.getElementById("register-form").addEventListener("submit", register);
  }

  if (document.getElementById("book-list")) {
    setupFilters();
    loadBooks();
  }

  if (document.getElementById("profile-data")) {
    loadProfile();
  }

  if (document.getElementById("book-detail")) {
    loadBookDetail();
  }

  if (document.getElementById("logout-button")) {
    document.getElementById("logout-button").addEventListener("click", logout);
  }
});

// --- Логін ---
async function login(e) {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const res = await fetch(`${API}/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (res.ok && data.access) {
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      window.location.href = "index.html";
    } else {
      alert(data.detail || "Помилка входу");
    }
  } catch (err) {
    alert("Помилка мережі");
  }
}

// --- Реєстрація з автологіном ---
async function register(e) {
  e.preventDefault();
  const email = document.getElementById("reg-email").value.trim();
  const password = document.getElementById("reg-password").value.trim();
  const firstName = document.getElementById("reg-firstname").value.trim();
  const lastName = document.getElementById("reg-lastname").value.trim();

  try {
    const res = await fetch(`${API}/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, password2, first_name: firstName, last_name: lastName }),
    });
    const data = await res.json();

    if (res.ok && data.access) {
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      alert("Реєстрація пройшла успішно!");
      window.location.href = "index.html";
    } else {
      alert(JSON.stringify(data));
    }
  } catch (err) {
    alert("Помилка мережі");
  }
}

// --- Вихід ---
function logout() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  window.location.href = "login.html";
}

// --- Завантаження профілю ---
async function loadProfile() {
  try {
    const res = await fetch(`${API}/profile/`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
    });

    if (!res.ok) {
      throw new Error("Не вдалось отримати профіль");
    }

    const profile = await res.json();
    document.getElementById("profile-data").innerText = `Email: ${profile.email}\nІм'я: ${profile.first_name}\nПрізвище: ${profile.last_name}`;
  } catch (err) {
    alert(err.message);
  }
}

// --- Завантаження деталей книги ---
async function loadBookDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  try {
    const res = await fetch(`${API}/books/${id}/`);
    if (!res.ok) throw new Error("Книга не знайдена");
    const book = await res.json();

    document.getElementById("book-detail").innerHTML = `
      <h2>${book.title}</h2>
      <p>${book.description}</p>
      <p><b>Жанр:</b> ${book.genre}</p>
      <p><b>Рік:</b> ${book.year}</p>
    `;
  } catch (err) {
    alert(err.message);
  }
}

// --- Завантаження книг з фільтрами ---
function setupFilters() {
  const searchInput = document.getElementById("search");
  const genreSelect = document.getElementById("genre");
  const yearSelect = document.getElementById("year");

  if (!searchInput || !genreSelect || !yearSelect) return;

  [searchInput, genreSelect, yearSelect].forEach(el => {
    el.addEventListener("input", () => loadBooks());
  });
}

async function loadBooks() {
  const search = document.getElementById("search")?.value.trim() || "";
  const genre = document.getElementById("genre")?.value || "";
  const year = document.getElementById("year")?.value || "";

  let query = [];
  if (search) query.push(`search=${encodeURIComponent(search)}`);
  if (genre) query.push(`genre=${encodeURIComponent(genre)}`);
  if (year) query.push(`year=${encodeURIComponent(year)}`);

  const url = `${API}/books/${query.length ? "?" + query.join("&") : ""}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Не вдалось завантажити книги");
    const books = await res.json();

    const list = document.getElementById("book-list");
    if (!list) return;

    list.innerHTML = books.length
      ? books.map(book => `
        <div class="book-card">
          <a href="book_detail.html?id=${book.id}">
            <img src="${book.cover || "https://via.placeholder.com/100x150"}" alt="Обкладинка ${book.title}">
            <h3>${book.title}</h3>
          </a>
          <p><b>Жанр:</b> ${book.genre}</p>
          <p><b>Рік:</b> ${book.year}</p>
        </div>
      `).join("")
      : "<p>Книги не знайдено</p>";
  } catch (err) {
    alert(err.message);
  }
}

// --- Скидання пароля (приклад) ---
async function sendPasswordReset(email) {
  const res = await fetch(`${API}/password-reset/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (res.ok) {
    alert("Лист для скидання пароля надіслано!");
  } else {
    alert("Помилка при відправці листа");
  }
}

async function confirmPasswordReset(token, newPassword) {
  const res = await fetch(`${API}/password-reset/confirm/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, new_password: newPassword }),
  });

  if (res.ok) {
    alert("Пароль успішно змінено!");
    window.location.href = "login.html";
  } else {
    alert("Помилка при зміні пароля");
  }
}

// --- Попап відкриття/закриття ---
const openPopUp = document.getElementById('open_pop_up');
const closePopUp = document.getElementById('pop_up_close');
const popUp = document.getElementById('pop_up');

if(openPopUp && closePopUp && popUp) {
  openPopUp.addEventListener('click', function(e){
      e.preventDefault();
      popUp.classList.add('openwin');
  });

  closePopUp.addEventListener('click', () => {
      popUp.classList.remove('openwin');
  });
}

