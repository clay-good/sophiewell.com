#!/usr/bin/env node
// spec-v1740: a negative that cannot be negative, read as zero.
//
// spec-v1728's sign-flip sweep drove OPTIONAL fields only. This drives every number field with a positive
// worked example: enter the same magnitude with a minus sign and keep the field when the answer is
// byte-identical to entering 0. That is a silent clamp (Math.max(0, x), clamp(), `> 0 ? x : 0`, or a band
// chain whose lowest band catches it), and most of them land in the reassuring band -- LACE "low risk" from a
// length of stay of -3, DKA "criteria not met" from a ketone of -6. Fields whose value changes nothing at
// all are another finder's job (probe-impossible-changes-nothing) and are skipped.
//
// A row is a suspect. Some quantities are signed by definition and stay accepted: POP-Q points (Ba runs
// from -3), Z scores, base excess, Bishop station.
//
// Asserts nothing; prints a report.
//
//   node scripts/probe-negative-as-zero.mjs
//   TOOLS=lace,nutric node scripts/probe-negative-as-zero.mjs

import { META } from '../lib/meta.js';
import { computeCalculator } from '../mcp/tools.js';
import { allCalculators } from '../mcp/catalog.js';

const raw = (r) => JSON.stringify(r.result ?? r);
const ONLY = process.env.TOOLS ? new Set(process.env.TOOLS.split(',')) : null;
let rows = 0;
for (const t of allCalculators()) {
  if (ONLY && !ONLY.has(t.id)) continue;
  const ex = META[t.id]?.example?.fields;
  if (!ex) continue;
  const base = computeCalculator({ id: t.id, inputs: { ...ex } });
  if (base.valid === false) continue;
  for (const f of (t.fields || [])) {
    if (f.kind !== 'number' || Array.isArray(f.values)) continue;
    const x = Number(ex[f.dom]);
    if (ex[f.dom] === '' || !Number.isFinite(x) || x <= 0) continue;
    const neg = computeCalculator({ id: t.id, inputs: { ...ex, [f.dom]: String(-x) } });
    if (neg.valid === false) continue;
    const zero = computeCalculator({ id: t.id, inputs: { ...ex, [f.dom]: '0' } });
    if (zero.valid === false) continue;
    if (raw(neg) !== raw(zero)) continue; // -x does not answer exactly like 0
    if (raw(neg) === raw(base)) continue; // the field changed nothing at all
    rows++;
    const o = neg.result || {};
    console.log(`${t.id}\t${f.arg}\t${x}\t${String(f.label || '').slice(0, 40)}\t${String(o.bandLabel || o.band || o.verdict || '').slice(0, 80)}`);
  }
}
console.error(`${rows} field(s) answer a negative exactly as they answer 0.`);
