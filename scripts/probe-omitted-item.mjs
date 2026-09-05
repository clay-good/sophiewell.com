#!/usr/bin/env node
// spec-v1073: what the agent surface does with an item nobody answered.
//
// The gate beside this (test/mcp/rated-items-are-required.test.js) asks the
// narrow, mechanical half of the question: does a calculator built ENTIRELY of
// rated items answer a call carrying none of them? Seventeen did, and all
// seventeen are fixed.
//
// This probe asks the wider one, which cannot be a gate because the answer needs
// judgment per field: fill a calculator from its own worked example, drop ONE
// number, and see whether the agent's answer changes without saying so. It is
// the agent-side twin of one-blank-field-probe.spec.js.
//
// A row here is a suspect, not a defect. Three things it cannot tell apart:
//
//   - a real zero. Dropping `pbac-hmb`'s large-clot count changes the tally, and
//     "no large clots" is a thing a patient reports.
//   - a dependent line that simply disappears, where nothing is computed from a
//     zero at all.
//   - a disclosure this script's vocabulary does not recognise. `modified-marshall`
//     says "assessed: renal 2", which is honest and matches nothing in DISCLOSING.
//
// Read each one against the tile. Asserts nothing; prints a report.
//
//   node scripts/probe-omitted-item.mjs
//   node scripts/probe-omitted-item.mjs --tile snakebite-severity

import { allCalculators } from '../mcp/catalog.js';
import { computeCalculator } from '../mcp/tools.js';
import { META } from '../lib/meta.js';
import { ASKING, DISCLOSING } from '../test/lib/asking-language.js';

const only = (() => {
  const i = process.argv.indexOf('--tile');
  return i > -1 ? process.argv[i + 1] : null;
})();

// Every string anywhere in the result: the band, the note, the per-item labels.
// A disclosure can live in any of them.
function texts(v, out = []) {
  if (typeof v === 'string') out.push(v);
  else if (Array.isArray(v)) v.forEach((x) => texts(x, out));
  else if (v && typeof v === 'object') Object.values(v).forEach((x) => texts(x, out));
  return out;
}

// Every number, keyed by its path, so "which numbers moved" is answerable and
// "they all went to null" -- the dependent line disappearing -- is separable
// from "a total went down".
function nums(v, path = '', out = {}) {
  if (typeof v === 'number' || v === null) out[path] = v;
  else if (Array.isArray(v)) v.forEach((x, i) => nums(x, `${path}[${i}]`, out));
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) nums(x, `${path}.${k}`, out);
  return out;
}

const rows = [];
for (const tool of allCalculators()) {
  if (only && tool.id !== only) continue;
  const ex = META[tool.id]?.example?.fields;
  if (!ex) continue;
  const full = computeCalculator({ id: tool.id, inputs: { ...ex } });
  if (full?.valid !== true) continue;

  for (const f of tool.fields || []) {
    if (f.kind !== 'number') continue;
    const v = ex[f.dom];
    if (v === undefined || String(v).trim() === '') continue;
    const partial = { ...ex };
    delete partial[f.dom];
    const got = computeCalculator({ id: tool.id, inputs: partial });
    if (got?.valid !== true) continue;                     // refused: correct
    if (JSON.stringify(got.result) === JSON.stringify(full.result)) continue;  // did not matter

    const after = texts(got.result).join(' ');
    if (ASKING.test(after) || DISCLOSING.test(after)) continue;  // said so

    const a = nums(full.result);
    const b = nums(got.result);
    const changed = Object.keys(b).filter((k) => k in a && a[k] !== b[k]);
    if (changed.length && changed.every((k) => b[k] === null)) continue;  // line dropped

    rows.push({
      id: tool.id,
      field: f.dom,
      label: String(f.label || '').slice(0, 50),
      changed: changed.slice(0, 4).join(', '),
      after: after.slice(0, 140),
    });
  }
}

const tiles = new Set(rows.map((r) => r.id));
console.log(`${rows.length} field(s) across ${tiles.size} calculator(s) changed the agent's answer when omitted,`);
console.log('without asking for the value or saying it was missing.\n');
for (const r of rows) {
  console.log(`  ${r.id}|${r.field}  (${r.label})`);
  if (r.changed) console.log(`      moved: ${r.changed}`);
  console.log(`      -> ${r.after}`);
}
