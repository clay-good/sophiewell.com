// Boot every #data-tool route in a real browser and surface render errors.
// Catches regressions that unit tests miss (data fetch failures, view import
// crashes, missing handlers, console errors, dead inputs).

import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

test('discover tool ids from home grid', async ({ page }) => {
  await page.goto('/');
  const ids = await page.$$eval('.tool-card', (cards) =>
    cards.map((c) => c.getAttribute('data-tool')).filter(Boolean),
  );
  expect(ids.length).toBeGreaterThan(150);
  // Stash discovered ids on the test info for the suite below.
  test.info().annotations.push({ type: 'tool-count', description: String(ids.length) });
});

// We can't easily share state across tests; instead, fetch the home page once
// per worker, extract tool ids, and run a single parameterized assertion.
async function discoverIds(page) {
  await page.goto('/');
  return page.$$eval('.tool-card', (cards) =>
    cards.map((c) => c.getAttribute('data-tool')).filter(Boolean),
  );
}

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
    await expect(page.locator('#tile-grid')).toBeVisible();
  }
});
