// spec-v1024: an answer that changes with the wall clock, from inputs that did
// not change.
//
// spec-v1018 found four of these by reading a sweep's output: a due-date tool
// reporting "gestational age: 87 weeks", a code clock reporting 107 days of CPR,
// and a pregnancy-dating comparison whose 172-day discordance was an artifact of
// how long ago the example was written. Its own closing line said what was
// missing: those were found by eye, and nothing fails when a new one is added.
//
// This is that check. Every tile is rendered twice, a year apart on a fake
// clock, with its inputs untouched between the two readings. A tile whose output
// differs is measuring time -- which is either its purpose or its bug, and the
// ledger beside this file is where that judgment is written down.

import { test, expect } from '@playwright/test';
import { CLOCK_DEPENDENT } from './clock-dependent-ledger.js';

const SHARDS = 4;
const SHARD_TIMEOUT_MS = 900_000;

test.skip(({ browserName }) => browserName !== 'chromium', 'whole-catalog sweep is chromium-only');

for (let shard = 0; shard < SHARDS; shard += 1) {
  test(`no tile silently answers from the clock (shard ${shard + 1} of ${SHARDS})`, async ({ page }) => {
    test.setTimeout(SHARD_TIMEOUT_MS);
    await page.clock.install({ time: new Date('2026-09-03T12:00:00Z') });
    await page.goto('/');
    const ids = await page.evaluate(async () => Object.keys((await import('/lib/meta.js')).META));
    expect(ids.length).toBeGreaterThan(1500);

    // A tile computes on input, so the clock has to be jumped and the tile
    // nudged; navigating again is not enough, because the render is not repeated
    // for the same URL.
    const nudge = () => page.evaluate(() => {
      const n = document.querySelector('#tool-body input, #tool-body select, #tool-body textarea');
      if (n) {
        n.dispatchEvent(new Event('input', { bubbles: true }));
        n.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    const read = () => page.evaluate(() => {
      const q = document.querySelector('#q-results') || document.querySelector('.screener-result');
      return q ? (q.textContent || '').replace(/\s+/g, ' ') : '';
    });

    const surprises = [];
    for (let i = shard; i < ids.length; i += SHARDS) {
      const id = ids[i];
      await page.goto(`/#${id}`);
      await page.waitForTimeout(60);
      await nudge();
      await page.waitForTimeout(40);
      const before = await read();
      if (!before) continue;

      await page.clock.setSystemTime(new Date('2027-09-03T12:00:00Z'));
      await nudge();
      await page.waitForTimeout(40);
      const after = await read();
      await page.clock.setSystemTime(new Date('2026-09-03T12:00:00Z'));

      if (before === after) continue;
      if (CLOCK_DEPENDENT.has(id)) continue;
      surprises.push(`${id}:\n    today: ${before.slice(0, 110)}\n    in a year: ${after.slice(0, 110)}`);
    }

    expect(
      surprises,
      `${surprises.length} tile(s) answered differently a year later from the same inputs.\n`
      + 'If the passage of time is what the tool measures -- a deadline countdown, a device-day\n'
      + 'count -- add the id to test/integration/clock-dependent-ledger.js with the reason. If it\n'
      + 'is not, the reading is drifting away from a worked example that pins a date\n'
      + '(docs/spec-v1018.md):\n'
      + surprises.join('\n'),
    ).toEqual([]);
  });
}
