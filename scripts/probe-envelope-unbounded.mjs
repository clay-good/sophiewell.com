#!/usr/bin/env node
// spec-v1175: a physiologic ceiling this project already wrote down, on a field
// that does not enforce it.
//
// `lib/bounds.js` (spec-v53) is 31 plausibility envelopes, each with a source
// note, written so that "a frankly-impossible input is never shown as a silent,
// authoritative value". Its header says how it was meant to spread -- "extended
// as tiles migrate, opportunistic, not a sweep" -- and it never did:
// spec-v1174 found `fib4` ruling out advanced fibrosis from a platelet count of
// 150,000 while the correct ceiling sat in a file `fib4`'s own view imports.
//
// This asks the general form of that question. For every numeric field whose
// label and unit name a quantity the table has an envelope for, drive the value
// an order of magnitude past the ceiling and ask whether the tile still answers.
//
// THE MAPPING IS THE HARD PART, AND ITS NEGATIVE TEST IS BUILT IN. An envelope
// belongs to a quantity in a compartment: `BOUNDS.sodium` is SERUM sodium at
// 90-200 mmol/L, and a urine sodium of 20 is normal, an IV bag's sodium additive
// of 30 is normal, and an AIR temperature of -10 C is a Tuesday. So the probe
// checks itself against every tile's own worked example: an example that falls
// OUTSIDE the envelope the probe assigned it is a mis-mapping, not a defect, and
// is reported separately and loudly. At spec-v1175 that check found three, all
// real (wind-chill's air temperature, iv-osmolarity's two additives), and they
// are excluded below.
//
// A row is a suspect, not a defect. Some tiles are right to compute from an
// extreme -- the ceiling is a DISCLOSURE boundary (spec-v53: the advisory never
// changes the number), so what a row asks is whether the reader was told, not
// whether the tile should have refused.
//
// Asserts nothing; prints a report.
//
//   node scripts/probe-envelope-unbounded.mjs
//   node scripts/probe-envelope-unbounded.mjs --key scr

import { allCalculators } from '../mcp/catalog.js';
import { BOUNDS } from '../lib/bounds.js';
import { META } from '../lib/meta.js';
import { computeCalculator } from '../mcp/tools.js';

const onlyKey = (() => {
  const i = process.argv.indexOf('--key');
  return i > -1 ? process.argv[i + 1] : null;
})();

// A quantity in another compartment, another substance, or a derived figure is
// not the envelope's subject. Each term here was earned: the three at the front
// by the self-check below, the rest by reading the labels they exclude.
const EXCLUDE = /\bair\b|additive|ambient|outdoor|wind|room |bag |infusate|\burine|urinary|csf|cerebrospinal|dialysate|drain|ascit|pleural|stool|saliva|sweat|24-?h|fractional|excret|clearance|ratio|delta|change|target|goal|desired|corrected|expected|predicted|per kg|dose|rate|infusion/i;

// label pattern, and the unit that confirms the quantity is in the envelope's
// own unit rather than a convertible one.
const MAP = [
  ['scr', /\b(serum )?creatinine\b/i, /mg\/dL/i],
  ['sodium', /\bsodium\b|\bNa\b/i, /mmol\/L|mEq\/L/i],
  ['potassium', /\bpotassium\b|\bK\+?\b/i, /mmol\/L|mEq\/L/i],
  ['bicarbonate', /bicarbonate|HCO3/i, /mmol\/L|mEq\/L/i],
  ['albumin', /\balbumin\b/i, /g\/dL/i],
  ['bilirubin', /bilirubin/i, /mg\/dL/i],
  ['hemoglobin', /h(a)?emoglobin|\bHb\b/i, /g\/dL/i],
  ['hematocrit', /h(a)?ematocrit|\bHct\b/i, /%/],
  ['lactate', /\blactate\b/i, /mmol\/L/i],
  ['glucose', /\bglucose\b/i, /mg\/dL/i],
  ['paO2', /PaO2|arterial oxygen tension/i, /mmHg/i],
  ['paCO2', /PaCO2/i, /mmHg/i],
  ['pH', /\bpH\b/i, /^$|arterial/i],
  ['hr', /heart rate|pulse/i, /bpm|beats/i],
  ['sbp', /systolic/i, /mmHg/i],
  ['dbp', /diastolic/i, /mmHg/i],
  ['temperature', /temperature/i, /°?C\b|celsius/i],
  ['rr', /respiratory rate/i, /\/min|breaths/i],
  ['platelets', /platelet/i, /10\^?9|10⁹|10\^?3|10³|thousand/i],
  ['wbc', /white (cell|blood)|\bWBC\b|leu[ck]ocyte/i, /10\^?9|10⁹|10\^?3|10³|thousand/i],
];

function candidates() {
  const rows = [];
  for (const tool of allCalculators()) {
    for (const f of (tool.fields || [])) {
      if (f.kind !== 'number' || Array.isArray(f.values)) continue;
      const text = `${f.label || ''} ${f.unit || ''}`;
      if (EXCLUDE.test(text)) continue;
      for (const [key, labRe, unitRe] of MAP) {
        if (onlyKey && key !== onlyKey) continue;
        if (labRe.test(text) && unitRe.test(String(f.unit || ''))) {
          rows.push({
            id: tool.id, dom: f.dom, key,
            label: String(f.label || '').slice(0, 44), unit: f.unit,
            ex: META[tool.id]?.example?.fields?.[f.dom],
          });
          break;
        }
      }
    }
  }
  return rows;
}

const rows = candidates();

// --- the probe's own negative test -----------------------------------------
// A worked example is a value someone chose deliberately. If it sits outside the
// envelope this probe assigned, the ASSIGNMENT is wrong.
const misMapped = [];
const usable = [];
for (const r of rows) {
  const b = BOUNDS[r.key];
  const n = Number(r.ex);
  if (r.ex === undefined || String(r.ex).trim() === '' || !Number.isFinite(n)) continue;
  if (n < b.min || n > b.max) misMapped.push({ ...r, n, b });
  else usable.push(r);
}

if (misMapped.length) {
  console.log('MIS-MAPPED -- a worked example outside the envelope this probe assigned it.');
  console.log('Read these FIRST: each is a mapping bug in this file, not a defect in the tile.\n');
  for (const m of misMapped) {
    console.log(`  ${m.id}|${m.dom} key=${m.key} example=${m.n} envelope=[${m.b.min}, ${m.b.max}]`);
    console.log(`      label "${m.label}" unit ${m.unit}`);
  }
  console.log('');
}

// --- the question ----------------------------------------------------------
const flagged = [];
for (const r of usable) {
  const ex = META[r.id].example.fields;
  const base = computeCalculator({ id: r.id, inputs: { ...ex } });
  if (base.valid === false) continue;
  const b = BOUNDS[r.key];
  const over = b.max * 10;
  const res = computeCalculator({ id: r.id, inputs: { ...ex, [r.dom]: String(over) } });
  if (res.valid === false) continue;
  const o = res.result || {};
  const say = [o.bandLabel, o.band, o.verdict, o.interpretation, o.detail]
    .filter((x) => typeof x === 'string').join(' | ');
  const verdict = [o.bandLabel, o.verdict].find((x) => typeof x === 'string' && x.trim()) || '';
  flagged.push({ ...r, over, max: b.max, say, verdict });
}

console.log(`${flagged.length} field(s) across ${new Set(flagged.map((f) => f.id)).size} calculator(s) answer`);
console.log('from a value an order of magnitude past a ceiling lib/bounds.js already declares.\n');

// The reassuring ones first: an impossible value that produces a RULE-OUT is the
// shape this programme cares about (rule 3), and an alarm from an impossible
// value is merely wrong rather than dangerous.
//
// spec-v1075's rule applies to this classifier, and the first version of it
// walked straight into the thing that rule exists to stop: matched against the
// whole reading, `haps`'s "NOT harmless", `lactate-clearance`'s "NOT a favorable
// trend" and `hys-law`'s "other causes are NOT recorded as ruled out" all read as
// reassurance. Thirteen of twenty-four rows were the vocabulary matching a
// tile's own explanation of the opposite conclusion.
//
// So it reads the VERDICT -- bandLabel or verdict, the short field a tile puts
// its conclusion in -- and falls back to the first clause of `band` only when
// there is no verdict field. And a leading negation disqualifies the match.
// Every term is word-bounded. `normal` unbounded matches inside ABnormal, which
// put four gestational-diabetes rows reading "single abnormal value" in the
// reassuring bucket -- the raw-substring trap, in the classifier written to
// avoid a vocabulary trap.
const REASSURING = /\bruled out\b|\brules out\b|\bexcludes\b|\bno evidence\b|\bnormal\b|\bbest preserved\b|\blow risk\b|\bno indication\b|\bunlikely\b|\bremission\b|\bfavorable\b|\bharmless\b|\bno excess\b/i;
const NEGATED = /\b(not|non|no longer|does not|cannot|fails? to)\b[^.]{0,40}$/i;
function readsReassuring(f) {
  // Splitting the fallback on a bare '.' cuts "ALBI score -58.69 -> grade 1:
  // the best preserved liver function" at the DECIMAL POINT and loses the
  // verdict. A sentence break is a period followed by a space or the end.
  const verdict = f.verdict || String(f.say).split('|')[0].split(/\.(?:\s|$)/)[0];
  const m = REASSURING.exec(verdict);
  if (!m) return false;
  // "not harmless", "not a favorable trend": the word is there and the sentence
  // says the opposite.
  return !NEGATED.test(verdict.slice(0, m.index));
}
const reassuring = flagged.filter(readsReassuring);
const rest = flagged.filter((f) => !readsReassuring(f));

const line = (f) => `  ${f.id}|${f.dom} [${f.key}] ${f.ex} -> ${f.over} (ceiling ${f.max})\n      ${f.say.slice(0, 150)}`;
console.log(`REASSURING FROM AN IMPOSSIBLE VALUE -- ${reassuring.length}`);
for (const f of reassuring) console.log(line(f));
console.log(`\nTHE REST -- ${rest.length}`);
for (const f of rest) console.log(line(f));

console.log(`\nReach: ${rows.length} field(s) map to one of ${Object.keys(BOUNDS).length} envelopes;`);
console.log(`${usable.length} have a worked example inside that envelope and are testable,`);
console.log(`${misMapped.length} are mis-mapped (above), and ${rows.length - usable.length - misMapped.length} carry no usable example.`);
