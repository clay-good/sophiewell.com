// A shared link has to show the same answer the sharer saw.
//
// Every tile offers "Copy link", and the link carries the field values in the
// hash. On four tiles it did not survive the trip: steroid-equiv, benzo-equiv,
// vasopressor and opioid-mme build their picklists from a fetch, so the
// restore ran against a select with no options, the tile fell back to its
// first row, and the result region came up empty. A colleague following the
// link saw nothing at all.
//
// Scoped to the tiles that build their inputs from a fetch, because that is
// the whole failure mode and a 1564-tile round trip is three navigations per
// tile. The list is every view that calls `loadFile`, and the count below is
// checked against the source so a new one cannot be added without being
// covered here:
//
//   grep -c "loadFile(" views/*.js
import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

test.skip(({ browserName }) => browserName !== 'chromium', 'driven through the browser');

const ASYNC_TILES = [
  'opioid-mme', 'steroid-equiv', 'benzo-equiv', 'abx-renal', 'vasopressor',
  'rvu-payment', 'drg-payment', 'field-triage',
  'tetanus', 'rabies-pep', 'bbp-exposure', 'tb-testing', 'sti-screening',
];

// Every `loadFile` call site in views/. If this moves, a tile has started (or
// stopped) building its inputs from a fetch, and ASYNC_TILES needs the same
// edit -- otherwise the new one ships uncovered.
const LOAD_FILE_CALLS = 14;

test('the tiles that fetch their inputs still answer their own link', async ({ page }) => {
  test.setTimeout(300_000);

  const views = join(process.cwd(), 'views');
  let calls = 0;
  for (const f of readdirSync(views)) {
    if (!f.endsWith('.js')) continue;
    calls += (readFileSync(join(views, f), 'utf8').match(/loadFile\(/g) || []).length;
  }
  expect(calls, 'a view started or stopped fetching its inputs -- update ASYNC_TILES').toBe(LOAD_FILE_CALLS);

  const read = () => page.evaluate(async () => {
    await new Promise((r) => setTimeout(r, 250));
    const q = document.querySelector('#q-results') || document.querySelector('.screener-result');
    return { text: q ? (q.innerText || '').replace(/\s+/g, ' ').trim() : '', hash: location.hash };
  });

  const broken = [];
  for (const id of ASYNC_TILES) {
    await page.goto(`/#${id}`);
    const sent = await read();
    // A tile whose example fills nothing writes no state and has nothing to
    // lose: its defaults reproduce themselves.
    if (!sent.text || !/[?&]q=/.test(sent.hash)) continue;
    await page.goto('/');
    await page.goto(`/${sent.hash}`);
    const got = await read();
    if (got.text !== sent.text) {
      broken.push(`${id}: the link shows "${got.text.slice(0, 60)}" where the tile showed "${sent.text.slice(0, 60)}"`);
    }
  }

  expect(broken, `${broken.length} tiles do not answer their own link`).toEqual([]);
});
