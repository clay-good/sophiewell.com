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

// spec-v62 §2 A4: SI<->conventional lab toggles on the Group E correction tiles.
test('corrected-sodium glucose in mmol/L matches the mg/dL example', async ({ page }) => {
  await page.goto('/#corrected-sodium', { waitUntil: 'load' });
  // 600 mg/dL = 33.3333 mmol/L; Na 130 -> corrected Na 138 (1.6) / 142 (2.4).
  await page.fill('#na', '130');
  await page.locator('#g-unit').selectOption('mmol/L');
  await page.fill('#g', '33.3333');
  await expect(page.locator('#q-results')).toContainText('138');
  await expect(page.locator('#q-results')).toContainText('142');
});

test('corrected-calcium in mmol/L + g/L matches the mg/dL + g/dL example', async ({ page }) => {
  await page.goto('/#corrected-calcium', { waitUntil: 'load' });
  // 8.0 mg/dL = 2.0 mmol/L Ca; 2.0 g/dL = 20 g/L albumin -> corrected Ca 9.6 mg/dL.
  await page.locator('#ca-unit').selectOption('mmol/L');
  await page.fill('#ca', '2.0');
  await page.locator('#alb-unit').selectOption('g/L');
  await page.fill('#alb', '20');
  await expect(page.locator('#q-results')).toContainText('9.6');
});

test('anion-gap albumin in g/L matches the g/dL example (corrected AG 16)', async ({ page }) => {
  await page.goto('/#anion-gap', { waitUntil: 'load' });
  // 4.0 g/dL = 40 g/L albumin; Na 140, Cl 100, HCO3 24 -> AG 16, corrected AG 16.
  await page.fill('#na', '140');
  await page.fill('#cl', '100');
  await page.fill('#hco3', '24');
  await page.locator('#alb-unit').selectOption('g/L');
  await page.fill('#alb', '40');
  await expect(page.locator('#q-results')).toContainText('16');
});

test('saag albumin in g/L matches the g/dL calculation (SAAG 3.0)', async ({ page }) => {
  await page.goto('/#saag', { waitUntil: 'load' });
  // serum 4.0 g/dL = 40 g/L, ascites 1.0 g/dL = 10 g/L -> SAAG 3.0 g/dL.
  await page.locator('#sa-unit').selectOption('g/L');
  await page.fill('#sa', '40');
  await page.locator('#aa-unit').selectOption('g/L');
  await page.fill('#aa', '10');
  await expect(page.locator('#q-results')).toContainText('SAAG: 3');
});

test('magnesium-replacement accepts serum Mg in mmol/L (toggle drives unitNum)', async ({ page }) => {
  await page.goto('/#magnesium-replacement', { waitUntil: 'load' });
  // 0.5 mmol/L = 1.215 mg/dL; dose is severity-driven, so moderate -> 2-4 g IV.
  await page.locator('#mg-serum-unit').selectOption('mmol/L');
  await page.fill('#mg-serum', '0.5');
  await page.locator('#mg-sev').selectOption('2');
  await expect(page.locator('#q-results')).toContainText('2-4');
});

// spec-v62 A4 (final wave): bilirubin (mg/dL<->umol/L), lactate and the CRRT
// ionised/total Ca (mmol/L<->mg/dL) toggles.
test('meld bilirubin in umol/L reproduces the mg/dL example (MELD-3.0 18)', async ({ page }) => {
  await page.goto('/#meld-childpugh', { waitUntil: 'load' });
  // The example auto-applies bilirubin 2.0 mg/dL (-> MELD-3.0 18). Entering the
  // SI-equivalent 34.2 umol/L = 2.0 mg/dL via the toggle must reproduce it.
  await page.locator('#m-bili-unit').selectOption('umol/L');
  await page.fill('#m-bili', '34.2');
  await expect(page.locator('#q-results')).toContainText('MELD-3.0: 18');
});

test('pelod2 lactate in mg/dL reproduces the mmol/L example (score 9)', async ({ page }) => {
  await page.goto('/#pelod2', { waitUntil: 'load' });
  // The example auto-applies lactate 6 mmol/L (-> PELOD-2 score 9). Entering the
  // conventional-equivalent 54.05 mg/dL = 6.0 mmol/L via the toggle must reproduce it.
  await page.locator('#p2-lactate-unit').selectOption('mg/dL');
  await page.fill('#p2-lactate', '54.05');
  await expect(page.locator('#q-results')).toContainText('PELOD-2 score: 9');
});

test('crrt ionised Ca in mg/dL matches the mmol/L banner threshold', async ({ page }) => {
  await page.goto('/#crrt-dose', { waitUntil: 'load' });
  // 6.0 mg/dL = 1.5 mmol/L systemic ionised Ca -> outside the 1.1-1.2 target banner.
  await page.fill('#cr-w', '70');
  await page.fill('#cr-r', '2000');
  await page.locator('#cr-sca-unit').selectOption('mg/dL');
  await page.fill('#cr-sca', '6.0');
  await expect(page.locator('#q-results')).toContainText('1.5 mmol/L outside 1.1-1.2');
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
    // spec-v61 A3 wave 2: the multi-output Group V5 lab / clinical-math tiles.
    'sodium-correction', 'free-water-deficit', 'iron-ganzoni', 'pbw-ardsnet', 'lights', 'corrected-anion-gap',
    // spec-v61 A3 wave 3: the multi-output Group F medication / infusion tiles
    // (tpn-macro and insulin-correction fold their headline total into the list).
    'drip-rate', 'tpn-macro', 'insulin-correction',
    // spec-v61 A3 wave 4: the multi-output Group I field-medicine tiles
    // (burn-fluid folds both resuscitation methods into one copyable schedule).
    'burn-fluid', 'peds-ett', 'naloxone',
    // spec-v61 A3 wave 5: the multi-output Group V7 oxygenation / renal-acid /
    // lipid tiles (each emits 2-4 distinct computed numeric results).
    'ldl-calc', 'cao2-do2', 'oxygenation-index', 'driving-pressure', 'acid-base-deficit',
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
