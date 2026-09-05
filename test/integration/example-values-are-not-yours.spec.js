// spec-v1008: an example value the reader has not replaced is still ours, and the
// form has to keep saying so.
//
// The sentence under the answer -- "These are example values. Replace them with
// your own." -- used to be removed on the FIRST edit anywhere in the tool body,
// on the reasoning that "after the first keystroke the values are theirs, not
// ours". That is true of the field they touched and false of every field they
// did not.
//
// It bit hardest where a field could not be cleared. The NIH Stroke Scale used to
// render its 13 items as range sliders, so there was no empty state to return one
// to: a reader who scored their own patient's motor leg as 3 got "NIHSS total: 8"
// with the sentence gone, and five of those points were the example patient's
// deficits (LOC 1, facial palsy 1, motor arm 2, language 1). Nothing on screen
// said so.
//
// spec-v1078 replaced those sliders with number inputs, for a different reason --
// a slider cannot say "not assessed", so an untouched form read "No stroke
// symptoms" -- and completed the example to all thirteen items. The mixing this
// test is about is unchanged and so is the fixture; only the arithmetic moved,
// from four seeded fields to thirteen.
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

  // The reader scores one item on their own patient. The example seeded the other
  // twelve and they are all still on screen -- including the five points of
  // deficit that belong to the example patient, not to theirs.
  await page.locator('input[id="6"]').fill('3');
  await expect(page.locator('#q-results')).toContainText('NIHSS total: 8');
  await expect(page.locator('.example-hint')).toHaveText(/12 fields below still hold example values/);

  // Replacing the last of them takes the sentence away, because by then the
  // values really are the reader's.
  //
  // Each replacement has to DIFFER from what the example seeded. The hint tracks
  // value equality, so typing 0 over a field the example already set to 0 leaves
  // it looking untouched -- which is the honest reading, since nothing on screen
  // can tell "the reader agrees it is 0" from "the reader has not looked yet".
  // Nine of the thirteen items are 0 in the example, so a loop that filled them
  // all with 0 would clear four flags and leave eight.
  const replacements = {
    '1a': '0', '1b': '1', '1c': '1', '2': '1', '3': '1', '4': '0',
    '5': '0', '7': '1', '8': '1', '9': '0', '10': '1', '11': '1',
  };
  for (const [id, v] of Object.entries(replacements)) await page.locator(`input[id="${id}"]`).fill(v);
  await expect(page.locator('.example-hint')).toHaveCount(0);
  await expect(page.locator('#q-results')).toContainText('NIHSS total: 11');
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
