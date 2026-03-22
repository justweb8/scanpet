// ScanPet Service Worker — PWA + Push Notifications
const CACHE = 'scanpet-v2';
const ASSETS = ['/'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});

// Manejar notificaciones push
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {};
  e.waitUntil(
    self.registration.showNotification(data.title || '🐾 ScanPet', {
      body: data.body || 'Alguien escaneó la placa de tu mascota',
      icon: data.icon || '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'scanpet-alert',
      requireInteraction: true,
      data: { url: data.url || '/' }
    })
  );
});

// Al hacer clic en la notificación
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.openWindow(e.notification.data?.url || '/')
  );
});
