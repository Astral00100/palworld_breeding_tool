// Caches the app shell so the interface can open even with no connection.
// Your actual data (combos/Palpedia) is never cached here — that's handled
// separately by the app itself via localStorage, and always tries OneDrive first.

const CACHE_NAME = 'pal-breeding-ledger-shell-v2';
const SHELL_FILES = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Never intercept calls to Microsoft Graph, login, or fonts — those need
  // to hit the network live (or fail live) so the app's own online/offline
  // handling can react correctly.
  if (
    url.hostname.includes('graph.microsoft.com') ||
    url.hostname.includes('login.microsoftonline.com') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('gstatic.com') ||
    url.hostname.includes('msauth.net')
  ) {
    return;
  }

  // App shell: cache-first, so the UI opens instantly and works offline.
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request)
          .then((response) => {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
            return response;
          })
          .catch(() => cached)
      );
    })
  );
});
