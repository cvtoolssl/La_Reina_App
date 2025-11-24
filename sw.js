self.addEventListener('install', (event) => {
    self.skipWaiting();
  });
  
  self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
  });
  
  // Escuchar mensajes desde el script principal para lanzar notificaciones
  self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'NOTIFY') {
      self.registration.showNotification("💖 ChochoCycle Dice:", {
        body: `${event.data.title}\n${event.data.body}`,
        icon: 'https://cdn-icons-png.flaticon.com/512/2913/2913564.png',
        vibrate: [200, 100, 200]
      });
    }
  });