// Probe (not a gate): does any calculator print a JavaScript runtime error into
// its answer when the form is cleared? safe() catches exceptions and renders
// err.message AS the answer, so a renderer that reads a property of a result the
// library withheld shows the reader a TypeError.
import { test, expect } from '@playwright/test';

const SHARDS = 4;
test.skip(({ browserName }) => browserName !== 'chromium', 'chromium-only');

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
      // "is not defined" is left out on purpose: rope-score's legitimate refusal
      // says "The score is not defined without it", and a sweep that flags that
      // reports a crash where there is none.
      if (/Cannot read propert|is not a function|undefined is not|is not iterable|null is not/.test(t)) {
        hits.push(`${id} :: ${t.slice(0, 130)}`);
      }
    }
    console.log(`JSERR shard${shard} n=${hits.length}`);
    for (const h of hits) console.log('JSERRHIT ' + h);
    expect(true).toBe(true);
  });
}
