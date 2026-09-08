// spec-v1118: the shape eight waves kept arriving at, asked of the whole catalog.
//
// spec-v1105 (`snakebite-severity`), spec-v1108 (`ces-d`), spec-v1110 (the three
// psychiatric scales), spec-v1112 (`mdq`), spec-v1115 (five more) and
// spec-v1117 (`timi-stemi`) were all the same two facts holding at once:
//
//   1. The tile renders a `<select>` whose FIRST option is a scoring level --
//      "0", "no", "none", "never", ASA 1, very-good cytogenetics -- so the
//      control cannot say "not answered" and the page opens on an answer
//      (rule 8).
//   2. The adapter does not mark the field `required`, so an agent omitting it
//      gets the same level (rule 9).
//
// Either alone is survivable. Together they mean the tile has a scoring input
// that NOBODY -- reader or agent -- can leave unanswered, and whose unanswered
// state is silently the most favourable one.
//
// This finds that pair. It is a PRIORITISER, not a defect list: a select whose
// first option is genuinely the default state of the world is fine, and the
// billing tiles are full of them. What it removes is the hand-search that found
// the last eight waves one tile at a time.
//
// Asserts nothing; prints a report and writes the machine-readable copy.
//
//   RUN_PROBES=1 npx playwright test test/integration/scoring-select-probe.spec.js --project=chromium

import { writeFileSync } from 'node:fs';
import { test } from '@playwright/test';
import { allCalculators } from '../../mcp/catalog.js';
import { computeCalculator } from '../../mcp/tools.js';
import { META } from '../../lib/meta.js';
import { ASKING, DISCLOSING } from '../lib/asking-language.js';

test.skip(!process.env.RUN_PROBES, 'probe: run deliberately, not in CI');
test.skip(({ browserName }) => browserName !== 'chromium', 'catalog sweep is chromium-only');

// The doms worth asking about: rendered by the tile, and NOT required of an agent.
const CANDIDATES = (() => {
  const map = {};
  for (const cal of allCalculators()) {
    const doms = (cal.fields || [])
      .filter((f) => f.dom && !f.required && (f.kind === 'enum' || f.kind === 'number'))
      .map((f) => f.dom);
    if (doms.length) map[cal.id] = doms;
  }
  return map;
})();

test('which scoring selects cannot say "not answered" on either surface', async ({ page }) => {
  test.setTimeout(1_800_000);

  const ids = Object.keys(CANDIDATES);
  const rows = [];
  let selectsSeen = 0;

  for (const id of ids) {
    await page.goto(`/#${id}`);
    const found = await page.evaluate(async (doms) => {
      await new Promise((r) => setTimeout(r, 60));
      const out = [];
      for (const dom of doms) {
        const n = document.getElementById(dom);
        if (!n || n.tagName !== 'SELECT' || !n.options.length) continue;
        out.push({
          dom,
          first: String(n.options[0].value),
          firstText: String(n.options[0].text).slice(0, 40),
          hasEmpty: [...n.options].some((o) => String(o.value) === ''),
          label: (document.querySelector(`label[for="${CSS.escape(dom)}"]`)?.textContent || '').trim().slice(0, 50),
        });
      }
      return out;
    }, CANDIDATES[id]);

    for (const f of found) {
      selectsSeen += 1;
      if (f.hasEmpty) continue;
      rows.push({ id, ...f });
    }
  }

  const byTile = new Map();
  for (const r of rows) byTile.set(r.id, [...(byTile.get(r.id) || []), r]);

  writeFileSync('test-results/scoring-selects.json', JSON.stringify(rows, null, 2));
  console.log(`${selectsSeen} select(s) across ${ids.length} tiles are rendered for a field the`);
  console.log('adapter does not require. Of those:\n');
  console.log(`${rows.length} across ${byTile.size} tiles have NO empty option, so neither the`);
  console.log('reader nor an agent can leave them unanswered.\n');
  // The second signal, and the one that makes this a prioritiser rather than a
  // list of 702. Being unanswerable only matters where it CHANGES something:
  // fill each tile from its worked example, drop the field, and keep the rows
  // where the answer moved without asking or disclosing. That is the same test
  // probe-omitted-item runs, intersected with the control question above.
  const unanswerable = new Set(rows.map((r) => `${r.id}|${r.dom}`));
  const both = [];
  for (const cal of allCalculators()) {
    const ex = META[cal.id]?.example?.fields;
    if (!ex) continue;
    const full = computeCalculator({ id: cal.id, inputs: { ...ex } });
    if (full?.valid !== true) continue;
    for (const f of cal.fields || []) {
      if (!unanswerable.has(`${cal.id}|${f.dom}`)) continue;
      if (ex[f.dom] === undefined || String(ex[f.dom]).trim() === '') continue;
      const partial = { ...ex };
      delete partial[f.dom];
      const got = computeCalculator({ id: cal.id, inputs: partial });
      if (got?.valid !== true) continue;
      if (JSON.stringify(got.result) === JSON.stringify(full.result)) continue;
      const text = JSON.stringify(got.result);
      if (ASKING.test(text) || DISCLOSING.test(text)) continue;
      both.push({ id: cal.id, dom: f.dom });
    }
  }
  writeFileSync('test-results/scoring-selects-that-matter.json', JSON.stringify(both, null, 2));

  const bothTiles = [...new Set(both.map((b) => b.id))];
  console.log(`\nAND ${both.length} of those, across ${bothTiles.length} tiles, also CHANGE THE`);
  console.log('ANSWER when dropped from the tile\'s own worked example. Read these first:\n');
  for (const id of bothTiles) {
    const fs = byTile.get(id).filter((f) => both.some((b) => b.id === id && b.dom === f.dom));
    console.log(`  ${id}  (${fs.length})`);
    for (const f of fs.slice(0, 6)) {
      console.log(`      ${f.dom}  opens on "${f.firstText}"  ${f.label ? `[${f.label}]` : ''}`);
    }
  }

  console.log('\nThe rest, unanswerable but not shown to move anything by the worked example:');
  console.log(`  ${[...byTile.keys()].filter((id) => !bothTiles.includes(id)).length} tiles.`);
  console.log('  A worked example is written alarming (spec-v1092), so silence here is weak');
  console.log('  evidence -- the defect lives on the reassuring side the example never reaches.');
});
