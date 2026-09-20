// Service Worker untuk Kula Studio PWA
// Hanya cache shell statis — request API dan non-GET SELALU bypass langsung ke network

const CACHE_NAME = 'kulastudio-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. JANGAN PERNAH intercept request non-GET (POST, PATCH, PUT, DELETE)
  if (request.method !== 'GET') {
    return;
  }

  // 2. JANGAN PERNAH intercept atau cache request API di hostname mana pun
  if (url.pathname.startsWith('/api') || url.pathname.includes('/api/')) {
    return;
  }

  // 3. JANGAN intercept koneksi websocket atau internal dev tools
  if (url.protocol.startsWith('ws') || url.pathname.includes('@vite') || url.pathname.includes('?token=')) {
    return;
  }

  // 4. JANGAN intercept host eksternal
  if (url.hostname !== self.location.hostname) {
    return;
  }

  // 5. Network first untuk navigasi halaman (SPA routing)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match('/index.html').then((r) => r || fetch(request))
      )
    );
    return;
  }

  // 6. Cache first untuk aset statis lokal (CSS, JS build, favicon, images)
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const cloned = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          if (request.method === 'GET') {
            cache.put(request, cloned);
          }
        }).catch(() => {});
        return response;
      });
    })
  );
});
