// spec-v1037: the two customers must not get different answers.
//
// `mcp/fields.js` marks some inputs `required`. An agent that omits one gets
// `MISSING_INPUT` and no number. The browser had no equivalent: it read the same
// blank field as `Number('')`, which is 0, and answered anyway. So the same
// missing lab produced a refusal on one surface and "P/F ratio: 0 (Severe ARDS)"
// on the other.
//
// This sweep asks the question the empty-form sweep cannot. That one clears
// EVERY field, which is a state a reader rarely reaches; this one clears exactly
// ONE and leaves the worked example in place everywhere else. That is the likely
// accident: a lab that has not come back yet, on an otherwise complete form.
//
// The oracle is the `required` declaration itself, so there is no heuristic
// about which fields "matter": the agent surface already refuses without them.
//
// Sharded like the other whole-catalog sweeps.
//
// spec-v1146: it used to clear the FIRST such field and `break` -- one field per
// tile, and always the same one, out of the 4,222 the catalog declares required
// across 1,089 tiles, 900 of which declare more than one. It was green throughout.
// Widened, it found 62 (tile, field) pairs that answered anyway, and in three of
// them the first required field had a lower bound that rejects zero while the
// second did not, so the sweep had been testing the guarded half every time.
//
// spec-v1156: those 62 were drained over spec-v1146 to spec-v1155 -- 35 tiles
// taught to ask, 27 declarations corrected -- so the gate asks the wide question
// itself now and the probe that carried it while the backlog drained is gone. It
// clears EVERY required text or number field, one at a time, putting each back
// before the next: an accumulating pile of blanks is the empty-form sweep again.
//
// Because it is a gate rather than a probe, it prints its own REACH with its
// result. A clean sweep is a claim about what it reached, not about the catalog --
// selects, checkboxes and sliders are skipped, since clearing one sets a different
// VALUE rather than removing one (spec-v1029), and so are fields the worked
// example leaves blank.

import { test, expect } from '@playwright/test';
import { ANSWERS_WITHOUT_A_REQUIRED_FIELD } from './required-field-ledger.js';
import { requiredFieldsByTile, answeredWithANumber, refusedOrDisclosed, clearEachAndRead } from '../lib/required-fields.js';

const SHARDS = 4;
const SHARD_TIMEOUT_MS = 900_000;

test.skip(({ browserName }) => browserName !== 'chromium', 'whole-catalog sweep is chromium-only');

// Shared with no-answer-from-nothing-sweep.spec.js: the words a tile uses when
// it is asking rather than answering.
// spec-v1056: shared with the empty-form sweep (test/lib/asking-language.js),
// which also carries the two rules about editing it.

// spec-v1146: the per-tile map and the reading helpers live in
// test/lib/required-fields.js. They were shared with a probe while the backlog
// drained; the probe is gone (spec-v1156) and the module stays, because the
// "did it answer?" test is a regex that has been tuned three times and belongs in
// one place.
const REQUIRED = requiredFieldsByTile();

const IDS = Object.keys(REQUIRED);

for (let shard = 0; shard < SHARDS; shard += 1) {
  test(`no tile answers without a field the agent surface requires (shard ${shard + 1} of ${SHARDS})`, async ({ page }) => {
    test.setTimeout(SHARD_TIMEOUT_MS);
    expect(IDS.length).toBeGreaterThan(900);

    const offenders = [];
    let pairs = 0;
    let declared = 0;
    let tilesWithNoField = 0;
    for (let i = shard; i < IDS.length; i += SHARDS) {
      const id = IDS[i];
      declared += REQUIRED[id].length;
      await page.goto(`/#${id}`);
      const readings = await page.evaluate(clearEachAndRead, REQUIRED[id]);
      pairs += readings.length;
      if (!readings.length) tilesWithNoField += 1;
      for (const reading of readings) {
        if (!reading || reading.text.length <= 12) continue;
        if (refusedOrDisclosed(reading.text, reading.base)) continue;
        if (!answeredWithANumber(reading.text)) continue;
        if (ANSWERS_WITHOUT_A_REQUIRED_FIELD.has(id)) continue;
        offenders.push(`${id} (cleared ${reading.cleared}): ${reading.text.slice(0, 120)}`);
      }
    }
    console.log(`REQFIELD shard${shard}: ${pairs} of ${declared} declared required fields cleared`
      + `; ${tilesWithNoField} tile(s) had no filled text/number input to clear`);
    // The reach is part of the result: if a change ever narrows what this can see,
    // it fails here rather than going quiet.
    expect(pairs, 'the sweep cleared almost nothing -- check what narrowed it').toBeGreaterThan(400);

    expect(
      offenders,
      `${offenders.length} (tile, field) pair(s) answered without a field mcp/fields.js calls required.\n`
      + 'An agent asking the same question gets MISSING_INPUT and no number. Either the browser\n'
      + 'should ask too (docs/spec-v1037.md), or the field is not really required and the\n'
      + 'declaration is wrong -- fixing either one is a fix. To record a legitimate exception,\n'
      + 'add the id to test/integration/required-field-ledger.js with a sentence saying why:\n'
      + offenders.join('\n'),
    ).toEqual([]);
  });
}
