(function() {
    'use strict';

    const CONFIG = {
        API_ENDPOINT: '/telegram_proxy.php',
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
                    console.log('Канверсія адпраўлена');
                } else {
                    console.warn('Google Analytics не загружаны');
                }
            } catch (error) { console.error('Памылка адпраўкі канверсіі:', error); }
        }
    };

    const ParticleSystem = {
        container: null,
        particles: [],
        init() {
            this.container = document.querySelector('.particles');
            if (!this.container) return;
            this.createParticles();
        },
        createParticles() {
            for (let i = 0; i < CONFIG.PARTICLES_COUNT; i++) {
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
            
            const form = document.getElementById('cleaningForm');
            form.querySelectorAll('.quantity-input').forEach(input => {
                input.value = 0;
                const decreaseBtn = input.parentElement.querySelector('[data-action="decrease"]');
                if (decreaseBtn) decreaseBtn.disabled = true;
            });

            const pillowsCheckbox = form.querySelector('[name="sofa_pillows"]');
            if (pillowsCheckbox) pillowsCheckbox.checked = false;

            if (selectedService) {
                const serviceWrapper = this.modalContent.querySelector(`.service-item-wrapper[data-service-name="${selectedService}"]`);
                if (serviceWrapper) {
                    const input = serviceWrapper.querySelector('.quantity-input');
                    const decreaseBtn = serviceWrapper.querySelector('[data-action="decrease"]');
                    
                    if (input.dataset.serviceType === 'area') {
                        input.value = 3;
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
        async handleSubmit(event) {
            event.preventDefault();
            const data = this.extractFormData();
            const validation = this.validateForm(data);

            if (!validation.isValid) {
                this.showFeedback(validation.message, 'error');
                ModalScrollEnhancements.scrollToFirstError();
                return;
            }

            const submitButton = this.form.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            this.showFeedback('Адпраўляем заяўку...', 'info');

            try {
                await this.submitToServer(data);
                this.showFeedback('✓ Заяўка паспяхова адпраўлена! Мы звяжамся з вамі ў бліжэйшы час.', 'success');
                Analytics.reportConversion();
                this.form.reset();
                this.form.querySelectorAll('.quantity-input').forEach(input => {
                    input.value = 0;
                    const decreaseBtn = input.parentElement.querySelector('[data-action="decrease"]');
                    if(decreaseBtn) decreaseBtn.disabled = true;
                });
                setTimeout(() => { Modal.close(); this.showFeedback('', 'info'); }, 2500);
            } catch (error) {
                console.error('Памылка адпраўкі формы:', error);
                this.showFeedback('Адбылася памылка пры адпраўцы. Калі ласка, паспрабуйце яшчэ раз.', 'error');
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
                        if(serviceName === 'Канапа') {
                            const pillowsCheckbox = this.form.querySelector('[name="sofa_pillows"]');
                            if(pillowsCheckbox && pillowsCheckbox.checked) {
                                serviceString += ' (з падушкамі)';
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
            if (data.services.length === 0) { return { isValid: false, message: 'Калі ласка, выберыце хаця б адну паслугу.' }; }
            
            const carpetItem = this.form.querySelector('[data-service-name="Дыван"] .quantity-input');
            if (carpetItem && carpetItem.value > 0 && carpetItem.value < 3) {
                return { isValid: false, message: 'Мінімальны заказ для дывана - 3 м².' };
            }
            
            if (!data.name) { return { isValid: false, message: 'Калі ласка, увядзіце ваша імя.' }; }
            const phoneRegex = /^[+]?[\d\s\-\(\)]{7,}$/;
            if (!phoneRegex.test(data.phone)) { return { isValid: false, message: 'Калі ласка, увядзіце карэктны нумар тэлефона.' }; }
            if (!data.address) { return { isValid: false, message: 'Калі ласка, пакажыце ваш адрас.' }; }
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
            const timestamp = new Date().toLocaleString('be-BY', { timeZone: 'Europe/Warsaw' });
            const servicesString = data.services.join('\n- ');
            return `<b>🆕 Новая заяўка на хімчыстку (BY)</b>\n\n<b>🛋️ Паслугі:</b>\n- ${servicesString}\n\n<b>📍 Адрас:</b> ${data.address}\n<b>👤 Імя:</b> ${data.name}\n<b>📞 Тэлефон:</b> <a href="tel:${data.phone}">${data.phone}</a>\n${data.comments ? `<b>💬 Каментар:</b> ${data.comments}` : ''}\n\n<b>🕐 Час:</b> ${timestamp}`.trim();
        },
        showFeedback(message, type) {
            if (!this.feedback) return;
            const typeClass = { 'success': 'text-success', 'error': 'text-error', 'info': 'text-secondary' };
            this.feedback.innerHTML = `<span class="${typeClass[type] || 'text-secondary'}">${message}</span>`;
        }
    };

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
                ParticleSystem.destroy();
                ParticleSystem.createParticles();
            }, 250);
            window.addEventListener('resize', handleResize);
        }
    };

    const Calculator = {
        prices: { sofa: 160, carpet: 15, chair: 40, mattress: 90 },
        values: { sofa: 0, carpet: 0, chair: 0, mattress: 0 },
        init() {
            const calcButtons = document.querySelectorAll('.calc-btn');
            const calcOrderBtn = document.getElementById('calcOrderBtn');
            
            calcButtons.forEach(btn => {
                btn.addEventListener('click', (e) => this.handleCalc(e));
            });
            
            if (calcOrderBtn) {
                calcOrderBtn.addEventListener('click', () => this.openModalWithCalc());
            }
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
            
            const discount = total * 0.1;
            const finalPrice = total - discount;
            
            const totalElement = document.getElementById('calcTotal');
            if (totalElement) {
                totalElement.innerHTML = `<span style="text-decoration: line-through; opacity: 0.5; font-size: 1.5rem;">${total} zł</span><br>${Math.round(finalPrice)} zł`;
            }
        },
        openModalWithCalc() {
            Modal.open();
            
            const serviceMap = {
                sofa: 'Канапа',
                carpet: 'Дыван',
                chair: 'Крэсла',
                mattress: 'Матрац'
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

    const PromoTimer = {
        endTime: null,
        init() {
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

    function init() {
        if (!window.CSS || !window.CSS.supports || !window.CSS.supports('display', 'grid')) {
            console.warn('Браўзер не падтрымлівае сучасныя CSS функцыі');
        }
        Navigation.init();
        Modal.init();
        Form.init();
        Performance.init();
        ModalScrollEnhancements.init();
        Calculator.init();
        PromoTimer.init();
        setTimeout(() => { ParticleSystem.init(); }, 3000);
        console.log('🚀 BrightHouse Cleaning ініцыялізаваны');
    }

    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        window.BrightHouse = { 
            ParticleSystem, 
            Navigation, 
            Modal, 
            Form, 
            Analytics, 
            Utils, 
            ModalScrollEnhancements,
            Calculator,
            PromoTimer
        };
    }

    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); }
    else { init(); }
})();
