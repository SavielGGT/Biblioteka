document.getElementById("registrationForm").addEventListener("submit", function(event) {
    event.preventDefault(); // зупиняємо перезавантаження сторінки
  
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const resultDiv = document.getElementById("result");
  
    if (!username || !email || !password) {
      resultDiv.textContent = "Усі поля обов’язкові.";
      resultDiv.style.color = "red";
      return;
    }
  
    //  ЗВ’ЯЗОК З БЕКЕНДОМ:
    // Надсилаємо дані на сервер для створення нового користувача
    fetch("https://your-backend-api.com/api/register", { // <-- ВСТАВ СВОЮ АДРЕСУ API
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: username,
        email: email,
        password: password
      })
    })
  
      //  Обробка відповіді з сервера
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          //  Реєстрація пройшла успішно
          resultDiv.textContent = "Реєстрація успішна! Можете увійти.";
          resultDiv.style.color = "green";
  
          //  За потреби перенаправлення:
          // window.location.href = "login.html";
        } else {
          //  Помилка реєстрації (наприклад, email вже існує)
          resultDiv.textContent = data.message || "Сталася помилка при реєстрації.";
          resultDiv.style.color = "red";
        }
      })
  
      //  Помилка зв’язку з сервером
      .catch(error => {
        console.error("Помилка:", error);
        resultDiv.textContent = "Помилка сервера. Спробуйте пізніше.";
        resultDiv.style.color = "red";
      });
  });