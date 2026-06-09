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

// spec-v61 §2 A4 rollout: the kg<->lb weight toggle on the Group F / v11
// dosing tiles must produce the same result as the canonical kg entry.
// 70 kg = 154.32358 lb, 3 kg = 6.6138679 lb, 60 kg = 132.27736 lb.
test('weight toggle in lb matches the kg dose calculation across Group F / v11', async ({ page }) => {
  // weight-dose: 70 kg * 5 mg/kg = 350 mg.
  await page.goto('/#weight-dose', { waitUntil: 'load' });
  await page.locator('#w-unit').selectOption('lb');
  await page.fill('#w', '154.32358');
  await page.fill('#d', '5');
  await page.fill('#u', 'mg/kg');
  await expect(page.locator('#q-results')).toContainText('350 mg');

  // gir: D10 at 15 mL/hr for 3 kg -> 8.33 mg/kg/min.
  await page.goto('/#gir', { waitUntil: 'load' });
  await page.locator('#gir-wt-unit').selectOption('lb');
  await page.fill('#gir-dex', '10');
  await page.fill('#gir-rate', '15');
  await page.fill('#gir-wt', '6.6138679');
  await expect(page.locator('#q-results')).toContainText('8.33');

  // ebv-mabl: 70 kg at 75 mL/kg -> EBV 5250 mL.
  await page.goto('/#ebv-mabl', { waitUntil: 'load' });
  await page.locator('#em-wt-unit').selectOption('lb');
  await page.fill('#em-wt', '154.32358');
  await page.locator('#em-factor').selectOption('75');
  await page.fill('#em-start', '45');
  await page.fill('#em-min', '30');
  await expect(page.locator('#q-results')).toContainText('5250');

  // urine-output: 120 mL over 4 h for 60 kg -> 0.5 mL/kg/hr.
  await page.goto('/#urine-output', { waitUntil: 'load' });
  await page.locator('#uo-wt-unit').selectOption('lb');
  await page.fill('#uo-vol', '120');
  await page.fill('#uo-int', '4');
  await page.fill('#uo-wt', '132.27736');
  await expect(page.locator('#q-results')).toContainText('0.5 mL/kg/hr');
});

// spec-v61 §2 A3: chart-ready labeled copy. Multi-output tiles render a
// "Copy results" button inside #q-results so a paste lands as clean
// `Label: Value Units` lines (lib/clipboard.js formatCopyAll) rather than a
// scraped innerText blob.
test('multi-output tiles offer a labeled "Copy results" button', async ({ page }) => {
  // Group E (A4) plus the v61 bedside calc tiles (A3 rollout): every tile that
  // produces two or more numeric results surfaces the clean-copy affordance.
  const ids = [
    'bsa', 'anion-gap', 'corrected-sodium', 'aa-gradient',
    'ebv-mabl', 'peds-transfusion-volume', 'rhig-dose', 'fluid-balance', 'carb-insulin-bolus',
  ];
  for (const id of ids) {
    await page.goto('/#' + id, { waitUntil: 'load' });
    await page.waitForTimeout(60);
    await page.locator('.example-reset').first().click();
    await expect(
      page.locator('#q-results button.copy-btn', { hasText: 'Copy results' }),
    ).toBeVisible();
  }
});
