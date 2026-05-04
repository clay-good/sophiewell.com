// sophiewell.com service worker.
// - Precaches the application shell on install.
// - Caches data shards on first fetch with a cache-first strategy.
// - Deletes old caches on activation.
//
// BUILD_HASH is bumped by the build script. The cache name includes it so a
// new deployment cleanly invalidates old caches.

const BUILD_HASH = 'dev';
const SHELL_CACHE = `sophiewell-shell-${BUILD_HASH}`;
const DATA_CACHE = `sophiewell-data-${BUILD_HASH}`;

const SHELL_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './CHANGELOG.md',
  './docs/stability.md',
  // Per-dataset manifests. Listing them by path so they precache for offline
  // first-load. Shards themselves are cached lazily on first fetch.
  './data/icd10cm/manifest.json',
  './data/hcpcs/manifest.json',
  './data/cpt-summaries/manifest.json',
  './data/mpfs/manifest.json',
  './data/nadac/manifest.json',
  './data/ndc/manifest.json',
  './data/npi/manifest.json',
  './data/ncci/manifest.json',
  './data/mue/manifest.json',
  './data/hospital-prices/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      // Tolerate missing manifests during early build steps.
      await Promise.all(
        SHELL_ASSETS.map(async (url) => {
          try {
            const response = await fetch(url, { cache: 'no-cache' });
            if (response && response.ok) await cache.put(url, response.clone());
          } catch (_e) {
            // Swallow individual failures; install still succeeds.
          }
        })
      );
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => name !== SHELL_CACHE && name !== DATA_CACHE)
          .map((name) => caches.delete(name))
      );
      await self.clients.claim();
    })()
  );
});

function isDataRequest(url) {
  return url.pathname.includes('/data/');
}

function isSameOrigin(url) {
  return url.origin === self.location.origin;
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (!isSameOrigin(url)) return;

  if (isDataRequest(url)) {
    // Cache-first for data shards; fall through to network on miss and store.
    event.respondWith(
      (async () => {
        const cache = await caches.open(DATA_CACHE);
        const cached = await cache.match(request);
        if (cached) return cached;
        try {
          const response = await fetch(request);
          if (response && response.ok) {
            cache.put(request, response.clone());
          }
          return response;
        } catch (err) {
          // Offline and not in cache: return a clear error response.
          return new Response('Offline and resource not cached.', {
            status: 504,
            statusText: 'Gateway Timeout',
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          });
        }
      })()
    );
    return;
  }

  // Shell: cache-first, fall back to network, fall back to cached index.html
  // for navigation requests so offline reload still works.
  event.respondWith(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      const cached = await cache.match(request);
      if (cached) return cached;
      try {
        const response = await fetch(request);
        if (response && response.ok) cache.put(request, response.clone());
        return response;
      } catch (err) {
        if (request.mode === 'navigate') {
          const fallback = await cache.match('./index.html');
          if (fallback) return fallback;
        }
        return new Response('Offline.', {
          status: 504,
          statusText: 'Gateway Timeout',
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      }
    })()
  );
});
