// Vanilla JS замена Vue.js - универсальная для всех языков
// Глобальный объект состояния (заменяет Vue instance)
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

// Тексты для разных языков
const translations = {
  pl: {
    rooms: { 0: 'pokoi', 1: 'pokój', 2: 'pokoje', 5: 'pokoi' },
    bathrooms: { 0: 'łazienek', 1: 'łazienka', 2: 'łazienki', 5: 'łazienek' },
    windows: { 0: 'okien', 1: 'okno', 2: 'okna', 5: 'okien' },
    generalna: 'Generalne sprzątanie',
    kompleksowa: 'Standardowe sprzątanie'
  },
  ru: {
    rooms: { 0: 'комнат', 1: 'комната', 2: 'комнаты', 5: 'комнат' },
    bathrooms: { 0: 'санузлов', 1: 'санузел', 2: 'санузла', 3: 'санузлов' },
    windows: { 0: 'окон', 1: 'окно', 2: 'окна', 5: 'окон' },
    generalna: 'Генеральная уборка',
    kompleksowa: 'Стандартная уборка'
  },
  en: {
    rooms: { 0: 'rooms', 1: 'room', 2: 'rooms' },
    bathrooms: { 0: 'bathrooms', 1: 'bathroom', 2: 'bathrooms' },
    windows: { 0: 'windows', 1: 'window', 2: 'windows' },
    generalna: 'Deep cleaning',
    kompleksowa: 'Standard cleaning'
  },
  by: {
    rooms: { 0: 'пакояў', 1: 'пакой', 2: 'пакоі', 5: 'пакояў' },
    bathrooms: { 0: 'санвузлоў', 1: 'санвузел', 2: 'санвузла', 3: 'санвузлоў' },
    windows: { 0: 'вокнаў', 1: 'акно', 2: 'вокны', 5: 'вокнаў' },
    generalna: 'Генеральная ўборка',
    kompleksowa: 'Стандартная ўборка'
  }
};

// Определяем язык из URL
function detectLanguage() {
  const path = window.location.pathname;
  if (path.includes('/ru/')) return 'ru';
  if (path.includes('/en/')) return 'en';
  if (path.includes('/by/')) return 'by';
  return 'pl';
}

const currentLang = detectLanguage();
const texts = translations[currentLang];

// Функция склонения для славянских языков
function getPlural(count, forms) {
  if (currentLang === 'en') {
    return count === 1 ? forms[1] : forms[2];
  }
  
  if (count === 0 || count > 4) return forms[0] || forms[5];
  if (count === 1) return forms[1];
  if (count > 1 && count < 5) return forms[2];
  return forms[0];
}

// Получение заголовка кнопки
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

// Обновление отображения
function updateDisplay() {
  vm.buttons.forEach(button => {
    const countElement = document.querySelector(`[data-button-id="${button.id}"] .pokj`);
    if (countElement) {
      countElement.textContent = `${button.count} ${getButtonTitle(button)}`;
    }
  });
  
  // Обновляем selectedItems
  vm.selectedItems = vm.buttons
    .filter(b => b.count > 0)
    .map(b => ({ id: b.id, title: getButtonTitle(b), count: b.count }));
  
  // Обновляем условие
  vm.isConditionMet = vm.selectedItems.length === 0;
  
  // Обновляем данные для формы
  vm.selectedItemsData = vm.selectedItems
    .map(item => `${item.id} - ${item.title}: ${item.count}`)
    .join(', ');
}

// Инициализация счетчиков
function initCounters() {
  const app = document.getElementById('app');
  if (!app) return;
  
  vm.$el = app;
  
  // Создаем HTML для радиокнопок
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
  
  // Создаем HTML для кнопок счетчиков
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
  
  // Создаём обёртку change-block
  const changeBlock = document.createElement('div');
  changeBlock.className = 'change-block';
  changeBlock.innerHTML = cleaningTypeHTML + buttonsHTML;
  
  // Находим кнопку "Узнать цену" которая уже есть в HTML
  const showModalBtn = document.getElementById('show-modal');
  
  // Очищаем app и добавляем change-block
  app.innerHTML = '';
  app.appendChild(changeBlock);
  
  // Добавляем кнопку в change-block
  if (showModalBtn) {
    changeBlock.appendChild(showModalBtn);
  }
  
  // Обработчики для радиокнопок
  const radioInputs = app.querySelectorAll('input[type="radio"]');
  radioInputs.forEach(radio => {
    radio.addEventListener('change', (e) => {
      vm.cleaningType = e.target.value;
      console.log('Тип уборки изменен на:', vm.cleaningType);
    });
  });
  
  // Устанавливаем начальное значение из checked радиокнопки
  const checkedRadio = app.querySelector('input[type="radio"]:checked');
  if (checkedRadio) {
    vm.cleaningType = checkedRadio.value;
    console.log('Начальный тип уборки:', vm.cleaningType);
  }
  
  // Обработчики для кнопок +/-
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
  
  // Обработчик сброса
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
  
  // Начальное обновление
  updateDisplay();
}

// Инициализация при загрузке DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCounters);
} else {
  initCounters();
}
