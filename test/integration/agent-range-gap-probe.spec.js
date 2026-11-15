// spec-v1729: a range the page enforces that the agent interface does not.
//
// spec-v1728 found 18 fields whose inputs declare `min` on the page (so
// spec-v1009's range warning speaks when a reader types a negative) while their
// MCP adapter field declared no range at all, so an agent's negative value went
// straight to the library and read as "not entered". The two surfaces are meant
// to say the same thing about a field (`mcp/fields.js` enforces an adapter's
// min/max before the library runs).
//
// This walks every tool on the page, reads each number input's `min` and `max`,
// and compares them with the adapter field that has the same `dom` id:
//
//   AGENTS UNFENCED -- the page declares a bound the adapter does not.
//   DISAGREE        -- both declare one and they differ.
//
// WHAT IT FOUND, first run (spec-v1729): 4,411 inputs compared. 4,113 page bounds
// the adapter does not declare, almost all `min="0"` on a field whose library
// refuses a negative itself (scripts/probe-sign-flipped.mjs covers the rest). 100
// bounds declared on both sides and different: 92 where the library also refuses
// the in-between value (only the warning differs), and 8 where it answered. ABI and
// COWS (from the 92) and the pediatric weight estimate (from the 8) were settled;
// the other seven of the 8 are conditional fields the worked example never
// reaches, left unverified (docs/spec-v1729.md).
//
// A FINDER, not a gate (the `-probe.spec.js` suffix keeps it out of CI):
//
//   RUN_PROBES=1 npx playwright test test/integration/agent-range-gap-probe.spec.js --project=chromium
import { test } from '@playwright/test';
import { writeFileSync } from 'node:fs';
import { REGISTRY } from '../../mcp/catalog.js';

test.skip(({ browserName }) => browserName !== 'chromium', 'chromium only');

test('page ranges the agent interface does not enforce', async ({ page }) => {
  test.setTimeout(1_800_000);
  const unfenced = []; const disagree = [];
  let compared = 0;
  for (const [id, e] of REGISTRY) {
    const nums = (e.fields || []).filter((f) => f.kind === 'number' && !Array.isArray(f.values));
    if (!nums.length) continue;
    await page.goto(`/#${id}`);
    await page.waitForTimeout(60);
    const attrs = await page.evaluate((doms) => Object.fromEntries(doms.map((d) => {
      const n = document.getElementById(d);
      return [d, n && n.tagName === 'INPUT' && n.type === 'number' ? { min: n.getAttribute('min'), max: n.getAttribute('max') } : null];
    })), nums.map((f) => f.dom));
    for (const f of nums) {
      const a = attrs[f.dom];
      if (!a) continue;
      compared += 1;
      for (const side of ['min', 'max']) {
        if (a[side] === null || a[side] === '') continue;
        const pageV = Number(a[side]);
        if (!Number.isFinite(pageV)) continue;
        if (!Number.isFinite(f[side])) unfenced.push({ id, dom: f.dom, side, page: pageV });
        else if (f[side] !== pageV) disagree.push({ id, dom: f.dom, side, page: pageV, adapter: f[side] });
      }
    }
  }
  if (process.env.ARG_OUT) writeFileSync(process.env.ARG_OUT, JSON.stringify({ unfenced, disagree }, null, 1));
  console.log(`\nCompared ${compared} number inputs that have an adapter field.`);
  console.log(`AGENTS UNFENCED: ${unfenced.length} bound(s) the page declares and the adapter does not.`);
  console.log(`DISAGREE: ${disagree.length} bound(s) declared on both sides with different values.`);
  for (const r of disagree) console.log(`  ${r.id}  ${r.dom}  ${r.side}: page ${r.page}, adapter ${r.adapter}`);
});
