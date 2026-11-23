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
// A row is a suspect. Some quantities are signed by definition and stay accepted (POP-Q points -- Ba runs
// from -3 -- Z scores, base excess, Bishop station), and two of the rows this finder prints are false
// positives of its own method: a field where 0 is refused TOO answers a negative the same way, by the same
// range message. Each of those is JUDGED below with its reason, and the report prints only what is not in
// that ledger, so a new row is a decision someone takes rather than a line in a report that already prints
// five known ones (spec-v1775 did this for the half-step and unit-equivalence finders).
//
// Asserts nothing; prints a report.
//
//   node scripts/probe-negative-as-zero.mjs
//   node scripts/probe-negative-as-zero.mjs --all   # the judged rows as well, with their reasons
//   TOOLS=lace,nutric node scripts/probe-negative-as-zero.mjs

import { META } from '../lib/meta.js';
import { computeCalculator } from '../mcp/tools.js';
import { allCalculators } from '../mcp/catalog.js';

// Fields whose negative is not a silent clamp, and why (docs/spec-v1740.md, docs/spec-v1759.md).
const JUDGED = {
  'popq-staging:ba': 'a POP-Q point is signed by definition: Ba runs from -3, and -3 is a real measurement',
  'ghent-marfan:aorticZScore': 'an aortic root Z score is signed by definition, in standard deviations either side of the mean',
  'o2-cylinder-duration:targetMinutes': 'owner decision of 2026-11-17: this tool keeps reading an optional target as absent (docs/spec-v1759.md)',
  'naloxone:bolusMg': 'a false positive of the method: 0 is refused here too, so -1 gets the same range message as 0 (docs/spec-v1759.md)',
  'methemoglobin:weight': 'a false positive of the method: 0 is refused here too, so -1 gets the same range message as 0 (docs/spec-v1759.md)',
};
const ALL = process.argv.includes('--all');
const judgedSeen = new Set();

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
    let x = Number(ex[f.dom]);
    let here = base;
    if (ex[f.dom] === undefined || ex[f.dom] === '') {
      // spec-v1759: a field the worked example leaves blank was never driven. Fill it with a positive value the tool
      // answers from (the adapter's midpoint, else 1, 10 or 50) and ask the same question; 14 fields answered.
      const mid = Number.isFinite(f.min) && Number.isFinite(f.max) ? (f.min + f.max) / 2 : null;
      x = [mid, 1, 10, 50].find((v) => v !== null && v > 0 && computeCalculator({ id: t.id, inputs: { ...ex, [f.dom]: String(v) } }).valid !== false);
      if (x === undefined) continue;
      here = computeCalculator({ id: t.id, inputs: { ...ex, [f.dom]: String(x) } });
    }
    if (!Number.isFinite(x) || x <= 0) continue;
    const neg = computeCalculator({ id: t.id, inputs: { ...ex, [f.dom]: String(-x) } });
    if (neg.valid === false) continue;
    const zero = computeCalculator({ id: t.id, inputs: { ...ex, [f.dom]: '0' } });
    if (zero.valid === false) continue;
    if (raw(neg) !== raw(zero)) continue; // -x does not answer exactly like 0
    if (raw(neg) === raw(here)) continue; // the field changed nothing at all
    const key = `${t.id}:${f.arg}`;
    if (JUDGED[key]) {
      judgedSeen.add(key);
      if (ALL) console.log(`JUDGED\t${t.id}\t${f.arg}\t${x}\t${JUDGED[key]}`);
      continue;
    }
    rows++;
    const o = neg.result || {};
    console.log(`${t.id}\t${f.arg}\t${x}\t${String(f.label || '').slice(0, 40)}\t${String(o.bandLabel || o.band || o.verdict || '').slice(0, 80)}`);
  }
}
const staleLedger = Object.keys(JUDGED).filter((k) => !judgedSeen.has(k));
for (const k of staleLedger) console.log(`STALE-LEDGER\t${k}\t(judged here, but the finder no longer reaches it)`);
console.error(`${rows} field(s) answer a negative exactly as they answer 0 and are not in the ledger, ${judgedSeen.size} judged`
  + `${staleLedger.length ? `, ${staleLedger.length} ledger row(s) STALE` : ''}. --all lists the judged rows and why.`);
