// spec-v1008: an example value the reader has not replaced is still ours, and the
// form has to keep saying so.
//
// The sentence under the answer -- "These are example values. Replace them with
// your own." -- used to be removed on the FIRST edit anywhere in the tool body,
// on the reasoning that "after the first keystroke the values are theirs, not
// ours". That is true of the field they touched and false of every field they
// did not.
//
// It bites hardest where a field cannot be cleared. The NIH Stroke Scale renders
// its 13 items as range sliders, so there is no empty state to return one to: a
// reader who scores their own patient's motor leg as 3 gets "NIHSS total: 8" with
// the sentence gone, and five of those points are the example patient's deficits
// (LOC 1, facial palsy 1, motor arm 2, language 1). Nothing on screen said so.
//
// spec-v754 caught the same mixing on the query-prefill path and fixed it by
// refusing to top up a partly answered question. This is the by-hand path, and
// the fix is the per-field one that markAutofilled was already using.

import { test, expect } from '@playwright/test';

test('a partly edited form says how much of it is still the example', async ({ page }) => {
  await page.goto('/#nihss');
  await page.waitForSelector('#q-results');
  await page.waitForTimeout(400);
  await expect(page.locator('.example-hint')).toHaveText(/These are example values/);

  // The reader scores one item on their own patient. The example seeded four
  // others (1a, 4, 5, 9) and they are all still on screen.
  await page.locator('input[id="6"]').fill('3');
  await expect(page.locator('#q-results')).toContainText('NIHSS total: 8');
  await expect(page.locator('.example-hint')).toHaveText(/4 fields below still hold example values/);

  // Replacing the last of them takes the sentence away, because by then the
  // values really are the reader's.
  for (const id of ['1a', '4', '5', '9']) await page.locator(`input[id="${id}"]`).fill('0');
  await expect(page.locator('.example-hint')).toHaveCount(0);
  await expect(page.locator('#q-results')).toContainText('NIHSS total: 3');
});

test('the singular reads as a singular', async ({ page }) => {
  // ich-score seeds three fields; leaving one of them is the singular case.
  await page.goto('/#ich-score');
  await page.waitForSelector('#q-results');
  await page.waitForTimeout(400);
  await page.locator('#ich-gcs').fill('6');
  await page.locator('#ich-age').fill('55');
  await expect(page.locator('.example-hint')).toHaveText(/1 field below still holds an example value/);
});
