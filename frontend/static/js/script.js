const API = "http://localhost:8000/api";

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("login-form")) {
    document.getElementById("login-form").addEventListener("submit", login);
  }

  if (document.getElementById("book-list")) {
    loadBooks();
  }

  if (document.getElementById("profile-data")) {
    loadProfile();
  }

  if (document.getElementById("book-detail")) {
    loadBookDetail();
  }
});

async function login(e) {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch(`${API}/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (data.access) {
    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);
    window.location.href = "index.html";
  } else {
    alert("Помилка входу");
  }
}

async function loadBooks() {
  const res = await fetch(`${API}/books/`);
  const books = await res.json();
  const list = document.getElementById("book-list");
  list.innerHTML = books.map(book => `<div><a href="book_detail.html?id=${book.id}">${book.title}</a></div>`).join("");
}

async function loadProfile() {
  const res = await fetch(`${API}/profile/`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
  });
  const profile = await res.json();
  document.getElementById("profile-data").innerText = `Email: ${profile.email}`;
}

async function loadBookDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const res = await fetch(`${API}/books/${id}/`);
  const book = await res.json();
  document.getElementById("book-detail").innerHTML = `
    <h2>${book.title}</h2>
    <p>${book.description}</p>
    <p>Жанр: ${book.genre}</p>
    <p>Рік: ${book.year}</p>
  `;
}

async function exportBooks() {
  const res = await fetch(`${API}/export/`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
  });
  if (res.ok) {
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "books.xlsx";
    document.body.appendChild(a);
    a.click();
    a.remove();
  } else {
    alert("Помилка експорту");
  }
}

async function scrapeBooks() {
  const res = await fetch(`${API}/scrape/`, {
    method: "POST",
    headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
  });

  if (res.ok) {
    alert("Парсинг запущено");
  } else {
    alert("Помилка при парсингу");
  }
}
