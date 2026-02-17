/**
 * Асинхронная загрузка ресурсов для оптимизации производительности
 * Загружает некритичные ресурсы после загрузки основного контента
 */

(function() {
  'use strict';

  const AsyncLoader = {
    // Загрузка скриптов
    loadScript(src, async = true, defer = false) {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = async;
        script.defer = defer;
        script.onload = () => resolve(script);
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.head.appendChild(script);
      });
    },

    // Загрузка стилей
    loadStyle(href) {
      return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.onload = () => resolve(link);
        link.onerror = () => reject(new Error(`Failed to load style: ${href}`));
        document.head.appendChild(link);
      });
    },

    // Ленивая загрузка изображений
    lazyLoadImages() {
      if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target;
              
              // Загрузка src
              if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
              }
              
              // Загрузка srcset
              if (img.dataset.srcset) {
                img.srcset = img.dataset.srcset;
                img.removeAttribute('data-srcset');
              }
              
              observer.unobserve(img);
            }
          });
        }, {
          rootMargin: '50px' // Начинаем загрузку за 50px до появления
        });

        // Наблюдаем за всеми изображениями с data-src
        document.querySelectorAll('img[data-src], img[data-srcset]').forEach(img => {
          imageObserver.observe(img);
        });
      } else {
        // Fallback для старых браузеров
        document.querySelectorAll('img[data-src]').forEach(img => {
          if (img.dataset.src) img.src = img.dataset.src;
          if (img.dataset.srcset) img.srcset = img.dataset.srcset;
        });
      }
    },

    // Загрузка некритичных ресурсов после загрузки страницы
    async loadNonCriticalResources() {
      try {
        // Загружаем Vue.js асинхронно (если еще не загружен)
        if (!window.Vue && document.getElementById('app')) {
          await this.loadScript('https://cdn.jsdelivr.net/npm/vue@3.5.13/dist/vue.global.prod.js');
          console.log('✓ Vue.js loaded');
        }

        // Загружаем IMask асинхронно
        if (!window.IMask && document.getElementById('phone')) {
          await this.loadScript('https://cdn.jsdelivr.net/npm/imask@7.1.3/dist/imask.min.js');
          console.log('✓ IMask loaded');
        }

        // Загружаем Font Awesome асинхронно (если не preloaded)
        const faLink = document.querySelector('link[href*="font-awesome"]');
        if (!faLink) {
          await this.loadStyle('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css');
          console.log('✓ Font Awesome loaded');
        }

      } catch (error) {
        console.error('Error loading non-critical resources:', error);
      }
    },

    // Предзагрузка изображений для следующих секций
    preloadNextSectionImages() {
      const images = [
        '/public/work-1.jpg',
        '/public/work-2.jpg',
        '/public/work-3.jpg'
      ];

      images.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
      });
    },

    // Инициализация
    init() {
      // Загружаем изображения лениво
      this.lazyLoadImages();

      // Загружаем некритичные ресурсы после загрузки страницы
      if (document.readyState === 'complete') {
        this.loadNonCriticalResources();
      } else {
        window.addEventListener('load', () => {
          // Задержка для приоритета основного контента
          setTimeout(() => {
            this.loadNonCriticalResources();
            this.preloadNextSectionImages();
          }, 1000);
        });
      }
    }
  };

  // Запускаем загрузчик
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AsyncLoader.init());
  } else {
    AsyncLoader.init();
  }

  // Экспорт для отладки
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.AsyncLoader = AsyncLoader;
  }
})();
