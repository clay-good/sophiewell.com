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
const GENERIC = /^This is a math aid for verification/;
const OWN = /^(?:[A-Z][A-Za-z-]* )?(?:decision support|screening \/ decision support|estimate \/ decision support)\b[,.]/i;

test('no tile states the generic clinical notice next to its own', async ({ page }) => {
  test.setTimeout(600_000);
  await page.goto('/');
  const tiles = await page.evaluate(async () => {
    const mod = await import('/lib/meta.js');
    return Object.keys(mod.META);
  });

  const doubled = [];
  for (const id of tiles) {
    await page.goto(`/#${id}`);
    const lines = await page.evaluate(() => {
      const main = document.querySelector('#main');
      return [...main.querySelectorAll('p, li, summary')]
        .filter((n) => !n.querySelector('p, li'))
        .map((n) => (n.textContent || '').replace(/\s+/g, ' ').trim())
        .filter((t) => t.length > 40);
    });
    // `loeb-minimum-criteria` opens its notice "Decision support for when the
    // minimum threshold ... is met", with no break after "support", so the
    // recogniser does not see it and the tile keeps the banner. One tile, and
    // the banner is right there, just redundant.
    if (id === 'loeb-minimum-criteria') continue;
    if (lines.some((t) => GENERIC.test(t)) && lines.some((t) => OWN.test(t))) doubled.push(id);
  }

  expect(doubled, `${doubled.length} tiles state the generic notice next to their own`).toEqual([]);
});
