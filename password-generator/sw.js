const VERSION = '1.2.7';
const CACHE_NAME = `password-generator-${VERSION}`;
const GHPATH = '/password-generator';
const APP_STATIC_RESOURCES = [
	`${GHPATH}/`,
	`${GHPATH}/index.html`,
	`${GHPATH}/styles.css`,
	`${GHPATH}/app.js`,
	`${GHPATH}/words.js`,
	`${GHPATH}/icons/android/android-launchericon-512-512.png`
];

self.addEventListener('install', (e) => {
	console.log(e)
	e.waitUntil(
		(async () => {
			const cache = await caches.open(CACHE_NAME);
			cache.addAll(APP_STATIC_RESOURCES);
		})()
	);
})

self.addEventListener('activate', (e) => {
	e.waitUntil(
		(async () => {
			const names = await caches.keys()
			await Promise.all(
				names.map((name) => {
					if (name !== CACHE_NAME) {
						return caches.delete(name);
					}
				})
			);
			await clients.claim();
		})(),
	);
});

self.addEventListener('fetch', (e) => {
	if (e.request.mode === 'navigate') {
		e.respondWith(caches.match('/'));
		return;
	}

	e.respondWith(
		(async () => {
			const cache = await caches.open(CACHE_NAME);
			const cachedResponse = await cache.match(e.request.url);
			if (cachedResponse) {
				return cachedResponse;
			}
			return new Response(null, {status: 404 });
		})(),
	);
});