document.getElementById("recoveryForm").addEventListener("submit", function(event) {
    event.preventDefault(); // зупиняємо стандартну відправку форми
  
    const email = document.getElementById("recoveryEmail").value.trim();
    const resultDiv = document.getElementById("recoveryResult");
  
    if (!email.includes("@")) {
      resultDiv.textContent = "Введіть дійсну електронну адресу.";
      resultDiv.style.color = "red";
      return;
    }
  
    //  ЗВ’ЯЗОК З БЕКЕНДОМ:
    // Надсилаємо email на сервер для ініціації процесу відновлення пароля
    fetch("https://your-backend-api.com/api/password-recovery", { // <-- ВСТАВ СВІЙ АДРЕС БЕКЕНДУ
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: email
      })
    })
  
      //  Обробка відповіді з сервера
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          //  УСПІХ:
          resultDiv.textContent = "Інструкції з відновлення пароля надіслано на пошту.";
          resultDiv.style.color = "green";
        } else {
          //  Невірна пошта або користувача не знайдено
          resultDiv.textContent = "Користувача з такою поштою не знайдено.";
          resultDiv.style.color = "red";
        }
      })
  
      //  Помилка з'єднання з сервером
      .catch(error => {
        console.error("Помилка:", error);
        resultDiv.textContent = "Сталася помилка. Спробуйте пізніше.";
        resultDiv.style.color = "red";
      });
  });