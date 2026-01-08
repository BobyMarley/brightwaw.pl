const form = document.querySelector("form");
const nameInput = document.getElementById("name");
const phoneInput = document.getElementById("phone");
const adresInput = document.getElementById("adres");
const sendButton = document.getElementById("send");

// НЕ объявляем modalContainer и successModalContainer здесь - они уже объявлены в modal.js

// Флаг для предотвращения множественных отправок
let isSubmitting = false;

form.addEventListener("submit", function(event) {
  event.preventDefault();

  // Предотвращаем множественные отправки
  if (isSubmitting) {
    console.log("Форма уже отправляется...");
    return;
  }

  // Валидация полей
  if (nameInput.value.trim() === "" || adresInput.value.trim() === "" || phoneInput.value.trim() === "") {
    alert("Proszę wypełnić wszystkie pola. / Пожалуйста, заполните все поля.");
    return;
  }

  // Проверка валидности телефона (должен содержать хотя бы 9 цифр после +48)
  const phoneDigits = phoneInput.value.replace(/\D/g, '');
  if (phoneDigits.length < 11) { // +48 (2 цифры) + 9 цифр номера = 11
    alert("Proszę podać poprawny numer telefonu. / Пожалуйста, введите корректный номер телефона.");
    return;
  }

  // Отключаем кнопку и меняем текст
  isSubmitting = true;
  sendButton.disabled = true;
  const originalText = sendButton.textContent;
  sendButton.textContent = 'Wysyłanie... / Отправка...';
  sendButton.style.opacity = '0.7';
  sendButton.style.cursor = 'not-allowed';

  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  const day = currentDate.getDate().toString().padStart(2, '0');
  const hours = currentDate.getHours().toString().padStart(2, '0');
  const minutes = currentDate.getMinutes().toString().padStart(2, '0');

  const localDate = `${year}-${month}-${day}`; 
  const localTime = `${hours}:${minutes}`;

  // Telegram Bot API
  const telegramBotToken = '6339860942:AAFolHF7Pk1HCLWwDIGhkvYEr2P-9eEBUgw';
  const telegramChatIds = ['5655772838','1137562732']; 
  
  // Формируем сообщение
  console.log('Текущий тип уборки в vm.cleaningType:', vm.cleaningType);
  const cleaningTypeText = vm.cleaningType === 'generalna' ? "Генеральная уборка / Generalne sprzątanie" : "Стандартная уборка / Standardowe sprzątanie";
  const selectedItemsText = vm.selectedItems.map(item => `${item.title} - ${item.count}`).join(' | ') || 'Не выбрано / Nie wybrano';
  console.log('Текст типа уборки для отправки:', cleaningTypeText);
  
  const message = `🏠 Новый заказ уборки! / Nowe zamówienie sprzątania!

👤 Имя / Imię: ${nameInput.value}
📞 Телефон / Telefon: ${phoneInput.value}
📍 Адрес / Adres: ${adresInput.value}
🧹 Тип уборки / Typ sprzątania: ${cleaningTypeText}
📋 Выбрано / Wybrano: ${selectedItemsText}
📅 Дата / Data: ${localDate}
🕒 Время / Czas: ${localTime}`;

  console.log('Отправка сообщения:', message);

  // Счетчик успешных отправок
  let completedRequests = 0;
  let successfulSends = 0;
  const totalChats = telegramChatIds.length;

  function handleRequestComplete(success = false) {
    completedRequests++;
    if (success) successfulSends++;
    
    console.log(`Завершено запросов: ${completedRequests}/${totalChats}, успешных: ${successfulSends}`);
    
    // Когда все запросы завершены
    if (completedRequests === totalChats) {
      // Показываем результат даже если хотя бы одна отправка успешна
      if (successfulSends > 0) {
        console.log('Отправка успешна, показываем модальное окно');
        
        // Отправка события конверсии без редиректа
        if (typeof gtag_report_conversion === 'function') {
          gtag_report_conversion();
        }

        // Закрываем форму и показываем успех
        modalContainer.style.display = "none";  
        successModalContainer.style.display = "block";

        // Очищаем форму
        form.reset();
        vm.selectedItems = [];
        const resetEvent = new CustomEvent('reset-button-counter');
        window.dispatchEvent(resetEvent);
      } else {
        // Все отправки провалились
        console.error('Все отправки провалились');
        alert("Błąd wysyłania. Spróbuj ponownie. / Ошибка отправки. Попробуйте снова.");
      }

      // Возвращаем кнопку в исходное состояние
      isSubmitting = false;
      sendButton.disabled = false;
      sendButton.textContent = originalText;
      sendButton.style.opacity = '1';
      sendButton.style.cursor = 'pointer';
    }
  }

  // Отправляем сообщения в Telegram
  telegramChatIds.forEach(chatId => {
    const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(message)}`;
    
    console.log(`Отправка в чат ${chatId}...`);
    
    fetch(url)
      .then(response => {
        console.log(`Ответ от Telegram для чата ${chatId}:`, response.status);
        return response.json();
      })
      .then(data => {
        if (data.ok) {
          console.log(`✓ Сообщение успешно отправлено в чат ${chatId}`);
          handleRequestComplete(true);
        } else {
          console.error(`✗ Ошибка отправки в чат ${chatId}:`, data);
          handleRequestComplete(false);
        }
      })
      .catch(error => {
        console.error(`✗ Ошибка сети при отправке в чат ${chatId}:`, error);
        handleRequestComplete(false);
      });
  });

  // Таймаут на случай зависания (15 секунд)
  setTimeout(() => {
    if (completedRequests < totalChats) {
      console.warn("⚠ Таймаут отправки формы - принудительное завершение");
      // Принудительно завершаем оставшиеся запросы
      while (completedRequests < totalChats) {
        handleRequestComplete(false);
      }
    }
  }, 15000);
});