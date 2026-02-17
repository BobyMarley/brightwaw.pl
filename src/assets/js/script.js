(function() {
    'use strict';

    const CONFIG = {
        API_ENDPOINT: '/api/telegram_proxy',
        ANALYTICS_ID: 'AW-11273981561/8oZpCLqZjvUZEPmc7f8p',
        PARTICLES_COUNT: 30,
        SCROLL_THRESHOLD: 100
    };

    const Utils = {
        throttle(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => { clearTimeout(timeout); func(...args); };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },
        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => { clearTimeout(timeout); func(...args); };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },
        random(min, max) { return Math.random() * (max - min) + min; }
    };

    const Analytics = {
        reportConversion() {
            try {
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'conversion', { 'send_to': CONFIG.ANALYTICS_ID });
                }
            } catch (error) { console.error('РћС€РёР±РєР° РїСЂРё РѕС‚РїСЂР°РІРєРµ РєРѕРЅРІРµСЂСЃРёРё:', error); }
        }
    };

    const ParticleSystem = {
        container: null,
        particles: [],
        getParticleCount() {
            return (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 767px)').matches) ? 10 : CONFIG.PARTICLES_COUNT;
        },
        init() {
            this.container = document.querySelector('.particles');
            if (!this.container) return;
            this.createParticles();
        },
        createParticles() {
            const count = this.getParticleCount();
            for (let i = 0; i < count; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.left = Utils.random(0, 100) + '%';
                particle.style.animationDelay = Utils.random(0, 25) + 's';
                particle.style.animationDuration = Utils.random(15, 30) + 's';
                this.container.appendChild(particle);
                this.particles.push(particle);
            }
        },
        destroy() {
            this.particles.forEach(particle => particle.remove());
            this.particles = [];
        }
    };

    const Navigation = {
        hamburger: null, mobileMenu: null, header: null,
        init() {
            this.hamburger = document.querySelector('.hamburger');
            this.mobileMenu = document.querySelector('.mobile-menu');
            this.header = document.querySelector('.header');
            this.bindEvents();
            this.initScrollEffect();
            this.initSmoothScrolling();
        },
        bindEvents() {
            if (this.hamburger && this.mobileMenu) {
                this.hamburger.addEventListener('click', () => this.toggleMobileMenu());
            }
        },
        toggleMobileMenu() {
            this.hamburger.classList.toggle('active');
            this.mobileMenu.classList.toggle('active');
            document.body.style.overflow = this.mobileMenu.classList.contains('active') ? 'hidden' : 'auto';
        },
        closeMobileMenu() {
            this.hamburger.classList.remove('active');
            this.mobileMenu.classList.remove('active');
            document.body.style.overflow = 'auto';
        },
        initScrollEffect() {
            const handleScroll = Utils.throttle(() => {
                if (window.scrollY > CONFIG.SCROLL_THRESHOLD) {
                    this.header.classList.add('scrolled');
                } else {
                    this.header.classList.remove('scrolled');
                }
            }, 16);
            window.addEventListener('scroll', handleScroll, { passive: true });
        },
        initSmoothScrolling() {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', (e) => {
                    e.preventDefault();
                    const target = document.querySelector(anchor.getAttribute('href'));
                    if (target) {
                        const headerHeight = this.header.offsetHeight;
                        const targetPosition = target.offsetTop - headerHeight - 20;
                        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
                        this.closeMobileMenu();
                    }
                });
            });
        }
    };

    const ModalScrollEnhancements = {
        modalContent: null,
        init() {
            this.modalContent = document.querySelector('.modal-content');
            if (!this.modalContent) return;
            this.modalContent.addEventListener('scroll', () => this.updateScrollState(), { passive: true });
        },
        updateScrollState() {
            if (!this.modalContent) return;
            const scrollTop = this.modalContent.scrollTop;
            const scrollHeight = this.modalContent.scrollHeight;
            const clientHeight = this.modalContent.clientHeight;
            if (scrollTop === 0) {
                this.modalContent.setAttribute('data-scroll', 'top');
            } else if (scrollTop + clientHeight >= scrollHeight - 5) {
                this.modalContent.setAttribute('data-scroll', 'bottom');
            } else {
                this.modalContent.setAttribute('data-scroll', 'middle');
            }
        }
    };

    const Modal = {
        modal: null,
        form: null, // в†ђ Р’РђР–РќРћ: РґРѕР±Р°РІР»РµРЅРѕ
        init() {
            this.modal = document.getElementById('modal');
            this.form = document.getElementById('cleaningForm'); // в†ђ Р’РђР–РќРћ: РґРѕР±Р°РІР»РµРЅРѕ
            this.bindEvents();
            this.bindServiceButtons();
        },
        bindEvents() {
            const openButton = document.getElementById('openModal');
            if (openButton) openButton.addEventListener('click', () => this.open());
            const closeButton = document.querySelector('.close-button');
            if (closeButton) closeButton.addEventListener('click', () => this.close());
            if (this.modal) {
                this.modal.addEventListener('click', (e) => { if (e.target === this.modal) this.close(); });
            }
            document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && this.modal?.style.display === 'block') this.close(); });
        },
        bindServiceButtons() {
            document.querySelectorAll('.select-service').forEach(button => {
                button.addEventListener('click', () => {
                    const serviceName = button.dataset.service;
                    this.open(serviceName);
                });
            });
        },
        open(selectedService = '') {
            if (!this.modal || !this.form) return;
            this.modal.style.display = 'block';
            document.body.style.overflow = 'hidden';

            // РЎР±СЂРѕСЃ С„РѕСЂРјС‹
            this.form.querySelectorAll('.quantity-input').forEach(input => {
                input.value = 0;
                const decBtn = input.parentElement.querySelector('[data-action="decrease"]');
                if (decBtn) decBtn.disabled = true;
            });
            const pillowsCheckbox = this.form.querySelector('[name="sofa_pillows"]');
            if (pillowsCheckbox) pillowsCheckbox.checked = false;

            // РђРІС‚РѕР·Р°РїРѕР»РЅРµРЅРёРµ РїСЂРё РІС‹Р±РѕСЂРµ СѓСЃР»СѓРіРё РёР· РєР°СЂС‚РѕС‡РєРё
            if (selectedService) {
                const wrapper = this.modal.querySelector(`.service-item-wrapper[data-service-name="${selectedService}"]`);
                if (wrapper) {
                    const input = wrapper.querySelector('.quantity-input');
                    const decBtn = wrapper.querySelector('[data-action="decrease"]');
                    if (input.dataset.serviceType === 'area') {
                        input.value = 3; // РјРёРЅРёРјСѓРј РґР»СЏ Dywan
                    } else {
                        input.value = 1;
                    }
                    if (decBtn) decBtn.disabled = false;
                }
            }

            setTimeout(() => {
                ModalScrollEnhancements.updateScrollState();
                const firstInput = this.modal.querySelector('input:not([type="number"])');
                if (firstInput) firstInput.focus();
            }, 100);
        },
        close() {
            if (!this.modal) return;
            this.modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    };

    const FORM_MIN_ORDER = 160;
    const FORM_SERVICE_PRICES = {
        'Sofa': { price: 180, type: 'quantity' },
        'Dywan': { price: 15, type: 'area' },
        'Fotel': { price: 40, type: 'quantity' },
        'KrzesЕ‚o': { price: 40, type: 'quantity' },
        'Materac': { price: 90, type: 'quantity' },
        'Pakiet': { price: 300, type: 'quantity' }
    };
    const Form = {
        form: null,
        feedback: null,
        init() {
            this.form = document.getElementById('cleaningForm');
            this.feedback = document.getElementById('formFeedback');
            if (this.form) {
                this.bindEvents();
                this.bindQuantityButtons();
            }
        },
        getFormOrderTotal() {
            let total = 0;
            this.form.querySelectorAll('.service-item-wrapper').forEach(item => {
                const name = item.dataset.serviceName;
                const cfg = FORM_SERVICE_PRICES[name];
                if (!cfg) return;
                const input = item.querySelector('.quantity-input');
                const value = parseInt(input && input.value, 10) || 0;
                total += value * cfg.price;
            });
            return total;
        },
        bindQuantityButtons() {
            this.form.addEventListener('click', (e) => {
                if (!e.target.matches('.quantity-btn')) return;
                const action = e.target.dataset.action;
                const input = e.target.parentElement.querySelector('.quantity-input');
                const decBtn = e.target.parentElement.querySelector('[data-action="decrease"]');
                let val = parseInt(input.value, 10);
                const min = parseInt(input.min, 10) || 0;
                const max = parseInt(input.max, 10) || Infinity;

                if (action === 'increase') val = Math.min(max, val + 1);
                else if (action === 'decrease') val = Math.max(min, val - 1);

                input.value = val;
                if (decBtn) decBtn.disabled = val <= min;
            });
        },
        bindEvents() {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        },
        async handleSubmit(e) {
            e.preventDefault();
            const submitButton = this.form.querySelector('.submit-btn');
            const orderTotal = this.getFormOrderTotal();
            if (orderTotal < FORM_MIN_ORDER) {
                const minOrderModal = document.getElementById('minOrderModal');
                if (minOrderModal) {
                    minOrderModal.style.display = 'flex';
                    minOrderModal.style.alignItems = 'center';
                    minOrderModal.style.justifyContent = 'center';
                }
                this.showFeedback('Minimalna kwota zamГіwienia to 160 zЕ‚. Dodaj usЕ‚ugi na tД™ kwotД™.', 'error');
                return;
            }
            const data = this.extractFormData();
            const validation = this.validateForm(data);

            if (!validation.isValid) {
                this.showFeedback(validation.message, 'error');
                return;
            }

            submitButton.disabled = true;
            this.showFeedback('WysyЕ‚anie zgЕ‚oszenia...', 'info');

            try {
                await this.submitToServer(data);
                this.showFeedback('вњ“ ZgЕ‚oszenie wysЕ‚ane pomyЕ›lnie! Skontaktujemy siД™ wkrГіtce.', 'success');
                Analytics.reportConversion();
                this.form.reset();
                this.form.querySelectorAll('.quantity-input').forEach(input => {
                    input.value = 0;
                    const decBtn = input.parentElement.querySelector('[data-action="decrease"]');
                    if (decBtn) decBtn.disabled = true;
                });
                setTimeout(() => {
                    Modal.close();
                    this.showFeedback('', 'info');
                }, 3000);
            } catch (error) {
                console.error('BЕ‚Д…d wysyЕ‚ania:', error);
                this.showFeedback('WystД…piЕ‚ bЕ‚Д…d podczas wysyЕ‚ania. SprГіbuj ponownie.', 'error');
            } finally {
                submitButton.disabled = false;
            }
        },
        extractFormData() {
            const formData = new FormData(this.form);
            const services = [];

            this.form.querySelectorAll('.service-item-wrapper').forEach(item => {
                const input = item.querySelector('.quantity-input');
                const value = parseInt(input.value, 10);
                if (value <= 0) return;

                const serviceName = item.dataset.serviceName;
                let str = '';

                if (input.dataset.serviceType === 'quantity') {
                    str = `${serviceName} (${value} szt.)`;
                    if (serviceName === 'Sofa') {
                        const pillows = this.form.querySelector('[name="sofa_pillows"]');
                        if (pillows?.checked) {
                            str += ' (z poduszkami)'; // в†ђ РјРѕР¶РЅРѕ РѕСЃС‚Р°РІРёС‚СЊ СЂСѓСЃСЃРєРёР№ РІР°СЂРёР°РЅС‚, РµСЃР»Рё Р°РґРјРёРЅ СЂСѓСЃСЃРєРёР№
                        }
                    }
                } else if (input.dataset.serviceType === 'area') {
                    str = `${serviceName} (${value} mВІ)`;
                }
                services.push(str);
            });

            return {
                services,
                address: formData.get('address')?.trim() || '',
                comments: formData.get('comments')?.trim() || '',
                name: formData.get('name')?.trim() || '',
                phone: formData.get('phone')?.trim() || ''
            };
        },
        validateForm(data) {
            if (data.services.length === 0) {
                return { isValid: false, message: 'ProszД™ wybraД‡ przynajmniej jednД… usЕ‚ugД™.' };
            }

            // РџСЂРѕРІРµСЂРєР° РјРёРЅРёРјР°Р»СЊРЅРѕРіРѕ Р·Р°РєР°Р·Р° Dywan вЂ” 3 РјВІ
            const carpetInput = this.form.querySelector('[data-service-name="Dywan"] .quantity-input');
            if (carpetInput && parseInt(carpetInput.value, 10) > 0 && parseInt(carpetInput.value, 10) < 3) {
                return { isValid: false, message: 'Minimalne zamГіwienie dla dywanu to 3 mВІ.' };
            }

            if (!data.name) {
                return { isValid: false, message: 'ProszД™ podaД‡ swoje imiД™.' };
            }

            const phoneRegex = /^[+]?[\d\s\-\(\)]{7,}$/;
            if (!phoneRegex.test(data.phone)) {
                return { isValid: false, message: 'ProszД™ podaД‡ poprawny numer telefonu.' };
            }

            if (!data.address) {
                return { isValid: false, message: 'ProszД™ podaД‡ adres.' };
            }

            return { isValid: true };
        },
        async submitToServer(data) {
            const message = this.formatTelegramMessage(data);
            const response = await fetch(CONFIG.API_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });
            if (!response.ok) {
                const err = await response.json().catch(() => null);
                throw new Error(err?.message || `HTTP ${response.status}`);
            }
            return response.json();
        },
        formatTelegramMessage(data) {
            const timestamp = new Date().toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' });
            const servicesString = data.services.join('\n- ');
            return `<b>рџ†• Nowe zgЕ‚oszenie - pranie mebli</b>\n\n<b>UsЕ‚ugi:</b>\n- ${servicesString}\n\n<b>Adres:</b> ${data.address}\n<b>ImiД™:</b> ${data.name}\n<b>Telefon:</b> <a href="tel:${data.phone}">${data.phone}</a>\n${data.comments ? `<b>Komentarz:</b> ${data.comments}` : ''}\n\n<b>Czas:</b> ${timestamp}`;
        },
        showFeedback(message, type = 'info') {
            if (!this.feedback) return;
            const classes = { success: 'text-success', error: 'text-error', info: 'text-secondary' };
            this.feedback.innerHTML = `<span class="${classes[type]}">${message}</span>`;
        }
    };

    const Calculator = {
        MIN_ORDER: 160,
        prices: { sofa: 180, carpet: 15, chair: 40, mattress: 90 },
        values: { sofa: 0, carpet: 0, chair: 0, mattress: 0 },
        init() {
            document.querySelectorAll('.calc-btn').forEach(btn => {
                btn.addEventListener('click', (e) => this.handleCalc(e));
            });
            const orderBtn = document.getElementById('calcOrderBtn');
            if (orderBtn) orderBtn.addEventListener('click', () => this.openModalWithCalc());
            const minOrderModal = document.getElementById('minOrderModal');
            const minOrderClose = document.getElementById('minOrderModalClose');
            if (minOrderClose && minOrderModal) {
                minOrderClose.addEventListener('click', () => { minOrderModal.style.display = 'none'; });
                minOrderModal.addEventListener('click', (e) => { if (e.target === minOrderModal) minOrderModal.style.display = 'none'; });
            }
        },
        getTotal() {
            let total = 0;
            for (let key in this.values) total += this.values[key] * this.prices[key];
            return total;
        },
        handleCalc(e) {
            const btn = e.target;
            const type = btn.dataset.calc;
            const action = btn.dataset.action;
            if (action === 'plus') this.values[type]++;
            else if (action === 'minus' && this.values[type] > 0) this.values[type]--;

            this.updateDisplay(type);
            this.updateTotal();
        },
        updateDisplay(type) {
            const el = document.querySelector(`[data-calc-display="${type}"]`);
            if (el) el.textContent = this.values[type];
        },
        updateTotal() {
            let total = 0;
            for (let key in this.values) total += this.values[key] * this.prices[key];
            const el = document.getElementById('calcTotal');
            if (el) el.textContent = total + ' zЕ‚';
            const discountRow = document.getElementById('calcTotalDiscountRow');
            const discountEl = document.getElementById('calcTotalDiscount');
            if (total > 0 && discountRow && discountEl) {
                const final = Math.round(total * 0.9);
                discountEl.textContent = final + ' zЕ‚';
                discountRow.style.display = '';
            } else if (discountRow) discountRow.style.display = 'none';
        },
        openModalWithCalc() {
            const total = this.getTotal();
            if (total < this.MIN_ORDER) {
                const minOrderModal = document.getElementById('minOrderModal');
                const minOrderNote = document.getElementById('calcMinOrderNote');
                if (minOrderModal) {
                    minOrderModal.style.display = 'flex';
                    minOrderModal.style.alignItems = 'center';
                    minOrderModal.style.justifyContent = 'center';
                }
                if (minOrderNote) {
                    minOrderNote.classList.add('calc-min-order-highlight');
                    setTimeout(() => minOrderNote.classList.remove('calc-min-order-highlight'), 3000);
                }
                return;
            }
            Modal.open();
            const map = { sofa: 'Sofa', carpet: 'Dywan', chair: 'Fotel', mattress: 'Materac' };
            for (let key in this.values) {
                if (this.values[key] > 0) {
                    const name = map[key];
                    const wrapper = document.querySelector(`.service-item-wrapper[data-service-name="${name}"]`);
                    if (wrapper) {
                        const input = wrapper.querySelector('.quantity-input');
                        const decBtn = wrapper.querySelector('[data-action="decrease"]');
                        input.value = this.values[key];
                        if (decBtn) decBtn.disabled = false;
                    }
                }
            }
        }
    };

    const PromoTimer = {
        endTime: null,
        init() {
            const saved = localStorage.getItem('promoEndTime');
            this.endTime = saved ? new Date(saved) : new Date(Date.now() + 24*60*60*1000);
            if (!saved) localStorage.setItem('promoEndTime', this.endTime);

            this.updateTimer();
            setInterval(() => this.updateTimer(), 1000);

            const btn = document.getElementById('promoOrderBtn');
            if (btn) btn.addEventListener('click', () => Modal.open());
        },
        updateTimer() {
            const diff = this.endTime - new Date();
            if (diff <= 0) {
                this.endTime = new Date(Date.now() + 24*60*60*1000);
                localStorage.setItem('promoEndTime', this.endTime);
                return;
            }
            const h = Math.floor(diff / (1000*60*60));
            const m = Math.floor((diff % (1000*60*60)) / (1000*60));
            const s = Math.floor((diff % (1000*60)) / 1000);
            if (document.getElementById('hours')) document.getElementById('hours').textContent = String(h).padStart(2,'0');
            if (document.getElementById('minutes')) document.getElementById('minutes').textContent = String(m).padStart(2,'0');
            if (document.getElementById('seconds')) document.getElementById('seconds').textContent = String(s).padStart(2,'0');
        }
    };

    function init() {
        Navigation.init();
        Modal.init();
        Form.init();
        ModalScrollEnhancements.init();
        Calculator.init();
        PromoTimer.init();
        setTimeout(() => ParticleSystem.init(), 3000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();



