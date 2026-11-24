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
import { fieldRange } from '../mcp/fields.js';

const ONLY = process.env.TOOLS ? new Set(process.env.TOOLS.split(',')) : null;
const ALL = process.argv.includes('--all');

// Rows read and judged, with their reason (docs/spec-v1780.md). The report prints only what is not here, so
// a new row is a decision someone takes rather than a line in a report that already prints a known one
// (spec-v1775's rule).
const JUDGED = {
  // The library converts a sub-1 value to months and applies the APLS 0-12 month formula, which is the
  // right answer for an infant's age typed into the years box. Closing the gap means either widening the
  // declaration and its label to 0-14, or refusing a fallback that was added on purpose -- a reader-facing
  // choice, left for the owner.
  'peds-weight-est:pw-years:min': 'the years field deliberately falls back to the APLS months formula below 1, and the label states 1-14: widening it is a reader-facing choice (docs/spec-v1780.md)',
};
const judgedSeen = new Set();

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
    // spec-v1779: the resolved range, so a bound declared by envelope name is driven like a literal.
    const declared = fieldRange(f);
    const hasMax = declared.max !== null;
    const hasMin = declared.min !== null && declared.min > 0;
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
    if (hasMax) probes.push(['max', declared.max, declared.max * 1.05 + 1e-6]);
    if (hasMin) probes.push(['min', declared.min, declared.min * 0.95]);
    for (const [label, cfg] of configs) {
      if (!answers(e, cfg)) continue; // the configuration itself is refused; it proves nothing
      configurations += 1;
      for (const [side, declared, v] of probes) {
        if (!answers(e, { ...cfg, [f.dom]: String(v) })) continue;
        const key = `${id}:${f.dom}:${side}`;
        const row = `${id}\t${f.dom}\t${side}=${declared}\tanswers at ${Number(v.toPrecision(8))}\twhen ${label}`;
        if (JUDGED[key]) {
          judgedSeen.add(key);
          if (ALL) console.log(`JUDGED\t${row}\t${JUDGED[key]}`);
          continue;
        }
        rows.push(row);
      }
    }
  }
}

for (const r of rows) console.log(r);
const distinct = new Set(rows.map((r) => r.split('\t').slice(0, 2).join(' '))).size;
const stale = Object.keys(JUDGED).filter((k) => !judgedSeen.has(k));
for (const k of stale) console.log(`STALE-LEDGER\t${k}\t(judged here, but the finder no longer reaches it)`);
console.error(`${rows.length} configuration(s) where the library answers past a declared bound, across ${distinct} field(s)`
  + `; ${judgedSeen.size} judged${stale.length ? `, ${stale.length} ledger row(s) STALE` : ''}.\n`
  + `Reach: ${fields} field(s) with a declared bound, driven in ${configurations} configuration(s) their worked `
  + `example still computes in. --all lists the judged rows and why.`);
