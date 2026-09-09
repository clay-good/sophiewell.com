// Probe (not a gate): spec-v1183 activated 85 `min:` declarations that 18 view
// modules had been accepting and dropping; spec-v1184 activated 3 `max:` ones in
// two more. This is the measurement taken BEFORE activating a bound, in the
// direction that could actually break.
//
// The lesson spec-v1179 exists for is that a declaration is not a rendering, so
// the count below is read off the page rather than out of the source. But the
// risk of turning an inert bound ON runs the other way: a floor that has never
// been enforced can start warning about a value the tile has always accepted --
// and the value most likely to be sitting in a field is the worked example's,
// which every reader sees on load without typing anything.
//
// So the sweep is AS THE TILE OPENS: example applied, nothing touched. A tile
// that warns here is one whose own documented reading is out of its own declared
// range, which is a defect in the bound or in the example, not in the reader.
//
// Both directions, in one probe. spec-v1183's version asked only about floors,
// and one wave later spec-v1184 needed the ceiling question -- which is the same
// "a second copy of the rule" mistake that let these helpers disagree in the
// first place. Reported, never asserted -- run it by name:
//
//   RUN_PROBES=1 npx playwright test test/integration/declared-bounds-probe.spec.js --project=chromium
import { test, expect } from '@playwright/test';

test.skip(({ browserName }) => browserName !== 'chromium', 'whole-catalog sweep is chromium-only');

test('no tile warns about its own worked example', async ({ page }) => {
  test.setTimeout(900_000);
  await page.goto('/');
  const ids = await page.evaluate(async () => Object.keys((await import('/lib/meta.js')).META));
  expect(ids.length).toBeGreaterThan(1500);

  const warned = [];
  let withMin = 0;
  let withMax = 0;
  for (const id of ids) {
    await page.goto(`/#${id}`);
    await page.waitForTimeout(60);
    const seen = await page.evaluate(() => {
      const nums = [...document.querySelectorAll('#tool-body input[type=number]')];
      const w = document.querySelector('.range-warning');
      return {
        min: nums.filter((n) => n.hasAttribute('min')).length,
        max: nums.filter((n) => n.hasAttribute('max')).length,
        // Both directions, named apart: a tile already warning on load for some
        // other reason is not a bound activation's doing.
        under: nums.filter((n) => n.value !== '' && n.validity && n.validity.rangeUnderflow)
          .map((n) => `${n.id}=${n.value} below min ${n.getAttribute('min')}`),
        over: nums.filter((n) => n.value !== '' && n.validity && n.validity.rangeOverflow)
          .map((n) => `${n.id}=${n.value} above max ${n.getAttribute('max')}`),
        text: w ? (w.textContent || '').replace(/\s+/g, ' ') : '',
      };
    });
    withMin += seen.min;
    withMax += seen.max;
    const bad = [...seen.under, ...seen.over];
    if (bad.length) warned.push(`${id}: ${bad.join(', ')} -- ${seen.text}`);
  }

  console.log(`number inputs rendering a min: ${withMin}`);
  console.log(`number inputs rendering a max: ${withMax}`);
  console.log(`tiles whose example falls outside a declared bound: ${warned.length}`);
  for (const line of warned) console.log(`  ${line}`);
});
