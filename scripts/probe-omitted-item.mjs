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

// Every string in the result -- the band, the detail, the per-item labels --
// because a disclosure can live in any of them.
//
// `note` is skipped deliberately. It is the tile's STATIC explanatory prose --
// the same sentences on every call, hoisted from a module constant -- and
// concatenating it into the reading silences the gate on a coincidence:
// `four-ts-hit`'s note says "where key information is missing the Society
// advises erring towards a higher score", and the word `missing` alone matched
// ASKING, so the tile was excused for prose that has nothing to do with this
// call. A disclosure has to be in what the tile SAID ABOUT THESE INPUTS.
function texts(v, out = [], top = true) {
  if (typeof v === 'string') out.push(v);
  else if (Array.isArray(v)) v.forEach((x) => texts(x, out, false));
  else if (v && typeof v === 'object') {
    for (const [k, x] of Object.entries(v)) {
      if (top && k === 'note') continue;
      texts(x, out, false);
    }
  }
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
    // spec-v1108: the same widening spec-v1102 made to
    // probe-omitted-field-decides.mjs, which this probe's sibling had and this
    // one did not -- the fourth thing in this repo found narrowed to `number`
    // after being written that way (spec-v1102, spec-v1106, and the gate there).
    //
    // Booleans stay out on purpose: rule 4 says an unticked checkbox is a real
    // "no". ENUMS are different -- a select always carries a value so the
    // browser never sends a blank one, but an API caller omits keys by default,
    // which is the surface split spec-v1073 is about. `euroscore2` was found by
    // HAND in spec-v1107 while this probe reported it clean, because all six of
    // its graded factors are enums.
    if (f.kind !== 'number' && f.kind !== 'enum') continue;
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
// spec-v1108: a finder's reach is part of its result (spec-v1099).
const seen = { number: 0, enum: 0, bool: 0, other: 0 };
for (const tool of allCalculators()) {
  if (only && tool.id !== only) continue;
  for (const f of tool.fields || []) seen[f.kind in seen ? f.kind : 'other'] += 1;
}
console.log(`Reach: ${seen.number} number and ${seen.enum} enum fields are dropped one at a time.`);
console.log(`${seen.bool} booleans are excluded (an unticked box is a real "no"), and ${seen.other} others.\n`);
for (const r of rows) {
  console.log(`  ${r.id}|${r.field}  (${r.label})`);
  if (r.changed) console.log(`      moved: ${r.changed}`);
  console.log(`      -> ${r.after}`);
}
