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
// ONE -- the first required field the tile actually renders as a text or number
// input -- and leaves the worked example in place everywhere else. That is the
// likely accident: a lab that has not come back yet, on an otherwise complete
// form.
//
// The oracle is the `required` declaration itself, so there is no heuristic
// about which fields "matter": the agent surface already refuses without them.
//
// Sharded like the other whole-catalog sweeps; ~1,000 tiles per run.

import { test, expect } from '@playwright/test';
import { allCalculators } from '../../mcp/catalog.js';
import { ANSWERS_WITHOUT_A_REQUIRED_FIELD } from './required-field-ledger.js';

const SHARDS = 4;
const SHARD_TIMEOUT_MS = 900_000;

test.skip(({ browserName }) => browserName !== 'chromium', 'whole-catalog sweep is chromium-only');

// Shared with no-answer-from-nothing-sweep.spec.js: the words a tile uses when
// it is asking rather than answering.
// Two of these earn a note. "rate|score X from N" is how the rating tiles ask
// for an item (`Rate vascularity on the 1-10 scale`), and it is written as a
// pattern rather than the bare word so it cannot swallow "heart rate 80".
//
// And "not reached" is deliberately NOT here. spec-v1038 nearly added it, on the
// strength of hys-law saying "the rule is not reached" -- which is exactly the
// defect this sweep is for: a criterion nobody measured, reported as one that
// was not met. A gate's asking-list must not learn to recognise the answers it
// exists to catch.
const ASKING = /enter |choose |select |complete |provide |missing|still needed|not scored|score all|rate all|(?:rate|score) [a-z0-9 ]{1,30}\b(?:from|on the) \d|measure |awaiting|fill |add at least|must be |out of range|cannot be|no criteria|unscored|check the value|blank|outstanding|rate the remaining|valid for ages|is required/i;

const REQUIRED = (() => {
  const map = {};
  for (const cal of allCalculators()) {
    const doms = (cal.fields || []).filter((f) => f.required).map((f) => f.dom).filter(Boolean);
    if (doms.length) map[cal.id] = doms;
  }
  return map;
})();

const IDS = Object.keys(REQUIRED);

for (let shard = 0; shard < SHARDS; shard += 1) {
  test(`no tile answers without a field the agent surface requires (shard ${shard + 1} of ${SHARDS})`, async ({ page }) => {
    test.setTimeout(SHARD_TIMEOUT_MS);
    expect(IDS.length).toBeGreaterThan(900);

    const offenders = [];
    for (let i = shard; i < IDS.length; i += SHARDS) {
      const id = IDS[i];
      await page.goto(`/#${id}`);
      const reading = await page.evaluate(async (doms) => {
        let cleared = null;
        for (const dom of doms) {
          const n = document.getElementById(dom);
          if (!n) continue;
          // A select, a checkbox and a slider cannot be blank -- clearing them
          // sets a different VALUE rather than removing one, which is a
          // different question (see spec-v1029 on prefilled zeros).
          if (n.tagName === 'SELECT' || n.type === 'checkbox' || n.type === 'range') continue;
          if (String(n.value) === '') continue;
          n.value = '';
          n.dispatchEvent(new Event('input', { bubbles: true }));
          n.dispatchEvent(new Event('change', { bubbles: true }));
          cleared = dom;
          break;
        }
        if (!cleared) return null;
        await new Promise((r) => setTimeout(r, 120));
        const q = document.querySelector('#q-results') || document.querySelector('.screener-result');
        return { cleared, text: q ? (q.textContent || '').replace(/\s+/g, ' ') : '' };
      }, REQUIRED[id]);

      if (!reading || reading.text.length <= 12) continue;
      if (ASKING.test(reading.text)) continue;
      // A number that is not a citation year: the tile answered.
      if (!/(?:^|[^\d.,])\d+(?:\.\d+)?(?![\d.,]*\s*(?:19|20)\d\d)/.test(reading.text.replace(/\(.*?\)/g, ''))) continue;
      if (ANSWERS_WITHOUT_A_REQUIRED_FIELD.has(id)) continue;
      offenders.push(`${id} (cleared ${reading.cleared}): ${reading.text.slice(0, 120)}`);
    }

    expect(
      offenders,
      `${offenders.length} tile(s) answered without a field mcp/fields.js calls required.\n`
      + 'An agent asking the same question gets MISSING_INPUT and no number. Either the browser\n'
      + 'should ask too (docs/spec-v1037.md), or the field is not really required and the\n'
      + 'declaration is wrong -- fixing either one is a fix. To record a legitimate exception,\n'
      + 'add the id to test/integration/required-field-ledger.js with a sentence saying why:\n'
      + offenders.join('\n'),
    ).toEqual([]);
  });
}
