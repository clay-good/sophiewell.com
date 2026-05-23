// spec-v50 §3.1 step 2 / §3.3 / §3.4 / §3.5: runtime posture assertions.
//
// Boots a real browser, exercises a representative slice of the catalog,
// and asserts:
//   - Zero requests to any origin other than the page origin (no third
//     party fetches; CSP connect-src 'self' is the build-time half).
//   - Zero `navigator.sendBeacon` calls and zero `Image` pixel-style fires
//     to off-origin URLs (the analytics half of §3.5).
//   - `document.cookie` is empty after every interaction (§3.3).
//   - Every localStorage / sessionStorage key written matches the
//     allowlist in scripts/storage-allowlist.json (§3.4).
//
// This is the runtime side of the commitments check. The static side
// lives in scripts/check-commitments.mjs and scripts/grep-check.mjs.

import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');

async function loadAllowlist() {
  const text = await readFile(join(ROOT, 'scripts', 'storage-allowlist.json'), 'utf8');
  return JSON.parse(text);
}

function isSameOrigin(reqUrl, pageOrigin) {
  try {
    const u = new URL(reqUrl);
    if (u.protocol === 'data:' || u.protocol === 'blob:' || u.protocol === 'about:') return true;
    return u.origin === pageOrigin;
  } catch (_) {
    return true;
  }
}

// Three representative tiles exercising distinct code paths:
//   bmi               - pure compute, no data fetch
//   icd10cm-lookup    - data-shard fetch (must hit /data/* on the page origin)
//   wells-pe          - boolean / additive scoring with synonym match
const SAMPLE_TILES = ['bmi', 'icd10cm-lookup', 'wells-pe'];

test('runtime: no off-origin network calls, no cookies, allowlisted storage only', async ({ page }) => {
  test.setTimeout(60_000);
  const allow = await loadAllowlist();
  const allowKeys = new Set(allow.keys);

  const pageOrigin = new URL(page.context()._options?.baseURL || process.env.BASE_URL || 'http://localhost:4173').origin;

  const offOriginRequests = [];
  page.on('request', (req) => {
    const url = req.url();
    if (!isSameOrigin(url, pageOrigin)) {
      offOriginRequests.push({ method: req.method(), url });
    }
  });

  // Patch navigator.sendBeacon and Image to a tripwire before any tile code runs.
  await page.addInitScript(() => {
    window.__sw_beaconCalls = [];
    if (navigator.sendBeacon) {
      const orig = navigator.sendBeacon.bind(navigator);
      navigator.sendBeacon = (url, data) => {
        window.__sw_beaconCalls.push({ kind: 'sendBeacon', url: String(url) });
        return orig(url, data);
      };
    }
    const OrigImage = window.Image;
    window.Image = function PatchedImage(...args) {
      const inst = new OrigImage(...args);
      try {
        Object.defineProperty(inst, 'src', {
          set(v) {
            try { window.__sw_beaconCalls.push({ kind: 'image.src', url: String(v) }); } catch (_) {}
            OrigImage.prototype.__lookupSetter__('src').call(inst, v);
          },
          get() { return OrigImage.prototype.__lookupGetter__('src').call(inst); },
        });
      } catch (_) {}
      return inst;
    };
    window.Image.prototype = OrigImage.prototype;
  });

  await page.goto('/', { waitUntil: 'networkidle' });

  // Exercise the home view (search, browse-disclosure toggle).
  await page.evaluate(() => { document.getElementById('browse-disclosure').open = true; });
  await page.fill('#hero-search', 'bmi').catch(() => {});

  // Exercise each sample tile: route + minimum input.
  for (const id of SAMPLE_TILES) {
    await page.goto('/#' + id, { waitUntil: 'load' });
    await page.waitForTimeout(150);
    if (id === 'bmi') {
      await page.fill('#w', '70').catch(() => {});
      await page.fill('#h', '1.75').catch(() => {});
    }
  }

  // Drain network / settle any async work.
  await page.waitForTimeout(300);

  // 1. No off-origin requests at all.
  expect(offOriginRequests, `off-origin requests: ${JSON.stringify(offOriginRequests, null, 2)}`).toEqual([]);

  // 2. No beacon / image-pixel calls fired.
  const beaconCalls = await page.evaluate(() => window.__sw_beaconCalls || []);
  expect(beaconCalls, `beacon-style calls: ${JSON.stringify(beaconCalls, null, 2)}`).toEqual([]);

  // 3. document.cookie stays empty after every interaction.
  const cookieValue = await page.evaluate(() => document.cookie);
  expect(cookieValue, 'document.cookie must be empty (spec-v50 §3.3)').toBe('');

  // 4. localStorage / sessionStorage keys must be on the allowlist.
  const storageKeys = await page.evaluate(() => ({
    local: Object.keys(window.localStorage || {}),
    session: Object.keys(window.sessionStorage || {}),
  }));
  for (const k of storageKeys.local) {
    expect(allowKeys.has(k), `localStorage key "${k}" not in storage-allowlist (spec-v50 §3.4)`).toBe(true);
  }
  for (const k of storageKeys.session) {
    expect(allowKeys.has(k), `sessionStorage key "${k}" not in storage-allowlist (spec-v50 §3.4)`).toBe(true);
  }
});
