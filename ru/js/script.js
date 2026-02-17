(function() {
    'use strict';

    // ===== КОНФИГУРАЦИЯ =====
    const CONFIG = {
        API_ENDPOINT: '/telegram_proxy.php',
        ANALYTICS_ID: 'AW-11273981561/8oZpCLqZjvUZEPmc7f8p',
        PARTICLES_COUNT: 30,
        SCROLL_THRESHOLD: 100
    };

    // ===== УТИЛИТЫ =====
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

    // ===== GOOGLE ANALYTICS =====
    const Analytics = {
        reportConversion() {
            try {
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'conversion', { 'send_to': CONFIG.ANALYTICS_ID });
                    console.log('Конверсия отправлена');
                } else {
                    console.warn('Google Analytics не загружен');
                }
            } catch (error) { console.error('Ошибка при отправке конверсии:', error); }
        }
    };

    // ===== ЧАСТИЦЫ =====
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

    // ===== НАВИГАЦИЯ =====
    const Navigation = {
        hamburger: null, mobileMenu: null, header: null, navLinks: null,
        init() {
            this.hamburger = document.querySelector('.hamburger');
            this.mobileMenu = document.querySelector('.mobile-menu');
            this.header = document.querySelector('.header');
            this.navLinks = document.querySelector('.mobile-nav');
            this.bindEvents();
            this.initScrollEffect();
            this.initSmoothScrolling();
        },
        bindEvents() {
            if (this.hamburger && this.mobileMenu) {
                this.hamburger.addEventListener('click', () => this.toggleMobileMenu());
                this.navLinks.addEventListener('click', (e) => {
                    if (e.target.tagName === 'A') {
                        this.closeMobileMenu();
                    }
                });
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
                if (window.scrollY > CONFIG.SCROLL_THRESHOLD) { this.header.classList.add('scrolled'); }
                else { this.header.classList.remove('scrolled'); }
            }, 16);
            window.addEventListener('scroll', handleScroll, { passive: true });
            this.handleScroll = handleScroll;
        },
        initSmoothScrolling() {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', (e) => {
                    e.preventDefault();
                    const target = document.querySelector(anchor.getAttribute('href'));
                    if (target) {
                        const headerHeight = this.header.offsetHeight;
                        const targetPosition = target.offsetTop - headerHeight - 20;
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                        this.closeMobileMenu();
                    }
                });
            });
        },
        destroy() { window.removeEventListener('scroll', this.handleScroll); }
    };

    // ===== УЛУЧШЕНИЯ СКРОЛЛА МОДАЛЬНОГО ОКНА =====
    const ModalScrollEnhancements = {
        modalContent: null, scrollTimeout: null,
        init() {
            this.modalContent = document.querySelector('.modal-content');
            if (!this.modalContent) return;
            this.bindScrollEvents();
        },
        bindScrollEvents() {
            this.modalContent.addEventListener('scroll', () => { this.handleScroll(); }, { passive: true });
        },
        handleScroll() { this.updateScrollState(); },
        updateScrollState() {
            if (!this.modalContent) return;
            const scrollTop = this.modalContent.scrollTop;
            const scrollHeight = this.modalContent.scrollHeight;
            const clientHeight = this.modalContent.clientHeight;
            if (scrollTop === 0) { this.modalContent.setAttribute('data-scroll', 'top'); }
            else if (scrollTop + clientHeight >= scrollHeight - 5) { this.modalContent.setAttribute('data-scroll', 'bottom'); }
            else { this.modalContent.setAttribute('data-scroll', 'middle'); }
        },
        scrollToFirstError() {
            const errorElement = this.modalContent.querySelector('.error, .form-input:invalid');
            if (errorElement) { errorElement.focus(); }
        }
    };

    // ===== МОДАЛЬНОЕ ОКНО =====
    const Modal = {
        modal: null, modalContent: null,
        init() {
            this.modal = document.getElementById('modal');
            this.modalContent = document.querySelector('.modal-content');
            this.bindEvents();
            this.bindServiceButtons();
        },
        bindEvents() {
            const openButton = document.getElementById('openModal');
            if (openButton) { openButton.addEventListener('click', () => this.open()); }
            const closeButton = document.querySelector('.close-button');
            if (closeButton) { closeButton.addEventListener('click', () => this.close()); }
            if (this.modal) { this.modal.addEventListener('click', (e) => { if (e.target === this.modal) { this.close(); } }); }
            document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && this.isOpen()) { this.close(); } });
        },
        bindServiceButtons() {
            const serviceButtons = document.querySelectorAll('.select-service');
            serviceButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const serviceName = button.dataset.service;
                    this.open(serviceName);
                });
            });
        },
        open(selectedService = '') {
            if (!this.modal) return;
            this.modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            
            this.form.querySelectorAll('.quantity-input').forEach(input => {
                input.value = 0;
                const decreaseBtn = input.parentElement.querySelector('[data-action="decrease"]');
                if (decreaseBtn) decreaseBtn.disabled = true;
            });

            const pillowsCheckbox = this.form.querySelector('[name="sofa_pillows"]');
            if (pillowsCheckbox) pillowsCheckbox.checked = false;

            if (selectedService) {
                const serviceWrapper = this.modalContent.querySelector(`.service-item-wrapper[data-service-name="${selectedService}"]`);
                if (serviceWrapper) {
                    const input = serviceWrapper.querySelector('.quantity-input');
                    const decreaseBtn = serviceWrapper.querySelector('[data-action="decrease"]');
                    
                    if (input.dataset.serviceType === 'area') {
                        input.value = 3; // Минимальное значение для ковра
                    } else {
                        input.value = 1;
                    }
                    if (decreaseBtn) decreaseBtn.disabled = false;
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
        },
        isOpen() { return this.modal && this.modal.style.display === 'block'; }
    };

    // ===== ФОРМА =====
    const FORM_MIN_ORDER = 160;
    const FORM_SERVICE_PRICES = {
        'Диван': { price: 180, type: 'quantity' },
        'Ковёр': { price: 15, type: 'area' },
        'Кресло': { price: 40, type: 'quantity' },
        'Стул': { price: 40, type: 'quantity' },
        'Матрас': { price: 90, type: 'quantity' },
        'Комплекс': { price: 300, type: 'quantity' }
    };
    const Form = {
        form: null, feedback: null,
        init() {
            this.form = document.getElementById('cleaningForm');
            this.feedback = document.getElementById('formFeedback');
            if (this.form) {
                this.bindEvents();
                this.bindQuantityButtons();
            }
        },
        bindQuantityButtons() {
            this.form.addEventListener('click', (event) => {
                const target = event.target;
                if (!target.matches('.quantity-btn')) return;

                const action = target.dataset.action;
                const input = target.parentElement.querySelector('.quantity-input');
                const decreaseBtn = target.parentElement.querySelector('[data-action="decrease"]');
                
                let currentValue = parseInt(input.value, 10);
                const min = parseInt(input.min, 10);
                const max = parseInt(input.max, 10) || Infinity;

                if (action === 'increase') {
                    currentValue = Math.min(max, currentValue + 1);
                } else if (action === 'decrease') {
                    currentValue = Math.max(min, currentValue - 1);
                }
                
                input.value = currentValue;
                decreaseBtn.disabled = currentValue <= min;
            });
        },
        bindEvents() { this.form.addEventListener('submit', (e) => this.handleSubmit(e)); },
        getFormOrderTotal() {
            let total = 0;
            const items = this.form.querySelectorAll('.service-item-wrapper');
            items.forEach(item => {
                const name = item.dataset.serviceName;
                const cfg = FORM_SERVICE_PRICES[name];
                if (!cfg) return;
                const input = item.querySelector('.quantity-input');
                const value = parseInt(input && input.value, 10) || 0;
                total += value * cfg.price;
            });
            return total;
        },
        async handleSubmit(event) {
            event.preventDefault();
            const orderTotal = this.getFormOrderTotal();
            if (orderTotal < FORM_MIN_ORDER) {
                const minOrderModal = document.getElementById('minOrderModal');
                if (minOrderModal) {
                    minOrderModal.style.display = 'flex';
                    minOrderModal.style.alignItems = 'center';
                    minOrderModal.style.justifyContent = 'center';
                }
                this.showFeedback('Минимальная сумма заказа — 160 zł. Добавьте услуги на эту сумму.', 'error');
                ModalScrollEnhancements.scrollToFirstError();
                return;
            }
            const data = this.extractFormData();
            const validation = this.validateForm(data);

            if (!validation.isValid) {
                this.showFeedback(validation.message, 'error');
                ModalScrollEnhancements.scrollToFirstError();
                return;
            }

            const submitButton = this.form.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            this.showFeedback('Отправляем заявку...', 'info');

            try {
                await this.submitToServer(data);
                this.showFeedback('✓ Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.', 'success');
                Analytics.reportConversion();
                this.form.reset();
                this.form.querySelectorAll('.quantity-input').forEach(input => {
                    input.value = 0;
                    const decreaseBtn = input.parentElement.querySelector('[data-action="decrease"]');
                    if(decreaseBtn) decreaseBtn.disabled = true;
                });
                setTimeout(() => { Modal.close(); this.showFeedback('', 'info'); }, 2500);
            } catch (error) {
                console.error('Ошибка отправки формы:', error);
                this.showFeedback('Произошла ошибка при отправке. Пожалуйста, попробуйте снова.', 'error');
            } finally {
                submitButton.disabled = false;
            }
        },
        extractFormData() {
            const formData = new FormData(this.form);
            const services = [];
            const serviceItems = this.form.querySelectorAll('.service-item-wrapper');

            serviceItems.forEach(item => {
                const input = item.querySelector('.quantity-input');
                const value = parseInt(input.value, 10);

                if (value > 0) {
                    const serviceName = item.dataset.serviceName;
                    const type = input.dataset.serviceType;
                    let serviceString = '';

                    if (type === 'quantity') {
                        serviceString = `${serviceName} (${value} шт.)`;
                        // Проверяем подушки только для дивана
                        if(serviceName === 'Диван') {
                            const pillowsCheckbox = this.form.querySelector('[name="sofa_pillows"]');
                            if(pillowsCheckbox && pillowsCheckbox.checked) {
                                serviceString += ' (с подушками)';
                            }
                        }
                    } else if (type === 'area') {
                        serviceString = `${serviceName} (${value} м²)`;
                    }
                    services.push(serviceString);
                }
            });

            return {
                services: services,
                address: formData.get('address')?.trim() || '',
                comments: formData.get('comments')?.trim() || '',
                name: formData.get('name')?.trim() || '',
                phone: formData.get('phone')?.trim() || ''
            };
        },
        validateForm(data) {
            if (data.services.length === 0) { return { isValid: false, message: 'Пожалуйста, выберите хотя бы одну услугу.' }; }
            
            const carpetItem = this.form.querySelector('[data-service-name="Ковёр"] .quantity-input');
            if (carpetItem && carpetItem.value > 0 && carpetItem.value < 3) {
                return { isValid: false, message: 'Минимальный заказ для ковра - 3 м².' };
            }
            
            if (!data.name) { return { isValid: false, message: 'Пожалуйста, введите ваше имя.' }; }
            const phoneRegex = /^[+]?[\d\s\-\(\)]{7,}$/;
            if (!phoneRegex.test(data.phone)) { return { isValid: false, message: 'Пожалуйста, введите корректный номер телефона.' }; }
            if (!data.address) { return { isValid: false, message: 'Пожалуйста, укажите ваш адрес.' }; }
            return { isValid: true };
        },
        async submitToServer(data) {
            const message = this.formatTelegramMessage(data);
            const response = await fetch(CONFIG.API_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: message })
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                const errorMessage = errorData ? errorData.message : `HTTP error! status: ${response.status}`;
                throw new Error(errorMessage);
            }
            return response.json();
        },
        formatTelegramMessage(data) {
            const timestamp = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Warsaw' });
            const servicesString = data.services.join('\n- ');
            return `<b>🆕 Новая заявка на химчистку</b>\n\n<b>🛋️ Услуги:</b>\n- ${servicesString}\n\n<b>📍 Адрес:</b> ${data.address}\n<b>👤 Имя:</b> ${data.name}\n<b>📞 Телефон:</b> <a href="tel:${data.phone}">${data.phone}</a>\n${data.comments ? `<b>💬 Комментарий:</b> ${data.comments}` : ''}\n\n<b>🕐 Время:</b> ${timestamp}`.trim();
        },
        showFeedback(message, type) {
            if (!this.feedback) return;
            const typeClass = { 'success': 'text-success', 'error': 'text-error', 'info': 'text-secondary' };
            this.feedback.innerHTML = `<span class="${typeClass[type] || 'text-secondary'}">${message}</span>`;
        }
    };

    // ===== ПРОИЗВОДИТЕЛЬНОСТЬ =====
    const Performance = {
        init() { this.initLazyLoading(); this.initResizeOptimization(); },
        initLazyLoading() {
            if ('IntersectionObserver' in window) {
                const imageObserver = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            if (img.dataset.src) { img.src = img.dataset.src; img.removeAttribute('data-src'); }
                            observer.unobserve(img);
                        }
                    });
                });
                document.querySelectorAll('img[data-src]').forEach(img => imageObserver.observe(img));
            }
        },
        initResizeOptimization() {
            const handleResize = Utils.debounce(() => {
                if (window.matchMedia && window.matchMedia('(max-width: 767px)').matches) return;
                ParticleSystem.destroy();
                ParticleSystem.createParticles();
            }, 250);
            window.addEventListener('resize', handleResize);
        }
    };



    const Calculator = {
    MIN_ORDER: 160,
    prices: {
        sofa: 180,
        carpet: 15,
        chair: 40,
        mattress: 90
    },
    values: {
        sofa: 0,
        carpet: 0,
        chair: 0,
        mattress: 0
    },
    init() {
        const calcButtons = document.querySelectorAll('.calc-btn');
        const calcOrderBtn = document.getElementById('calcOrderBtn');
        
        calcButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleCalc(e));
        });
        
        if (calcOrderBtn) {
            calcOrderBtn.addEventListener('click', () => this.openModalWithCalc());
        }
        
        const minOrderModal = document.getElementById('minOrderModal');
        const minOrderClose = document.getElementById('minOrderModalClose');
        if (minOrderClose && minOrderModal) {
            minOrderClose.addEventListener('click', () => {
                minOrderModal.style.display = 'none';
            });
            minOrderModal.addEventListener('click', (e) => {
                if (e.target === minOrderModal) minOrderModal.style.display = 'none';
            });
        }
    },
    getTotal() {
        let total = 0;
        for (let type in this.values) {
            total += this.values[type] * this.prices[type];
        }
        return total;
    },
    handleCalc(e) {
        const button = e.target;
        const type = button.dataset.calc;
        const action = button.dataset.action;
        
        if (action === 'plus') {
            this.values[type]++;
        } else if (action === 'minus' && this.values[type] > 0) {
            this.values[type]--;
        }
        
        this.updateDisplay(type);
        this.updateTotal();
    },
    updateDisplay(type) {
        const display = document.querySelector(`[data-calc-display="${type}"]`);
        if (display) {
            display.textContent = this.values[type];
        }
    },
    updateTotal() {
        let total = 0;
        for (let type in this.values) {
            total += this.values[type] * this.prices[type];
        }
        
        // Итого — полная сумма заказа (без скидки)
        const totalElement = document.getElementById('calcTotal');
        if (totalElement) {
            totalElement.textContent = total + ' zł';
        }
        
        // Скидка 10% при заказе через калькулятор — показываем цену к оплате отдельно
        const discountRow = document.getElementById('calcTotalDiscountRow');
        const discountElement = document.getElementById('calcTotalDiscount');
        if (total > 0 && discountRow && discountElement) {
            const discount = total * 0.1;
            const finalPrice = total - discount;
            discountElement.textContent = Math.round(finalPrice) + ' zł';
            discountRow.style.display = '';
        } else if (discountRow) {
            discountRow.style.display = 'none';
        }
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
        // Открываем модальное окно и заполняем данными из калькулятора
        Modal.open();
        
        // Заполняем поля в форме значениями из калькулятора
        const serviceMap = {
            sofa: 'Диван',
            carpet: 'Ковёр',
            chair: 'Кресло',
            mattress: 'Матрас'
        };
        
        for (let type in this.values) {
            if (this.values[type] > 0) {
                const serviceName = serviceMap[type];
                const wrapper = document.querySelector(`.service-item-wrapper[data-service-name="${serviceName}"]`);
                if (wrapper) {
                    const input = wrapper.querySelector('.quantity-input');
                    const decreaseBtn = wrapper.querySelector('[data-action="decrease"]');
                    input.value = this.values[type];
                    if (decreaseBtn) decreaseBtn.disabled = false;
                }
            }
        }
    }
};

// ===== ТАЙМЕР АКЦИИ =====
const PromoTimer = {
    endTime: null,
    init() {
        // Устанавливаем время окончания акции (24 часа от текущего момента)
        const saved = localStorage.getItem('promoEndTime');
        if (saved) {
            this.endTime = new Date(saved);
        } else {
            this.endTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
            localStorage.setItem('promoEndTime', this.endTime);
        }
        
        this.updateTimer();
        setInterval(() => this.updateTimer(), 1000);
        
        const promoBtn = document.getElementById('promoOrderBtn');
        if (promoBtn) {
            promoBtn.addEventListener('click', () => Modal.open());
        }
    },
    updateTimer() {
        const now = new Date();
        const diff = this.endTime - now;
        
        if (diff <= 0) {
            // Сбрасываем таймер
            this.endTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
            localStorage.setItem('promoEndTime', this.endTime);
            return;
        }
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        const hoursEl = document.getElementById('hours');
        const minutesEl = document.getElementById('minutes');
        const secondsEl = document.getElementById('seconds');
        
        if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
        if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
        if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
    }
};

// ===== ОБНОВЛЕННАЯ ИНИЦИАЛИЗАЦИЯ =====
function init() {
    if (!window.CSS || !window.CSS.supports || !window.CSS.supports('display', 'grid')) {
        console.warn('Браузер не поддерживает современные CSS функции');
    }
    Navigation.init();
    Modal.init();
    Form.init();
    Performance.init();
    ModalScrollEnhancements.init();
    Calculator.init(); // НОВОЕ
    PromoTimer.init(); // НОВОЕ
    setTimeout(() => { ParticleSystem.init(); }, 3000);
    console.log('🚀 BrightHouse Cleaning инициализован');
}

// Экспорт для отладки (без изменений)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.BrightHouse = { 
        ParticleSystem, 
        Navigation, 
        Modal, 
        Form, 
        Analytics, 
        Utils, 
        ModalScrollEnhancements,
        Calculator, // НОВОЕ
        PromoTimer // НОВОЕ
    };
}

    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); }
    else { init(); }

    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        window.BrightHouse = { ParticleSystem, Navigation, Modal, Form, Analytics, Utils, ModalScrollEnhancements };
    }
})();