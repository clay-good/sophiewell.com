// Mobile no-horizontal-scroll sweep over the PRE-RENDERED static build under
// dist/ -- the pages Cloudflare Pages serves to a visitor (or crawler) who lands
// on a deep link from search: the audience hubs (/for/<audience>/), the topic
// pages (/topics/<slug>/), the /commitments/ page, and the full catalog of
// /tools/<id>/ pages. These are distinct HTML documents from the SPA hash routes that
// mobile-no-hscroll.spec.js already covers, so they need their own guard: a
// pre-rendered page can carry hand-authored copy, breadcrumbs, and OG headers
// the live SPA view never renders.
//
// Served by the second Playwright webServer (SERVE_ROOT=dist on :4174); the
// page list is read straight off the built dist/ tree so it can never drift
// from what shipped. `npm run test:e2e` builds dist/ before Playwright starts.

import { test, expect } from '@playwright/test';
import { readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const DIST = 'http://localhost:4174';
const DIST_DIR = fileURLToPath(new URL('../../dist', import.meta.url));

function dirSlugs(sub) {
  const full = `${DIST_DIR}/${sub}`;
  if (!existsSync(full)) return [];
  return readdirSync(full, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);
}

async function assertNoHorizontalScroll(page, label) {
  const o = await page.evaluate(() => ({
    s: document.documentElement.scrollWidth,
    c: document.documentElement.clientWidth,
  }));
  // Sub-pixel rounding can add 1px; anything more is a real overflow.
  expect(o.s, `${label}: documentElement scrollWidth (${o.s}) must not exceed `
    + `clientWidth (${o.c})`).toBeLessThanOrEqual(o.c + 1);
}

// Structural pages with unique layouts -- swept on every browser at 320px (the
// narrowest mainstream phone). Hubs/topics are read from dist/ so a new
// audience or topic is covered automatically.
const STRUCTURAL = [
  '/', '/commitments/', '/topics/',
  ...dirSlugs('for').map((s) => `/for/${s}/`),
  ...dirSlugs('topics').map((s) => `/topics/${s}/`),
];

for (const path of STRUCTURAL) {
  test(`static 320px: ${path} does not scroll horizontally`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    const resp = await page.goto(DIST + path, { waitUntil: 'load' });
    expect(resp && resp.status(), `${path} must serve 200`).toBeLessThan(400);
    await expect(page.locator('main, .content, .home-view, body').first()).toBeVisible();
    await assertNoHorizontalScroll(page, path);
  });
}

// The full pre-rendered tool-page sweep is chromium-only (same rationale as
// the SPA full-catalog sweep: a single long navigation loop is unreliable on
// the firefox/webkit runners; chromium gives the per-page signal).
test.describe('static tool pages', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'full tool-page sweep is chromium-only');

  test('every pre-rendered /tools/<id>/ page at 320px does not scroll horizontally', async ({ page }) => {
    test.setTimeout(300_000);
    const ids = dirSlugs('tools');
    expect(ids.length, 'dist/tools must hold the full pre-rendered catalog').toBeGreaterThan(150);
    await page.setViewportSize({ width: 320, height: 800 });
    const bad = [];
    for (const id of ids) {
      const resp = await page.goto(`${DIST}/tools/${id}/`, { waitUntil: 'load' });
      if (!resp || resp.status() >= 400) { bad.push(`${id}: HTTP ${resp && resp.status()}`); continue; }
      const o = await page.evaluate(() => ({
        s: document.documentElement.scrollWidth, c: document.documentElement.clientWidth,
      }));
      if (o.s > o.c + 1) bad.push(`${id}: ${o.s}/${o.c}`);
    }
    expect(bad, `static tool pages with horizontal scroll at 320px:\n  - ${bad.join('\n  - ')}`).toEqual([]);
  });
});
