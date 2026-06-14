// Deep interaction sweep: for every tool route, click every visible button
// and type into every visible text/number input, asserting nothing throws.
//
// This intentionally tolerates wide variation across views; the contract is
// only "no uncaught error and the body still renders an h1". Per-tool semantic
// correctness is covered by unit tests in test/unit/.

import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

// This sweep does ~3 minutes of continuous navigation and DOM thrash. On
// chromium it is reliable; on firefox/webkit the same monolithic loop has
// occasionally exhausted the browser context (observed: target-closed at
// ~iteration 12). The lighter all-tools.spec.js sweep already runs cross-
// browser and catches per-renderer breakage, so we restrict this fuzz pass
// to chromium where the signal/cost ratio holds.
test.skip(({ browserName }) => browserName !== 'chromium', 'fuzz pass is chromium-only');

test('every tool tolerates indiscriminate interaction without crashing', async ({ page }) => {
  // Serial, full-catalog interaction sweep: one navigation + a burst of input
  // edits per tile. Its wall-clock grows linearly with the catalog (~1s/tile)
  // and contends for CPU with the other browser projects under
  // `npm run test:e2e`. At 342 tiles a clean run is ~6 min, so the budget is
  // generous headroom above that to absorb CI worker contention without a
  // timeout flake (same rationale as example-correctness.spec.js). A real crash
  // still fails fast per-tile, never via this timeout. Raise as the catalog grows.
  test.setTimeout(600_000);
  const errors = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e}`));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
  page.on('response', (r) => { if (r.status() >= 400) errors.push(`http ${r.status()} ${r.url()}`); });

  // spec-v51: source tile ids from sitemap.xml (the home grid was
  // reduced to 10 curated quick-picks; the sitemap remains the
  // canonical list of `/tools/<id>/` routes).
  const sitemap = await page.request.get('/sitemap.xml');
  expect(sitemap.ok(), 'sitemap.xml must be reachable').toBe(true);
  const xml = await sitemap.text();
  const ids = [...xml.matchAll(/<loc>[^<]*\/tools\/([^/<]+)\/<\/loc>/g)].map((m) => m[1]);

  const failures = [];
  for (const id of ids) {
    const before = errors.length;
    await page.goto('/#' + id, { waitUntil: 'load' });
    await page.waitForTimeout(80);

    // Type into the first few text/number inputs; default-fill nudges the
    // common live-render path that almost every calculator uses.
    const inputs = await page.locator('main input[type="text"], main input[type="number"], main input:not([type])').all();
    for (let i = 0; i < Math.min(inputs.length, 4); i++) {
      try {
        const inp = inputs[i];
        if (!(await inp.isVisible())) continue;
        const type = (await inp.getAttribute('type')) || 'text';
        await inp.fill(type === 'number' ? '1' : 'test');
      } catch { /* hidden / readonly / detached -- ignore */ }
    }

    // Click every visible button in the tool body except print, navigation,
    // and the example-button (the example button is exercised separately
    // and reloading the body mid-loop confuses Playwright's locator caching).
    const btns = await page.locator(
      'main button:not(.breadcrumb-back):not(.print-btn):not(.example-reset)',
    ).all();
    for (const b of btns) {
      try {
        if (!(await b.isVisible())) continue;
        await b.click({ timeout: 1000 });
      } catch { /* navigation-effect or detached node -- fine */ }
    }

    const newErrs = errors.slice(before);
    if (newErrs.length) failures.push({ id, errors: newErrs });
  }

  if (failures.length) {
    console.log('INTERACTION FAILURES:\n' + JSON.stringify(failures, null, 2));
  }
  expect(failures, JSON.stringify(failures, null, 2)).toEqual([]);
});
