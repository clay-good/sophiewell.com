// Mobile responsiveness guard: no view may scroll horizontally.
//
// The site is built for the nurse on shift, who reaches for it on a phone
// as often as a workstation. A horizontal scrollbar on any view is a defect
// (long URLs in PA citations, wide tables, unbreakable hashes are the usual
// culprits). This spec has three layers:
//
//   1. A per-shape sample (home + one tile of each shape) at BOTH 320 and
//      360 px, on every browser engine.
//   2. The PA linter with long citation URLs rendered (the content most
//      likely to overflow).
//   3. A FULL-CATALOG sweep (every tile in the sitemap) at 320 px -- the
//      narrowest mainstream width -- so the "no horizontal scroll on every
//      view" guarantee is *enforced* across every tile, not just a
//      sample. Previously a full-catalog sweep was a one-time manual check;
//      this makes it a permanent regression guard, so a new tile can never
//      ship horizontal overflow undetected.
//
// 320 px is the strictest case: a layout that fits there fits at 360 px and
// up, so the full sweep runs at 320 px only (the sample still covers 360 px).
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

// Full-catalog sweep: every tile route, at the strictest mainstream width
// (320 px), must not scroll horizontally. Tile ids come from sitemap.xml (the
// same catalog source all-tools.spec.js uses). One test loops all tiles and
// reports every offender at once, so a regression names exactly which views
// broke. SPA hash routes re-render in place, so this is fast (~10-15 s for the
// whole catalog) despite covering the full tile catalog. chromium-only (inherits the skip
// above): horizontal overflow is layout/CSS-driven and the documentElement
// scrollWidth-vs-clientWidth check is engine-agnostic, so one engine is a
// sufficient guard and keeps the sweep cheap.
test('mobile 320px: every tile in the catalog (sitemap) does not scroll horizontally', async ({ page }) => {
  test.setTimeout(180_000);
  const resp = await page.request.get('/sitemap.xml');
  expect(resp.ok(), 'sitemap.xml must be reachable').toBe(true);
  const xml = await resp.text();
  const ids = [...xml.matchAll(/<loc>[^<]*\/tools\/([^/<]+)\/<\/loc>/g)].map((m) => m[1]);
  expect(ids.length, 'sitemap must list the full tile catalog').toBeGreaterThan(150);

  await page.setViewportSize({ width: 320, height: 800 });
  const offenders = [];
  for (const id of ids) {
    await page.goto('/#' + id, { waitUntil: 'load' });
    // Let async data fetches and the meta-block source stamp settle.
    await page.waitForTimeout(40);
    const overflow = await page.evaluate(() => {
      const doc = document.documentElement;
      return { scroll: doc.scrollWidth, client: doc.clientWidth };
    });
    if (overflow.scroll > overflow.client + 1) {
      offenders.push(`${id} (scrollWidth ${overflow.scroll} > clientWidth ${overflow.client})`);
    }
  }
  expect(offenders, `tiles with horizontal scroll at 320px:\n${offenders.join('\n')}`).toEqual([]);
});

// spec-v61 §2 A6: the printable handoff/summary views (SBAR, code-blue) render
// the shared print template on a button click. Build each and confirm (a) the
// printable footer is present and (b) the rendered template does not scroll
// horizontally at 320px. chromium-only (inherits the engine-agnostic rationale
// above).
test.skip(({ browserName }) => browserName !== 'chromium', 'printable build is chromium-only');

test('mobile 320px: printable SBAR + code-blue summaries build without horizontal scroll', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });

  // SBAR handoff: fill a long field, build the printable, assert footer + no hscroll.
  await page.goto('/#sbar-template', { waitUntil: 'load' });
  await page.fill('#s', 'Mrs. Chen in 412B, post-op day 1, new chest pressure radiating to the jaw with diaphoresis and a single run of nonsustained VT on telemetry.');
  await page.getByRole('button', { name: 'Build printable handoff' }).click();
  await expect(page.locator('.printable-footer')).toContainText('No data was sent or stored');
  await assertNoHorizontalScroll(page, 'sbar-template printable');

  // Code-blue summary: fill timestamps, build the printable, assert it renders.
  await page.goto('/#code-blue-clock', { waitUntil: 'load' });
  await page.fill('#cb-start', '2026-06-06T10:00');
  await page.fill('#cb-rhy', '2026-06-06T10:02');
  await page.fill('#cb-cyc', '3');
  await page.getByRole('button', { name: 'Build printable code summary' }).click();
  await expect(page.locator('.printable-footer')).toContainText('No data was sent or stored');
  await assertNoHorizontalScroll(page, 'code-blue-clock printable');
});
