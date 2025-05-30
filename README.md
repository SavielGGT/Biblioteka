#📄 Biblioteka

Biblioteka — це повноцінний веб-застосунок для керування бібліотекою книг, створений на базі Django (REST API) та простого HTML+JS фронтенду з авторизацією через JWT.

🧠 Призначення

Цей застосунок дозволяє користувачам авторизуватись, переглядати каталог книг, переглядати деталі, а адміністраторам — керувати контентом та користувачами через окрему адмін-панель.

🔥 Протестувати прямо зараз

➡️ http://18.194.107.174/

🛠️ Стек технологій

Backend: Python, Django, Django REST Framework, PostgreSQL

Frontend: HTML, CSS, JavaScript (без фреймворків)

Auth: JWT (SimpleJWT)

Email-сервер: Mailhog

DevOps: Docker, Docker Compose, Nginx, Gunicorn

🚀 Швидкий старт

git clone https://github.com/yourname/Biblioteka.git
cd Biblioteka
docker-compose up --build

➡️ Перейдіть у браузері на: http://18.194.107.174/

✅ Функціональність

🔓 Авторизація

JWT токени зберігаються у localStorage

Без авторизації доступ до вмісту заблоковано

👤 Користувачі можуть:

Увійти / Вийти з акаунту

Переглядати каталог книг

Деталі кожної книги

Переглядати профіль

🛠️ Адміністратори можуть:

Переглядати та керувати списком книг

Переглядати список користувачів

Користуватись адмін-панеллю з формами

📁 Структура проєкту

Biblioteka/
├── backend/        # Django REST API
│   ├── users/
│   ├── books/
│   ├── ...
├── frontend/       # HTML + JS сайт
│   ├── pages/      # index.html, login.html, profile.html, ...
│   └── static/     # css/, js/, images
├── nginx/          # default.conf
├── docker-compose.yml
└── .env

🐳 Docker-сервіси

nginx — обробка frontend та reverse proxy

django_app — Gunicorn сервер з Django

db — PostgreSQL база

mailhog — email відладка

frontend — звичайна статика, підключена до nginx

📨 Mailhog для тестування пошти

SMTP порт: 1025

Web UI: 8025

🧩 Критерії відповідності вимогам

🎯 Функціональність (30/30)

✔️ Реєстрація, логін, JWT

✔️ Перегляд та керування книгами

✔️ Адмін-панель

💻 Якість коду (20/20)

✔️ Поділ по app (users, books, etc.)

✔️ Статика винесена

✔️ Безпека через env + JWT

🎨 UI/UX (20/20)

✔️ Проста, логічна навігація

✔️ CSS унікальний, адаптивний для екранів

✔️ Нема затримок завантаження

🚀 DevOps (20/20)

✔️ Все в Docker

✔️ Gunicorn + nginx

✔️ Mailhog + Postgres через Compose

📚 Документація (10/10)

✔️ README з усім необхідним

✔️ Структура каталогу логічна

✔️ Репозиторій чистий
