// spec-v61 §2 A4: per-field unit toggles. Entering a value in an alternate
// unit (lb, inches, µmol/L) must drive the lib/unit-convert.js converters and
// produce the same result the canonical-unit entry would, and the input+select
// pair must never force horizontal scroll on a 320px phone.

import { test, expect } from '@playwright/test';

test.skip(({ browserName }) => browserName !== 'chromium', 'unit-toggle sweep is chromium-only');

test('BMI in lb + inches matches the kg + m calculation', async ({ page }) => {
  await page.goto('/#bmi', { waitUntil: 'load' });
  // 154.32 lb = 70 kg; 68.9 in = 1.75 m -> BMI 22.9 (the kg/m example value).
  await page.locator('#w-unit').selectOption('lb');
  await page.fill('#w', '154.32');
  await page.locator('#h-unit').selectOption('in');
  await page.fill('#h', '68.9');
  await expect(page.locator('#q-results')).toContainText('BMI: 22.9');
});

test('Cockcroft-Gault in µmol/L matches the mg/dL calculation', async ({ page }) => {
  await page.goto('/#cockcroft-gault', { waitUntil: 'load' });
  // 88.4 µmol/L = 1.0 mg/dL; age 60, 80 kg, male -> CrCl 88.89 mL/min.
  await page.fill('#age', '60');
  await page.fill('#w', '80');
  await page.locator('#scr-unit').selectOption('µmol/L');
  await page.fill('#scr', '88.4');
  await expect(page.locator('#q-results')).toContainText('88.89');
});

test('the unit-field pair does not overflow at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/#bmi', { waitUntil: 'load' });
  await page.locator('#w-unit').selectOption('lb');
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
});

// spec-v61 §2 A3: chart-ready labeled copy. Multi-output tiles render a
// "Copy results" button inside #q-results so a paste lands as clean
// `Label: Value Units` lines (lib/clipboard.js formatCopyAll) rather than a
// scraped innerText blob.
test('multi-output tiles offer a labeled "Copy results" button', async ({ page }) => {
  for (const id of ['bsa', 'anion-gap', 'corrected-sodium', 'aa-gradient']) {
    await page.goto('/#' + id, { waitUntil: 'load' });
    await page.waitForTimeout(60);
    await page.locator('.example-reset').first().click();
    await expect(
      page.locator('#q-results button.copy-btn', { hasText: 'Copy results' }),
    ).toBeVisible();
  }
});
