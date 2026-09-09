// A field whose LABEL names its range must enforce it.
//
// This shipped as a probe, found 14, and became a gate the moment the count hit
// zero -- a finder is for a question, a gate is for a property, and this is a
// property now.
//
// spec-v1009 exists because a transposed digit is the commonest data-entry error
// there is, and the backstop in app.js only fires at 1e9 -- so "Age 1307" and
// "Heart rate 3007" are caught by a DECLARED BOUND or by nothing. spec-v1183 and
// spec-v1184 activated every bound that had been written and dropped.
//
// This asks the next question, and asks it where no clinical judgment is needed:
// the repo has already written the range down, in the label the reader can see.
//
//   field('Glasgow Coma Scale (3-15)', 'p2-gcs', { min: 3, max: 15 })   enforced
//   field('Glasgow Coma Scale (3-15)', 'xx-gcs')                        NOT
//
// The second says 3-15 on screen and accepts 157. That is the same shape as the
// whole spec-v1179 -> v1184 line: a bound that was written down and never took
// effect -- except here it was written down IN FRONT OF THE READER.
//
// No clinical judgment is needed to hold this line, which is why it can be a
// gate at all: the range is not a number someone has to decide, it is the number
// already printed beside the box. A new field that shows one and does not enforce
// it fails here.
import { test, expect } from '@playwright/test';

test.skip(({ browserName }) => browserName !== 'chromium', 'whole-catalog sweep is chromium-only');

test('every label that names a range has an input that enforces it', async ({ page }) => {
  test.setTimeout(900_000);
  await page.goto('/');
  const ids = await page.evaluate(async () => Object.keys((await import('/lib/meta.js')).META));
  expect(ids.length).toBeGreaterThan(1500);

  const gaps = [];
  let numbers = 0;
  let bounded = 0;
  let labelled = 0;
  for (const id of ids) {
    await page.goto(`/#${id}`);
    await page.waitForTimeout(50);
    const seen = await page.evaluate(() => {
      const out = { n: 0, bounded: 0, labelled: 0, gaps: [] };
      for (const inp of document.querySelectorAll('#tool-body input[type=number]')) {
        out.n += 1;
        const hasMin = inp.hasAttribute('min');
        const hasMax = inp.hasAttribute('max');
        if (hasMin || hasMax) out.bounded += 1;
        const label = document.querySelector(`label[for="${CSS.escape(inp.id)}"]`);
        const text = label ? (label.textContent || '') : '';
        // "(3-15)", "(0 to 100)", "(21-100%)" -- a range the reader is shown.
        // Requires BOTH endpoints: "(mL/min)" and "(2020 revision)" are not ranges.
        // The dash class is written as escapes, not glyphs: grep-check.mjs bans a
        // literal en/em dash in source, and these labels use both spellings
        // ("GCS (3-15)" with a hyphen, "(0\u2013100 mm)" with an en dash).
        const m = text.match(/\(\s*(-?\d+(?:\.\d+)?)\s*(?:[-\u2013\u2014]|to)\s*(-?\d+(?:\.\d+)?)\s*[^)]{0,6}\)/);
        if (!m) continue;
        const lo = Number(m[1]); const hi = Number(m[2]);
        if (!(hi > lo)) continue; // "(1-2 mg)" style dosing text, or a reversed pair
        out.labelled += 1;
        if (hasMin && hasMax) continue;
        out.gaps.push(`${inp.id} "${text.trim().slice(0, 60)}" -> min=${inp.getAttribute('min')} max=${inp.getAttribute('max')} (label says ${lo}-${hi})`);
      }
      return out;
    });
    numbers += seen.n; bounded += seen.bounded; labelled += seen.labelled;
    for (const g of seen.gaps) gaps.push(`${id}: ${g}`);
  }

  console.log(`number inputs, catalog-wide: ${numbers}`);
  console.log(`  carrying a min or a max:   ${bounded}`);
  console.log(`  whose LABEL names a range: ${labelled}`);

  // The reach, asserted: a sweep that matched no labels would pass while saying
  // nothing, which is the failure mode every gate in this line has had.
  expect(numbers, 'expected thousands of number inputs').toBeGreaterThan(2000);
  expect(labelled, 'expected many labels to name a range').toBeGreaterThan(200);

  expect(gaps, `${gaps.length} field(s) show a range they do not enforce`).toEqual([]);
});
