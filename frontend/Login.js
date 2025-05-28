document.getElementById("loginForm").addEventListener("submit", function (event) {
    event.preventDefault(); // Зупиняємо стандартну поведінку форми
  
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const resultDiv = document.getElementById("loginResult");
  
    if (!username || !password) {
      resultDiv.textContent = "Усі поля обов’язкові для заповнення.";
      resultDiv.style.color = "red";
      return;
    }
  
    //  ЗВ’ЯЗОК З БЕКЕНДОМ:
    // Надсилаємо email/логін і пароль на сервер для перевірки
    fetch("API", { // <-- ТУТ ВСТАВЛЯЄШ СВОЄ API
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: username, // або login, в залежності від API
        password: password
      })
    })
  
      //  Обробка відповіді з бекенду
      .then(response => response.json())
      .then(data => {
        if (data.token) {
          //  ЗБЕРІГАННЯ ТОКЕНА:
          // Зберігаємо токен для подальшої авторизації (захищені сторінки)
          localStorage.setItem("authToken", data.token);
  
          //  ПЕРЕНАПРАВЛЕННЯ:
          // Перехід на головну сторінку після успішного входу
          window.location.href = "library.html"; // <-- ТУТ ВСТАВ СВОЮ ГОЛОВНУ СТОРІНКУ
        } else {
          //  Обробка помилки авторизації
          resultDiv.textContent = "Невірний логін або пароль.";
          resultDiv.style.color = "red";
        }
      })
  
      //  Помилка зв’язку з сервером
      .catch(error => {
        console.error("Помилка авторизації:", error);
        resultDiv.textContent = "Сталася помилка. Спробуйте ще раз пізніше.";
        resultDiv.style.color = "red";
      });
  });