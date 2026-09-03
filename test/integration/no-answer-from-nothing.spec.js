// spec-v1013: a calculation with no inputs is not a result of zero.
//
// spec-v1006 and spec-v1007 covered the SCORES: a partial total is a lower bound,
// so an incomplete score may rule in and must never rule out. The arithmetic
// tiles had the same defect in a plainer form. Their renderers read fields with
// `num()` / `nv()`, which is `Number(input.value)`, and `Number('')` is 0 -- so an
// empty form arrived as a patient made entirely of zeros, and they answered.
//
// Measured over the catalog by clearing every number field:
//
//   bsa                 "Du Bois: 0 m^2"
//   map                 "MAP: 0 mmHg"
//   anion-gap           "Anion gap: 0"
//   corrected-sodium    "Corrected Na (factor 1.6): -1.6 mEq/L"   (a negative sodium)
//   qtc                 "Bazett: 0 ms"
//   bw-bsa-suite        "IBW (Devine): 50.0 kg"  -- the formula's constant, a
//                       plausible-looking dosing weight for nobody
//   weight-dose         "Total dose: 0 mg"
//   apap-24h-max        "Remaining to ceiling: 4000 mg (0% of 4000 mg)"
//   insulin-drip        "Suggested rate (example only): 0 units/hr"
//
// The last three are dose calculators, and the acetaminophen one is the worst
// shape of all: it reports headroom nobody has measured.

import { test, expect } from '@playwright/test';

const TILES = [
  'bsa', 'map', 'anion-gap', 'corrected-calcium', 'corrected-sodium', 'qtc',
  'pack-years', 'osmolal-gap', 'winters', 'bw-bsa-suite',
  'weight-dose', 'insulin-drip', 'enteral-free-water', 'apap-24h-max',
];

for (const id of TILES) {
  test(`${id}: an empty form is asked to fill in, not answered`, async ({ page }) => {
    await page.goto(`/#${id}`);
    await page.waitForSelector('#q-results');
    await page.waitForTimeout(350);
    await page.evaluate(() => {
      for (const n of document.querySelectorAll('#tool-body input[type=number]')) {
        n.value = '';
        n.dispatchEvent(new Event('input', { bubbles: true }));
        n.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await page.waitForTimeout(200);
    const text = (await page.locator('#q-results').innerText()).replace(/\s+/g, ' ');
    expect(text, `${id} answered an empty form`).toMatch(/Enter |Add at least one source/);
    expect(text).not.toMatch(/\bNaN\b|\bnull\b|Infinity/);
  });
}

// The prompt is not a dead end: entering the values brings the answer back.
test('a filled form still answers', async ({ page }) => {
  await page.goto('/#map');
  await page.waitForSelector('#q-results');
  await page.locator('#s').fill('120');
  await page.locator('#d').fill('80');
  await expect(page.locator('#q-results')).toContainText('MAP: 93.3 mmHg');
});
