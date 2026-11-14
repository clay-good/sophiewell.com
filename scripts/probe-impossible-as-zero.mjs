#!/usr/bin/env node
// spec-v1720: an impossible value scored as ZERO, on the path the page takes.
//
// `bess-balance-error` read 11 errors on a stance as none: its helper was
//
//     if (!Number.isFinite(n) || n < 0 || n > hi) return 0;
//
// and the same helper, under one name or another, is copied into some
// twenty-five libraries. `probe-impossible-reads-as-absent` exists for exactly
// this shape and missed it, twice over:
//
//   1. Its oracle compares an impossible value with OMITTING the field, and it
//      skips any field whose omission is refused -- which is every REQUIRED
//      field. All six BESS stances are required.
//   2. It asks through the agent layer, which enforces an adapter's declared
//      min and max before the library sees anything. The page does not: a
//      number input's `max` marks a typed 11 invalid and passes it on. So a
//      tile whose adapter is fenced can still score an 11 as 0 in the browser.
//
// This asks the question on the library path (`compute(toArgs(...))`, the
// adapter's validator skipped), with the other oracle: does an impossible value
// give EXACTLY the answer the field set to 0 gives, while 0 and the worked
// example give different answers? Then the value nobody could have entered was
// silently replaced by the one that scores nothing.
//
// A row is a suspect. A view can refuse before the library runs (a select
// cannot carry 999999; some views check ranges themselves), so each row is
// confirmed on the page before it is fixed.
//
// WHAT IT FOUND, first run (spec-v1720). 205 fields across 81 calculators on the
// library path. `test/integration/impossible-as-zero-probe.spec.js` drove every
// one on the page: 185 never reach the library with the value (the view refuses
// first), and 20 do. Of those 20, two are the BESS defect again --
// `rivermead-mobility-index` read a count of 16 as RMI 0 of 15, and `ihs4` read
// a lesion count above 500 as none -- and both are refused by name now. The other
// 18 read like 0 because the instrument puts them in the same band as 0: ICHD-3's
// duration windows (181 min, 73 h), du Bois's under-5% FVC band, FGSI's
// symmetric extremes, Phoenix's GCS cut at 10, SNAPPE-II's ratio bands, and
// TI-RADS, which says "Enter the nodule maximum diameter" above 20 cm. The
// 201 rows the probe still prints are those 185 and those 16 fields.
//
// Asserts nothing; prints a report.
//
//   node scripts/probe-impossible-as-zero.mjs
//   node scripts/probe-impossible-as-zero.mjs --id bess-balance-error

import { META } from '../lib/meta.js';
import { REGISTRY } from '../mcp/catalog.js';

const i = process.argv.indexOf('--id');
const onlyId = i > -1 ? process.argv[i + 1] : null;
const IMPOSSIBLE = ['999999', '-999999'];

const run = (e, inputs) => {
  try {
    const raw = e.compute(e.toArgs(inputs));
    if (raw == null || raw.valid === false) return null;
    return JSON.stringify(e.formatResult(raw));
  } catch { return null; }
};

const rows = [];
let tiles = 0; let fields = 0;
for (const [id, e] of REGISTRY) {
  if (onlyId && id !== onlyId) continue;
  const ex = META[id] && META[id].example && META[id].example.fields;
  if (!ex) continue;
  const base = run(e, ex);
  if (base === null) continue;
  tiles += 1;
  for (const f of e.fields || []) {
    if (f.kind !== 'number' || Array.isArray(f.values)) continue;
    if (!Object.prototype.hasOwnProperty.call(ex, f.dom)) continue;
    const exVal = String(ex[f.dom]).trim();
    if (exVal === '' || Number(exVal) === 0) continue;
    const zero = run(e, { ...ex, [f.dom]: '0' });
    if (zero === null || zero === base) continue;   // 0 refused, or 0 changes nothing: no signal
    fields += 1;
    for (const bad of IMPOSSIBLE) {
      const r = run(e, { ...ex, [f.dom]: bad });
      if (r === null) continue;                      // refused: correct
      if (r !== zero) continue;                      // used it, or did something else
      rows.push({ id, dom: f.dom, label: f.label, bad, required: !!f.required, fencedForAgents: Number.isFinite(f.max) || Number.isFinite(f.min) });
      break;
    }
  }
}

rows.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
console.log(`${rows.length} field(s) across ${new Set(rows.map((r) => r.id)).size} calculator(s) score an impossible value exactly as 0, on the library path.`);
console.log(`Reach: ${tiles} calculators with a working example, ${fields} numeric fields where 0 changes the answer.`);
console.log('"agents fenced" means the adapter declares a range, so only the page reaches the library with it.\n');
for (const r of rows) {
  console.log(`  ${r.id}  ${r.dom} = ${r.bad}  (${r.label})${r.required ? '  required' : ''}${r.fencedForAgents ? '  agents fenced' : ''}`);
}
