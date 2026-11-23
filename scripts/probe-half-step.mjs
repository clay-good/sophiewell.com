#!/usr/bin/env node
// spec-v1755: an ordinal item or a count, scored at a half step.
//
// scripts/probe-fraction-rounded.mjs finds a whole-step field that ROUNDS a fraction. This finds the other half:
// a field that SCORES one from wherever it falls between cutoffs. It picks number fields whose label marks them as
// an ordinal item with a small range ("Mobility (1-4)") or a count ("Number of lesions"), drives each at its
// worked-example value plus 0.5 on the page's path (compute(toArgs())), and lists those that answer.
//
// A row is a suspect: 0-10 rating lines, averages (attacks per day), durations and a center's own cutoff are
// legitimately fractional. Those were left on purpose, and for two years the report printed them every run --
// 61 rows, of which 51 were known, which is how a finder teaches people to skip it. So each one is JUDGED
// below, with the reason it is fractional, and the report prints only what is NOT in that ledger. A judged
// row that stops appearing is printed too: the ledger is wrong, or the tool changed.
//
// Asserts nothing; prints a report.
//
//   node scripts/probe-half-step.mjs
//   node scripts/probe-half-step.mjs --all      # the judged rows as well, with their reasons

import { META } from '../lib/meta.js';
import { REGISTRY } from '../mcp/catalog.js';

const WHOLE = /\(\s*-?\d+\s*(?:-|\u2013|to)\s*\d+\s*\)|\bgrade\b|\bcount\b|number of|\bitems?\b|\bepisodes?\b|\bscore\b(?!.*(?:%|mg|mmol))|\bpoints?\b|\bAIS\b|\bECOG\b|\bASA\b|\bNYHA\b|stage\b|\bpregnanc|\bpara\b|\bgravid|\bdrinks?\b|\bfractures?\b|\bnodules?\b|\blesions?\b|\bvisits?\b|\badmissions\b|\bfalls\b|\bteeth\b|\bjoints?\b/i;
// Fields whose half step is a real reading, and why. spec-v1773 fixed the ten that were not; these are the
// rest, each checked against what the instrument measures.
const JUDGED = {
  'anaqeeb-aeeg:anaqeeb-upper': 'the margin of an aEEG trace in microvolts, a measurement',
  'asdas:asdas-bp': 'a rating line the instrument scores on a visual-analogue or 0-10 scale, where a half step is a real reading',
  'asdas:asdas-ms': 'a rating line the instrument scores on a visual-analogue or 0-10 scale, where a half step is a real reading',
  'asdas:asdas-pg': 'a rating line the instrument scores on a visual-analogue or 0-10 scale, where a half step is a real reading',
  'auth-runout:ar-approved': 'units or visits on an authorization: nothing is rounded or banded, and a payer unit is not an ordinal step',
  'auth-runout:ar-used': 'units or visits on an authorization: nothing is rounded or banded, and a payer unit is not an ordinal step',
  'basdai:basdai-q1': 'a rating line the instrument scores on a visual-analogue or 0-10 scale, where a half step is a real reading',
  'basdai:basdai-q2': 'a rating line the instrument scores on a visual-analogue or 0-10 scale, where a half step is a real reading',
  'basdai:basdai-q4': 'a rating line the instrument scores on a visual-analogue or 0-10 scale, where a half step is a real reading',
  'basdai:basdai-q5': 'a rating line the instrument scores on a visual-analogue or 0-10 scale, where a half step is a real reading',
  'basfi:basfi-i1': 'a rating line the instrument scores on a visual-analogue or 0-10 scale, where a half step is a real reading',
  'basfi:basfi-i10': 'a rating line the instrument scores on a visual-analogue or 0-10 scale, where a half step is a real reading',
  'basfi:basfi-i2': 'a rating line the instrument scores on a visual-analogue or 0-10 scale, where a half step is a real reading',
  'basfi:basfi-i3': 'a rating line the instrument scores on a visual-analogue or 0-10 scale, where a half step is a real reading',
  'basfi:basfi-i4': 'a rating line the instrument scores on a visual-analogue or 0-10 scale, where a half step is a real reading',
  'basfi:basfi-i5': 'a rating line the instrument scores on a visual-analogue or 0-10 scale, where a half step is a real reading',
  'basfi:basfi-i6': 'a rating line the instrument scores on a visual-analogue or 0-10 scale, where a half step is a real reading',
  'basfi:basfi-i7': 'a rating line the instrument scores on a visual-analogue or 0-10 scale, where a half step is a real reading',
  'basfi:basfi-i8': 'a rating line the instrument scores on a visual-analogue or 0-10 scale, where a half step is a real reading',
  'basfi:basfi-i9': 'a rating line the instrument scores on a visual-analogue or 0-10 scale, where a half step is a real reading',
  'bologna-por:bol-afc-cut': 'the center\'s own antral follicle count cutoff, which spec-v1755 left to the center',
  'cyp2d6-phenoconversion:cpc-score': 'a CYP2D6 activity score, which CPIC defines in half steps (0.5, 1, 1.5)',
  'dapsa:dapsa-global': 'a rating line the instrument scores on a visual-analogue or 0-10 scale, where a half step is a real reading',
  'dapsa:dapsa-pain': 'a rating line the instrument scores on a visual-analogue or 0-10 scale, where a half step is a real reading',
  'das28:da-gh': 'a rating line the instrument scores on a visual-analogue or 0-10 scale, where a half step is a real reading',
  'dose-history-level:dhl-f': 'an oral bioavailability from 0 to 1, a fraction by definition',
  'elemental-iron-ingested:iron-tabs': 'a tablet count, where half a tablet is a real ingestion (spec-v1755)',
  'esspri:esp-dry': 'a rating line the instrument scores on a visual-analogue or 0-10 scale, where a half step is a real reading',
  'esspri:esp-fat': 'a rating line the instrument scores on a visual-analogue or 0-10 scale, where a half step is a real reading',
  'ghent-marfan:gm-z': 'an aortic root Z score, a measurement in standard deviations',
  'hlb-blend:hb-acid': 'a saponification or acid number, a laboratory measurement',
  'hlb-blend:hb-sap': 'a saponification or acid number, a laboratory measurement',
  'midas:mi-int': 'a rating line the instrument scores on a visual-analogue or 0-10 scale, where a half step is a real reading',
  'occupational-dose-limit-check:odl-fetus': 'a dose in millisieverts, a measurement',
  'opioid-cyp2d6-pediatric-check:ocp-score': 'a CYP2D6 activity score, which CPIC defines in half steps (0.5, 1, 1.5)',
  'rapid3:rapid3-global': 'a rating line the instrument scores on a visual-analogue or 0-10 scale, where a half step is a real reading',
  'rapid3:rapid3-pain': 'a rating line the instrument scores on a visual-analogue or 0-10 scale, where a half step is a real reading',
  'rome-ecopd:rome-vas': 'a rating line the instrument scores on a visual-analogue or 0-10 scale, where a half step is a real reading',
  'sample-size-proportion:ssp-d': 'a precision in percentage points, which the WHO manual allows at any value',
  'sample-size-two-groups:ss2-d': 'a precision in percentage points, which the WHO manual allows at any value',
  'scorad:scorad-pruritus': 'a rating line the instrument scores on a visual-analogue or 0-10 scale, where a half step is a real reading',
  'scorad:scorad-sleeplessness': 'a rating line the instrument scores on a visual-analogue or 0-10 scale, where a half step is a real reading',
  'sea-guideline:sea-wbc': 'a white cell count in 10^9/L, a measurement',
  'triss:tr-rts': 'the coded Revised Trauma Score, a weighted sum with decimals (0 to 7.8408)',
};

const ALL = process.argv.includes('--all');
const seen = new Set();

const run = (e, inputs) => { try { const r = e.compute(e.toArgs(inputs)); return r == null ? { valid: false } : r; } catch { return { valid: false }; } };
let rows = 0, n = 0;
for (const [id, e] of REGISTRY) {
  const ex = META[id]?.example?.fields; if (!ex || !e.fields) continue;
  const base = run(e, { ...ex }); if (base.valid === false) continue;
  for (const f of e.fields) {
    if (f.kind !== 'number' || !WHOLE.test(f.label || '')) continue;
    if (/%|mg|mmol|\/|kg|cm|mm|mL|hours?|minutes?|days?|weeks?|months?|years?|\bage\b|ratio|index\b|level|rate/i.test((f.label||'')+' '+(f.unit||''))) continue;
    let x = Number(ex[f.dom]);
    if (ex[f.dom] === undefined || ex[f.dom] === '') {
      // spec-v1759: a field the worked example leaves blank is filled with a whole value the tool answers from.
      x = [Number.isFinite(f.min) ? Math.ceil(f.min) + 1 : null, 1, 2, 0].find((v) => v !== null && run(e, { ...ex, [f.dom]: String(v) }).valid !== false);
      if (x === undefined) continue;
    }
    if (!Number.isInteger(x) || x > 60) continue;
    n++;
    const r = run(e, { ...ex, [f.dom]: String(x + 0.5) });
    if (r.valid === false) continue;
    const key = `${id}:${f.dom}`;
    if (JUDGED[key]) {
      seen.add(key);
      if (ALL) console.log(`JUDGED\t${id}\t${f.dom}\t${x + 0.5}\t${JUDGED[key]}`);
      continue;
    }
    rows++;
    console.log(`${id}\t${f.dom}\t${x + 0.5}\t${(f.label || '').slice(0, 50)}\t${String(r.bandLabel || r.band || r.text || '').slice(0, 60)}`);
  }
}
// A judged row that no longer appears: the ledger has to be corrected, or the tool has.
const stale = Object.keys(JUDGED).filter((k) => !seen.has(k));
for (const k of stale) console.log(`STALE-LEDGER\t${k}\t(judged fractional here, but the finder no longer reaches it)`);
console.error(`${n} field(s) driven at a half step. ${rows} suspect(s) not in the ledger, ${seen.size} judged`
  + `${stale.length ? `, ${stale.length} ledger row(s) STALE` : ''}. --all lists the judged rows and why.`);
if (rows || stale.length) console.error('Each unledgered row is a decision: fix the tool, or add it to JUDGED with the reason it is fractional.');
