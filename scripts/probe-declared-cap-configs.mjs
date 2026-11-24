#!/usr/bin/env node
// spec-v1777: a declared bound the library enforces at the worked example and nowhere else.
//
// `mcp/fields.js` refuses a value outside a field's declared `min`/`max` before the library runs, and the
// browser page calls the library directly. So a declaration the library does not enforce is a divergence:
// the agent is refused what the reader on the page is answered. spec-v1744's probe-adapter-only-bounds asks
// for exactly that -- but it asks ONCE, from the tool's worked example, with every other input left where
// the example put it.
//
// A cap written inside one branch of a library is invisible to a single configuration. The chemotherapy
// dose check bounds the weight it needs for a body-surface-area dose and never looks at it when the basis
// is a carboplatin AUC target. The medicare-refund check bounds the quantity dispensed and never reaches
// that line for a drug with no negotiated price yet. Both answer, on the page, at a weight or a quantity a
// declaration would have refused.
//
// This asks the same question across CONFIGURATIONS: each other number field at half and twice its example
// value, and each enum field at every option it lists. In every configuration the worked example still
// computes in, the library is called 5% past each declared edge. A row is a configuration where it ANSWERS
// there -- not where it refuses for some other reason, which leaves page and agent agreeing that there is
// no answer.
//
// Read each row before narrowing or dropping the declaration. A tool is entitled to ignore an input on a
// branch that does not use it, and the question each row raises is which of the two is true: that the
// declaration is too tight for the branches that ignore the field, or that the branch ignoring it should
// not be answering from a value that far out at all.
//
// Asserts nothing; prints a report.
//
//   node scripts/probe-declared-cap-configs.mjs
//   TOOLS=chemo-dose-verify,abg node scripts/probe-declared-cap-configs.mjs

import { META } from '../lib/meta.js';
import { REGISTRY } from '../mcp/catalog.js';

const ONLY = process.env.TOOLS ? new Set(process.env.TOOLS.split(',')) : null;

const answers = (e, inputs) => {
  let r;
  try { r = e.compute(e.toArgs(inputs)); } catch { return false; }
  return r != null && r.valid !== false;
};

let fields = 0;
let configurations = 0;
const rows = [];
for (const [id, e] of REGISTRY) {
  if (ONLY && !ONLY.has(id)) continue;
  const ex = META[id]?.example?.fields;
  if (!ex || !e.fields) continue;
  if (!answers(e, { ...ex })) continue;
  const nums = e.fields.filter((f) => f.kind === 'number' && !Array.isArray(f.values));
  const enums = e.fields.filter((f) => f.kind === 'enum' && Array.isArray(f.values));
  for (const f of nums) {
    const hasMax = Number.isFinite(f.max);
    const hasMin = Number.isFinite(f.min) && f.min > 0;
    if (!hasMax && !hasMin) continue;
    fields += 1;
    const configs = [['the example', { ...ex }]];
    for (const o of nums) {
      if (o === f) continue;
      const v = Number(ex[o.dom]);
      if (!Number.isFinite(v) || v === 0) continue;
      configs.push([`${o.dom}=${v * 0.5}`, { ...ex, [o.dom]: String(v * 0.5) }],
        [`${o.dom}=${v * 2}`, { ...ex, [o.dom]: String(v * 2) }]);
    }
    for (const o of enums) for (const v of o.values) configs.push([`${o.dom}=${v}`, { ...ex, [o.dom]: String(v) }]);
    const probes = [];
    // 5% past the edge, and never only a rounding away from it: a library whose own limit is the same
    // number must still refuse this.
    if (hasMax) probes.push(['max', f.max, f.max * 1.05 + 1e-6]);
    if (hasMin) probes.push(['min', f.min, f.min * 0.95]);
    for (const [label, cfg] of configs) {
      if (!answers(e, cfg)) continue; // the configuration itself is refused; it proves nothing
      configurations += 1;
      for (const [side, declared, v] of probes) {
        if (!answers(e, { ...cfg, [f.dom]: String(v) })) continue;
        rows.push(`${id}\t${f.dom}\t${side}=${declared}\tanswers at ${Number(v.toPrecision(8))}\twhen ${label}`);
      }
    }
  }
}

for (const r of rows) console.log(r);
const distinct = new Set(rows.map((r) => r.split('\t').slice(0, 2).join(' '))).size;
console.error(`${rows.length} configuration(s) where the library answers past a declared bound, across ${distinct} field(s).\n`
  + `Reach: ${fields} field(s) with a declared bound, driven in ${configurations} configuration(s) their worked example still computes in.`);
