// spec-v1019: nothing stopped a NEW tile from answering a form with nothing in
// it.
//
// spec-v1006 through spec-v1018 fixed thirty-odd of them, one judgment at a
// time, and every one of those fixes is pinned by a named test. None of that
// stops the next calculator from reading a blank field as a zero: the tests name
// the tiles they fixed, and a tile that does not exist yet is in no list.
//
// This sweep asks the question of the whole catalog. It clears every number
// field, the way a reader does before typing their own values, and fails on any
// tile that still produces a reading and is not carried in the ledger beside it.
//
// It is sharded for the same reason example-correctness is: the serial loop over
// 1,704 tiles is long enough to fight a timeout, and `fullyParallel` turns four
// shards into roughly a quarter of the wall clock.

import { test, expect } from '@playwright/test';
import { ANSWERS_AN_EMPTY_FORM } from './empty-form-ledger.js';
import { ASKING } from '../lib/asking-language.js';

const SHARDS = 4;
const SHARD_TIMEOUT_MS = 900_000;

test.skip(({ browserName }) => browserName !== 'chromium', 'whole-catalog sweep is chromium-only');

// spec-v1056: the asking vocabulary is shared with the required-field sweep now
// (test/lib/asking-language.js). The two had a copy each and the copies had
// drifted -- and the drift was being paid for in ledger lines, because a phrase
// missing here makes this sweep flag a tile that is refusing correctly.

for (let shard = 0; shard < SHARDS; shard += 1) {
  test(`no new tile answers a cleared form (shard ${shard + 1} of ${SHARDS})`, async ({ page }) => {
    test.setTimeout(SHARD_TIMEOUT_MS);
    await page.goto('/');
    const ids = await page.evaluate(async () => Object.keys((await import('/lib/meta.js')).META));
    expect(ids.length).toBeGreaterThan(1500);

    const offenders = [];
    for (let i = shard; i < ids.length; i += SHARDS) {
      const id = ids[i];
      await page.goto(`/#${id}`);
      const reading = await page.evaluate(async () => {
        // Text fields and textareas count: rosendaal-ttr's input is a list of
        // dated INR values typed into a textarea, and a sweep that only cleared
        // number inputs would leave its data in place and call it an answer.
        const nums = [
          ...document.querySelectorAll('#tool-body input[type=number], #tool-body input[type=text], #tool-body textarea'),
        ];
        if (!nums.length) return null;
        for (const n of nums) {
          n.value = '';
          n.dispatchEvent(new Event('input', { bubbles: true }));
          n.dispatchEvent(new Event('change', { bubbles: true }));
        }
        // spec-v1026: 120 ms, not 25. At 25 the sweep raced tiles that compute
        // behind an await (a picklist shard, a lazily imported module) and read
        // a half-rendered region: four tiles reported differently between two
        // runs of the same commit, which is a gate that lies in both directions.
        await new Promise((r) => setTimeout(r, 120));
        const q = document.querySelector('#q-results') || document.querySelector('.screener-result');
        return q ? (q.textContent || '').replace(/\s+/g, ' ') : '';
      });
      if (reading === null || reading.length <= 12) continue;
      if (ASKING.test(reading)) continue;
      // A number that is not a citation year: the tile answered.
      if (!/(?:^|[^\d.,])\d+(?:\.\d+)?(?![\d.,]*\s*(?:19|20)\d\d)/.test(reading.replace(/\(.*?\)/g, ''))) continue;
      if (ANSWERS_AN_EMPTY_FORM.has(id)) continue;
      offenders.push(`${id}: ${reading.slice(0, 120)}`);
    }

    expect(
      offenders,
      `${offenders.length} tile(s) answered a form with nothing in it. Either the blank field is a\n`
      + 'criterion the clinician answered "no" to -- in which case add the id to\n'
      + 'test/integration/empty-form-ledger.js with a sentence saying so -- or it is a measurement\n'
      + 'nobody took, in which case ask for it instead of computing from a zero (docs/spec-v1013.md):\n'
      + offenders.join('\n'),
    ).toEqual([]);
  });
}
