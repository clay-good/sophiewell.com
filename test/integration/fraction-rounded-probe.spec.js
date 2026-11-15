// spec-v1722: confirms `scripts/probe-fraction-rounded.mjs` on the page. A FINDER, not a gate (the
// `-probe.spec.js` suffix keeps it out of CI): it asserts nothing and prints the rows it confirms.
//
// The library probe cannot tell a free number input from a select whose adapter calls it a number,
// and a select cannot carry 2.49. So each row is driven the way a reader would type it: if the field
// is a typed <input> (number or text, not a slider), type x, read the result, type x+0.49, read it again, and report the row when the
// two readings are the same. The house number input is `step="any"`, so the browser accepts 2.49
// as valid and nothing on the page says it was rounded.
//
//   node scripts/probe-fraction-rounded.mjs --json > /tmp/fr.json
//   FR_ROWS=/tmp/fr.json RUN_PROBES=1 npx playwright test test/integration/fraction-rounded-probe.spec.js --project=chromium
import { test } from '@playwright/test';
import { readFileSync } from 'node:fs';

const ROWS = process.env.FR_ROWS ? JSON.parse(readFileSync(process.env.FR_ROWS, 'utf8')) : [];

test.skip(({ browserName }) => browserName !== 'chromium', 'chromium only');

test('fractions the page rounds without saying so', async ({ page }) => {
  test.setTimeout(1_800_000);
  const confirmed = []; const notInput = []; let driven = 0;
  for (const { id, dom, x } of ROWS) {
    await page.goto(`/#${id}`);
    await page.waitForTimeout(150);
    const out = await page.evaluate(async ([domId, whole]) => {
      const n = document.getElementById(domId);
      if (!n) return { missing: true };
      // A slider (type=range) snaps 1.49 to its step in the browser, so nobody can enter the
      // fraction there; only a typed box can carry it to the library.
      if (n.tagName !== 'INPUT' || (n.type !== 'number' && n.type !== 'text')) return { tag: `${n.tagName.toLowerCase()}${n.type ? `[${n.type}]` : ''}` };
      const read = () => { const q = document.querySelector('#q-results') || document.querySelector('.screener-result'); return q ? q.textContent.replace(/\s+/g, ' ').trim() : ''; };
      const set = async (v) => { n.value = v; n.dispatchEvent(new Event('input', { bubbles: true })); n.dispatchEvent(new Event('change', { bubbles: true })); await new Promise((r) => setTimeout(r, 120)); return read(); };
      const atWhole = await set(String(whole));
      const atFrac = await set(String(whole + 0.49));
      const atNext = await set(String(whole + 1));
      return { atWhole, atFrac, atNext };
    }, [dom, x]);
    if (out.missing) { notInput.push(`${id} ${dom}: not on the page`); continue; }
    if (out.tag) { notInput.push(`${id} ${dom}: ${out.tag}`); continue; }
    driven += 1;
    if (out.atWhole === out.atFrac && out.atWhole !== out.atNext) confirmed.push(`${id}  ${dom}  ${x + 0.49} reads as ${x}: ${out.atFrac.slice(0, 120)}`);
  }
  console.log(`\nCONFIRMED on the page: ${confirmed.length} of ${driven} free inputs driven (${notInput.length} rows were not a free input).\n`);
  for (const c of confirmed) console.log(`  ${c}`);
  console.log(`\nNot a free input:\n  ${notInput.join('\n  ')}`);
});
