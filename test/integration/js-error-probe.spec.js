// Probe (not a gate): does any calculator print a JavaScript runtime error into
// its answer? safe() catches exceptions and renders err.message AS the answer,
// so a renderer that reads a property of a result the library withheld shows the
// reader a TypeError.
//
// Two passes, because the first one alone missed a live defect for a long time.
//
//   CLEARED -- every input emptied. This is the original pass, and it looks for
//     the renderer that assumed a value the library refused to compute.
//   AS IT OPENS (spec-v1144) -- the tile exactly as a reader first meets it,
//     with its worked example applied and nothing touched. `drg-payment` threw
//     "null is not iterable" out of derivation() on every case that is not a
//     post-acute transfer -- which is the case its own example shows -- so its
//     derivation table had never rendered, and the engine's message stood where
//     the table belongs. Clearing the form was not the way to find that: the
//     defect is in the ordinary reading, not the empty one.
//
// The lesson is the finder's, not the tile's: a probe that only tests the
// cleared form can only find the defects that need a cleared form.
//
// Negative-tested before being trusted, and the measurement is the argument:
// with the derivation() fix reverted, the AS IT OPENS pass finds BOTH tiles
// (`drg-payment` and `drug-wastage`) and the CLEARED pass finds NEITHER. A
// finder whose silence has never been checked is not evidence.
import { test, expect } from '@playwright/test';

const SHARDS = 4;
test.skip(({ browserName }) => browserName !== 'chromium', 'chromium-only');

// "is not defined" is left out on purpose: rope-score's legitimate refusal says
// "The score is not defined without it", and a sweep that flags that reports a
// crash where there is none.
const ENGINE_ERROR = /Cannot read propert|is not a function|undefined is not|is not iterable|null is not/;

for (let shard = 0; shard < SHARDS; shard += 1) {
  test(`js errors on a cleared form (shard ${shard + 1})`, async ({ page }) => {
    test.setTimeout(1_800_000);
    await page.goto('/');
    const ids = await page.evaluate(async () => Object.keys((await import('/lib/meta.js')).META));
    const hits = [];
    for (let i = shard; i < ids.length; i += SHARDS) {
      const id = ids[i];
      await page.goto(`/#${id}`);
      const t = await page.evaluate(async () => {
        for (const n of document.querySelectorAll('#tool-body input[type=number], #tool-body input[type=text], #tool-body textarea')) {
          n.value = '';
          n.dispatchEvent(new Event('input', { bubbles: true }));
          n.dispatchEvent(new Event('change', { bubbles: true }));
        }
        await new Promise((r) => setTimeout(r, 130));
        return (document.querySelector('#q-results')?.textContent || '').replace(/\s+/g, ' ');
      });
      if (ENGINE_ERROR.test(t)) hits.push(`${id} :: ${t.slice(0, 130)}`);
    }
    console.log(`JSERR shard${shard} n=${hits.length}`);
    for (const h of hits) console.log('JSERRHIT ' + h);
    expect(true).toBe(true);
  });
}

// spec-v1144: the same question of the tile as it opens -- worked example
// applied, nothing touched. This is what every reader sees first.
for (let shard = 0; shard < SHARDS; shard += 1) {
  test(`js errors on the tile as it opens (shard ${shard + 1})`, async ({ page }) => {
    test.setTimeout(1_800_000);
    await page.goto('/');
    const ids = await page.evaluate(async () => Object.keys((await import('/lib/meta.js')).META));
    const hits = [];
    for (let i = shard; i < ids.length; i += SHARDS) {
      const id = ids[i];
      await page.goto(`/#${id}`);
      const t = await page.evaluate(async () => {
        await new Promise((r) => setTimeout(r, 130));
        return (document.querySelector('#q-results')?.textContent || '').replace(/\s+/g, ' ');
      });
      if (ENGINE_ERROR.test(t)) hits.push(`${id} :: ${t.slice(0, 130)}`);
    }
    console.log(`JSERROPEN shard${shard} n=${hits.length}`);
    for (const h of hits) console.log('JSERROPENHIT ' + h);
    expect(true).toBe(true);
  });
}
