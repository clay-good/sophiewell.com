// spec-v986: the README's offline promise, exercised rather than assumed.
//
//   "Calculations run locally and keep working offline."
//
// Two things already guard the machinery around that sentence and neither
// touches the sentence itself. `no-network.spec.js` proves nothing LEAVES the
// device -- the privacy half. `test/unit/sw-shell.test.js` proves the service
// worker's precache LIST matches every asset index.html references. A correct
// list is not a populated cache: the install handler swallows every individual
// fetch failure by design ("install still succeeds"), so an asset that 404s at
// install time is missing from the cache and nothing anywhere notices.
//
// This asserts the link neither of them covers: after install, the shell cache
// actually HOLDS every asset the list names, and holds a real response for each.
//
// TWO WAYS OF SIMULATING OFFLINE WERE TRIED AND BOTH LIE HERE. Each was checked
// by emptying SHELL_ASSETS to `[]` and re-running; each still passed.
//
//   `context.setOffline(true)` does not apply to the service worker's own
//   fetches, so the worker fell through to the live server and served the page
//   from the network while the test believed it was offline.
//
//   `context.route('**', abort)` does not reach what satisfies the navigation
//   either -- the browser's own HTTP cache answers, and no request is recorded
//   as aborted.
//
// A test that passes when the thing it tests is broken is worse than no test, so
// neither shipped. What is left reads the cache directly, and DOES fail when the
// cache is empty. It proves the install populated the shell; it does not claim
// to prove the browser then renders from it, because nothing here can.
//
// Served from `dist` on :4175 -- the same build as :4174, but with the REAL
// service worker. scripts/serve.mjs answers /sw.js with a self-unregistering
// stub unless SERVE_SW is set, because the shell cache keys on a build hash that
// reads "dev" in the source tree and would otherwise serve every local edit from
// a stale copy. The escape hatch was written "when the offline behavior itself
// is what you are testing" and had never been used.

import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const DIST = 'http://localhost:4175';

// The list the worker promises to precache, read from the worker itself.
function shellAssets() {
  const src = readFileSync(fileURLToPath(new URL('../../sw.js', import.meta.url)), 'utf8');
  const body = src.slice(src.indexOf('const SHELL_ASSETS = ['));
  const list = body.slice(0, body.indexOf('\n];'));
  return [...list.matchAll(/'([^']+)'/g)].map((m) => m[1]).filter((p) => p.startsWith('./'));
}

// Register, then wait for the worker to control the page. A reload after
// `navigator.serviceWorker.ready` is what makes it the one answering fetches.
async function serviceWorkerInControl(page) {
  await page.goto(`${DIST}/`);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 15000 });
}

test.describe('offline', () => {
  // Chromium only: the other two projects do not run service workers in this
  // harness, so they would fail for the browser rather than for the site.
  test.skip(({ browserName }) => browserName !== 'chromium', 'service workers are chromium-only here');

  test('install actually caches every asset the shell list promises', async ({ page }) => {
    await serviceWorkerInControl(page);

    const promised = shellAssets();
    expect(promised.length, 'the worker names a shell to precache').toBeGreaterThan(5);

    const cached = await page.evaluate(async (paths) => {
      const names = await caches.keys();
      const shell = names.find((n) => n.startsWith('sophiewell-shell'));
      if (!shell) return { shell: null };
      const cache = await caches.open(shell);
      const missing = [];
      const empty = [];
      for (const p of paths) {
        const res = await cache.match(new URL(p, location.href).href);
        if (!res) { missing.push(p); continue; }
        if (!(await res.clone().arrayBuffer()).byteLength) empty.push(p);
      }
      return { shell, missing, empty, size: (await cache.keys()).length };
    }, promised);

    expect(cached.shell, 'a shell cache exists').toBeTruthy();
    // The install handler swallows individual failures, so this is the only
    // place a shell asset that 404s at install time would ever show up.
    expect(cached.missing, 'every promised shell asset is in the cache').toEqual([]);
    expect(cached.empty, 'and each one cached a real response, not an empty body').toEqual([]);
  });
});
