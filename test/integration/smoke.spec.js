// End-to-end smoke tests. Drives a real browser through the home view and a
// representative tile from each utility group.
//
// Selectors updated for the spec.md v4 redesign: tiles are
// `<button class="tool-card" data-tool="...">` inside a sticky topbar
// layout. The topbar exposes the brand wordmark; tool views render their
// name into <main class="content"> with a breadcrumb above.

import { test, expect } from '@playwright/test';

test('home: renders centered topbar and full tool-card grid', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.topbar .topbar-brand')).toContainText('Sophie Well');
  await expect(page.locator('.tool-card')).toHaveCount(79);
  // Filters and search are removed in v4.10; the home is just the tile grid.
  await expect(page.locator('.filters:not(.visually-hidden)')).toHaveCount(0);
  await expect(page.locator('#search')).toHaveCount(0);
});

test('home: clicking a tool card opens its renderer (BMI smoke)', async ({ page }) => {
  await page.goto('/');
  await page.click('.tool-card[data-tool="bmi"]');
  await expect(page).toHaveURL(/#bmi/);
  await expect(page.locator('.content h1')).toHaveText('BMI Calculator');
  await expect(page.locator('.breadcrumb-back')).toBeVisible();
  // The form is mounted and live-render works:
  await page.fill('#w', '70');
  await page.fill('#h', '1.75');
  await expect(page.getByText('BMI: 22.9 kg/m^2 (Normal)')).toBeVisible();
});

test('home: clicking ICD-10 card opens its renderer with breadcrumb', async ({ page }) => {
  await page.goto('/');
  await page.click('.tool-card[data-tool="icd10"]');
  await expect(page).toHaveURL(/#icd10/);
  await expect(page.locator('.content h1')).toHaveText('ICD-10-CM Code Lookup');
  await expect(page.locator('.breadcrumb .bc-current')).toContainText('ICD-10-CM');
});

test('group A: ICD-10 lookup returns results', async ({ page }) => {
  await page.goto('/#icd10');
  await page.fill('#q', 'I10');
  await expect(page.getByText('Essential (primary) hypertension')).toBeVisible();
});

test('group A: CPT tool shows AMA notice and never displays AMA descriptors', async ({ page }) => {
  await page.goto('/#cpt');
  await expect(page.getByText('CPT code descriptors are owned by the American Medical Association')).toBeVisible();
  await page.fill('#q', '99213');
  await expect(page.getByText('Work RVU:')).toBeVisible();
  await expect(page.getByRole('link', { name: /AMA's free public CPT lookup/ })).toBeVisible();
});

test('group B: MPFS computes facility and non-facility allowables', async ({ page }) => {
  await page.goto('/#mpfs');
  await page.fill('#mpfs-code', '99213');
  await expect(page.getByText('Facility allowable:')).toBeVisible();
  await expect(page.getByText('Non-facility allowable:')).toBeVisible();
});

test('group C: Bill Decoder extracts codes from pasted text', async ({ page }) => {
  await page.goto('/#decoder');
  const sample = 'Dx I10 E11.65\n99213 Office visit $250.00\nNPI 1234567893';
  await page.fill('#bill', sample);
  await page.click('#decode-btn');
  await expect(page.getByText('Total dollar amounts found')).toBeVisible();
  await expect(page.getByText('I10')).toBeVisible();
  await expect(page.getByText('1234567893')).toBeVisible();
});

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

test('group G: GCS sums to 15', async ({ page }) => {
  await page.goto('/#gcs');
  await expect(page.getByText('GCS total: 15 (Mild)')).toBeVisible();
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

test('spec-v2: Test-with-example button populates inputs and renders result', async ({ page }) => {
  await page.goto('/#bmi');
  await page.click('.example-btn');
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

test('spec-v2: hash-based pinning toggles a tool card into the Pinned section', async ({ page }) => {
  await page.goto('/');
  const bmiCard = page.locator('.tool-card[data-tool="bmi"]');
  await bmiCard.locator('.pin-btn').click();
  await expect(page).toHaveURL(/#?.*p=bmi/);
  await expect(page.locator('#pinned-section')).toBeVisible();
  await expect(page.locator('#pinned-grid .tool-card')).toHaveCount(1);
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
  await page.goto('/#defib');
  await expect(page.getByText('Local protocols, medical direction, and clinician judgment')).toBeVisible();
});

test('spec-v3: pediatric ETT calculator computes 5 mm uncuffed at age 4', async ({ page }) => {
  await page.goto('/#peds-ett');
  await page.fill('#pet-age', '4');
  await expect(page.getByText('Tube size: 5 mm internal diameter (uncuffed)')).toBeVisible();
});
