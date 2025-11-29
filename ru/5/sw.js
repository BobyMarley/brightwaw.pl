// sw.js

const CACHE_NAME = 'brighthouse-cache-v1.2'; 
const urlsToCache = [
  '/ru/pranie.html',
  './css/styles.css',
  './js/script.js',
  './images/video-poster.jpg',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap'
  // Иконки для манифеста можно добавить сюда же
  // '/images/icons/icon-192x192.png',
  // '/images/icons/icon-512x512.png'
];

// Установка Service Worker и кэширование статических ресурсов
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Активация Service Worker и удаление старых кэшей
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Обработка запросов: отдавать из кэша, если есть, иначе идти в сеть
// Стратегия: Stale-While-Revalidate (Быстрый ответ из кэша, с фоновым обновлением)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(response => {
        const fetchPromise = fetch(event.request).then(networkResponse => {
          // Если запрос успешен, кэшируем новый ответ
          if (networkResponse.ok) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        });
        // Возвращаем из кэша сразу, если есть, а в фоне обновляем
        return response || fetchPromise;
      });
    })
  );
});