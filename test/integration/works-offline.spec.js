// spec-v1541 §5: the offline promise, exercised rather than assumed.
//
//   "Calculations run locally, and after one visit every tool keeps working offline."
//
// TWO WAYS OF SIMULATING OFFLINE WERE TRIED (spec-v986) AND BOTH LIE. Each was
// checked by emptying the precache and re-running; each still passed.
//
//   `context.setOffline(true)` does not apply to the service worker's own
//   fetches, so the worker fell through to the live server.
//
//   `context.route('**', abort)` does not reach what satisfies the navigation
//   either -- the browser's own HTTP cache answers.
//
// So these tests run their own server over the built `dist/`, send
// `Cache-Control: no-store` (the HTTP cache holds nothing), and "go offline" by
// making that server drop every connection. Whatever renders after that came
// from Cache Storage. Each test also reads Cache Storage directly. The suite
// was checked against a pack cut down to the shell: the offline-boot tests
// failed, as they must.
//
// Chromium only: the other two projects do not run service workers in this
// harness, so they would fail for the browser rather than for the site.

import { test, expect } from '@playwright/test';
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = fileURLToPath(new URL('../../dist', import.meta.url));
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.txt': 'text/plain; charset=utf-8',
};

// A static server over dist/ that can be taken down, can serve a replacement
// body for a path, and logs every path asked for.
async function distServer() {
  const s = { down: false, overrides: new Map(), log: [] };
  s.server = createServer((req, res) => {
    const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    s.log.push(path);
    if (s.down) { req.socket.destroy(); return; }
    const headers = { 'Cache-Control': 'no-store' };
    if (s.overrides.has(path)) {
      const o = s.overrides.get(path);
      res.writeHead(o.status || 200, { ...headers, 'Content-Type': TYPES[extname(path)] || 'text/plain' });
      res.end(o.body);
      return;
    }
    let file = join(DIST, path);
    if (path.endsWith('/')) file = join(file, 'index.html');
    if (!file.startsWith(DIST) || !existsSync(file) || statSync(file).isDirectory()) {
      res.writeHead(404, headers); res.end('not found'); return;
    }
    res.writeHead(200, { ...headers, 'Content-Type': TYPES[extname(file)] || 'application/octet-stream' });
    res.end(readFileSync(file));
  });
  await new Promise((r) => s.server.listen(0, '127.0.0.1', r));
  s.base = `http://127.0.0.1:${s.server.address().port}`;
  s.close = () => new Promise((r) => { s.server.closeAllConnections(); s.server.close(r); });
  return s;
}

const manifest = () => JSON.parse(readFileSync(join(DIST, 'precache-manifest.json'), 'utf8'));

// Register, let the install finish, and be controlled.
async function installed(page, base) {
  await page.goto(`${base}/`);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 60000 });
}

// What Cache Storage holds: each pack cache, whether it is complete, and which
// of the given urls it is missing.
function packs(page, urls = []) {
  return page.evaluate(async (want) => {
    const out = [];
    for (const name of await caches.keys()) {
      if (!name.startsWith('sophiewell-pack-')) continue;
      const cache = await caches.open(name);
      const missing = [];
      for (const u of want) if (!(await cache.match(new URL(u, location.href).href))) missing.push(u);
      out.push({ name, complete: !!(await cache.match('./precache-manifest.json')), missing });
    }
    return out;
  }, urls);
}

// A new version of the site: a worker whose PACK differs (so the browser sees an
// update), and a manifest edited by `edit`.
function serveUpdate(s, version, edit) {
  const sw = readFileSync(join(DIST, 'sw.js'), 'utf8').replace(/const PACK = '[^']*';/, `const PACK = '${version}';`);
  const m = edit({ ...manifest(), version });
  s.overrides.set('/sw.js', { body: sw });
  s.overrides.set('/precache-manifest.json', { body: JSON.stringify(m) });
}

// Ask for the update and wait for the new worker to finish one way or the other.
function updateOutcome(page) {
  return page.evaluate(async () => {
    const reg = await navigator.serviceWorker.getRegistration();
    const found = new Promise((r) => reg.addEventListener('updatefound', () => r(reg.installing), { once: true }));
    await reg.update();
    const w = await found;
    return new Promise((r) => {
      const check = () => { if (w.state === 'activated' || w.state === 'redundant') r(w.state); };
      w.addEventListener('statechange', check);
      check();
    });
  });
}

// The app, booted from whatever the cache holds: the home box, a search, and
// three tools from different groups computing their worked examples.
async function bootsOffline(page, base) {
  await page.goto(`${base}/`);
  await expect(page.locator('#hero-search')).toBeVisible();
  await page.locator('#hero-search').fill('body mass index');
  await expect(page.locator('#hero-search-results [role="option"]').first()).toBeVisible();
  for (const [id, text] of [['bmi', 'BMI: 22.9'], ['anion-gap', 'Anion gap: 16'], ['cockcroft-gault', '88.89']]) {
    await page.goto(`${base}/#${id}`);
    await page.reload();
    await expect(page.locator('#q-results'), `${id} computes offline`).toContainText(text);
  }
}

test.describe('offline', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'service workers are chromium-only here');
  test.setTimeout(180_000);
  let s;
  test.beforeEach(async () => { s = await distServer(); });
  test.afterEach(async () => { await s.close(); });

  test('install stores every entry of the offline pack, and says so', async ({ page }) => {
    await installed(page, s.base);
    const m = manifest();
    expect(m.entries.length, 'the pack is the app, not the shell').toBeGreaterThan(1000);
    const [pack, ...others] = await packs(page, m.entries.map((e) => e.url));
    expect(others, 'one pack cache').toEqual([]);
    expect(pack.name).toBe(`sophiewell-pack-${m.version}`);
    expect(pack.complete, 'the manifest, stored last, marks the pack complete').toBe(true);
    expect(pack.missing, 'every manifest entry is in the cache').toEqual([]);
    await expect(page.locator('#offline-status')).toContainText('Saved for offline use, version of');
  });

  test('the app boots offline from the pack', async ({ page }) => {
    await installed(page, s.base);
    s.down = true;
    await bootsOffline(page, s.base);
  });

  test('a never-visited tool page opens offline', async ({ page }) => {
    await installed(page, s.base);
    s.down = true;
    await page.goto(`${s.base}/tools/bmi/`);
    await expect(page.locator('#q-results')).toContainText('BMI: 22.9');
  });

  test('an update that fails halfway leaves the saved pack intact', async ({ page }) => {
    await installed(page, s.base);
    const before = await packs(page);
    serveUpdate(s, 'b-broken', (m) => ({ ...m, entries: [...m.entries, { url: './lib/not-deployed.js', hash: '0' }] }));
    expect(await updateOutcome(page), 'the broken update is discarded').toBe('redundant');
    const after = await packs(page);
    expect(after.find((p) => p.name === before[0].name), 'the saved pack is still there and complete')
      .toEqual({ ...before[0], missing: [] });
    s.down = true;
    await bootsOffline(page, s.base);
  });

  test('an update fetches only the entries that changed', async ({ page }) => {
    await installed(page, s.base);
    serveUpdate(s, 'b-one-change', (m) => ({
      ...m, entries: m.entries.map((e) => (e.url === './styles.css' ? { ...e, hash: 'changed' } : e)),
    }));
    s.log.length = 0;
    expect(await updateOutcome(page)).toBe('activated');
    const fetched = s.log.filter((p) => p !== '/sw.js' && p !== '/precache-manifest.json');
    expect(fetched, 'only the changed entry crossed the network').toEqual(['/styles.css']);
    const after = await packs(page, manifest().entries.map((e) => e.url));
    expect(after.map((p) => [p.name, p.complete, p.missing.length])).toEqual([['sophiewell-pack-b-one-change', true, 0]]);
  });
});
