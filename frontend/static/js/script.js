const API = "http://18.194.107.174/api";

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

  if (document.getElementById("book-detail")) {
    loadBookDetail();
  }

  if (document.getElementById("profile-data")) {
    loadProfile();
  }

  if (document.getElementById("logout-button")) {
    document.getElementById("logout-button").addEventListener("click", logout);
  }

  if (document.getElementById("home-button")) {
    document.getElementById("home-button").addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }

  // --- Показ кнопки адміна ---
  const adminButton = document.getElementById("admin-button");
  const userRole = localStorage.getItem("userRole");
  if (adminButton && userRole === "admin") {
    adminButton.style.display = "inline-block";
    adminButton.addEventListener("click", () => {
      window.location.href = "admin_panel.html";
    });
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

      await loadUserRole();

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
  const password2 = document.getElementById("reg-password2").value.trim();
  const firstName = document.getElementById("reg-firstname").value.trim();
  const lastName = document.getElementById("reg-lastname").value.trim();

  try {
    const res = await fetch(`${API}/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        password2,
        first_name: firstName,
        last_name: lastName,
      }),
    });

    const data = await res.json();

    if (res.ok && data.access) {
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);

      await loadUserRole();

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
  localStorage.removeItem("userRole");
  window.location.href = "login.html";
}

// --- Завантаження профілю ---
async function loadProfile() {
  try {
    const res = await fetch(`${API}/profile/`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
    });

    if (!res.ok) throw new Error("Не вдалось отримати профіль");

    const profile = await res.json();
    const role = profile.is_staff ? "Адмін" : "Користувач";

    document.getElementById("profile-data").innerText =
      `Email: ${profile.email}\nІм'я: ${profile.first_name}\nПрізвище: ${profile.last_name}\nРоль: ${role}`;
  } catch (err) {
    alert(err.message);
  }
}

// --- Завантаження ролі ---
async function loadUserRole() {
  try {
    const res = await fetch(`${API}/profile/`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
    });
    if (!res.ok) throw new Error("Не вдалось отримати профіль");

    const profile = await res.json();
    const role = profile.is_staff ? "admin" : "user";
    localStorage.setItem("userRole", role);
  } catch (err) {
    console.error(err);
    localStorage.setItem("userRole", "user");
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

    const bookDetail = document.getElementById("book-detail");

    const imageUrl = book.cover || book.image_url || "https://via.placeholder.com/300x450";
    const rating = book.rating || "Невідомо";
    const genre = book.genre || "Невідомо";
    const description = book.description || "Опис відсутній";

    bookDetail.innerHTML = `
      <div class="book-details">
        <img src="${imageUrl}" alt="Обкладинка ${book.title}">
        <div class="info">
          <h2>${book.title}</h2>
          <p><span class="label">Жанр:</span> ${genre}</p>
          <p><span class="label">Рейтинг:</span> ${rating}</p>
          <p><span class="label">Опис:</span> ${description}</p>
        </div>
      </div>
    `;
  } catch (err) {
    alert(err.message);
  }
}


// --- Фільтри ---
function setupFilters() {
  const searchInput = document.getElementById("search");
  const genreSelect = document.getElementById("genre");
  const ratingSelect = document.getElementById("rating");

  if (!searchInput || !genreSelect || !ratingSelect) return;

  [searchInput, genreSelect, ratingSelect].forEach(el => {
    el.addEventListener("input", () => loadBooks());
  });
}

// --- Завантаження книг ---
async function loadBooks() {
  const search = document.getElementById("search")?.value.trim() || "";
  const genre = document.getElementById("genre")?.value || "";
  const rating = document.getElementById("rating")?.value || "";

  let query = [];
  if (search) query.push(`search=${encodeURIComponent(search)}`);
  if (genre) query.push(`genre=${encodeURIComponent(genre)}`);
  if (rating) query.push(`rating=${encodeURIComponent(rating)}`);

  const url = `${API}/books/${query.length ? "?" + query.join("&") : ""}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Не вдалось завантажити книги");
    const books = await res.json();

    const list = document.getElementById("book-list");
    if (!list) return;

    list.innerHTML = books.length
      ? books.map(book => {
          const imageUrl = book.cover || book.image_url || "https://via.placeholder.com/100x150";
          return `
            <div class="book-card">
              <a href="book_detail.html?id=${book.id}">
                <img src="${imageUrl}" alt="Обкладинка ${book.title}">
                <h3>${book.title}</h3>
              </a>
              <p><b>Жанр:</b> ${book.genre}</p>
              <p><b>Рейтинг:</b> ${book.rating}</p>
            </div>
          `;
        }).join("")
      : "<p>Книги не знайдено</p>";
  } catch (err) {
    alert(err.message);
  }
}

// --- Скидання пароля ---
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
    const data = await res.json();
    alert(data.detail || "Помилка при зміні пароля");
  }
}

if (document.getElementById("reset-confirm-form")) {
  document.getElementById("reset-confirm-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const token = new URLSearchParams(window.location.search).get("token");
    const password = document.getElementById("new-password").value.trim();
    const password2 = document.getElementById("new-password2")?.value.trim();

    if (!token) {
      alert("Токен відсутній у URL");
      return;
    }

    if (!password || password.length < 6) {
      alert("Пароль має містити щонайменше 6 символів");
      return;
    }

    if (password2 && password !== password2) {
      alert("Паролі не співпадають");
      return;
    }

    await confirmPasswordReset(token, password);
  });
}

document.getElementById("recoveryForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const emailInput = document.getElementById("recoveryEmail");
  const resultDiv = document.getElementById("recoveryResult");

  if (!emailInput || !resultDiv) {
    console.error("Не знайдено елементи форми відновлення");
    return;
  }

  const email = emailInput.value.trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    resultDiv.innerText = "Введіть коректну email-адресу";
    resultDiv.style.color = "red";
    return;
  }

  try {
    const res = await fetch(`${API}/password-reset/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    
    if (res.ok) {
      resultDiv.innerText = "Лист для скидання пароля надіслано!";
      resultDiv.style.color = "green";
    } else {
      const data = await res.json();
      resultDiv.innerText = data.detail || "Помилка при відправці листа";
      resultDiv.style.color = "red";
    }
  } catch (err) {
    console.error(err);
    resultDiv.innerText = "Помилка мережі. Спробуйте пізніше.";
    resultDiv.style.color = "red";
  }
});

// --- Попап ---
const openPopUp = document.getElementById("open_pop_up");
const closePopUp = document.getElementById("pop_up_close");
const popUp = document.getElementById("pop_up");

if (openPopUp && closePopUp && popUp) {
  openPopUp.addEventListener("click", function (e) {
    e.preventDefault();
    popUp.classList.add("openwin");
  });

  closePopUp.addEventListener("click", () => {
    popUp.classList.remove("openwin");
  });
}

