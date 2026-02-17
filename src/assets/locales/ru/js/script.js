(function() {
    'use strict';

    // ===== РљРћРќР¤РР“РЈР РђР¦РРЇ =====
    const CONFIG = {
        API_ENDPOINT: '/api/telegram_proxy',
        ANALYTICS_ID: 'AW-11273981561/8oZpCLqZjvUZEPmc7f8p',
        PARTICLES_COUNT: 30,
        SCROLL_THRESHOLD: 100
    };

    // ===== РЈРўРР›РРўР« =====
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
                    console.log('РљРѕРЅРІРµСЂСЃРёСЏ РѕС‚РїСЂР°РІР»РµРЅР°');
                } else {
                    console.warn('Google Analytics РЅРµ Р·Р°РіСЂСѓР¶РµРЅ');
                }
            } catch (error) { console.error('РћС€РёР±РєР° РїСЂРё РѕС‚РїСЂР°РІРєРµ РєРѕРЅРІРµСЂСЃРёРё:', error); }
        }
    };

    // ===== Р§РђРЎРўРР¦Р« =====
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

    // ===== РќРђР’РР“РђР¦РРЇ =====
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

    // ===== РЈР›РЈР§РЁР•РќРРЇ РЎРљР РћР›Р›Рђ РњРћР”РђР›Р¬РќРћР“Рћ РћРљРќРђ =====
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

    // ===== РњРћР”РђР›Р¬РќРћР• РћРљРќРћ =====
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
                        input.value = 3; // РњРёРЅРёРјР°Р»СЊРЅРѕРµ Р·РЅР°С‡РµРЅРёРµ РґР»СЏ РєРѕРІСЂР°
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

    // ===== Р¤РћР РњРђ =====
    const FORM_MIN_ORDER = 160;
    const FORM_SERVICE_PRICES = {
        'Р”РёРІР°РЅ': { price: 180, type: 'quantity' },
        'РљРѕРІС‘СЂ': { price: 15, type: 'area' },
        'РљСЂРµСЃР»Рѕ': { price: 40, type: 'quantity' },
        'РЎС‚СѓР»': { price: 40, type: 'quantity' },
        'РњР°С‚СЂР°СЃ': { price: 90, type: 'quantity' },
        'РљРѕРјРїР»РµРєСЃ': { price: 300, type: 'quantity' }
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
                this.showFeedback('РњРёРЅРёРјР°Р»СЊРЅР°СЏ СЃСѓРјРјР° Р·Р°РєР°Р·Р° вЂ” 160 zЕ‚. Р”РѕР±Р°РІСЊС‚Рµ СѓСЃР»СѓРіРё РЅР° СЌС‚Сѓ СЃСѓРјРјСѓ.', 'error');
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
            this.showFeedback('РћС‚РїСЂР°РІР»СЏРµРј Р·Р°СЏРІРєСѓ...', 'info');

            try {
                await this.submitToServer(data);
                this.showFeedback('вњ“ Р—Р°СЏРІРєР° СѓСЃРїРµС€РЅРѕ РѕС‚РїСЂР°РІР»РµРЅР°! РњС‹ СЃРІСЏР¶РµРјСЃСЏ СЃ РІР°РјРё РІ Р±Р»РёР¶Р°Р№С€РµРµ РІСЂРµРјСЏ.', 'success');
                Analytics.reportConversion();
                this.form.reset();
                this.form.querySelectorAll('.quantity-input').forEach(input => {
                    input.value = 0;
                    const decreaseBtn = input.parentElement.querySelector('[data-action="decrease"]');
                    if(decreaseBtn) decreaseBtn.disabled = true;
                });
                setTimeout(() => { Modal.close(); this.showFeedback('', 'info'); }, 2500);
            } catch (error) {
                console.error('РћС€РёР±РєР° РѕС‚РїСЂР°РІРєРё С„РѕСЂРјС‹:', error);
                this.showFeedback('РџСЂРѕРёР·РѕС€Р»Р° РѕС€РёР±РєР° РїСЂРё РѕС‚РїСЂР°РІРєРµ. РџРѕР¶Р°Р»СѓР№СЃС‚Р°, РїРѕРїСЂРѕР±СѓР№С‚Рµ СЃРЅРѕРІР°.', 'error');
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
                        serviceString = `${serviceName} (${value} С€С‚.)`;
                        // РџСЂРѕРІРµСЂСЏРµРј РїРѕРґСѓС€РєРё С‚РѕР»СЊРєРѕ РґР»СЏ РґРёРІР°РЅР°
                        if(serviceName === 'Р”РёРІР°РЅ') {
                            const pillowsCheckbox = this.form.querySelector('[name="sofa_pillows"]');
                            if(pillowsCheckbox && pillowsCheckbox.checked) {
                                serviceString += ' (СЃ РїРѕРґСѓС€РєР°РјРё)';
                            }
                        }
                    } else if (type === 'area') {
                        serviceString = `${serviceName} (${value} РјВІ)`;
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
            if (data.services.length === 0) { return { isValid: false, message: 'РџРѕР¶Р°Р»СѓР№СЃС‚Р°, РІС‹Р±РµСЂРёС‚Рµ С…РѕС‚СЏ Р±С‹ РѕРґРЅСѓ СѓСЃР»СѓРіСѓ.' }; }
            
            const carpetItem = this.form.querySelector('[data-service-name="РљРѕРІС‘СЂ"] .quantity-input');
            if (carpetItem && carpetItem.value > 0 && carpetItem.value < 3) {
                return { isValid: false, message: 'РњРёРЅРёРјР°Р»СЊРЅС‹Р№ Р·Р°РєР°Р· РґР»СЏ РєРѕРІСЂР° - 3 РјВІ.' };
            }
            
            if (!data.name) { return { isValid: false, message: 'РџРѕР¶Р°Р»СѓР№СЃС‚Р°, РІРІРµРґРёС‚Рµ РІР°С€Рµ РёРјСЏ.' }; }
            const phoneRegex = /^[+]?[\d\s\-\(\)]{7,}$/;
            if (!phoneRegex.test(data.phone)) { return { isValid: false, message: 'РџРѕР¶Р°Р»СѓР№СЃС‚Р°, РІРІРµРґРёС‚Рµ РєРѕСЂСЂРµРєС‚РЅС‹Р№ РЅРѕРјРµСЂ С‚РµР»РµС„РѕРЅР°.' }; }
            if (!data.address) { return { isValid: false, message: 'РџРѕР¶Р°Р»СѓР№СЃС‚Р°, СѓРєР°Р¶РёС‚Рµ РІР°С€ Р°РґСЂРµСЃ.' }; }
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
            return `<b>рџ†• РќРѕРІР°СЏ Р·Р°СЏРІРєР° РЅР° С…РёРјС‡РёСЃС‚РєСѓ</b>\n\n<b>рџ›‹пёЏ РЈСЃР»СѓРіРё:</b>\n- ${servicesString}\n\n<b>рџ“Ќ РђРґСЂРµСЃ:</b> ${data.address}\n<b>рџ‘¤ РРјСЏ:</b> ${data.name}\n<b>рџ“ћ РўРµР»РµС„РѕРЅ:</b> <a href="tel:${data.phone}">${data.phone}</a>\n${data.comments ? `<b>рџ’¬ РљРѕРјРјРµРЅС‚Р°СЂРёР№:</b> ${data.comments}` : ''}\n\n<b>рџ•ђ Р’СЂРµРјСЏ:</b> ${timestamp}`.trim();
        },
        showFeedback(message, type) {
            if (!this.feedback) return;
            const typeClass = { 'success': 'text-success', 'error': 'text-error', 'info': 'text-secondary' };
            this.feedback.innerHTML = `<span class="${typeClass[type] || 'text-secondary'}">${message}</span>`;
        }
    };

    // ===== РџР РћРР—Р’РћР”РРўР•Р›Р¬РќРћРЎРўР¬ =====
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
        
        // РС‚РѕРіРѕ вЂ” РїРѕР»РЅР°СЏ СЃСѓРјРјР° Р·Р°РєР°Р·Р° (Р±РµР· СЃРєРёРґРєРё)
        const totalElement = document.getElementById('calcTotal');
        if (totalElement) {
            totalElement.textContent = total + ' zЕ‚';
        }
        
        // РЎРєРёРґРєР° 10% РїСЂРё Р·Р°РєР°Р·Рµ С‡РµСЂРµР· РєР°Р»СЊРєСѓР»СЏС‚РѕСЂ вЂ” РїРѕРєР°Р·С‹РІР°РµРј С†РµРЅСѓ Рє РѕРїР»Р°С‚Рµ РѕС‚РґРµР»СЊРЅРѕ
        const discountRow = document.getElementById('calcTotalDiscountRow');
        const discountElement = document.getElementById('calcTotalDiscount');
        if (total > 0 && discountRow && discountElement) {
            const discount = total * 0.1;
            const finalPrice = total - discount;
            discountElement.textContent = Math.round(finalPrice) + ' zЕ‚';
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
        // РћС‚РєСЂС‹РІР°РµРј РјРѕРґР°Р»СЊРЅРѕРµ РѕРєРЅРѕ Рё Р·Р°РїРѕР»РЅСЏРµРј РґР°РЅРЅС‹РјРё РёР· РєР°Р»СЊРєСѓР»СЏС‚РѕСЂР°
        Modal.open();
        
        // Р—Р°РїРѕР»РЅСЏРµРј РїРѕР»СЏ РІ С„РѕСЂРјРµ Р·РЅР°С‡РµРЅРёСЏРјРё РёР· РєР°Р»СЊРєСѓР»СЏС‚РѕСЂР°
        const serviceMap = {
            sofa: 'Р”РёРІР°РЅ',
            carpet: 'РљРѕРІС‘СЂ',
            chair: 'РљСЂРµСЃР»Рѕ',
            mattress: 'РњР°С‚СЂР°СЃ'
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

// ===== РўРђР™РњР•Р  РђРљР¦РР =====
const PromoTimer = {
    endTime: null,
    init() {
        // РЈСЃС‚Р°РЅР°РІР»РёРІР°РµРј РІСЂРµРјСЏ РѕРєРѕРЅС‡Р°РЅРёСЏ Р°РєС†РёРё (24 С‡Р°СЃР° РѕС‚ С‚РµРєСѓС‰РµРіРѕ РјРѕРјРµРЅС‚Р°)
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
            // РЎР±СЂР°СЃС‹РІР°РµРј С‚Р°Р№РјРµСЂ
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

// ===== РћР‘РќРћР’Р›Р•РќРќРђРЇ РРќРР¦РРђР›РР—РђР¦РРЇ =====
function init() {
    if (!window.CSS || !window.CSS.supports || !window.CSS.supports('display', 'grid')) {
        console.warn('Р‘СЂР°СѓР·РµСЂ РЅРµ РїРѕРґРґРµСЂР¶РёРІР°РµС‚ СЃРѕРІСЂРµРјРµРЅРЅС‹Рµ CSS С„СѓРЅРєС†РёРё');
    }
    Navigation.init();
    Modal.init();
    Form.init();
    Performance.init();
    ModalScrollEnhancements.init();
    Calculator.init(); // РќРћР’РћР•
    PromoTimer.init(); // РќРћР’РћР•
    setTimeout(() => { ParticleSystem.init(); }, 3000);
    console.log('рџљЂ BrightHouse Cleaning РёРЅРёС†РёР°Р»РёР·РѕРІР°РЅ');
}

// Р­РєСЃРїРѕСЂС‚ РґР»СЏ РѕС‚Р»Р°РґРєРё (Р±РµР· РёР·РјРµРЅРµРЅРёР№)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.BrightHouse = { 
        ParticleSystem, 
        Navigation, 
        Modal, 
        Form, 
        Analytics, 
        Utils, 
        ModalScrollEnhancements,
        Calculator, // РќРћР’РћР•
        PromoTimer // РќРћР’РћР•
    };
}

    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); }
    else { init(); }

    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        window.BrightHouse = { ParticleSystem, Navigation, Modal, Form, Analytics, Utils, ModalScrollEnhancements };
    }
})();



