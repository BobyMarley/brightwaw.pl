const form = document.querySelector("form");
const nameInput = document.getElementById("name");
const phoneInput = document.getElementById("phone");
const adresInput = document.getElementById("adres");
const sendButton = document.getElementById("send");

// РќР• РѕР±СЉСЏРІР»СЏРµРј modalContainer Рё successModalContainer Р·РґРµСЃСЊ - РѕРЅРё СѓР¶Рµ РѕР±СЉСЏРІР»РµРЅС‹ РІ modal.js

// Р¤Р»Р°Рі РґР»СЏ РїСЂРµРґРѕС‚РІСЂР°С‰РµРЅРёСЏ РјРЅРѕР¶РµСЃС‚РІРµРЅРЅС‹С… РѕС‚РїСЂР°РІРѕРє
let isSubmitting = false;

form.addEventListener("submit", function(event) {
  event.preventDefault();

  // РџСЂРµРґРѕС‚РІСЂР°С‰Р°РµРј РјРЅРѕР¶РµСЃС‚РІРµРЅРЅС‹Рµ РѕС‚РїСЂР°РІРєРё
  if (isSubmitting) {
    console.log("Р¤РѕСЂРјР° СѓР¶Рµ РѕС‚РїСЂР°РІР»СЏРµС‚СЃСЏ...");
    return;
  }

  // Р’Р°Р»РёРґР°С†РёСЏ РїРѕР»РµР№
  if (nameInput.value.trim() === "" || adresInput.value.trim() === "" || phoneInput.value.trim() === "") {
    alert("ProszД™ wypeЕ‚niД‡ wszystkie pola. / РџРѕР¶Р°Р»СѓР№СЃС‚Р°, Р·Р°РїРѕР»РЅРёС‚Рµ РІСЃРµ РїРѕР»СЏ.");
    return;
  }

  // РџСЂРѕРІРµСЂРєР° РІР°Р»РёРґРЅРѕСЃС‚Рё С‚РµР»РµС„РѕРЅР° (РґРѕР»Р¶РµРЅ СЃРѕРґРµСЂР¶Р°С‚СЊ С…РѕС‚СЏ Р±С‹ 9 С†РёС„СЂ РїРѕСЃР»Рµ +48)
  const phoneDigits = phoneInput.value.replace(/\D/g, '');
  if (phoneDigits.length < 11) { // +48 (2 С†РёС„СЂС‹) + 9 С†РёС„СЂ РЅРѕРјРµСЂР° = 11
    alert("ProszД™ podaД‡ poprawny numer telefonu. / РџРѕР¶Р°Р»СѓР№СЃС‚Р°, РІРІРµРґРёС‚Рµ РєРѕСЂСЂРµРєС‚РЅС‹Р№ РЅРѕРјРµСЂ С‚РµР»РµС„РѕРЅР°.");
    return;
  }

  // РћС‚РєР»СЋС‡Р°РµРј РєРЅРѕРїРєСѓ Рё РјРµРЅСЏРµРј С‚РµРєСЃС‚
  isSubmitting = true;
  sendButton.disabled = true;
  const originalText = sendButton.textContent;
  sendButton.textContent = 'WysyЕ‚anie... / РћС‚РїСЂР°РІРєР°...';
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
  
  // Р¤РѕСЂРјРёСЂСѓРµРј СЃРѕРѕР±С‰РµРЅРёРµ
  console.log('РўРµРєСѓС‰РёР№ С‚РёРї СѓР±РѕСЂРєРё РІ vm.cleaningType:', vm.cleaningType);
  const cleaningTypeText = vm.cleaningType === 'generalna' ? "Р“РµРЅРµСЂР°Р»СЊРЅР°СЏ СѓР±РѕСЂРєР° / Generalne sprzД…tanie" : "РЎС‚Р°РЅРґР°СЂС‚РЅР°СЏ СѓР±РѕСЂРєР° / Standardowe sprzД…tanie";
  const selectedItemsText = vm.selectedItems.map(item => `${item.title} - ${item.count}`).join(' | ') || 'РќРµ РІС‹Р±СЂР°РЅРѕ / Nie wybrano';
  console.log('РўРµРєСЃС‚ С‚РёРїР° СѓР±РѕСЂРєРё РґР»СЏ РѕС‚РїСЂР°РІРєРё:', cleaningTypeText);
  
  const message = `рџЏ  РќРѕРІС‹Р№ Р·Р°РєР°Р· СѓР±РѕСЂРєРё! / Nowe zamГіwienie sprzД…tania!

рџ‘¤ РРјСЏ / ImiД™: ${nameInput.value}
рџ“ћ РўРµР»РµС„РѕРЅ / Telefon: ${phoneInput.value}
рџ“Ќ РђРґСЂРµСЃ / Adres: ${adresInput.value}
рџ§№ РўРёРї СѓР±РѕСЂРєРё / Typ sprzД…tania: ${cleaningTypeText}
рџ“‹ Р’С‹Р±СЂР°РЅРѕ / Wybrano: ${selectedItemsText}
рџ“… Р”Р°С‚Р° / Data: ${localDate}
рџ•’ Р’СЂРµРјСЏ / Czas: ${localTime}`;

  console.log('РћС‚РїСЂР°РІРєР° СЃРѕРѕР±С‰РµРЅРёСЏ:', message);

  // РЎС‡РµС‚С‡РёРє СѓСЃРїРµС€РЅС‹С… РѕС‚РїСЂР°РІРѕРє
  let completedRequests = 0;
  let successfulSends = 0;
  const totalChats = telegramChatIds.length;

  function handleRequestComplete(success = false) {
    completedRequests++;
    if (success) successfulSends++;
    
    console.log(`Р—Р°РІРµСЂС€РµРЅРѕ Р·Р°РїСЂРѕСЃРѕРІ: ${completedRequests}/${totalChats}, СѓСЃРїРµС€РЅС‹С…: ${successfulSends}`);
    
    // РљРѕРіРґР° РІСЃРµ Р·Р°РїСЂРѕСЃС‹ Р·Р°РІРµСЂС€РµРЅС‹
    if (completedRequests === totalChats) {
      // РџРѕРєР°Р·С‹РІР°РµРј СЂРµР·СѓР»СЊС‚Р°С‚ РґР°Р¶Рµ РµСЃР»Рё С…РѕС‚СЏ Р±С‹ РѕРґРЅР° РѕС‚РїСЂР°РІРєР° СѓСЃРїРµС€РЅР°
      if (successfulSends > 0) {
        console.log('РћС‚РїСЂР°РІРєР° СѓСЃРїРµС€РЅР°, РїРѕРєР°Р·С‹РІР°РµРј РјРѕРґР°Р»СЊРЅРѕРµ РѕРєРЅРѕ');
        
        // РћС‚РїСЂР°РІРєР° СЃРѕР±С‹С‚РёСЏ РєРѕРЅРІРµСЂСЃРёРё Р±РµР· СЂРµРґРёСЂРµРєС‚Р°
        if (typeof gtag_report_conversion === 'function') {
          gtag_report_conversion();
        }

        // Р—Р°РєСЂС‹РІР°РµРј С„РѕСЂРјСѓ Рё РїРѕРєР°Р·С‹РІР°РµРј СѓСЃРїРµС…
        modalContainer.classList.remove("active");
        successModalContainer.style.display = "block";

        // РћС‡РёС‰Р°РµРј С„РѕСЂРјСѓ
        form.reset();
        vm.selectedItems = [];
        const resetEvent = new CustomEvent('reset-button-counter');
        window.dispatchEvent(resetEvent);
      } else {
        // Р’СЃРµ РѕС‚РїСЂР°РІРєРё РїСЂРѕРІР°Р»РёР»РёСЃСЊ
        console.error('Р’СЃРµ РѕС‚РїСЂР°РІРєРё РїСЂРѕРІР°Р»РёР»РёСЃСЊ');
        alert("BЕ‚Д…d wysyЕ‚ania. SprГіbuj ponownie. / РћС€РёР±РєР° РѕС‚РїСЂР°РІРєРё. РџРѕРїСЂРѕР±СѓР№С‚Рµ СЃРЅРѕРІР°.");
      }

      // Р’РѕР·РІСЂР°С‰Р°РµРј РєРЅРѕРїРєСѓ РІ РёСЃС…РѕРґРЅРѕРµ СЃРѕСЃС‚РѕСЏРЅРёРµ
      isSubmitting = false;
      sendButton.disabled = false;
      sendButton.textContent = originalText;
      sendButton.style.opacity = '1';
      sendButton.style.cursor = 'pointer';
    }
  }

  // РћС‚РїСЂР°РІР»СЏРµРј СЃРѕРѕР±С‰РµРЅРёСЏ РІ Telegram
  telegramChatIds.forEach(chatId => {
    const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(message)}`;
    
    console.log(`РћС‚РїСЂР°РІРєР° РІ С‡Р°С‚ ${chatId}...`);
    
    fetch(url)
      .then(response => {
        console.log(`РћС‚РІРµС‚ РѕС‚ Telegram РґР»СЏ С‡Р°С‚Р° ${chatId}:`, response.status);
        return response.json();
      })
      .then(data => {
        if (data.ok) {
          console.log(`вњ“ РЎРѕРѕР±С‰РµРЅРёРµ СѓСЃРїРµС€РЅРѕ РѕС‚РїСЂР°РІР»РµРЅРѕ РІ С‡Р°С‚ ${chatId}`);
          handleRequestComplete(true);
        } else {
          console.error(`вњ— РћС€РёР±РєР° РѕС‚РїСЂР°РІРєРё РІ С‡Р°С‚ ${chatId}:`, data);
          handleRequestComplete(false);
        }
      })
      .catch(error => {
        console.error(`вњ— РћС€РёР±РєР° СЃРµС‚Рё РїСЂРё РѕС‚РїСЂР°РІРєРµ РІ С‡Р°С‚ ${chatId}:`, error);
        handleRequestComplete(false);
      });
  });

  // РўР°Р№РјР°СѓС‚ РЅР° СЃР»СѓС‡Р°Р№ Р·Р°РІРёСЃР°РЅРёСЏ (15 СЃРµРєСѓРЅРґ)
  setTimeout(() => {
    if (completedRequests < totalChats) {
      console.warn("вљ  РўР°Р№РјР°СѓС‚ РѕС‚РїСЂР°РІРєРё С„РѕСЂРјС‹ - РїСЂРёРЅСѓРґРёС‚РµР»СЊРЅРѕРµ Р·Р°РІРµСЂС€РµРЅРёРµ");
      // РџСЂРёРЅСѓРґРёС‚РµР»СЊРЅРѕ Р·Р°РІРµСЂС€Р°РµРј РѕСЃС‚Р°РІС€РёРµСЃСЏ Р·Р°РїСЂРѕСЃС‹
      while (completedRequests < totalChats) {
        handleRequestComplete(false);
      }
    }
  }, 15000);
});



