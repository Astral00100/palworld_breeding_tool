// Caches the app shell so the interface can open even with no connection.
// Your actual data (combos/Palpedia) is never cached here — that's handled
// separately by the app itself via localStorage, and always tries OneDrive first.

const CACHE_NAME = 'pal-breeding-ledger-shell-v3';
const SHELL_FILES = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Fetch each shell file with cache:'reload' so a browser-level HTTP cache
      // can't hand us a stale copy while we're building the *new* cache version.
      await Promise.all(
        SHELL_FILES.map((url) =>
          fetch(url, { cache: 'reload' }).then((response) => cache.put(url, response))
        )
      );
    })
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

  // Never intercept calls to Supabase or fonts — those need to hit the
  // network live (or fail live) so the app's own online/offline handling
  // can react correctly.
  if (
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('supabase.in') ||
    url.hostname.includes('jsdelivr.net') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('gstatic.com')
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
