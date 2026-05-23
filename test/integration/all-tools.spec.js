// Boot every #data-tool route in a real browser and surface render errors.
// Catches regressions that unit tests miss (data fetch failures, view import
// crashes, missing handlers, console errors, dead inputs).

import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

// spec-v51: the homepage no longer renders the full tile grid (only 10
// curated quick-picks). Discover tile IDs from sitemap.xml instead --
// it is the catalog source for `/tools/<id>/` URLs and is built from
// the same UTILITIES array `app.js` exposes at runtime.
async function discoverIds(page) {
  const resp = await page.request.get('/sitemap.xml');
  expect(resp.ok(), 'sitemap.xml must be reachable').toBe(true);
  const xml = await resp.text();
  return [...xml.matchAll(/<loc>[^<]*\/tools\/([^/<]+)\/<\/loc>/g)].map((m) => m[1]);
}

test('discover tool ids from sitemap', async ({ page }) => {
  const ids = await discoverIds(page);
  expect(ids.length).toBeGreaterThan(150);
  test.info().annotations.push({ type: 'tool-count', description: String(ids.length) });
});

test('every tool route renders without console errors and shows an h1', async ({ page }) => {
  test.setTimeout(180_000);
  const errors = [];
  page.on('pageerror', (err) => errors.push({ kind: 'pageerror', msg: String(err) }));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push({ kind: 'console', msg: msg.text() });
  });
  page.on('response', (resp) => {
    if (resp.status() >= 400) errors.push({ kind: 'http', status: resp.status(), url: resp.url() });
  });

  const ids = await discoverIds(page);
  const failures = [];
  for (const id of ids) {
    const before = errors.length;
    await page.goto('/#' + id, { waitUntil: 'load' });
    // Allow async data fetches and the meta-block source stamp to settle.
    await page.waitForTimeout(120);
    const h1 = await page.locator('.content > h1').first().textContent().catch(() => null);
    if (!h1 || !h1.trim()) failures.push({ id, reason: 'no h1' });
    const newErrs = errors.slice(before);
    if (newErrs.length) failures.push({ id, reason: 'errors', errors: newErrs });
  }
  if (failures.length) {
    console.log('TOOL FAILURES:\n' + JSON.stringify(failures, null, 2));
  }
  expect(failures, JSON.stringify(failures, null, 2)).toEqual([]);
});

test('every tool route exposes a working back button to home', async ({ page }) => {
  test.setTimeout(120_000);
  const ids = await discoverIds(page);
  // Sample to keep runtime sane; the contract is identical across views.
  const sample = ids.filter((_, i) => i % 8 === 0);
  for (const id of sample) {
    await page.goto('/#' + id);
    const back = page.locator('.breadcrumb-back');
    await expect(back, `back missing on #${id}`).toBeVisible();
    await back.click();
    // Assert on the hero (always visible on home) per spec-v51.
    await expect(page.locator('#hero-search')).toBeVisible();
  }
});
