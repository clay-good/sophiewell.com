// spec-v1087: the other way a control cannot say "not answered".
//
// spec-v1047 and spec-v1078 are about sliders: a slider sits somewhere the
// moment the page renders, and that position looks exactly like a rating
// somebody made. Every one of those tiles is now a number input.
//
// A number input CAN be blank -- but only if it is rendered blank. Give it
// `value: '0'` and the reader meets a form already answered, and has to delete
// eight zeros to say "I have not assessed this". That is the same defect wearing
// the fix's clothes, and it is invisible to the slider probe next door.
//
// `views/group-v198.js` builds the ISTH bleeding assessment tool this way:
//
//   field(label, id, { type: 'number', min: '0', max: '4', value: '0' })
//
// so all fourteen bleeding domains open showing 0, and the tile reads
// "ISTH-BAT 0 -- within the normal range" for a patient nobody has asked about.
//
// The distinction this draws, and the reason it cannot just flag every default:
// a value the tile's own WORKED EXAMPLE supplies is legitimate -- that is the
// example doing its job. What this looks for is a numeric input whose value did
// not come from the example, because that is a default the renderer invented.
//
// Asserts nothing; prints a report and writes the machine-readable copy.
//
//   RUN_PROBES=1 npx playwright test test/integration/prefilled-default-probe.spec.js --project=chromium

import { writeFileSync } from 'node:fs';
import { test } from '@playwright/test';

test.skip(!process.env.RUN_PROBES, 'probe: run deliberately, not in CI');
test.skip(({ browserName }) => browserName !== 'chromium', 'catalog sweep is chromium-only');

test('which numeric inputs open pre-filled with a value the example did not supply', async ({ page }) => {
  test.setTimeout(900_000);

  await page.goto('/');
  const ids = await page.evaluate(async () => {
    const { META } = await import('/lib/meta.js');
    return Object.keys(META);
  });

  const rows = [];
  // spec-v1158: the reach, because "4 calculators" is a number with no scale. If a
  // change ever stopped `input[type=number]` matching -- a view moving to a custom
  // control, say -- the count would fall and read as an improvement.
  let numericInputs = 0;
  let tilesWithNumericInput = 0;
  for (const id of ids) {
    await page.goto(`/#${id}`);
    const found = await page.evaluate(async (tileId) => {
      await new Promise((r) => setTimeout(r, 120));
      const { META } = await import('/lib/meta.js');
      const example = (META[tileId] && META[tileId].example && META[tileId].example.fields) || {};
      const body = document.getElementById('tool-body');
      if (!body) return null;
      const out = [];
      const numeric = body.querySelectorAll('input[type=number]');
      for (const n of numeric) {
        const v = String(n.value ?? '').trim();
        if (v === '') continue;                                  // rendered blank: correct
        if (Object.prototype.hasOwnProperty.call(example, n.id)) continue;  // the example's doing
        out.push({ field: n.id, value: v, placeholder: n.placeholder || '' });
      }
      const res = document.querySelector('#q-results') || body;
      return {
        seen: numeric.length,
        fields: out,
        reading: (res.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 140),
      };
    }, id);
    if (!found) continue;
    numericInputs += found.seen;
    if (found.seen) tilesWithNumericInput += 1;
    if (found.fields.length) rows.push({ id, fields: found.fields, reading: found.reading });
  }

  const out = 'test-results/prefilled-defaults.json';
  writeFileSync(out, JSON.stringify(rows, null, 2));
  console.log(`wrote ${out}`);
  console.log(`${rows.length} calculator(s) render a numeric input pre-filled with a value`);
  console.log('their worked example did not supply.\n');
  console.log(`Reach: ${numericInputs} number input(s) across ${tilesWithNumericInput} of ${ids.length} tiles.`);
  console.log('The rest are built of selects, checkboxes and sliders, which this cannot see --');
  console.log('slider-default-probe.spec.js is the one that looks at those.\n');
  console.log('A suspect, not a defect: a default is fine where the number is a SETTING the reader');
  console.log('adjusts (a target, a rate, a reference range). It is wrong where the number is an');
  console.log('OBSERVATION, because a pre-filled 0 is a finding nobody made.\n');
  for (const r of rows) {
    console.log(`  ${r.id}  (${r.fields.length})`);
    for (const f of r.fields.slice(0, 6)) console.log(`      ${f.field} = "${f.value}"`);
    console.log(`      -> ${r.reading}`);
  }
});
