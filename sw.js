const CACHE_NAME = 'chocho-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});

// Manejo de notificaciones en segundo plano
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'NOTIFY') {
    self.registration.showNotification("🍑 ChochoCycle", {
      body: `${event.data.title}\n${event.data.body}`,
      icon: 'https://cdn-icons-png.flaticon.com/512/3014/3014239.png',
      vibrate: [200, 100, 200]
    });
  }
});