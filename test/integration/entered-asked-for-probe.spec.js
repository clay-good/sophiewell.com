// spec-v1723: confirms `scripts/probe-entered-asked-for.mjs` on the page. A FINDER, not a gate (the
// `-probe.spec.js` suffix keeps it out of CI): it asserts nothing and prints the rows it confirms.
//
// The library answers an impossible value with "Enter ..." -- what it says to a blank field. On the
// page that is only a defect when nothing else says what is wrong: spec-v1009's range warning
// ("Check the highlighted value: ... outside the 0 to 20 this field accepts") already appears above
// the answer for any input that declares a min or max. So each row is typed into its field, and
// reported only when the input is a typed box, no #range-warning appears, and the answer itself
// says nothing about the value ("must be", "Check the value", or bounds.js's "plausible range").
//
//   node scripts/probe-entered-asked-for.mjs --json | tail -1 > /tmp/ea.json
//   EA_ROWS=/tmp/ea.json RUN_PROBES=1 npx playwright test test/integration/entered-asked-for-probe.spec.js --project=chromium
import { test } from '@playwright/test';
import { readFileSync } from 'node:fs';

const ROWS = process.env.EA_ROWS ? JSON.parse(readFileSync(process.env.EA_ROWS, 'utf8')) : [];

test.skip(({ browserName }) => browserName !== 'chromium', 'chromium only');

test('entered values the page answers with "Enter it", unexplained', async ({ page }) => {
  test.setTimeout(1_800_000);
  const confirmed = []; const covered = []; const notInput = [];
  for (const { id, dom, bad } of ROWS) {
    await page.goto(`/#${id}`);
    await page.waitForTimeout(150);
    const out = await page.evaluate(async ([domId, v]) => {
      const n = document.getElementById(domId);
      if (!n) return { missing: true };
      if (n.tagName !== 'INPUT' || (n.type !== 'number' && n.type !== 'text')) return { tag: `${n.tagName.toLowerCase()}[${n.type}]` };
      n.value = v; n.dispatchEvent(new Event('input', { bubbles: true })); n.dispatchEvent(new Event('change', { bubbles: true }));
      await new Promise((r) => setTimeout(r, 150));
      const q = document.querySelector('#q-results') || document.querySelector('.screener-result');
      const warn = document.getElementById('range-warning');
      return { answer: q ? q.textContent.replace(/\s+/g, ' ').trim() : '', warned: !!warn, min: n.getAttribute('min'), max: n.getAttribute('max') };
    }, [dom, bad]);
    if (out.missing || out.tag) { notInput.push(`${id} ${dom}: ${out.tag || 'not on the page'}`); continue; }
    if (out.warned || /must be|Check the value|outside|plausible range/i.test(out.answer)) { covered.push(`${id} ${dom}`); continue; }
    confirmed.push(`${id}  ${dom} = ${bad}  (min ${out.min}, max ${out.max}): ${out.answer.slice(0, 110)}`);
  }
  console.log(`\nCONFIRMED on the page: ${confirmed.length} (${covered.length} already explained, ${notInput.length} not a typed box).\n`);
  for (const c of confirmed) console.log(`  ${c}`);
  console.log(`\nNot a typed box:\n  ${notInput.join('\n  ')}`);
});
