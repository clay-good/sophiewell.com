// Theme-correctness guard: the active theme must drive the UA color-scheme so
// native controls (date pickers, number spinners, <select> popups, scrollbars)
// and the mobile browser-chrome bar match the page, in BOTH themes.
//
// spec-v73 fixed a real light-mode defect: color-scheme was declared dark-only
// (a hardcoded <meta>), so a light-mode page rendered a black date field and
// dark scrollbars. The fix sets `color-scheme` in CSS keyed on data-theme, so
// it tracks the manual toggle, not just the OS preference. This spec pins both
// halves so a future palette/meta edit can't silently re-break either theme.
//
// chromium-only: color-scheme resolution is engine-agnostic CSS, so one engine
// is a sufficient guard (the same rationale the hscroll catalog sweep uses).

import { test, expect } from '@playwright/test';

// #appeal-deadline renders a native <input type=date> -- the control that
// rendered black-on-white before the fix -- so this route exercises the exact
// surface the bug appeared on.
const ROUTE = '/#appeal-deadline';

// Force the theme via the stored-preference path (localStorage 'sw-theme'),
// injected before theme.js runs at boot -- deterministic on every engine,
// unlike the prefers-color-scheme emulation path.
async function expectScheme(page, theme, expectedColor) {
  await page.addInitScript((t) => {
    try { localStorage.setItem('sw-theme', t); } catch (_) { /* storage blocked */ }
  }, theme);
  await page.goto(ROUTE, { waitUntil: 'load' });

  const active = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  expect(active, `${theme}: data-theme should be active (else the guard is vacuous)`).toBe(theme);

  // The CSS color-scheme must resolve to the active theme so the UA paints
  // native widgets to match. Before the fix this was 'normal'.
  const scheme = await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme);
  expect(scheme, `${theme}: computed color-scheme should equal the theme`).toBe(theme);

  // The mobile browser-chrome bar must match --bg-primary, and there must be
  // exactly one theme-color meta (theme.js updates the existing tag, never
  // appends a duplicate).
  const metas = await page.evaluate(() =>
    [...document.querySelectorAll('meta[name="theme-color"]')].map((m) => m.content));
  expect(metas, `${theme}: exactly one theme-color meta`).toHaveLength(1);
  expect(metas[0], `${theme}: theme-color should match --bg-primary`).toBe(expectedColor);
}

test('color-scheme + theme-color track the light theme', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'color-scheme resolution is engine-agnostic CSS');
  await expectScheme(page, 'light', '#ffffff');
});

test('color-scheme + theme-color track the dark theme', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'color-scheme resolution is engine-agnostic CSS');
  await expectScheme(page, 'dark', '#0a0a0a');
});
