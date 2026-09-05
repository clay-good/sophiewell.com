// spec-v1074 follow-up: a <select> the registry describes as a bare number.
//
// Two gates depend on `values` being present on a number field:
//
//   field-values-match-dom.spec.js  (spec-v770) keeps a DECLARED list honest in
//     both directions -- but it can only check fields that declare one.
//   rated-items-are-required.test.js (spec-v1074) refuses to let an omitted
//     PICKLIST item move the answer, and finds its picklists the same way.
//
// So a field the browser renders as a <select> while the adapter says only
// `kind: 'number'` is invisible to both. It found 83 of them across seven
// calculators, and two were accepting numbers their own form does not offer --
// `audit-full` summed a 3.7 into "AUDIT total 13.7: Zone II hazardous use",
// which is the atlas-cdi defect spec-v770 was written for, still live on two
// tiles.
//
// `cornell-csdd` is the one it finds that must NOT be fixed this way: its
// options are ("", "a", "0", "1", "2"), where `a` means "unable to evaluate".
// A numeric `values` list would REJECT that legal answer, which the spec-v770
// header calls the worse of the two failures.
//
// This asserts nothing. It is the finder; run it by hand:
//
//   RUN_PROBES=1 npx playwright test test/integration/undeclared-picklist-probe.spec.js --project=chromium

import { writeFileSync } from 'node:fs';
import { test } from '@playwright/test';
import { REGISTRY } from '../../mcp/tools.js';

test.skip(!process.env.RUN_PROBES, 'probe: run deliberately, not in CI');
test.skip(({ browserName }) => browserName !== 'chromium', 'catalog sweep is chromium-only');

test('which number fields are rendered as a select but declare no values', async ({ page }) => {
  test.setTimeout(900_000);

  const targets = [];
  for (const calc of REGISTRY.values()) {
    const doms = (calc.fields || [])
      .filter((f) => f.kind === 'number' && !Array.isArray(f.values))
      .map((f) => f.dom);
    if (doms.length) targets.push({ id: calc.id, doms });
  }

  const found = [];
  for (const { id, doms } of targets) {
    await page.goto(`/#${id}`);
    const rows = await page.evaluate((list) => {
      const out = [];
      for (const dom of list) {
        const el = document.getElementById(dom);
        if (!el || el.tagName !== 'SELECT') continue;
        out.push({ dom, options: [...el.options].map((o) => o.value) });
      }
      return out;
    }, doms);
    for (const r of rows) found.push({ id, ...r });
  }

  const byTile = new Map();
  for (const f of found) {
    if (!byTile.has(f.id)) byTile.set(f.id, []);
    byTile.get(f.id).push(f);
  }

  // The console is interleaved by the reporter, so the machine-readable copy
  // goes to a file: the option lists are what a fix has to be typed from.
  const out = 'test-results/undeclared-picklists.json';
  writeFileSync(out, JSON.stringify(Object.fromEntries(byTile), null, 2));
  console.log(`wrote ${out}`);
  console.log(`${found.length} number field(s) across ${byTile.size} calculator(s) are a <select> on screen`);
  console.log('with no `values` in the registry, so an agent cannot learn which numbers mean anything,');
  console.log('and both value-list gates walk past them.\n');
  for (const [id, rows] of byTile) {
    console.log(`  ${id}  (${rows.length})`);
    for (const r of rows) console.log(`      ${r.dom}: ${r.options.join(', ')}`);
  }
});
