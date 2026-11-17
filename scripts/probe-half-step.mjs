#!/usr/bin/env node
// spec-v1755: an ordinal item or a count, scored at a half step.
//
// scripts/probe-fraction-rounded.mjs finds a whole-step field that ROUNDS a fraction. This finds the other half:
// a field that SCORES one from wherever it falls between cutoffs. It picks number fields whose label marks them as
// an ordinal item with a small range ("Mobility (1-4)") or a count ("Number of lesions"), drives each at its
// worked-example value plus 0.5 on the page's path (compute(toArgs())), and lists those that answer.
//
// A row is a suspect: 0-10 rating lines, averages (attacks per day), durations and a center's own cutoff are
// legitimately fractional (docs/spec-v1755.md lists the ones left on purpose).
//
// Asserts nothing; prints a report.
//
//   node scripts/probe-half-step.mjs

import { META } from '../lib/meta.js';
import { REGISTRY } from '../mcp/catalog.js';

const WHOLE = /\(\s*-?\d+\s*(?:-|\u2013|to)\s*\d+\s*\)|\bgrade\b|\bcount\b|number of|\bitems?\b|\bepisodes?\b|\bscore\b(?!.*(?:%|mg|mmol))|\bpoints?\b|\bAIS\b|\bECOG\b|\bASA\b|\bNYHA\b|stage\b|\bpregnanc|\bpara\b|\bgravid|\bdrinks?\b|\bfractures?\b|\bnodules?\b|\blesions?\b|\bvisits?\b|\badmissions\b|\bfalls\b|\bteeth\b|\bjoints?\b/i;
const run = (e, inputs) => { try { const r = e.compute(e.toArgs(inputs)); return r == null ? { valid: false } : r; } catch { return { valid: false }; } };
let rows = 0, n = 0;
for (const [id, e] of REGISTRY) {
  const ex = META[id]?.example?.fields; if (!ex || !e.fields) continue;
  const base = run(e, { ...ex }); if (base.valid === false) continue;
  for (const f of e.fields) {
    if (f.kind !== 'number' || !WHOLE.test(f.label || '')) continue;
    if (/%|mg|mmol|\/|kg|cm|mm|mL|hours?|minutes?|days?|weeks?|months?|years?|\bage\b|ratio|index\b|level|rate/i.test((f.label||'')+' '+(f.unit||''))) continue;
    const x = Number(ex[f.dom]); if (ex[f.dom] === '' || !Number.isInteger(x) || x > 60) continue;
    n++;
    const r = run(e, { ...ex, [f.dom]: String(x + 0.5) });
    if (r.valid === false) continue;
    rows++;
    console.log(`${id}\t${f.dom}\t${x + 0.5}\t${(f.label || '').slice(0, 50)}\t${String(r.bandLabel || r.band || r.text || '').slice(0, 60)}`);
  }
}
console.error(rows, 'of', n);
