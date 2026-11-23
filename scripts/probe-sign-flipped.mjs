#!/usr/bin/env node
// spec-v1728: a value entered with the wrong sign, read as something it is not.
//
// spec-v1724 found two answers decided by a sign: Amsler-Krumeich dropped a
// myopia written -9 D as "not entered" and understaged severe keratoconus, and
// the sweep that found it was a one-off command. This is that sweep, kept, with
// a second question added.
//
// For each number field whose worked example is positive, set it to the same
// magnitude with a minus sign, on the page's path (`compute(toArgs(...))`):
//
//   READ AS BLANK  -- an OPTIONAL field whose negative answers exactly like the
//     field left blank (and blank differs from the example). The value was
//     dropped as "not entered".
//   READ AS ITS ABSOLUTE VALUE -- the negative answers exactly like the positive,
//     at the example AND at a second magnitude that moves the answer (one that
//     only matches at the example is a band coincidence, not a dropped sign).
//     The sign was thrown away without a word (a silent Math.abs), which is right
//     for a field that means a magnitude and wrong for one where the sign is the
//     finding (a base deficit, a negative strain, a fall in FVC).
//
// A row is a suspect. Many negatives are nonsense (a negative weight), and the
// page's spec-v1009 range warning already flags those when the input declares a
// min; a row matters when the sign is plausible and the answer hides it.
//
// Asserts nothing; prints a report.
//
//   node scripts/probe-sign-flipped.mjs
//   node scripts/probe-sign-flipped.mjs --id amsler-krumeich

import { META } from '../lib/meta.js';
import { REGISTRY } from '../mcp/catalog.js';

const i = process.argv.indexOf('--id');
const onlyId = i > -1 ? process.argv[i + 1] : null;

const run = (e, inputs) => {
  try {
    const raw = e.compute(e.toArgs(inputs));
    if (raw == null || raw.valid === false) return null;
    return JSON.stringify(raw);
  } catch { return null; }
};

const asBlank = []; const asAbs = [];
let fields = 0;
for (const [id, e] of REGISTRY) {
  if (onlyId && id !== onlyId) continue;
  const ex = META[id] && META[id].example && META[id].example.fields;
  if (!ex) continue;
  const base = run(e, ex);
  if (base === null) continue;
  for (const f of e.fields || []) {
    if (f.kind !== 'number' || Array.isArray(f.values)) continue;
    let x = Number(String(ex[f.dom] ?? '').trim());
    let here = ex;
    let filledFromBlank = false;
    if (String(ex[f.dom] ?? '').trim() === '') {
      // spec-v1761: a field the worked example leaves blank was never asked. Fill it with a positive value the tool
      // answers from and that moves the answer (adapter midpoint, else 1, 10 or 50); the blank example is then
      // exactly the "left blank" answer to compare with.
      const mid = Number.isFinite(f.min) && Number.isFinite(f.max) ? (f.min + f.max) / 2 : null;
      x = [mid, 1, 10, 50].find((v) => { if (v === null || !(v > 0)) return false; const r = run(e, { ...ex, [f.dom]: String(v) }); return r !== null && r !== base; });
      if (x === undefined) continue;
      here = { ...ex, [f.dom]: String(x) };
      filledFromBlank = true;
    }
    if (!(x > 0)) continue;
    fields += 1;
    const baseHere = filledFromBlank ? run(e, here) : base;
    const neg = run(e, { ...ex, [f.dom]: String(-x) });
    if (neg === null) continue;                                  // refused: fine
    const row = { id, dom: f.dom, x, label: f.label };
    if (neg === baseHere) {
      // A band coincidence looks the same at x (-x and x both in the lowest band),
      // so ask again at a magnitude that answers differently from x. A real silent
      // Math.abs mirrors there too; a band does not, because -y stays low.
      const ys = [x * 1.5, x * 2, x * 0.5, x + 1];
      const mirrored = ys.some((y) => {
        const pos = run(e, { ...ex, [f.dom]: String(y) });
        return pos !== null && pos !== baseHere && run(e, { ...ex, [f.dom]: String(-y) }) === pos;
      });
      if (mirrored) asAbs.push(row);
      continue;
    }
    if (!f.required) {
      const blank = run(e, { ...ex, [f.dom]: '' });
      if (blank !== null && blank !== baseHere && neg === blank) asBlank.push(row);
    }
  }
}

const by = (p, q) => (p.id < q.id ? -1 : p.id > q.id ? 1 : 0);
// spec-v1775: rows already judged, with the reason, so the report prints only what is not. A report that
// prints the same two rows every run is a report people learn to skip.
const JUDGED = {
  'o2-cylinder-duration:o2-flow': 'owner decision of 2026-11-17: this tool keeps reading a negative optional flow as absent (docs/spec-v1759.md)',
  'o2-cylinder-duration:o2-target': 'owner decision of 2026-11-17: this tool keeps reading a negative optional target as absent (docs/spec-v1759.md)',
};
const ALL = process.argv.includes('--all');
const judgedSeen = new Set();
const unjudged = (list) => list.filter((r) => {
  const key = `${r.id}:${r.dom}`;
  if (!JUDGED[key]) return true;
  judgedSeen.add(key);
  if (ALL) console.log(`JUDGED\t${r.id}\t${r.dom}\t${-r.x}\t${JUDGED[key]}`);
  return false;
});

const blankRows = unjudged(asBlank);
const absRows = unjudged(asAbs);
console.log(`Reach: ${fields} number fields with a positive worked-example value.\n`);
console.log(`READ AS BLANK: ${blankRows.length} optional field(s) where -x answers exactly like the field left blank.`);
for (const r of blankRows.sort(by)) console.log(`  ${r.id}  ${r.dom} = ${-r.x}  (${r.label})`);
console.log(`\nREAD AS ITS ABSOLUTE VALUE: ${absRows.length} field(s) where -x answers exactly like x.`);
for (const r of absRows.sort(by)) console.log(`  ${r.id}  ${r.dom} = ${-r.x}  (${r.label})`);
const staleLedger = Object.keys(JUDGED).filter((k) => !judgedSeen.has(k));
for (const k of staleLedger) console.log(`STALE-LEDGER\t${k}\t(judged here, but the finder no longer reaches it)`);
console.log(`\n${judgedSeen.size} row(s) judged${staleLedger.length ? `, ${staleLedger.length} ledger row(s) STALE` : ''}. --all lists them and why.`);
