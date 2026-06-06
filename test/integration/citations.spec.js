// spec-v54 §4.4: citation rendering integrity.
//
// Two assertions, on a tile whose citation carries a long DOI URL (the content
// most likely to overflow a narrow column):
//   1. The inline citation is actually rendered on the tile (invariant 2.1:
//      a citation that lives only in a doc, not on the tile, is a violation).
//   2. The references block does not scroll horizontally at 320 px (invariant
//      2.3: long DOIs/instrument tokens must wrap, not force a side-scroll).
//
// 320 px is the narrowest mainstream phone width; a block that fits there fits
// at every wider width. chromium-only: horizontal overflow is layout/CSS-driven
// and the scrollWidth-vs-clientWidth check is engine-agnostic, so one engine is
// a sufficient, cheap guard (matching the full-catalog sweep in
// mobile-no-hscroll.spec.js).

import { test, expect } from '@playwright/test';

test.skip(({ browserName }) => browserName !== 'chromium', 'references rendering check is chromium-only');

// egfr ships a long DOI in citationUrl (https://doi.org/10.1056/NEJMoa2102953)
// rendered as the "Read the source" link, plus a multi-sentence inline citation.
const LONG_DOI_TILE = 'egfr';

test('320px: a long-DOI tile renders its inline citation and the references block does not scroll horizontally', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/#' + LONG_DOI_TILE, { waitUntil: 'load' });

  // Invariant 2.1: the inline citation is present on the tile.
  const citation = page.locator('.tool-meta .citation').first();
  await expect(citation).toBeVisible();
  await expect(citation).toContainText('Citation:');
  await expect(citation).toContainText('NEJM');

  // Let the source stamp / link settle, then measure the references block.
  await page.waitForTimeout(50);
  const overflow = await page.evaluate(() => {
    const block = document.querySelector('.tool-meta');
    const doc = document.documentElement;
    return {
      blockScroll: block ? block.scrollWidth : 0,
      blockClient: block ? block.clientWidth : 0,
      docScroll: doc.scrollWidth,
      docClient: doc.clientWidth,
    };
  });

  // Invariant 2.3: neither the references block nor the page scrolls sideways.
  expect(overflow.blockScroll,
    `references block scrollWidth (${overflow.blockScroll}) must not exceed clientWidth (${overflow.blockClient})`)
    .toBeLessThanOrEqual(overflow.blockClient + 1);
  expect(overflow.docScroll,
    `document scrollWidth (${overflow.docScroll}) must not exceed clientWidth (${overflow.docClient})`)
    .toBeLessThanOrEqual(overflow.docClient + 1);
});
