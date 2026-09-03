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

// spec-v1014: the second wave, from the same sweep read to the end. These are the
// tiles where the empty form did not just print a zero but reached a DECISION:
//
//   centor              a blank age earned the McIsaac under-15 point, pushing the
//                       band toward "consider empiric or test" -- antibiotics
//   psi                 "PSI 20 - Class II (outpatient)" -- a decision to send
//                       someone home, from a library that has refused a missing
//                       age since spec-v931 behind an nv() that never let it
//   peds-ett            "Tube size: 4 mm ... Depth of insertion: 12 cm at the lip"
//   oxytocin-titration  "Ordered dose -> pump rate: 0 mL/hr"
//   electrolyte-repl.   "K: 80 mEq" with an infusion rate and a recheck interval
//   anc                 "0 cells/uL / Severe neutropenia (CTCAE grade 4) /
//                       Neutropenic precautions; fever in this range is an emergency"
//   urine-anion-gap     "Positive UAG: impaired renal ammonium excretion (renal
//                       tubular acidosis)" -- a diagnosis from three blank labs
//   qbl-pph             "0 mL / Below the postpartum-hemorrhage threshold"
const WAVE_2 = [
  ['psi', /Enter the patient age to score/],
  ['peds-ett', /Enter the patient age/],
  ['oxytocin-titration', /Enter an ordered dose/],
  ['electrolyte-replacement', /Enter the serum level/],
  ['anc', /Enter a white cell count/],
  ['urine-anion-gap', /Enter a urine sodium/],
  ['qbl-pph', /Enter the measured blood volume/],
];

for (const [id, want] of WAVE_2) {
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
    expect(text, `${id} answered an empty form`).toMatch(want);
  });
}

// centor keeps its Centor score (its four criteria are checkboxes, and unchecked
// is an answer) and withholds only the age-dependent McIsaac line.
test('centor: a blank age withholds McIsaac, not Centor', async ({ page }) => {
  await page.goto('/#centor');
  await page.waitForSelector('#q-results');
  await page.waitForTimeout(350);
  await page.evaluate(() => {
    const n = document.getElementById('ce-age');
    n.value = '';
    n.dispatchEvent(new Event('input', { bubbles: true }));
  });
  const text = await page.locator('#q-results').innerText();
  expect(text).toMatch(/Centor: \d/);
  expect(text).toMatch(/Enter an age for the McIsaac score/);
});

// The prompt is not a dead end: entering the values brings the answer back.
test('a filled form still answers', async ({ page }) => {
  await page.goto('/#map');
  await page.waitForSelector('#q-results');
  await page.locator('#s').fill('120');
  await page.locator('#d').fill('80');
  await expect(page.locator('#q-results')).toContainText('MAP: 93.3 mmHg');
});

// spec-v1016: the score-shaped remainder of the same sweep, and the case where
// the lower-bound argument runs the other way.
//
//   snappe-ii     "SNAPPE-II 0/162: lower illness severity" from ten blank
//                 measurements -- the tile even says "items left blank score
//                 their normal (0-point) band", which is fair for a partly
//                 charted neonate and still cannot mean an unmeasured one is well
//   scorad        "SCORAD 28/103 - moderate atopic dermatitis" with "extent A 0%"
//                 printed underneath: the extent is a measurement and it is a
//                 fifth of the score
//   lund-browder  "%TBSA: 0%" from an unmarked burn chart -- and %TBSA is what
//                 the fluid resuscitation is calculated from
//   slums         "SLUMS 0 of 30 - dementia", labelling an exam nobody performed.
//                 Here a HIGHER score is a better one, so an unscored item can
//                 only ADD points: a partial total is a floor on the score and a
//                 CEILING on the severity. An incomplete SLUMS can be read as
//                 normal once it has earned enough points, and can never be read
//                 as impaired.
const WAVE_3 = [
  ['snappe-ii', /Enter at least one SNAPPE-II measurement/],
  ['scorad', /Enter the extent/],
  ['lund-browder', /at least one region/],
  ['slums', /Score the remaining/],
];

for (const [id, want] of WAVE_3) {
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
    await page.waitForTimeout(250);
    const text = (await page.locator('#q-results').innerText()).replace(/\s+/g, ' ');
    expect(text, `${id} answered an empty form`).toMatch(want);
  });
}

// spec-v1017: the fourth wave. Three of these reached a conclusion, not just a
// zero: "Corrected level below the 10-20 ug/mL therapeutic range", "Serum K is
// at or above target - no deficit by this estimate", and "0 mOsm/L - below ~900
// mOsm/L; peripheral administration is generally acceptable", which is a
// decision about whether the infusion needs a central line.
const WAVE_4 = [
  ['corrected-phenytoin', /Enter a measured phenytoin level/],
  ['potassium-deficit', /Enter a serum potassium/],
  ['iv-osmolarity', /Enter at least one component of the bag/],
  ['burn-uop-target', /Enter a weight to calculate/],
  ['fluid-balance', /Enter a total intake/],
];

for (const [id, want] of WAVE_4) {
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
    await page.waitForTimeout(250);
    const text = (await page.locator('#q-results').innerText()).replace(/\s+/g, ' ');
    expect(text, `${id} answered an empty form`).toMatch(want);
  });
}

// spec-v1017: and the advisory that sits beside these answers names the quantity
// the way the label does, not the way the code does.
test('the plausible-range advisory names the quantity, not the variable', async ({ page }) => {
  await page.goto('/#potassium-deficit');
  await page.waitForSelector('#q-results');
  await page.waitForTimeout(350);
  await page.locator('#kd-wt').fill('0.1');
  const text = (await page.locator('#q-results').innerText()).replace(/\s+/g, ' ');
  expect(text).toMatch(/plausible range for weight \(0.3 to 500 kg\)/);
  expect(text).not.toMatch(/weightKg/);
});

// spec-v1020: the same rule on the likelier form -- not an empty page, but a page
// with a couple of values in it. This is how lrinec said "low risk" from a single
// CRP (spec-v1006), and it is what the whole-catalog sweep in spec-v1019 says it
// does not cover.
//
//   smart-cop  an age alone answered "SMART-COP 0: low risk" -- a prediction
//              about needing vasopressors or ventilation, from a patient nobody
//              had examined. Its checkboxes are criteria, but the respiratory
//              rate and the oxygenation trio are measurements.
//   lace       a length of stay alone answered "LACE 1: low risk of 30-day death
//              or unplanned readmission". The Charlson index and the emergency
//              visits are counts somebody has to look up.
test('smart-cop: an age alone does not read as low risk', async ({ page }) => {
  await page.goto('/#smart-cop');
  await page.waitForSelector('#q-results');
  await page.waitForTimeout(350);
  await page.evaluate(() => {
    for (const n of document.querySelectorAll('#tool-body input[type=number]')) {
      n.value = '';
      n.dispatchEvent(new Event('input', { bubbles: true }));
      n.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await page.locator('#sc-age').fill('50');
  const text = (await page.locator('#q-results').innerText()).replace(/\s+/g, ' ');
  expect(text).toMatch(/at least 0 so far/);
  expect(text).toMatch(/respiratory rate/);
  expect(text).not.toMatch(/low risk per Charles/);

  // The measurements entered, the low-risk reading is available again.
  await page.locator('#sc-rr').fill('18');
  await page.locator('#sc-spo2').fill('97');
  await expect(page.locator('#q-results')).toContainText('low risk per Charles');
});

test('lace: a length of stay alone does not read as low risk', async ({ page }) => {
  await page.goto('/#lace');
  await page.waitForSelector('#q-results');
  await page.waitForTimeout(350);
  await page.evaluate(() => {
    for (const n of document.querySelectorAll('#tool-body input[type=number]')) {
      n.value = '';
      n.dispatchEvent(new Event('input', { bubbles: true }));
      n.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await page.locator('#lc-los').fill('1');
  const text = (await page.locator('#q-results').innerText()).replace(/\s+/g, ' ');
  expect(text).toMatch(/at least 1 so far/);
  expect(text).not.toMatch(/low risk of 30-day death/);
});

// spec-v1025: found by a different question -- which tiles compute without the
// fields the AGENT surface declares required? The MCP registry marks a field
// `required`, and computeCalculator refuses without it; the browser had no such
// contract, and 44 tiles answered anyway. Most are the checklist family the
// empty-form ledger already carries, and four were not:
//
//   aa-gradient      "PAO2: 0 mmHg, A-a gradient: 0 mmHg"
//   anion-gap-dd     "Anion gap: 0 ... delta/delta ratio = -0.50, Pure non-AG
//                    metabolic acidosis" -- a named acid-base diagnosis. Its
//                    sibling anion-gap was guarded at spec-v1013; this one was
//                    missed because it lives in a different renderer.
//   rhig-dose        "RhIG dose: 1 standard 300 ug vial(s)" -- a dose, from a
//                    Kleihauer-Betke nobody had run
//   meld-childpugh   "MELD-3.0: 20 - High; Child-Pugh: 8 - Class B" -- a
//                    transplant-priority score from five cleared labs
const WAVE_5 = [
  ['aa-gradient', /Enter an FiO2/],
  ['anion-gap-dd', /Enter a sodium/],
  ['rhig-dose', /Enter a maternal blood volume/],
  ['meld-childpugh', /Enter a bilirubin/],
];

for (const [id, want] of WAVE_5) {
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
    await page.waitForTimeout(250);
    const text = (await page.locator('#q-results').innerText()).replace(/\s+/g, ' ');
    expect(text, `${id} answered an empty form`).toMatch(want);
  });
}
