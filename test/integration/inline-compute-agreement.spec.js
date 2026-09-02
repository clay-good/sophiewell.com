// spec-v761: the dropdown and the tile must say the same number.
//
// lib/query-compute.js answers 21 tiles inline, so the search listbox shows a
// value BEFORE the reader opens anything. Selecting that row routes to the tile
// with the parsed inputs prefilled, and the tile computes it again from those
// inputs. Two computations of one number, on two surfaces, with nothing
// asserting they agree.
//
// They did not. queryCompute returns values in each field's CANONICAL unit, but
// a unit select pre-selects the US-customary option (spec-v283), so
// "crcl 72F 68 kg cr 1.4" showed 38.99 mL/min in the dropdown and 17.69 on the
// tile it opened -- two different numbers, neither labelled, and no gate. It was
// live. spec-v754 fixed the cause; this pins it shut.
//
// One probe per template. A template with no probe here is a template with no
// agreement check, so add one when you add a template.
import { test, expect } from '@playwright/test';

const PROBES = [
  ['bmi', 'bmi 80 kg 180 cm'],
  ['bsa', 'bsa 80 kg 180 cm'],
  ['map', 'map 120/80'],
  ['anion-gap', 'anion gap na 140 cl 104 hco3 24'],
  ['corrected-calcium', 'corrected calcium ca 7.2 albumin 2.1'],
  ['corrected-sodium', 'corrected sodium na 130 glucose 600'],
  ['bw-bsa-suite', 'ideal body weight 180 cm male'],
  ['cockcroft-gault', 'crcl 72 year old woman 68 kg creatinine 1.4'],
  ['eag-a1c', 'eag a1c 7.5'],
  ['qtc', 'qtc qt 400 hr 70'],
  ['aa-gradient', 'a-a gradient fio2 0.21 paco2 40 pao2 80'],
  ['shock-index', 'shock index hr 110 sbp 90'],
  ['maint-fluids', 'maintenance fluids 20 kg'],
  ['pf-ratio', 'pf ratio pao2 80 fio2 0.5'],
  ['winters', 'winters hco3 12'],
  ['mentzer', 'mentzer mcv 70 rbc 5'],
  ['egfr', 'egfr creatinine 1.4 age 72 female'],
  ['delta-gap', 'delta gap na 140 cl 100 hco3 12'],
  ['retic-index', 'reticulocyte index retic 2 hct 30'],
  ['tsat', 'tsat iron 60 tibc 300'],
  ['fena-feurea', 'fena urine sodium 20 serum sodium 140 urine creatinine 50 serum creatinine 1.4'],
];

// Chromium only, same rationale as the other whole-catalog sweeps: one long
// navigation loop is unreliable on the firefox/webkit runners.
test.skip(({ browserName }) => browserName !== 'chromium', 'agreement sweep is chromium-only');

test('every inline-compute template agrees with the tile it opens', async ({ page }) => {
  test.setTimeout(180_000);
  await page.goto('/');

  const disagreements = [];
  const unfired = [];

  for (const [tile, query] of PROBES) {
    await page.evaluate(() => { window.location.hash = ''; });
    const hero = page.locator('#hero-search');
    await hero.fill('');
    await hero.fill(query);
    const row = page.locator('.hero-search-result').first();
    await row.waitFor({ timeout: 10_000 });

    // The template's own primary value -- not the display string. Comparing
    // every number in the listbox text sounds equivalent and is not: it pulls
    // digits out of labels ("A1c" -> 1) and formula notation ("4-2-1"), and out
    // of the INPUTS the tile has no reason to echo back. `value` is the one
    // number the template asserts, and the tile has to reproduce it.
    const promised = await page.evaluate(async (q) => {
      const { queryCompute } = await import('/lib/query-compute.js');
      const hit = queryCompute(q);
      return hit ? { tile: hit.tile, value: hit.value } : null;
    }, query);
    if (!promised || typeof promised.value !== 'number') { unfired.push({ tile, query }); continue; }
    if (promised.tile !== tile) { unfired.push({ tile, query, routedTo: promised.tile }); continue; }

    await row.click();
    await expect(page).toHaveURL(new RegExp(`#${tile}\\b`), { timeout: 10_000 });
    await page.waitForTimeout(250);

    const delivered = await page.locator('#q-results').textContent();
    const deliveredNums = (String(delivered).match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
    // Rounding differs between surfaces (60 vs 60.0, 24-28 vs 24.0 to 28.0), so
    // the tolerance is a rounding step, not an equality.
    const agrees = deliveredNums.some(
      (d) => Math.abs(d - promised.value) <= Math.max(0.051, Math.abs(promised.value) * 0.002)
    );
    if (!agrees) {
      disagreements.push({
        tile, query, promised: promised.value, delivered: String(delivered).trim().slice(0, 100),
      });
    }
  }

  expect(unfired, `templates whose probe stopped firing:\n${JSON.stringify(unfired, null, 2)}`).toEqual([]);
  expect(
    disagreements,
    `the listbox and the tile disagree:\n${JSON.stringify(disagreements, null, 2)}`
  ).toEqual([]);
});
