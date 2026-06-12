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

// Accessibility: every form control in every rendered tile view must have an
// accessible name, so a screen-reader user hears a label, not a bare "edit
// text" / "combo box". The static a11y-check scans renderer SOURCE for
// <label for>; this catches the dynamic-DOM cases it cannot see -- controls
// built at runtime whose name comes from aria-label (the added MME rows, the
// offscreen PA file picker). chromium-only: accessible-name computation is
// DOM-driven and engine-agnostic, so one engine guards it cheaply (per-test
// skip so the rest of this file still runs on every engine).
test('every form control in every tool view has an accessible name', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'accessible-name sweep is chromium-only (DOM-driven, engine-agnostic)');
  test.setTimeout(180_000);
  const ids = await discoverIds(page);
  const offenders = [];
  for (const id of ids) {
    await page.goto('/#' + id, { waitUntil: 'load' });
    await page.waitForTimeout(40);
    const bad = await page.evaluate(() => {
      function named(el) {
        const a = el.getAttribute('aria-label'); if (a && a.trim()) return true;
        const lb = el.getAttribute('aria-labelledby');
        if (lb && lb.split(/\s+/).some((r) => { const t = document.getElementById(r); return t && t.textContent.trim(); })) return true;
        if (el.labels && [...el.labels].some((l) => l.textContent.trim())) return true;
        const ti = el.getAttribute('title'); if (ti && ti.trim()) return true;
        const ty = (el.getAttribute('type') || '').toLowerCase();
        // hidden/submit/button inputs take their name from value, not a label.
        if (el.tagName === 'INPUT' && (ty === 'hidden' || ty === 'submit' || ty === 'button') && (el.value || '').trim()) return true;
        return false;
      }
      return [...document.querySelectorAll('main input, main select, main textarea, .content input, .content select, .content textarea')]
        .filter((el) => !named(el))
        .map((el) => `${el.tagName.toLowerCase()}#${el.id || '(noid)'}`);
    });
    if (bad.length) offenders.push(`${id}: ${bad.join(', ')}`);
  }
  expect(offenders, `form controls with no accessible name:\n${offenders.join('\n')}`).toEqual([]);
});

// Accessibility: heading levels in a rendered tile body must not skip a level
// (WCAG 1.3.1 Info and Relationships, 2.4.10 Section Headings). The page name
// is the `.content > h1`; a renderer whose first section heading is an <h3>
// produces an h1->h3 skip that a screen-reader's heading navigation reports as a
// missing level. The static a11y-check only validates heading order in
// index.html, and the h1 test above only checks h1 presence, so this dynamic
// case slips through both. chromium-only (DOM-driven, engine-agnostic).
test('no tool view skips a heading level (h1 -> h3 with no h2)', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'heading-order sweep is chromium-only (DOM-driven, engine-agnostic)');
  test.setTimeout(180_000);
  const ids = await discoverIds(page);
  const offenders = [];
  for (const id of ids) {
    await page.goto('/#' + id, { waitUntil: 'load' });
    await page.waitForTimeout(40);
    const skips = await page.evaluate(() => {
      const hs = [...document.querySelectorAll('.content h1, .content h2, .content h3, .content h4, .content h5, .content h6')]
        .map((el) => ({ level: Number(el.tagName[1]), text: el.textContent.trim().slice(0, 40) }));
      const out = [];
      let prev = 0;
      for (const h of hs) {
        if (prev !== 0 && h.level > prev + 1) out.push(`h${prev}->h${h.level} "${h.text}"`);
        prev = h.level;
      }
      return out;
    });
    if (skips.length) offenders.push(`${id}: ${skips.join('; ')}`);
  }
  expect(offenders, `heading-level skips:\n${offenders.join('\n')}`).toEqual([]);
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
