const CACHE_NAME = 'trodia-minijuegos-v3';
const CORE_ASSETS = [
  './', './index.html', './reaccion.html', './ruleta.html', './pitstop.html',
  './app.css', './shared.js', './Manifest.json',
  './img/trodia_fest.png', './fonts/lexend-latin-wght-normal.woff2',
  './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'
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

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cached) => {
      const net = fetch(event.request)
        .then((res) => {
          if (res && (res.status === 200 || res.type === 'opaque')) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(event.request, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || net;
    })
  );
});
