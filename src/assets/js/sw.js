const CACHE_NAME = 'brighthouse-v1';
const urlsToCache = [
  '/',
  '/ru/',
  '/public/rooms/room.png',
  '/public/rooms/corridor.png',
  '/public/rooms/kitchen.png',
  '/public/rooms/bathroom.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => response || fetch(e.request))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});



