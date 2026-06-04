// Mobile responsiveness guard: no view may scroll horizontally.
//
// The site is built for the nurse on shift, who reaches for it on a phone
// as often as a workstation. A horizontal scrollbar on any view is a defect
// (long URLs in PA citations, wide tables, unbreakable hashes are the usual
// culprits). This spec loads the home view and a representative tile from
// each shape at a narrow phone viewport (360 CSS px, the common Android
// floor) and asserts the document never overflows its own width.
//
// The PA linter case additionally drops a UnitedHealthcare TXT packet so the
// findings list renders its long uhcprovider.com citation URLs -- the exact
// content that must wrap rather than scroll (styles.css .pa-rule-citation
// overflow-wrap).

import { test, expect } from '@playwright/test';

const PHONE = { width: 360, height: 800 };

// scrollWidth can exceed clientWidth by a sub-pixel from rounding; allow 1px.
async function assertNoHorizontalScroll(page, label) {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return { scroll: doc.scrollWidth, client: doc.clientWidth };
  });
  expect(overflow.scroll, `${label}: documentElement scrollWidth (${overflow.scroll}) `
    + `must not exceed clientWidth (${overflow.client})`).toBeLessThanOrEqual(overflow.client + 1);
}

const STATIC_VIEWS = [
  { hash: '/', label: 'home' },
  { hash: '/#bmi', label: 'bmi (numeric calculator)' },
  { hash: '/#wells-pe', label: 'wells-pe (scoring tile)' },
  { hash: '/#pa-lint', label: 'pa-lint (document-linter, empty state)' },
  // Regression guards for the three views a full-catalog sweep caught
  // overflowing at <=414px: two wide reference tables (now wrapped in a
  // .table-scroll region) and the SBAR <pre> output (now white-space:
  // pre-wrap). See styles.css .table-scroll / pre and lib/table.js.
  { hash: '/#peds-dose', label: 'peds-dose (wide reference table)' },
  { hash: '/#anticoag-reversal', label: 'anticoag-reversal (wide reference table)' },
  { hash: '/#sbar-template', label: 'sbar-template (pre-formatted output)' },
];

// 320px is the narrowest mainstream phone (older/smaller Android, iPhone SE
// in some zoom states); 360px is the common Android floor.
const VIEWPORTS = [{ width: 320, height: 800 }, PHONE];

for (const view of STATIC_VIEWS) {
  for (const vp of VIEWPORTS) {
    test(`mobile ${vp.width}px: ${view.label} does not scroll horizontally`, async ({ page }) => {
      await page.setViewportSize(vp);
      await page.goto(view.hash);
      await expect(page.locator('.content, .home-view, main').first()).toBeVisible();
      await assertNoHorizontalScroll(page, view.label);
    });
  }
}

// chromium-only: depends on the file-drop + lazy-parse path the other PA
// integration specs already gate to chromium.
test.skip(({ browserName }) => browserName !== 'chromium', 'PA findings sweep is chromium-only');

test('mobile 360px: pa-lint findings with long citation URLs do not scroll horizontally', async ({ page }) => {
  await page.setViewportSize(PHONE);
  await page.goto('/#pa-lint');
  await expect(page.locator('#pa-file-picker')).toBeAttached();

  // A UnitedHealthcare packet that fires several R-PA-UHC-* rules, each
  // carrying a long uhcprovider.com citation URL in .pa-rule-citation.
  const packet = 'UnitedHealthcare Choice Plus Prior Authorization Request\n'
    + 'Member ID: 987654321\n'
    + 'Requested procedure: MRI lumbar spine CPT 72148\n'
    + 'Out-of-network request.\n'
    + 'This is an appeal of the prior determination.\n';
  await page.setInputFiles('#pa-file-picker', {
    name: 'uhc-packet.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from(packet, 'utf8'),
  });

  // Wait for the findings list (citations rendered) before measuring.
  await expect(page.locator('.pa-rule-citation').first()).toBeVisible({ timeout: 20_000 });
  await assertNoHorizontalScroll(page, 'pa-lint findings');
});
