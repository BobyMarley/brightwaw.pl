 async function fetchCardsData() {
    try {
      const response = await fetch('/data/ru/priceData_ru.json?v=16');
      return await response.json();
    } catch (error) {
      console.error("Error loading card data from JSON file: " + error);
      throw error;
    }
  }

  async function fetchTabsData(fileName) {
    try {
      const response = await fetch(`/data/ru/${fileName}?v=16`);
      return await response.json();
    } catch (error) {
      console.error("Error loading tab data from JSON file: " + error);
      throw error;
    }
  }

  async function createCardElement(cardId, initialType, cardData) {
    const card = document.createElement("div");
    const cardsContainer = document.querySelector('.cards');
    card.classList.add("card");
    card.id = cardId;

    const cardContent = document.createElement("div");
    cardContent.classList.add("card-content");

    cardContent.innerHTML = `
      <h3>${cardData[cardId][initialType].roomCount}</h3>    
      <p class="price"><span class="price-value">${cardData[cardId][initialType].price}</span></p>
      <!--<p class="description">${cardData[cardId][initialType].description}</p>-->
      <section class="cards-input">
        <input type="radio" name="cleaning-type-${cardId}" data-card="${cardId}" data-item="0" value="kompleksowa" checked>
        <label>Стандартная уборка</label>
      </section>
      <section class="cards-input">
        <input type="radio" name="cleaning-type-${cardId}" data-card="${cardId}" data-item="1" value="generalna">
        <label>Генеральная уборка</label>
      </section>
    `;

    card.appendChild(cardContent);
    return card;
  }
  async function fetchAndCreateCards() {
    try {
      const [cardsData, tabsDataKompleksowa] = await Promise.all([
        fetchCardsData(),
        fetchTabsData("tabData_ru_kompleksowa.json")
      ]);

      const cardsContainer = document.querySelector(".cards-container");
      
      await Promise.all(Object.keys(cardsData).map(async (cardId) => {
        const initialType = "kompleksowa";
        const cardElement = await createCardElement(cardId, initialType, cardsData);
        cardsContainer.appendChild(cardElement);
      }));

      const radioInputs = document.querySelectorAll('input[type="radio"]');
      radioInputs.forEach(input => {
        input.addEventListener("change", async () => {
          const cardId = input.getAttribute("data-card");
          const priceValue = document.querySelector(`#${cardId} .price-value`);
          const selectedType = input.value;
          priceValue.textContent = cardsData[cardId][selectedType].price;

          const heading = document.getElementById("cleaning-type-heading");
          heading.textContent = selectedType === "kompleksowa" ? "Что включает стандартная уборка" : "Что включает генеральная уборка";
          
          const fileName = selectedType === "kompleksowa" ? "tabData_ru_kompleksowa.json" : "tabData_ru_generalna.json";
          const newTabsData = await fetchTabsData(fileName);
          loadTabs(newTabsData);
        });
      });
      
      loadTabs(tabsDataKompleksowa);
      initCleaningTypeButtons();
    } catch (error) {
      console.error("Error while fetching and creating cards: " + error);
    }
  }
  
  function initCleaningTypeButtons() {
    const buttons = document.querySelectorAll('.cleaning-type-btn');
    
    buttons.forEach(button => {
      button.addEventListener('click', async function() {
        const type = this.getAttribute('data-type');
        
        buttons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        
        const heading = document.getElementById('cleaning-type-heading');
        heading.textContent = type === 'kompleksowa' ? 'Что Входит в Стандартную Уборку' : 'Что Входит в Генеральную Уборку';
        
        const fileName = type === 'kompleksowa' ? 'tabData_ru_kompleksowa.json' : 'tabData_ru_generalna.json';
        const newTabsData = await fetchTabsData(fileName);
        loadTabs(newTabsData);
      });
    });
  }
  const roomIcons = {
    '1': ['fa-broom', 'fa-couch', 'fa-utensils', 'fa-lightbulb', 'fa-window-maximize', 'fa-tv', 'fa-plug', 'fa-image', 'fa-check', 'fa-door-open', 'fa-couch', 'fa-bed', 'fa-broom', 'fa-couch', 'fa-box', 'fa-arrows-up-down-left-right', 'fa-bars', 'fa-hand-sparkles'],
    '2': ['fa-broom', 'fa-check', 'fa-box', 'fa-plug', 'fa-broom', 'fa-box', 'fa-bars', 'fa-hand-sparkles', 'fa-arrows-up-down-left-right'],
    '3': ['fa-kitchen-set', 'fa-droplet', 'fa-utensils', 'fa-fire', 'fa-fire-burner', 'fa-sink', 'fa-faucet', 'fa-trash-can', 'fa-trash-can', 'fa-temperature-low', 'fa-plug', 'fa-broom', 'fa-box', 'fa-temperature-low', 'fa-fire', 'fa-wind', 'fa-bars', 'fa-hand-sparkles'],
    '4': ['fa-shower', 'fa-droplet', 'fa-bath', 'fa-faucet', 'fa-toilet', 'fa-box', 'fa-temperature-half', 'fa-washing-machine', 'fa-plug', 'fa-broom', 'fa-box', 'fa-wind', 'fa-arrows-up-down-left-right', 'fa-bars', 'fa-hand-sparkles']
  };
  
  function loadTabs(tabData) {
    try {
      const tabNumbers = [1, 2, 3, 4];
      const roomEmojis = {1: '🛏️', 2: '🚪', 3: '🍳', 4: '🛁'};

      tabNumbers.forEach(tabNumber => {
        const cleaningContent = document.querySelector(`.cleaning-content[data-room="${tabNumber}"]`);
        const tabDataItem = tabData[tabNumber.toString()];
        const icons = roomIcons[tabNumber.toString()];

        const roomImages = {
          '1': '/public/rooms/room.png',
          '2': '/public/rooms/corridor.png',
          '3': '/public/rooms/kitchen.png',
          '4': '/public/rooms/bathroom.png'
        };

        cleaningContent.innerHTML = `
          <div>
            <ul>
              ${tabDataItem.items.map((item, index) => `<li><i class="fa-solid ${icons[index] || 'fa-check'}"></i>${item}</li>`).join('')}
            </ul>
          </div>
          <div class="cleaning-image">
            <img src="${roomImages[tabNumber.toString()]}" alt="${tabDataItem.title || 'Уборка'}" style="width:100%;height:100%;object-fit:cover;border-radius:12px;" />
          </div>
        `;
      });
      
      initCleaningTabs();
    } catch (error) {
      console.error("Error while updating tabs: " + error);
    }
  }
  
  function initCleaningTabs() {
    const tabs = document.querySelectorAll('.cleaning-tab');
    const contents = document.querySelectorAll('.cleaning-content');
    
    tabs.forEach(tab => {
      tab.addEventListener('click', function() {
        const roomId = this.getAttribute('data-room');
        
        tabs.forEach(t => t.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));
        
        this.classList.add('active');
        document.querySelector(`.cleaning-content[data-room="${roomId}"]`).classList.add('active');
      });
    });
  }

  fetchAndCreateCards();