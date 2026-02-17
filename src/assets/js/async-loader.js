/**
 * РђСЃРёРЅС…СЂРѕРЅРЅР°СЏ Р·Р°РіСЂСѓР·РєР° СЂРµСЃСѓСЂСЃРѕРІ РґР»СЏ РѕРїС‚РёРјРёР·Р°С†РёРё РїСЂРѕРёР·РІРѕРґРёС‚РµР»СЊРЅРѕСЃС‚Рё
 * Р—Р°РіСЂСѓР¶Р°РµС‚ РЅРµРєСЂРёС‚РёС‡РЅС‹Рµ СЂРµСЃСѓСЂСЃС‹ РїРѕСЃР»Рµ Р·Р°РіСЂСѓР·РєРё РѕСЃРЅРѕРІРЅРѕРіРѕ РєРѕРЅС‚РµРЅС‚Р°
 */

(function() {
  'use strict';

  const AsyncLoader = {
    // Р—Р°РіСЂСѓР·РєР° СЃРєСЂРёРїС‚РѕРІ
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

    // Р—Р°РіСЂСѓР·РєР° СЃС‚РёР»РµР№
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

    // Р›РµРЅРёРІР°СЏ Р·Р°РіСЂСѓР·РєР° РёР·РѕР±СЂР°Р¶РµРЅРёР№
    lazyLoadImages() {
      if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target;
              
              // Р—Р°РіСЂСѓР·РєР° src
              if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
              }
              
              // Р—Р°РіСЂСѓР·РєР° srcset
              if (img.dataset.srcset) {
                img.srcset = img.dataset.srcset;
                img.removeAttribute('data-srcset');
              }
              
              observer.unobserve(img);
            }
          });
        }, {
          rootMargin: '50px' // РќР°С‡РёРЅР°РµРј Р·Р°РіСЂСѓР·РєСѓ Р·Р° 50px РґРѕ РїРѕСЏРІР»РµРЅРёСЏ
        });

        // РќР°Р±Р»СЋРґР°РµРј Р·Р° РІСЃРµРјРё РёР·РѕР±СЂР°Р¶РµРЅРёСЏРјРё СЃ data-src
        document.querySelectorAll('img[data-src], img[data-srcset]').forEach(img => {
          imageObserver.observe(img);
        });
      } else {
        // Fallback РґР»СЏ СЃС‚Р°СЂС‹С… Р±СЂР°СѓР·РµСЂРѕРІ
        document.querySelectorAll('img[data-src]').forEach(img => {
          if (img.dataset.src) img.src = img.dataset.src;
          if (img.dataset.srcset) img.srcset = img.dataset.srcset;
        });
      }
    },

    // Р—Р°РіСЂСѓР·РєР° РЅРµРєСЂРёС‚РёС‡РЅС‹С… СЂРµСЃСѓСЂСЃРѕРІ РїРѕСЃР»Рµ Р·Р°РіСЂСѓР·РєРё СЃС‚СЂР°РЅРёС†С‹
    async loadNonCriticalResources() {
      try {
        // Р—Р°РіСЂСѓР¶Р°РµРј Vue.js Р°СЃРёРЅС…СЂРѕРЅРЅРѕ (РµСЃР»Рё РµС‰Рµ РЅРµ Р·Р°РіСЂСѓР¶РµРЅ)
        if (!window.Vue && document.getElementById('app')) {
          await this.loadScript('https://cdn.jsdelivr.net/npm/vue@3.5.13/dist/vue.global.prod.js');
          console.log('вњ“ Vue.js loaded');
        }

        // Р—Р°РіСЂСѓР¶Р°РµРј IMask Р°СЃРёРЅС…СЂРѕРЅРЅРѕ
        if (!window.IMask && document.getElementById('phone')) {
          await this.loadScript('https://cdn.jsdelivr.net/npm/imask@7.1.3/dist/imask.min.js');
          console.log('вњ“ IMask loaded');
        }

        // Р—Р°РіСЂСѓР¶Р°РµРј Font Awesome Р°СЃРёРЅС…СЂРѕРЅРЅРѕ (РµСЃР»Рё РЅРµ preloaded)
        const faLink = document.querySelector('link[href*="font-awesome"]');
        if (!faLink) {
          await this.loadStyle('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css');
          console.log('вњ“ Font Awesome loaded');
        }

      } catch (error) {
        console.error('Error loading non-critical resources:', error);
      }
    },

    // РџСЂРµРґР·Р°РіСЂСѓР·РєР° РёР·РѕР±СЂР°Р¶РµРЅРёР№ РґР»СЏ СЃР»РµРґСѓСЋС‰РёС… СЃРµРєС†РёР№
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

    // РРЅРёС†РёР°Р»РёР·Р°С†РёСЏ
    init() {
      // Р—Р°РіСЂСѓР¶Р°РµРј РёР·РѕР±СЂР°Р¶РµРЅРёСЏ Р»РµРЅРёРІРѕ
      this.lazyLoadImages();

      // Р—Р°РіСЂСѓР¶Р°РµРј РЅРµРєСЂРёС‚РёС‡РЅС‹Рµ СЂРµСЃСѓСЂСЃС‹ РїРѕСЃР»Рµ Р·Р°РіСЂСѓР·РєРё СЃС‚СЂР°РЅРёС†С‹
      if (document.readyState === 'complete') {
        this.loadNonCriticalResources();
      } else {
        window.addEventListener('load', () => {
          // Р—Р°РґРµСЂР¶РєР° РґР»СЏ РїСЂРёРѕСЂРёС‚РµС‚Р° РѕСЃРЅРѕРІРЅРѕРіРѕ РєРѕРЅС‚РµРЅС‚Р°
          setTimeout(() => {
            this.loadNonCriticalResources();
            this.preloadNextSectionImages();
          }, 1000);
        });
      }
    }
  };

  // Р—Р°РїСѓСЃРєР°РµРј Р·Р°РіСЂСѓР·С‡РёРє
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AsyncLoader.init());
  } else {
    AsyncLoader.init();
  }

  // Р­РєСЃРїРѕСЂС‚ РґР»СЏ РѕС‚Р»Р°РґРєРё
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.AsyncLoader = AsyncLoader;
  }
})();




