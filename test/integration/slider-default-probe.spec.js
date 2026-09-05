// spec-v1078 follow-up: which scored items are still sliders, and what does
// their default say?
//
// A slider cannot be blank. It sits somewhere the moment the page renders, and
// that position looks exactly like a rating somebody made. spec-v1047 fixed
// WAT-1 on that reasoning and spec-v1078 fixed both stroke scales, where the
// consequence was "NIHSS total: 0 (No stroke symptoms)" for a patient nobody had
// examined.
//
// `views/` still calls rangeField in dozens of places, and most of them are
// probably fine: a slider is a reasonable control for a quantity that is being
// measured rather than rated, and some default to the abnormal end where nothing
// reassuring can be read off an untouched form.
//
// The question this asks is narrower than "is it a slider": load the tile, leave
// every slider exactly where it rendered, and read the answer. A tile that says
// something REASSURING from a form nobody has touched is the spec-v1047 defect;
// a tile that says nothing, asks, or opens on an abnormal reading is not.
//
// It asserts nothing -- deciding which readings are reassuring needs a person.
// Run it by hand:
//
//   RUN_PROBES=1 npx playwright test test/integration/slider-default-probe.spec.js --project=chromium

import { writeFileSync } from 'node:fs';
import { test } from '@playwright/test';
import { ASKING, DISCLOSING } from '../lib/asking-language.js';

test.skip(!process.env.RUN_PROBES, 'probe: run deliberately, not in CI');
test.skip(({ browserName }) => browserName !== 'chromium', 'catalog sweep is chromium-only');

// The words a tile reaches for when an untouched form has been read as normal.
const REASSURING = /\b(no |none|normal|absent|negative|low risk|minimal|mild|intact|healed|closed|not indicated|unlikely|remission|clear|independent|full)\b/i;

test('which slider-scored tiles read as reassuring before anyone touches them', async ({ page }) => {
  test.setTimeout(900_000);

  await page.goto('/');
  const ids = await page.evaluate(async () => Object.keys((await import('/lib/meta.js')).META));

  const rows = [];
  for (const id of ids) {
    await page.goto(`/#${id}`);
    const seen = await page.evaluate(async () => {
      await new Promise((r) => setTimeout(r, 130));
      const body = document.getElementById('tool-body');
      if (!body) return null;
      const ranges = [...body.querySelectorAll('input[type=range]')];
      if (!ranges.length) return null;
      const out = document.querySelector('#q-results') || document.querySelector('.screener-result');
      return {
        sliders: ranges.length,
        defaults: ranges.slice(0, 4).map((n) => `${n.id}=${n.value}`),
        reading: out ? (out.textContent || '').replace(/\s+/g, ' ').trim() : '',
      };
    });
    if (!seen) continue;

    // A tile that asks, or owns up to what it has not been given, is not this.
    if (ASKING.test(seen.reading) || DISCLOSING.test(seen.reading)) continue;
    if (!seen.reading) continue;
    if (!REASSURING.test(seen.reading)) continue;
    rows.push({ id, ...seen, reading: seen.reading.slice(0, 160) });
  }

  const out = 'test-results/slider-defaults.json';
  writeFileSync(out, JSON.stringify(rows, null, 2));
  console.log(`wrote ${out}`);
  console.log(`${rows.length} tile(s) render a slider AND read as reassuring on an untouched form.`);
  console.log('Each is a suspect, not a defect: read it against the instrument. A slider is fine for a');
  console.log('quantity being measured; it is not fine for an item somebody has to rate.\n');
  for (const r of rows) {
    console.log(`  ${r.id}  (${r.sliders} sliders, ${r.defaults.join(' ')})`);
    console.log(`      -> ${r.reading}`);
  }
});
