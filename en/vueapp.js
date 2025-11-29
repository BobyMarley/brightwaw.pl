const app = Vue.createApp({
  data() {
    return {
      selectedItems: [],
      isConditionMet: true,
      selectedItemsData: '',
      cleaningType: ''
    };
  },
  methods: {
    handleCountUpdated(button) {
      const index = this.selectedItems.findIndex(item => item.id === button.id);
      if (index !== -1) {
        this.selectedItems[index].count = button.count;
      } else {
        this.selectedItems.push({ id: button.id, title: button.title, count: button.count });
      }
      if (button.count === 0) {
        this.selectedItemsData = '';
        this.isConditionMet = true;
      } else {
        this.selectedItemsData = this.selectedItems.map(({ id, title, count }) => `${id} - ${title}: ${count}`).join(', ');
        this.isConditionMet = false;
      }
    },
    handleCleaningTypeUpdated(cleaningType) { // Добавлена функция для обновления cleaningType
      this.cleaningType = cleaningType;
    },
    reset() {
      this.selectedItems = [];
      this.cleaningType = 'general'; // Добавлено значение по умолчанию для cleaningType
    }
  },
  mounted() {
    window.addEventListener('reset-button-counter', this.reset);
  }  
});

app.component('button-counter', {
  emits: ['count-updated', 'cleaning-type-updated'],
  data() {
    return {     
      cleaningType: 'general',
      buttons: [
      { id: 1, title: '', count: 0 },
      { id: 2, title: '', count: 0 },
      { id: 3, title: '', count: 0 }
      ]
    };
  },
  methods: {
     increment(button) {
      button.count++;
      button.title = this.getButtonTitle(button);
      this.$emit('count-updated', button);
    },
    decrement(button) {
      button.count--;
      button.title = this.getButtonTitle(button);
      this.$emit('count-updated', button);
    },
    reset() {
      this.buttons.forEach(button => {
        button.count = 0;
        button.title = this.getButtonTitle(button);
      });
    },
    getButtonTitle(button) {
    if (button.id === 1) {
      if (button.count === 0 || button.count > 4 ) {
        return 'Rooms';
      } else if (button.count === 1) {
        return 'Room';}
      else if (button.count > 1 && button.count < 5) {
        return 'Rooms';
      }
    } else if (button.id === 2) {
      if (button.count === 1) {
        return 'Bathroom';
      } else if (button.count > 1 && button.count < 5) {
        return 'Bathroom';
      } else if (button.count === 0 || button.count > 4) {
        return 'Bathrooms';
      }
    } else if (button.id === 3) {
      if (button.count === 1) {
        return 'Window';
      } else if (button.count > 1 && button.count < 5) {
        return 'Windows';
      } else if (button.count === 0 || button.count > 4) {
        return 'Windows';
      }
    }
    return '';
   }     
  },
    mounted() {
      window.addEventListener('reset-button-counter', this.reset);      
    },  
    
  template: `
  <div class="cleaning-type-toggle">
    <section>
    <input type="radio" value="general" v-model="cleaningType" name="cleaningType" @change="$emit('cleaning-type-updated', cleaningType)">
      <label>General Cleaning</label>    
    </section>  
    <section>
      <input type="radio" value="complex" v-model="cleaningType" name="cleaningType" @change="$emit('cleaning-type-updated', cleaningType)">
      <label>Regular Сleaning</label>
    </section>
  </div>
  <div v-for="button in buttons" :key="button.id" class="pokoj-btn">        
    <button class="btn-minus" @click="decrement(button)" aria-label="Button minus" :disabled="button.count === 0">
      <div class="minus">
        <img class="minus-ico" alt="" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iNSIgdmlld0JveD0iMCAwIDE2IDUiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0wIDQuNjcyVjBIMTZWNC42NzJIMFoiIGZpbGw9ImJsYWNrIi8+Cjwvc3ZnPgo=" />
      </div>
    </button>
    <b class="pokj">{{ button.count }} {{ getButtonTitle(button) }}</b>
    <button class="btn-plus" @click="increment(button)" aria-label="Button plus">
      <div class="plus">
        <img class="plus-ico" alt="" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTUuNTE3MjQgMTZWMEgxMC41MTUyVjE2SDUuNTE3MjRaTTAgMTAuNDUzOFY1LjU0NjIySDE2VjEwLjQ1MzhIMFoiIGZpbGw9ImJsYWNrIi8+Cjwvc3ZnPgo=" />
      </div>
    </button>
  </div>
  `
});
const vm = app.mount('#app');