// Printing must not drop the citation.
//
// The citation, the source's interpretation bands, and the derivation block all
// live inside a closed <details> so the tool page stays short. A closed
// <details> does not print its contents, so without help a page printed for the
// chart would carry the number and none of its provenance. theme.js opens every
// disclosure on `beforeprint` and restores each one on `afterprint`.
//
// This is the regression guard for that handler, on both surfaces that ship a
// disclosure: the SPA tool view and the pre-rendered /tools/<id>/ page.
//
// chromium-only: the behavior is a plain DOM event handler with no
// engine-specific surface, so one engine is a sufficient guard.

import { test, expect } from '@playwright/test';

test.skip(({ browserName }) => browserName !== 'chromium', 'print-expansion check is chromium-only');

// wells-pe carries both disclosures: the derivation block inside the tool body
// and the citation block in the references region.
async function probe(page) {
  return page.evaluate(() => {
    const state = () => [...document.querySelectorAll('details')].map((d) => d.open);
    const before = state();
    window.dispatchEvent(new Event('beforeprint'));
    const during = state();
    window.dispatchEvent(new Event('afterprint'));
    return { before, during, after: state() };
  });
}

test('SPA tool view: every closed disclosure opens for print and closes again', async ({ page }) => {
  await page.goto('/#wells-pe', { waitUntil: 'load' });
  await expect(page.locator('.tool-proof')).toBeAttached();

  const r = await probe(page);
  expect(r.before.length, 'wells-pe should render at least one disclosure').toBeGreaterThan(0);
  expect(r.before, 'disclosures start closed').toEqual(r.before.map(() => false));
  expect(r.during, 'every disclosure is open while printing').toEqual(r.before.map(() => true));
  expect(r.after, 'each disclosure is restored to closed after printing').toEqual(r.before);
});

// The pre-rendered pages are served from dist/ on 4174 (see playwright.config.js
// webServer), and load theme.js as their only script, so they exercise the same
// handler from a different entry point.
test('pre-rendered tool page: the references disclosure opens for print', async ({ page }) => {
  await page.goto('http://localhost:4174/tools/wells-pe/', { waitUntil: 'load' });
  await expect(page.locator('details.tp-refs')).toBeAttached();

  const r = await probe(page);
  expect(r.before.length).toBeGreaterThan(0);
  expect(r.during, 'every disclosure is open while printing').toEqual(r.before.map(() => true));
  expect(r.after, 'each disclosure is restored after printing').toEqual(r.before);
});

test('SPA: a disclosure the reader opened stays open after printing', async ({ page }) => {
  await page.goto('/#wells-pe', { waitUntil: 'load' });
  const proof = page.locator('.tool-proof');
  await proof.evaluate((d) => { d.open = true; });

  await probe(page);
  await expect(proof).toHaveJSProperty('open', true);
});
