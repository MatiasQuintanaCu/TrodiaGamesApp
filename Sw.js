const CACHE_NAME = 'trodia-minijuegos-v7';
const CORE_ASSETS = [
  './', './index.html', './reaccion.html', './ruleta.html', './pitstop.html', './frenada.html', './conos.html', './armar.html',
  './app.css', './shared.js', './Manifest.json',
  './img/trodia_fest.png', './fonts/lexend-latin-wght-normal.woff2',
  './img/logo.png', './img/Reaccion.png', './img/PITSTOP.png', './img/ruleta.png', './img/Frenada.png', './img/Conos.png', './img/Armar.png'
];
const TAILWIND = 'https://cdn.tailwindcss.com/3.4.17';

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(CORE_ASSETS.map((u) => cache.add(u).catch(() => {})));
    try { await cache.put(TAILWIND, await fetch(new Request(TAILWIND, { mode: 'no-cors' }))); } catch {}
  })());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

// Archivos propios: primero la red (así las actualizaciones llegan siempre), caché solo sin conexión.
// Recursos externos (Tailwind): primero caché.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const sameOrigin = new URL(req.url).origin === self.location.origin;
  event.respondWith(
    sameOrigin
      ? fetch(req)
          .then((res) => {
            if (res && res.status === 200) {
              const copy = res.clone();
              caches.open(CACHE_NAME).then((c) => c.put(req, copy));
            }
            return res;
          })
          .catch(() => caches.match(req, { ignoreSearch: true }))
      : caches.match(req).then((cached) =>
          cached ||
          fetch(req).then((res) => {
            if (res && (res.status === 200 || res.type === 'opaque')) {
              const copy = res.clone();
              caches.open(CACHE_NAME).then((c) => c.put(req, copy));
            }
            return res;
          })
        )
  );
});
