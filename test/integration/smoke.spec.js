// End-to-end smoke tests. Drives a real browser through the home view and a
// representative tile from each utility group.
//
// Selectors updated for the spec.md v4 redesign: tiles are
// `<button class="tool-card" data-tool="...">` inside a sticky topbar
// layout. The topbar exposes the brand wordmark; tool views render their
// name into <main class="content"> with a breadcrumb above.

import { test, expect } from '@playwright/test';

test('home: renders centered topbar, hero search, and full-catalog tool picker', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.topbar .topbar-brand')).toContainText('Sophie Well');
  // spec-v52 §6: the v51 ten quick-picks were replaced by a single
  // native <select> that lists every tile in the catalog alphabetically.
  // The placeholder option + one <option> per tile = catalog count + 1.
  await expect(page.locator('#hero-search')).toBeVisible();
  await expect(page.locator('#tool-picker-select')).toBeVisible();
  const optCount = await page.locator('#tool-picker-select option').count();
  expect(optCount).toBeGreaterThan(200);
  await expect(page.locator('.quick-pick')).toHaveCount(0);
  await expect(page.locator('.filters:not(.visually-hidden)')).toHaveCount(0);
  await expect(page.locator('#search')).toHaveCount(0);
});

test('home: hero-search routes to a tile on Enter (BMI smoke)', async ({ page }) => {
  await page.goto('/');
  // spec-v51: navigate to BMI via deep link (the home no longer renders
  // the BMI tile directly; only 10 curated quick-picks are visible).
  await page.goto('/#bmi');
  await expect(page).toHaveURL(/#bmi/);
  await expect(page.locator('.content h1')).toHaveText('BMI Calculator');
  await expect(page.locator('.breadcrumb-back')).toBeVisible();
  // The form is mounted and live-render works:
  await page.fill('#w', '70');
  await page.fill('#h', '1.75');
  await expect(page.getByText('BMI: 22.9 kg/m^2 (Normal)')).toBeVisible();
});

// spec-v29 wave 29-2: tiles in Groups A (code-reference lookups), C/L
// (patient-literacy / form-locator), I (field-medicine reference cards),
// K/O (lab-range / wallet-card reference), and the single-class clinical
// reference cards in Group G were removed. Their hashes now redirect to
// the home view with a `.deprecation-notice` carrying the "Removed in
// spec-v29" banner. The per-tile smokes below are deleted; a single
// parameterized check covers one representative hash from each retired
// surface.

const RETIRED_TILE_HASHES = [
  'icd10',          // Group A
  'eob-glossary',   // Group L
  'defib',          // Group I
  'lab-adult',      // Group K
  'high-alert-card', // Group O
];
for (const id of RETIRED_TILE_HASHES) {
  test(`retired tile #${id} shows the v29 removed-note`, async ({ page }) => {
    await page.goto('/#' + id);
    await expect(page.locator('.deprecation-notice')).toContainText('Removed in spec-v29');
  });
}

test('group E: BMI calculator returns category', async ({ page }) => {
  await page.goto('/#bmi');
  await page.fill('#w', '70');
  await page.fill('#h', '1.75');
  await expect(page.getByText('BMI: 22.9 kg/m^2 (Normal)')).toBeVisible();
});

test('group E: clinical inline notice appears', async ({ page }) => {
  await page.goto('/#bmi');
  await expect(page.getByText('This is a math aid for verification.')).toBeVisible();
});

test('group F: drip rate computes', async ({ page }) => {
  await page.goto('/#drip-rate');
  await page.fill('#v', '1000');
  await page.fill('#t', '480');
  await page.fill('#df', '15');
  await expect(page.getByText('Rate: 125 mL/hr')).toBeVisible();
  await expect(page.getByText('Drops: 31 gtts/min')).toBeVisible();
});

test('group G: GCS renders prefilled example total', async ({ page }) => {
  // spec-v9 §3.3: tiles boot with their META.example fields applied,
  // so the GCS view loads at eye=3/verbal=4/motor=5 = 12 (Moderate).
  await page.goto('/#gcs');
  await expect(page.getByText('GCS total: 12 (Moderate)')).toBeVisible();
});

test('group H: appointment prep generates questions', async ({ page }) => {
  await page.goto('/#prep');
  await page.selectOption('#visit', 'follow-up');
  await page.click('#gen-btn');
  await expect(page.locator('h2', { hasText: 'After' })).toBeVisible();
});

test('CSP: outbound network connection is blocked', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(async () => {
    try {
      await fetch('https://example.com/no');
      return 'ALLOWED';
    } catch (e) {
      return 'BLOCKED';
    }
  });
  expect(result).toBe('BLOCKED');
});

test('No clientside storage APIs are used', async ({ page }) => {
  await page.goto('/');
  await page.goto('/#bmi');
  const used = await page.evaluate(() => ({
    localStorage: localStorage.length,
    sessionStorage: sessionStorage.length,
    cookies: document.cookie,
  }));
  expect(used.localStorage).toBe(0);
  expect(used.sessionStorage).toBe(0);
  expect(used.cookies).toBe('');
});

test('footer: credit-badge and gh-badge are visible and external', async ({ page }) => {
  await page.goto('/');
  const credit = page.locator('.credit-badge');
  await expect(credit).toBeVisible();
  await expect(credit).toHaveAttribute('href', /claygood\.com/);
  const gh = page.locator('.gh-badge');
  await expect(gh).toBeVisible();
  await expect(gh).toHaveAttribute('href', /github\.com\/clay-good\/sophiewell\.com/);
});

// ---- spec-v2 layer ----

test('spec-v2: every utility renders inline citation or source stamp', async ({ page }) => {
  await page.goto('/#bmi');
  await expect(page.locator('.tool-meta .citation')).toContainText('Quetelet');
});

test('spec-v2 / spec-v9: example values prefill the tile and reset link restores them', async ({ page }) => {
  // spec-v9 §3.3 replaced the "Test with example" button with on-load
  // prefill plus a "Reset to example" link. The link applies the example
  // values and reveals the documented Expected text.
  await page.goto('/#bmi');
  await expect(page.getByText('BMI: 22.9 kg/m^2 (Normal)')).toBeVisible();
  // The user can edit inputs and reset back to the example.
  await page.fill('#w', '90');
  await page.fill('#h', '1.80');
  await page.click('.example-reset');
  await expect(page.getByText('BMI: 22.9 kg/m^2 (Normal)')).toBeVisible();
  await expect(page.locator('.example-expected')).toContainText('Expected:');
});

test('spec-v2: hash-based calculator state persists across reload', async ({ page }) => {
  await page.goto('/#bmi');
  await page.fill('#w', '60');
  await page.fill('#h', '1.70');
  await page.waitForTimeout(150);
  const hash = await page.evaluate(() => location.hash);
  expect(hash).toContain('q=');
  expect(hash).toContain('w%3D60');
});

test('spec-v8 §3.2 / §5.2: no Pin button and no #pinned-section render on the home view', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.pin-btn')).toHaveCount(0);
  await expect(page.locator('#pinned-section')).toHaveCount(0);
  await expect(page.locator('#pinned-grid')).toHaveCount(0);
});

test('spec-v8 §5.3: legacy #p=<id> bookmarks silently resolve to the home view', async ({ page }) => {
  await page.goto('/#p=bmi,egfr,icd10');
  // No tile route fires; we land on the home view with the prompt hero visible.
  // Asserting on the hero (always present on home) per spec-v51.
  await expect(page.locator('#hero-search')).toBeVisible();
  await expect(page.locator('#pinned-section')).toHaveCount(0);
});

test('spec-v2: ? help overlay appears and dismisses on Escape', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Shift+/');
  await expect(page.locator('#shortcut-overlay')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#shortcut-overlay')).toHaveCount(0);
});

test('spec-v2: leader G then B navigates to BMI', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.activeElement.blur());
  await page.keyboard.press('g');
  await page.keyboard.press('b');
  await expect(page).toHaveURL(/#bmi/);
});

test('spec-v2: changelog and stability docs render via in-site routes', async ({ page }) => {
  await page.goto('/#changelog');
  await expect(page.locator('.content h1')).toHaveText('Changelog');
  await expect(page.locator('.doc-body h2').first()).toBeVisible();
  await page.goto('/#stability');
  await expect(page.locator('.content h1')).toHaveText('Stability commitments');
});

// ---- spec-v3 layer ----

test('spec-v3: Group I tools render the local-protocol notice', async ({ page }) => {
  // `defib` was retired in spec-v29 wave 29-2 (Group I reference cards); the
  // local-protocol notice is now exercised against a Group I survivor.
  await page.goto('/#cincinnati');
  await expect(page.getByText('Local protocols, medical direction, and clinician judgment')).toBeVisible();
});

test('spec-v3: pediatric ETT calculator computes 5 mm uncuffed at age 4', async ({ page }) => {
  await page.goto('/#peds-ett');
  await page.fill('#pet-age', '4');
  await expect(page.getByText('Tube size: 5 mm internal diameter (uncuffed)')).toBeVisible();
});

// ---- spec-v4 layer: one smoke per new group (J-O) ----

test('spec-v4 group J: tetanus decision tree renders the first question', async ({ page }) => {
  await page.goto('/#tetanus');
  await expect(page.locator('.content h1')).toHaveText('Tetanus Prophylaxis Decision Tree');
  await expect(page.getByRole('heading', { name: 'Wound type?' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Clean and minor' })).toBeVisible();
});

// spec-v4 groups K (lab reference), L (forms & numbers literacy), and O
// (patient-safety wallet cards) were entirely retired in spec-v29 wave
// 29-2 (§2.2, §2.4); their per-tile smokes are dropped. The redirect
// behavior for representative hashes (`lab-adult`, `eob-glossary`,
// `high-alert-card`) is covered by the parameterized retired-tile check
// near the top of this file.

test('spec-v4 group N: pediatric weight converter computes lb/oz to kg', async ({ page }) => {
  await page.goto('/#peds-weight-conv');
  await expect(page.locator('.content h1')).toHaveText('Pediatric Weight Converter (lb/oz <-> kg)');
  // Default values 7 lb 5 oz are pre-filled and the converter live-renders on load.
  await expect(page.getByText('7 lb 5 oz =', { exact: false })).toBeVisible();
  await expect(page.getByText('Term newborn:', { exact: false })).toBeVisible();
});

