// spec-v1146: the gate beside this one tests ONE required field per tile.
//
// `required-field-agreement.spec.js` clears the first required field a tile
// renders as a text or number input, then `break`s. That is one field per tile,
// and always the same one:
//
//   required fields the catalog declares        4,226
//   tiles that declare at least one             1,089
//   tiles that declare more than one              900
//
// So at most 1,089 of the 4,226 have ever been cleared by it, and it has been
// green throughout. What the other three thousand hid was not exotic. In three
// tiles the FIRST required field had a lower bound that rejects zero and the
// SECOND did not, so the sweep tested the guarded half every time:
//
//   aa-pf-suite   pfRatio needs fio2 >= 0.01, and allows pao2 = 0
//                 -> "P/F ratio: 0 - Severe ARDS (Berlin)"
//   burn-fluid    burnFluid needs weightKg >= 0.1, and allows tbsaPercent = 0
//                 -> "Parkland total 24h: 0 mL"
//   big           spec-v1041 fixed the base deficit and left the INR and the GCS
//                 -> "BIG 0.0: <16, below the high-mortality threshold"
//
// The last one is the sharpest: a fix landed on the field the sweep tests, and
// the same defect on the two fields beside it survived five hundred waves.
// `aa-pf-suite`'s reading is the example in spec-v1037's OWN header.
//
// This is a probe rather than a widened gate because the widened question has a
// backlog: 62 (tile, field) pairs at the first run, of which this wave fixed
// three. Widening the gate now would mean ledgering 59 rows to keep it green,
// and a tile exempted for nothing is a tile the gate is not protecting. The gate
// keeps stopping NEW first-field offenders while this drains; see
// docs/spec-v1146.md for the backlog and the triage.
//
//   RUN_PROBES=1 npx playwright test test/integration/required-field-every-probe.spec.js --project=chromium

import { test, expect } from '@playwright/test';
import { ANSWERS_WITHOUT_A_REQUIRED_FIELD } from './required-field-ledger.js';
import { requiredFieldsByTile, answeredWithANumber, refusedOrDisclosed, clearEachAndRead } from '../lib/required-fields.js';

const SHARDS = 4;
test.skip(({ browserName }) => browserName !== 'chromium', 'whole-catalog sweep is chromium-only');

const REQUIRED = requiredFieldsByTile();
const IDS = Object.keys(REQUIRED);

for (let shard = 0; shard < SHARDS; shard += 1) {
  test(`every required field, one at a time (shard ${shard + 1} of ${SHARDS})`, async ({ page }) => {
    test.setTimeout(1_800_000);
    const hits = [];
    // A clean sweep is a claim about its reach, so the reach is printed with it.
    let pairs = 0;
    let declared = 0;
    for (let i = shard; i < IDS.length; i += SHARDS) {
      const id = IDS[i];
      declared += REQUIRED[id].length;
      await page.goto(`/#${id}`);
      const readings = await page.evaluate(clearEachAndRead, REQUIRED[id]);
      pairs += readings.length;
      for (const r of readings) {
        if (!r || r.text.length <= 12) continue;
        if (refusedOrDisclosed(r.text)) continue;
        if (!answeredWithANumber(r.text)) continue;
        if (ANSWERS_WITHOUT_A_REQUIRED_FIELD.has(id)) continue;
        hits.push(`${id}|${r.cleared} :: ${r.text.slice(0, 110)}`);
      }
    }
    console.log(`RFEVERY shard${shard} n=${hits.length} pairs=${pairs} declared=${declared}`);
    for (const h of hits) console.log('RFEVERYHIT ' + h);
    expect(true).toBe(true);
  });
}
