// One disclaimer per tile, not two.
//
// The generic clinical notice goes above the inputs on every clinical tile:
// "This is a math aid for verification. Institutional protocols and clinician
// judgment govern any clinical decision." Two thirds of the views then closed
// with their own, longer version of the same sentence -- "Decision support,
// not a verdict. The result is the cited source's, computed from the inputs
// you enter. The management decision stays with the clinician and local
// protocol." 1063 of the 1564 tiles said it twice, on one screen, and a reader
// who meets the same disclaimer twice learns to skip both.
//
// app.js drops the generic one when the view states its own. This sweep is the
// only place that can see the result: it is a property of the rendered page,
// not of any source file.
import { test, expect } from '@playwright/test';

test.skip(({ browserName }) => browserName !== 'chromium', 'whole-catalog sweep is chromium-only');

// One navigation per tile against a local server; a clean run is ~15s at 1564
// tiles. The budget absorbs a contended CI runner.
// spec-v1157: `OWN` used to be a SECOND copy of app.js's recogniser, and the two
// had already drifted -- this one had neither the `/ ` opening alternative nor the
// standalone "Decision support, not a verdict" branch nor the "who decides"
// conjunct. A sweep that exists to police a decision must read the same rule the
// decision is made with, so both now import lib/own-notice.js.
const GENERIC = /^This is a math aid for verification/;

test('no tile states the generic clinical notice next to its own', async ({ page }) => {
  test.setTimeout(600_000);
  await page.goto('/');
  const tiles = await page.evaluate(async () => {
    const mod = await import('/lib/meta.js');
    return Object.keys(mod.META);
  });

  const doubled = [];
  // The reach: how many tiles the recogniser can see at all. If a rewording ever
  // drops a tile out of it, that tile silently stops being protected -- and if a
  // change drops MOST of them, this fails here rather than reporting clean.
  let statesItsOwn = 0;
  for (const id of tiles) {
    await page.goto(`/#${id}`);
    const read = await page.evaluate(async () => {
      const { noticeLines, isOwnNoticeLine } = await import('/lib/own-notice.js');
      const main = document.querySelector('#main');
      const all = noticeLines(main);
      return { lines: all.filter((t) => t.length > 40), own: all.some(isOwnNoticeLine) };
    });
    const { lines } = read;
    if (read.own) statesItsOwn += 1;
    // spec-v1157: `loeb-minimum-criteria` used to be skipped here, because its
    // notice opens "Decision support FOR when the minimum threshold ... is met",
    // with no break after "support", so the recogniser does not see it and the
    // tile keeps the banner. But an unrecognised tile is never flagged in the
    // first place -- the exemption protected nothing, and a tile exempted for
    // nothing is a tile the gate is not protecting. Removed; the sweep still
    // passes, and if that notice is ever reworded into the recognised shape the
    // tile joins the check instead of staying carved out of it.
    if (lines.some((t) => GENERIC.test(t)) && read.own) doubled.push(id);
  }

  console.log(`ONEDISC: ${statesItsOwn} of ${tiles.length} tiles state their own clinical notice`);
  expect(statesItsOwn, 'the recogniser sees almost no tile -- check what reworded').toBeGreaterThan(300);
  expect(doubled, `${doubled.length} tiles state the generic notice next to their own`).toEqual([]);
});
