class ButtonCounter {
  constructor() {
    this.cleaningType = 'kompleksowa';
    this.buttons = [
      { id: 1, title: '', count: 0 },
      { id: 2, title: '', count: 0 },
      { id: 3, title: '', count: 0 }
    ];
    this.selectedItems = [];
    this.isConditionMet = true;
    this.init();
  }

  getButtonTitle(button) {
    const titles = {
      1: { 1: 'комната', 2: 'комнаты', 5: 'комнат' },
      2: { 1: 'санузел', 2: 'санузла', 5: 'санузлов' },
      3: { 1: 'окно', 2: 'окна', 5: 'окон' }
    };
    const t = titles[button.id];
    if (button.count === 0 || button.count > 4) return t[5];
    if (button.count === 1) return t[1];
    return t[2];
  }

  increment(button) {
    button.count++;
    this.update(button);
  }

  decrement(button) {
    if (button.count > 0) {
      button.count--;
      this.update(button);
    }
  }

  update(button) {
    button.title = this.getButtonTitle(button);
    const idx = this.selectedItems.findIndex(i => i.id === button.id);
    if (idx !== -1) this.selectedItems[idx] = button;
    else this.selectedItems.push(button);
    this.isConditionMet = this.selectedItems.every(b => b.count === 0);
    this.updateUI(button);
    document.dispatchEvent(new CustomEvent('count-updated', { detail: button }));
  }

  updateUI(button) {
    const btns = document.querySelectorAll('.pokoj-btn');
    const btn = btns[button.id - 1];
    if (btn) {
      btn.querySelector('.pokj').textContent = `${button.count} ${this.getButtonTitle(button)}`;
      btn.querySelector('.btn-minus').disabled = button.count === 0;
    }
  }

  init() {
    const changeBlock = document.querySelector('.change-block');
    if (!changeBlock) return;
    
    const html = `
      <div class="cleaning-type-toggle">
        <section>
          <input type="radio" value="generalna" name="cleaningType">
          <label>Генеральная уборка</label>
        </section>
        <section>
          <input type="radio" value="kompleksowa" name="cleaningType" checked>
          <label>Стандартная уборка</label>
        </section>
      </div>
      ${this.buttons.map(b => `
        <div class="pokoj-btn">
          <button class="btn-minus" data-id="${b.id}" disabled>
            <div class="minus">
              <img class="minus-ico" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iNSIgdmlld0JveD0iMCAwIDE2IDUiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0wIDQuNjcyVjBIMTZWNC42NzJIMFoiIGZpbGw9ImJsYWNrIi8+Cjwvc3ZnPgo=" />
            </div>
          </button>
          <b class="pokj">0 ${this.getButtonTitle(b)}</b>
          <button class="btn-plus" data-id="${b.id}">
            <div class="plus">
              <img class="plus-ico" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTUuNTE3MjQgMTZWMEgxMC41MTUyVjE2SDUuNTE3MjRaTTAgMTAuNDUzOFY1LjU0NjIySDE2VjEwLjQ1MzhIMFoiIGZpbGw9ImJsYWNrIi8+Cjwvc3ZnPgo=" />
            </div>
          </button>
        </div>
      `).join('')}
    `;
    
    changeBlock.insertAdjacentHTML('afterbegin', html);
    this.attachEvents();
  }

  attachEvents() {
    document.querySelector('.change-block').addEventListener('click', (e) => {
      const id = parseInt(e.target.closest('button')?.dataset.id);
      if (!id) return;
      const button = this.buttons.find(b => b.id === id);
      if (e.target.closest('.btn-plus')) this.increment(button);
      if (e.target.closest('.btn-minus')) this.decrement(button);
    });
    document.querySelector('.change-block').addEventListener('change', (e) => {
      if (e.target.name === 'cleaningType') {
        this.cleaningType = e.target.value;
        document.dispatchEvent(new CustomEvent('cleaning-type-updated', { detail: this.cleaningType }));
      }
    });
  }
}

window.vm = null;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { window.vm = new ButtonCounter(); });
} else {
  window.vm = new ButtonCounter();
}
