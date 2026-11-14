// spec-v1720: confirms `scripts/probe-impossible-as-zero.mjs` on the page. A FINDER, not a gate (the
// `-probe.spec.js` suffix keeps it out of CI): it asserts nothing and prints the rows it confirms.
//
// The library probe cannot tell a free number input from a select whose adapter calls it a number --
// an Aldrete item is a 0-2 select on the page -- and a select cannot carry 999999. So each row is
// driven here the way a reader would: if the field is an <input>, type the impossible value, read the
// result, type 0, read it again, and report the row only when the two readings are the same and the
// example's reading differs from both.
//
//   node scripts/probe-impossible-as-zero.mjs   (writes nothing; the rows go to a file by hand)
//   ASZ_ROWS=/tmp/asz.json RUN_PROBES=1 npx playwright test test/integration/impossible-as-zero-probe.spec.js --project=chromium
import { test } from '@playwright/test';
import { readFileSync } from 'node:fs';

const ROWS = process.env.ASZ_ROWS ? JSON.parse(readFileSync(process.env.ASZ_ROWS, 'utf8')) : [];

test.skip(({ browserName }) => browserName !== 'chromium', 'chromium only');

test('impossible values the page scores as zero', async ({ page }) => {
  test.setTimeout(1_800_000);
  const confirmed = []; const notInput = []; let driven = 0;
  for (const { id, dom } of ROWS) {
    await page.goto(`/#${id}`);
    await page.waitForTimeout(150);
    const out = await page.evaluate(async (domId) => {
      const n = document.getElementById(domId);
      if (!n) return { missing: true };
      if (n.tagName !== 'INPUT' || n.type === 'checkbox' || n.type === 'radio') return { tag: `${n.tagName.toLowerCase()}${n.type ? `[${n.type}]` : ''}` };
      const read = () => { const q = document.querySelector('#q-results') || document.querySelector('.screener-result'); return q ? q.textContent.replace(/\s+/g, ' ').trim() : ''; };
      const set = async (v) => { n.value = v; n.dispatchEvent(new Event('input', { bubbles: true })); n.dispatchEvent(new Event('change', { bubbles: true })); await new Promise((r) => setTimeout(r, 120)); return read(); };
      const example = read();
      const bad = await set('999999');
      const zero = await set('0');
      return { example, bad, zero };
    }, dom);
    if (out.missing) { notInput.push(`${id} ${dom}: not on the page`); continue; }
    if (out.tag) { notInput.push(`${id} ${dom}: ${out.tag}`); continue; }
    driven += 1;
    if (out.bad === out.zero && out.bad !== out.example) confirmed.push(`${id}  ${dom}\n      999999 reads: ${out.bad.slice(0, 140)}`);
  }
  console.log(`\nCONFIRMED on the page: ${confirmed.length} of ${driven} free inputs driven (${notInput.length} rows were not a free input).\n`);
  for (const c of confirmed) console.log(`  ${c}`);
  console.log(`\nNot a free input:\n  ${notInput.join('\n  ')}`);
});
