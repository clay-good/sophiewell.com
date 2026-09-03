// spec-v1009: a number outside the range its own field declares must not pass
// unremarked.
//
// 207 numeric inputs across 99 tiles carry a `max`, and about half the tiles
// enforce it themselves ("Enter a Glasgow Coma Scale total between 3 and 15").
// The other half computed from whatever was typed, because `min` and `max` on an
// input are enforced by the browser only at form submission and these tiles never
// submit. Measured on the live pages before this fix:
//
//   rabt-score    heart rate 3007  -> shock index 30.07, massive transfusion predicted
//   saps-ii       age 1307         -> 79.9% predicted hospital mortality
//   snappe-ii     FiO2 1007%       -> SNAPPE-II 101 of 162, "high illness severity"
//   peged         D-dimer 500007   -> CT pulmonary angiography indicated
//   hiet-dosing   bolus 17 u/kg    -> an insulin dose, from a field that allows 1
//
// A transposed digit is the commonest data-entry error there is, which makes this
// the likeliest way a reader ends up with a wrong number: not a wrong formula, a
// wrong key. The range was already declared and the browser already knew the
// value broke it.

import { test, expect } from '@playwright/test';

const CASES = [
  ['rabt-score', 'ra-hr', 3007, /Heart rate.*is 3007, outside the 0 to 300/, '110'],
  ['saps-ii', 'saps-age', 1307, /Age.*is 1307, outside the 0 to 130/, '72'],
  ['hiet-dosing', 'hi-bolus', 17, /Bolus.*is 17, outside the 0 to 1/, '1'],
  // A tile that already refuses out-of-range input gets the same warning, and
  // the two do not contradict each other.
  ['gcs-pupils', 'gp-gcs', 157, /Glasgow Coma Scale.*is 157, outside the 3 to 15/, '6'],
];

for (const [tile, id, value, want, good] of CASES) {
  test(`${tile}: an out-of-range value is called out above the answer`, async ({ page }) => {
    await page.goto(`/#${tile}`);
    await page.waitForSelector('#q-results');
    await page.waitForTimeout(300);
    // spec-v1027: created on demand, so it is absent until there is something to
    // say. spec-v1022 kept it permanently in the DOM and that put an empty
    // paragraph between the hoisted explanation and the answer, which three
    // other suites assert about.
    await expect(page.locator('.range-warning')).toHaveCount(0);

    await page.locator(`#${id}`).fill(String(value));
    await expect(page.locator('.range-warning')).toHaveText(want);
    // Above the answer, never inside it: #q-results is an aria-live region and
    // this is not part of the reading.
    const outside = await page.evaluate(() => {
      const w = document.querySelector('.range-warning');
      const r = document.getElementById('q-results');
      return !!w && !!r && !r.contains(w)
        && (w.compareDocumentPosition(r) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
    });
    expect(outside, 'warning sits above #q-results and outside it').toBe(true);
    await expect(page.locator(`#${id}`)).toHaveAttribute('aria-invalid', 'true');

    // Correcting the value takes the warning away again.
    await page.locator(`#${id}`).fill(good);
    await expect(page.locator('.range-warning')).toHaveCount(0);
    await expect(page.locator(`#${id}`)).not.toHaveAttribute('aria-invalid', 'true');
  });
}

test('an in-range value is never flagged', async ({ page }) => {
  await page.goto('/#saps-ii');
  await page.waitForSelector('#q-results');
  await page.locator('#saps-age').fill('72');
  await page.waitForTimeout(200);
  await expect(page.locator('.range-warning')).toHaveCount(0);
});

test('two bad values are named in one sentence', async ({ page }) => {
  await page.goto('/#lrinec');
  await page.waitForSelector('#q-results');
  await page.waitForTimeout(300);
  await page.locator('#lr-hb').fill('257');
  await page.locator('#lr-wbc').fill('-4');
  await expect(page.locator('.range-warning')).toHaveText(/Check the highlighted values:.*;/);
});

// spec-v1022: docs/accessibility.md says results announce through a POLITE live
// region and that a validation message is tied to its input with
// aria-describedby. spec-v1009 shipped this warning as a role="alert" created on
// the first offence: assertive, so it interrupts a screen reader mid-sentence,
// and re-created rather than updated, so on some readers it would not have been
// announced at all.
test('the warning follows the house live-region pattern', async ({ page }) => {
  await page.goto('/#saps-ii');
  await page.waitForSelector('#q-results');
  await page.waitForTimeout(300);
  await page.locator('#saps-age').fill('1307');
  const region = page.locator('.range-warning');
  await expect(region).toHaveAttribute('aria-live', 'polite');
  await expect(region).not.toHaveAttribute('role', 'alert');
  // The sentence about the value is attached to the field it is about.
  await expect(page.locator('#saps-age')).toHaveAttribute('aria-describedby', /range-warning/);
  await expect(page.locator('#saps-age')).toHaveAttribute('aria-invalid', 'true');

  await page.locator('#saps-age').fill('72');
  await expect(region).toHaveCount(0);
  await expect(page.locator('#saps-age')).not.toHaveAttribute('aria-describedby', /range-warning/);
});
