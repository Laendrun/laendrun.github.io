const VERSION = '0.0.1';
const CACHE_NAME = `kiss-${VERSION}`;
const GHPATH = '/collector';
const APP_STATIC_RESOURCES = [
  `${GHPATH}/`,
  `${GHPATH}/index.html`,
  `${GHPATH}/index.css`,
  `${GHPATH}/index.js`,
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_STATIC_RESOURCES);
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    })
  );
});
