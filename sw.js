// sophiewell.com service worker (spec-v1541: offline that survives the field).
//
// - Install stores the whole offline pack named by precache-manifest.json, or
//   nothing: one failed entry fails the install, and the worker already in
//   control keeps serving its own complete pack. A half-downloaded update is
//   never used.
// - An entry whose content hash is unchanged is copied from the previous pack
//   instead of fetched, so a one-file fix costs one file.
// - An install interrupted by a lost signal resumes where it stopped: the
//   entries already stored stay in the new pack's cache until the next attempt.
// - The manifest is stored last. A pack cache holding it is complete; that is
//   how this worker, the next one, and the page's status line tell.
// - Old caches are deleted only on activate, which follows a complete install.
//
// PACK is stamped by scripts/build-precache.mjs with a hash of what the app
// runs, not the commit, so a docs-only commit leaves this file, and every
// phone's saved copy, untouched.

const PACK = 'dev';
const PACK_PREFIX = 'sophiewell-pack-';
const PACK_CACHE = `sophiewell-pack-${PACK}`;
// Anything fetched at run time that is not in the pack: dataset shards and
// prerendered pages. Keyed by the pack, whose version covers every data file.
const RUNTIME_CACHE = `sophiewell-data-${PACK}`;
const MANIFEST = './precache-manifest.json';
const PARALLEL = 6;

async function tell(message) {
  const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  for (const c of clients) c.postMessage(message);
}

// The complete packs already on the phone, newest manifest per url: url -> { hash, cache }.
async function previousEntries() {
  const out = new Map();
  for (const name of await caches.keys()) {
    if (!name.startsWith(PACK_PREFIX) || name === PACK_CACHE) continue;
    // Opened by its literal prefix, which scripts/check-commitments.mjs reads (spec-v50 §3.4).
    const cache = await caches.open(`sophiewell-pack-${name.slice(PACK_PREFIX.length)}`);
    const stored = await cache.match(MANIFEST);
    if (!stored) continue;
    try {
      for (const e of (await stored.json()).entries) out.set(e.url, { hash: e.hash, cache });
    } catch (_e) { /* an unreadable manifest offers nothing to reuse */ }
  }
  return out;
}

async function installPack() {
  const res = await fetch(MANIFEST, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`precache manifest: ${res.status}`);
  const manifest = await res.clone().json();
  // A deploy caught between files: this worker and the manifest disagree. Fail,
  // and the browser tries again at its next update check.
  if (manifest.version !== PACK) throw new Error(`precache manifest is ${manifest.version}, worker is ${PACK}`);
  const cache = await caches.open(PACK_CACHE);
  if (await cache.match(MANIFEST)) return;
  const previous = await previousEntries();
  const queue = manifest.entries.slice();
  const total = queue.length;
  let done = 0;
  let told = 0;
  async function one(entry) {
    if (await cache.match(entry.url)) return;
    const prev = previous.get(entry.url);
    let response = prev && prev.hash === entry.hash ? await prev.cache.match(entry.url) : null;
    if (!response) {
      response = await fetch(entry.url, { cache: 'no-cache' });
      if (!response.ok) throw new Error(`${entry.url}: ${response.status}`);
    }
    await cache.put(entry.url, response);
  }
  async function lane() {
    while (queue.length) {
      await one(queue.shift());
      done += 1;
      const pct = Math.floor((done / total) * 100);
      if (pct > told) { told = pct; tell({ type: 'pack-progress', pct }); }
    }
  }
  await Promise.all(Array.from({ length: PARALLEL }, lane));
  await cache.put(MANIFEST, res);
}

self.addEventListener('install', (event) => {
  event.waitUntil(installPack().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => name !== PACK_CACHE && name !== RUNTIME_CACHE)
          .map((name) => caches.delete(name))
      );
      await self.clients.claim();
    })()
  );
});

// The page asks whether its pack is complete, for the footer's status line.
self.addEventListener('message', (event) => {
  if (!event.data || event.data.type !== 'pack-status') return;
  event.waitUntil(
    (async () => {
      const stored = await (await caches.open(PACK_CACHE)).match(MANIFEST);
      let date = null;
      if (stored) { try { date = (await stored.json()).date; } catch (_e) { /* complete, undated */ } }
      event.source.postMessage({ type: 'pack-status', complete: !!stored, date });
    })()
  );
});

function offline(text) {
  return new Response(text, {
    status: 504,
    statusText: 'Gateway Timeout',
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Offline': '1' },
  });
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Report configuration is a live kill-switch surface. Never satisfy an API
  // request from a cache.
  if (url.pathname.startsWith('/api/')) return;

  event.respondWith(
    (async () => {
      const packed = await (await caches.open(PACK_CACHE)).match(request, { ignoreSearch: true });
      if (packed) return packed;
      const runtime = await caches.open(RUNTIME_CACHE);
      // Dataset shards: cache-first. A changed data file changes PACK, and with
      // it this cache's name.
      if (url.pathname.includes('/data/')) {
        const cached = await runtime.match(request);
        if (cached) return cached;
        try {
          const response = await fetch(request);
          if (response && response.ok) runtime.put(request, response.clone());
          return response;
        } catch (_e) {
          return offline('This list needs a connection the first time it is used. After that it works offline.');
        }
      }
      // Everything else (the prerendered /tools/, /for/ and /topics/ pages):
      // network first, so a copy fix is seen, then the copy saved on a visit.
      try {
        const response = await fetch(request);
        if (response && response.ok) runtime.put(request, response.clone());
        return response;
      } catch (_e) {
        const cached = await runtime.match(request);
        if (cached) return cached;
        if (request.mode === 'navigate') {
          // A page never visited online: open the same tool in the app, which
          // is in the pack. /tools/<id>/ is the app's #<id>.
          const tool = /^\/tools\/([^/]+)\/?$/.exec(url.pathname);
          return Response.redirect(new URL(tool ? `/#${tool[1]}` : '/', self.location.origin).href, 302);
        }
        return offline('Offline.');
      }
    })()
  );
});
