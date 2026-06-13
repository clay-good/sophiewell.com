// "Skip to content" must move focus to the main landmark, not navigate.
//
// This is a hash-routed SPA: a bare href="#main" sets location.hash, the router
// reads route "main", finds no tile, and calls restoreHome(). Before spec-v74
// that meant activating the skip link on any tile ejected the user back to the
// home view, with focus on <body> instead of the content -- a WCAG 2.4.1
// (Bypass Blocks) failure that was worse than a no-op. spec-v74 intercepts the
// link to focus #main without touching the hash. This spec pins both halves:
// the current view is preserved AND focus lands on the main landmark.
//
// chromium-only: focus + activation behavior is engine-agnostic (the same
// rationale the other SPA-behavior guards use).

import { test, expect } from '@playwright/test';

test('skip link focuses #main and keeps the current tile (does not eject to home)', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'skip-link focus behavior is engine-agnostic');
  await page.goto('/#bmi', { waitUntil: 'load' });

  const heading = page.locator('#main h1').first();
  await expect(heading).toHaveText(/BMI/i);
  const hashBefore = await page.evaluate(() => location.hash);

  // Activate the skip link the way a keyboard user would: focus it, press Enter.
  await page.evaluate(() => document.querySelector('.skip-link').focus());
  await page.keyboard.press('Enter');

  // The tile must still be shown (it was replaced by the home view pre-fix)...
  await expect(heading, 'the tile must not be replaced by the home view').toHaveText(/BMI/i);
  // ...the route state must be untouched (no #main navigation)...
  expect(await page.evaluate(() => location.hash), 'the hash/route must be unchanged').toBe(hashBefore);
  // ...and focus must land on the main landmark (it was <body> pre-fix).
  expect(await page.evaluate(() => document.activeElement && document.activeElement.id),
    'focus must move to #main').toBe('main');
});

test('skip link focuses #main from the home view', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'skip-link focus behavior is engine-agnostic');
  await page.goto('/#/', { waitUntil: 'load' });
  await page.evaluate(() => document.querySelector('.skip-link').focus());
  await page.keyboard.press('Enter');
  expect(await page.evaluate(() => document.activeElement && document.activeElement.id),
    'focus must move to #main on home too').toBe('main');
});
