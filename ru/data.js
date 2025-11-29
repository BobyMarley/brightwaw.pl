 async function fetchCardsData() {
    try {
      const response = await fetch('/data/ru/priceData_ru.json');
      return await response.json();
    } catch (error) {
      console.error("Error loading card data from JSON file: " + error);
      throw error;
    }
  }

  async function fetchTabsData(fileName) {
    try {
      const response = await fetch(`/data/ru/${fileName}`);
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
      initTabHandlers();
    } catch (error) {
      console.error("Error while fetching and creating cards: " + error);
    }
  }
  function loadTabs(tabData) {
    try {
      const tabNumbers = [1, 2, 3, 4];

      tabNumbers.forEach(tabNumber => {
        const tabContent = document.querySelector(`.tab-content[data-item="${tabNumber}"]`);
        const tabDataItem = tabData[tabNumber.toString()];

        tabContent.innerHTML = `
          <div class="item">
            <div class="item-text">
              <h2>${tabDataItem.title}</h2>
              <h3>${tabDataItem.description}</h3>
              <ul>
                ${tabDataItem.items.map(item => `<li>${item}</li>`).join('')}
              </ul>
            </div>
          </div>
        `;
      });
    } catch (error) {
      console.error("Error while updating tabs: " + error);
    }
  }

  function initTabHandlers() {
    const tabs = document.querySelectorAll(".tab");
    const tabContents = document.querySelectorAll(".tab-content");
    tabs.forEach((tab) => {
      tab.addEventListener("click", function () {
        const item = this.getAttribute("data-item");
        tabs.forEach((t) => t.classList.remove("active"));
        tabContents.forEach((content) => content.classList.remove("active"));
        this.classList.add("active");
        document.querySelector(`.tab-content[data-item="${item}"]`).classList.add("active");
      });
    });
  }

  fetchAndCreateCards().then(() => {
    initTabHandlers();
  });