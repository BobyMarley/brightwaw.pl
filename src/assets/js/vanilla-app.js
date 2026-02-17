// Vanilla JS Р·Р°РјРµРЅР° Vue.js - СѓРЅРёРІРµСЂСЃР°Р»СЊРЅР°СЏ РґР»СЏ РІСЃРµС… СЏР·С‹РєРѕРІ
// Р“Р»РѕР±Р°Р»СЊРЅС‹Р№ РѕР±СЉРµРєС‚ СЃРѕСЃС‚РѕСЏРЅРёСЏ (Р·Р°РјРµРЅСЏРµС‚ Vue instance)
window.vm = {
  selectedItems: [],
  isConditionMet: true,
  selectedItemsData: '',
  cleaningType: 'kompleksowa',
  buttons: [
    { id: 1, title: '', count: 0 },
    { id: 2, title: '', count: 0 },
    { id: 3, title: '', count: 0 }
  ],
  $el: null
};

// РўРµРєСЃС‚С‹ РґР»СЏ СЂР°Р·РЅС‹С… СЏР·С‹РєРѕРІ
const translations = {
  pl: {
    rooms: { 0: 'pokoi', 1: 'pokГіj', 2: 'pokoje', 5: 'pokoi' },
    bathrooms: { 0: 'Е‚azienek', 1: 'Е‚azienka', 2: 'Е‚azienki', 5: 'Е‚azienek' },
    windows: { 0: 'okien', 1: 'okno', 2: 'okna', 5: 'okien' },
    generalna: 'Generalne sprzД…tanie',
    kompleksowa: 'Standardowe sprzД…tanie'
  },
  ru: {
    rooms: { 0: 'РєРѕРјРЅР°С‚', 1: 'РєРѕРјРЅР°С‚Р°', 2: 'РєРѕРјРЅР°С‚С‹', 5: 'РєРѕРјРЅР°С‚' },
    bathrooms: { 0: 'СЃР°РЅСѓР·Р»РѕРІ', 1: 'СЃР°РЅСѓР·РµР»', 2: 'СЃР°РЅСѓР·Р»Р°', 3: 'СЃР°РЅСѓР·Р»РѕРІ' },
    windows: { 0: 'РѕРєРѕРЅ', 1: 'РѕРєРЅРѕ', 2: 'РѕРєРЅР°', 5: 'РѕРєРѕРЅ' },
    generalna: 'Р“РµРЅРµСЂР°Р»СЊРЅР°СЏ СѓР±РѕСЂРєР°',
    kompleksowa: 'РЎС‚Р°РЅРґР°СЂС‚РЅР°СЏ СѓР±РѕСЂРєР°'
  },
  en: {
    rooms: { 0: 'rooms', 1: 'room', 2: 'rooms' },
    bathrooms: { 0: 'bathrooms', 1: 'bathroom', 2: 'bathrooms' },
    windows: { 0: 'windows', 1: 'window', 2: 'windows' },
    generalna: 'Deep cleaning',
    kompleksowa: 'Standard cleaning'
  },
  by: {
    rooms: { 0: 'РїР°РєРѕСЏСћ', 1: 'РїР°РєРѕР№', 2: 'РїР°РєРѕС–', 5: 'РїР°РєРѕСЏСћ' },
    bathrooms: { 0: 'СЃР°РЅРІСѓР·Р»РѕСћ', 1: 'СЃР°РЅРІСѓР·РµР»', 2: 'СЃР°РЅРІСѓР·Р»Р°', 3: 'СЃР°РЅРІСѓР·Р»РѕСћ' },
    windows: { 0: 'РІРѕРєРЅР°Сћ', 1: 'Р°РєРЅРѕ', 2: 'РІРѕРєРЅС‹', 5: 'РІРѕРєРЅР°Сћ' },
    generalna: 'Р“РµРЅРµСЂР°Р»СЊРЅР°СЏ СћР±РѕСЂРєР°',
    kompleksowa: 'РЎС‚Р°РЅРґР°СЂС‚РЅР°СЏ СћР±РѕСЂРєР°'
  }
};

// РћРїСЂРµРґРµР»СЏРµРј СЏР·С‹Рє РёР· URL
function detectLanguage() {
  const path = window.location.pathname;
  if (path.includes('/ru/')) return 'ru';
  if (path.includes('/en/')) return 'en';
  if (path.includes('/by/')) return 'by';
  return 'pl';
}

const currentLang = detectLanguage();
const texts = translations[currentLang];

// Р¤СѓРЅРєС†РёСЏ СЃРєР»РѕРЅРµРЅРёСЏ РґР»СЏ СЃР»Р°РІСЏРЅСЃРєРёС… СЏР·С‹РєРѕРІ
function getPlural(count, forms) {
  if (currentLang === 'en') {
    return count === 1 ? forms[1] : forms[2];
  }
  
  if (count === 0 || count > 4) return forms[0] || forms[5];
  if (count === 1) return forms[1];
  if (count > 1 && count < 5) return forms[2];
  return forms[0];
}

// РџРѕР»СѓС‡РµРЅРёРµ Р·Р°РіРѕР»РѕРІРєР° РєРЅРѕРїРєРё
function getButtonTitle(button) {
  if (button.id === 1) {
    return getPlural(button.count, texts.rooms);
  } else if (button.id === 2) {
    return getPlural(button.count, texts.bathrooms);
  } else if (button.id === 3) {
    return getPlural(button.count, texts.windows);
  }
  return '';
}

// РћР±РЅРѕРІР»РµРЅРёРµ РѕС‚РѕР±СЂР°Р¶РµРЅРёСЏ
function updateDisplay() {
  vm.buttons.forEach(button => {
    const countElement = document.querySelector(`[data-button-id="${button.id}"] .pokj`);
    if (countElement) {
      countElement.textContent = `${button.count} ${getButtonTitle(button)}`;
    }
  });
  
  // РћР±РЅРѕРІР»СЏРµРј selectedItems
  vm.selectedItems = vm.buttons
    .filter(b => b.count > 0)
    .map(b => ({ id: b.id, title: getButtonTitle(b), count: b.count }));
  
  // РћР±РЅРѕРІР»СЏРµРј СѓСЃР»РѕРІРёРµ
  vm.isConditionMet = vm.selectedItems.length === 0;
  
  // РћР±РЅРѕРІР»СЏРµРј РґР°РЅРЅС‹Рµ РґР»СЏ С„РѕСЂРјС‹
  vm.selectedItemsData = vm.selectedItems
    .map(item => `${item.id} - ${item.title}: ${item.count}`)
    .join(', ');
}

// РРЅРёС†РёР°Р»РёР·Р°С†РёСЏ СЃС‡РµС‚С‡РёРєРѕРІ
function initCounters() {
  const app = document.getElementById('app');
  if (!app) return;
  
  vm.$el = app;
  
  // РЎРѕР·РґР°РµРј HTML РґР»СЏ СЂР°РґРёРѕРєРЅРѕРїРѕРє
  const cleaningTypeHTML = `
    <div class="cleaning-type-toggle">
      <section>
        <input type="radio" value="generalna" name="cleaningType" id="radio-generalna">
        <label for="radio-generalna">${texts.generalna}</label>
      </section>
      <section>
        <input type="radio" value="kompleksowa" name="cleaningType" id="radio-kompleksowa" checked>
        <label for="radio-kompleksowa">${texts.kompleksowa}</label>
      </section>
    </div>
  `;
  
  // РЎРѕР·РґР°РµРј HTML РґР»СЏ РєРЅРѕРїРѕРє СЃС‡РµС‚С‡РёРєРѕРІ
  const buttonsHTML = vm.buttons.map(button => `
    <div class="pokoj-btn" data-button-id="${button.id}">
      <button class="btn-minus" data-action="decrement" data-id="${button.id}" aria-label="Button minus">
        <div class="minus">
          <img class="minus-ico" alt="" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iNSIgdmlld0JveD0iMCAwIDE2IDUiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0wIDQuNjcyVjBIMTZWNC42NzJIMFoiIGZpbGw9ImJsYWNrIi8+Cjwvc3ZnPgo=" />
        </div>
      </button>
      <b class="pokj">${button.count} ${getButtonTitle(button)}</b>
      <button class="btn-plus" data-action="increment" data-id="${button.id}" aria-label="Button plus">
        <div class="plus">
          <img class="plus-ico" alt="" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTUuNTE3MjQgMTZWMEgxMC41MTUyVjE2SDUuNTE3MjRaTTAgMTAuNDUzOFY1LjU0NjIySDE2VjEwLjQ1MzhIMFoiIGZpbGw9ImJsYWNrIi8+Cjwvc3ZnPgo=" />
        </div>
      </button>
    </div>
  `).join('');
  
  // РЎРѕР·РґР°С‘Рј РѕР±С‘СЂС‚РєСѓ change-block
  const changeBlock = document.createElement('div');
  changeBlock.className = 'change-block';
  changeBlock.innerHTML = cleaningTypeHTML + buttonsHTML;
  
  // РќР°С…РѕРґРёРј РєРЅРѕРїРєСѓ "РЈР·РЅР°С‚СЊ С†РµРЅСѓ" РєРѕС‚РѕСЂР°СЏ СѓР¶Рµ РµСЃС‚СЊ РІ HTML
  const showModalBtn = document.getElementById('show-modal');
  
  // РћС‡РёС‰Р°РµРј app Рё РґРѕР±Р°РІР»СЏРµРј change-block
  app.innerHTML = '';
  app.appendChild(changeBlock);
  
  // Р”РѕР±Р°РІР»СЏРµРј РєРЅРѕРїРєСѓ РІ change-block
  if (showModalBtn) {
    changeBlock.appendChild(showModalBtn);
  }
  
  // РћР±СЂР°Р±РѕС‚С‡РёРєРё РґР»СЏ СЂР°РґРёРѕРєРЅРѕРїРѕРє
  const radioInputs = app.querySelectorAll('input[type="radio"]');
  radioInputs.forEach(radio => {
    radio.addEventListener('change', (e) => {
      vm.cleaningType = e.target.value;
      console.log('РўРёРї СѓР±РѕСЂРєРё РёР·РјРµРЅРµРЅ РЅР°:', vm.cleaningType);
    });
  });
  
  // РЈСЃС‚Р°РЅР°РІР»РёРІР°РµРј РЅР°С‡Р°Р»СЊРЅРѕРµ Р·РЅР°С‡РµРЅРёРµ РёР· checked СЂР°РґРёРѕРєРЅРѕРїРєРё
  const checkedRadio = app.querySelector('input[type="radio"]:checked');
  if (checkedRadio) {
    vm.cleaningType = checkedRadio.value;
    console.log('РќР°С‡Р°Р»СЊРЅС‹Р№ С‚РёРї СѓР±РѕСЂРєРё:', vm.cleaningType);
  }
  
  // РћР±СЂР°Р±РѕС‚С‡РёРєРё РґР»СЏ РєРЅРѕРїРѕРє +/-
  app.addEventListener('click', (e) => {
    const button = e.target.closest('[data-action]');
    if (!button) return;
    
    const action = button.dataset.action;
    const id = parseInt(button.dataset.id);
    const vmButton = vm.buttons.find(b => b.id === id);
    
    if (!vmButton) return;
    
    if (action === 'increment') {
      vmButton.count++;
    } else if (action === 'decrement' && vmButton.count > 0) {
      vmButton.count--;
    }
    
    vmButton.title = getButtonTitle(vmButton);
    updateDisplay();
  });
  
  // РћР±СЂР°Р±РѕС‚С‡РёРє СЃР±СЂРѕСЃР°
  window.addEventListener('reset-button-counter', () => {
    vm.buttons.forEach(button => {
      button.count = 0;
      button.title = getButtonTitle(button);
    });
    vm.cleaningType = 'kompleksowa';
    const kompleksowaRadio = document.getElementById('radio-kompleksowa');
    if (kompleksowaRadio) kompleksowaRadio.checked = true;
    updateDisplay();
  });
  
  // РќР°С‡Р°Р»СЊРЅРѕРµ РѕР±РЅРѕРІР»РµРЅРёРµ
  updateDisplay();
}

// РРЅРёС†РёР°Р»РёР·Р°С†РёСЏ РїСЂРё Р·Р°РіСЂСѓР·РєРµ DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCounters);
} else {
  initCounters();
}



