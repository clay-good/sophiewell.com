#!/usr/bin/env node
// spec-v1722: a fractional value in a whole-number field, silently rounded.
//
// The silent-zero helper copied into some twenty-five libraries ends
//
//     if (!Number.isFinite(n) || n < 0 || n > hi) return 0;
//     return Math.round(n);
//
// spec-v1720 settled the first line. The second one means a count typed as
// 2.5 is scored as 3, and nothing on the screen says so. A number input with no
// `step` marks 2.5 invalid and passes it on anyway, so the page reaches the
// library with it.
//
// Oracle, on the library path (`compute(toArgs(...))`, the page's path): take a
// whole-number example value x where x and x+1 give different answers. If
// x+0.49 answers exactly like x and x+0.51 answers exactly like x+1, the library
// rounded the fraction away. (A continuous input whose ANSWER is rounded flips
// wherever its slope puts the next half-unit, almost never at exactly x+0.5.) A field that measures something continuous with a
// cutoff at x+0.5 would match too, so a row is a suspect to read, not a defect.
//
// WHAT IT FOUND, first run (spec-v1722). 151 fields across 69 calculators. On the
// page 16 are sliders (they cannot hold 1.49) and 135 are typed boxes. 81 of those,
// ordinal items and clinical counts in 23 scores, now refuse a fraction through
// `gradeFault`'s fifth element / `wholeFault`. The 70 rows it still prints are the
// sliders, continuous measurements whose answer is rounded with a slope of 1 (each
// checked at its cutoff and correct), and billing/administration counts left for
// an owner decision (docs/spec-v1722.md).
//
// Asserts nothing; prints a report.
//
//   node scripts/probe-fraction-rounded.mjs
//   node scripts/probe-fraction-rounded.mjs --id rivermead-mobility-index
//   node scripts/probe-fraction-rounded.mjs --json > /tmp/fr.json   (rows for the page probe:
//   FR_ROWS=/tmp/fr.json RUN_PROBES=1 npx playwright test test/integration/fraction-rounded-probe.spec.js --project=chromium)

import { META } from '../lib/meta.js';
import { REGISTRY } from '../mcp/catalog.js';

const i = process.argv.indexOf('--id');
const onlyId = i > -1 ? process.argv[i + 1] : null;

const run = (e, inputs) => {
  try {
    const raw = e.compute(e.toArgs(inputs));
    if (raw == null || raw.valid === false) return null;
    // The RAW result, not the formatted one: a continuous input whose answer
    // is rounded for display would otherwise look rounded on the way in.
    return JSON.stringify(raw);
  } catch { return null; }
};

// spec-v1817: the rows that have been READ, with the reason each one is right.
//
// spec-v1722 split this report into three groups and fixed one: 81 ordinal items and clinical counts now
// refuse a fraction through `gradeFault`'s fifth element or `wholeFault`. What it left was described
// rather than written down -- "sliders, continuous measurements whose answer is rounded with a slope of 1,
// and billing counts left for an owner decision" -- so the 24 rows that have come and gone since nobody
// read. These 46 are read, and they fall into three kinds:
//
//   PRINTED FIGURE ONLY. The verdict at x+0.49 and at x+0.51 is the same word; what moved is a figure
//   printed to a fixed precision, and with a slope of about 1 in this input it lands on its display
//   boundary half a unit in. 33 rows, and nothing is decided by the rounding. Measured, not assumed: the
//   two readings were compared on bandLabel, bandKey, stage, severity, grade, tier, risk, category,
//   verdict and class before this group was written.
//
//   THE PRINTED FIGURE DECIDES A BAND WHOSE PUBLISHED EDGES ARE AT THAT PRECISION. `abi` reports the index
//   to two decimals and bands it on the AHA's own two-decimal ranges -- 0.41-0.90 is
//   mild-to-moderate, 0.91-0.99 is borderline -- which have no gap between adjacent displayed values, so
//   banding the printed figure IS the published rule. 11 rows.
//
//   A WHOLE-YEAR AGE SUMMED INTO AN INTEGER SCORE. The Baux score is age + percent burn and is published
//   as an integer, so an age entered with a fraction has to round for the score to exist at all. 2 rows.
const AGE_SUM = 'The score is age + percent burn and is published as an INTEGER, so an age entered with a '
  + 'fraction has to round for the score to exist. A whole-year age is the convention the score is built on';
const PRINTED = 'Only a printed figure moves: the verdict at x+0.49 and at x+0.51 is the same word '
  + '(compared on bandLabel, bandKey, stage, severity, grade, tier, risk, category, verdict and class). '
  + 'A figure printed to a fixed precision, with a slope of about 1 in this input, lands on its display '
  + 'boundary half a unit in, and nothing is decided by the rounding';
const EDGES = 'The printed figure decides a band whose published edges are at that same precision, with no '
  + 'gap between adjacent displayed values -- so banding the printed figure is the published rule, not a '
  + 'rounding that changed an answer';
const JUDGED = {
  'abi|abi-ra': EDGES,
  'abi|abi-la': PRINTED,
  'action-icu-score|aic-hr': PRINTED,
  'action-icu-score|aic-sbp': PRINTED,
  'ada-diabetes-risk-test|ada-age': PRINTED,
  'adjusted-patient-days|apd-inpatient': PRINTED,
  'adjusted-patient-days|apd-outpatient': PRINTED,
  'adjusted-patient-days|apd-hours': PRINTED,
  'adjusted-patient-days|apd-drugs': PRINTED,
  'astral-score|ast-age': PRINTED,
  'auth-runout|ar-lead': EDGES,
  'barnhart-hcg|bh-rep': EDGES,
  'baux-score|bx-age': AGE_SUM,
  'brazil-spider-antivenom|bsp-weight': PRINTED,
  'caap-af-score|caap-age': PRINTED,
  'calosha-wildfire-smoke|ws-aqi': PRINTED,
  'carb-insulin-bolus|ci-carbs': EDGES,
  'dose-calendar|dc-win': PRINTED,
  'ecmo-titration|ec-pco': PRINTED,
  'fractional-excretion-potassium|fek-ucr': EDGES,
  'grim-score|grim-alb': EDGES,
  'hodgkin-ips|hips-hgb': EDGES,
  'hscore-hlh|hs-fib': EDGES,
  'igcccg|igcccg-ldh': PRINTED,
  'inventory-turns|inv-cogs': PRINTED,
  'iron-ganzoni|stores': PRINTED,
  'mcmahon-rhabdo|mcm-ca': PRINTED,
  'mdacc-cll-index|mdacc-age': PRINTED,
  'ng-tube-length|ng-nex': PRINTED,
  'norepi-equiv|nee-dopa': PRINTED,
  'nsofa|nso-spo2': PRINTED,
  'nursing-home-staffing-check|nh-total': PRINTED,
  'nursing-home-staffing-check|nh-aide': PRINTED,
  'nursing-home-staffing-check|nh-licensed': PRINTED,
  'plan-score|plan-age': PRINTED,
  'qtc|qt': PRINTED,
  'rabt-score|ra-hr': PRINTED,
  'resp-acidosis-compensation|ra-paco2': EDGES,
  'revised-baux|rbx-age': AGE_SUM,
  'sbp-ascitic-fluid|sbp-pmn': PRINTED,
  'shunt-fraction|shunt-pao2a': EDGES,
  'simplified-revised-geneva|sg-hr': PRINTED,
  'sipa|sp-hr': EDGES,
  'urine-anion-gap|uag-na': PRINTED,
  'urine-anion-gap|uag-k': PRINTED,
  'urine-anion-gap|uag-cl': PRINTED,
};
const judgedSeen = new Set();

const rows = [];
let tiles = 0; let fields = 0;
for (const [id, e] of REGISTRY) {
  if (onlyId && id !== onlyId) continue;
  const ex = META[id] && META[id].example && META[id].example.fields;
  if (!ex) continue;
  if (run(e, ex) === null) continue;
  tiles += 1;
  for (const f of e.fields || []) {
    if (f.kind !== 'number' || Array.isArray(f.values)) continue;
    let x = Number(String(ex[f.dom] ?? '').trim());
    if (String(ex[f.dom] ?? '').trim() === '') {
      // spec-v1761: a field the worked example leaves blank is asked too, from a whole value the tool answers from.
      x = [Number.isFinite(f.min) ? Math.ceil(f.min) + 1 : null, 1, 2, 5, 10].find((v) => v !== null && run(e, { ...ex, [f.dom]: String(v) }) !== null);
      if (x === undefined) continue;
    }
    if (!Number.isInteger(x)) continue;
    // Step down when x+1 is outside the field's range, so a top-of-scale
    // example still gets asked.
    const lo = Number.isFinite(f.max) && x + 1 > f.max ? x - 1 : x;
    const at = (v) => run(e, { ...ex, [f.dom]: String(v) });
    const a = at(lo); const b = at(lo + 1);
    if (a === null || b === null || a === b) continue;
    fields += 1;
    if (at(lo + 0.49) === a && at(lo + 0.51) === b) rows.push({ id, dom: f.dom, label: f.label, x: lo });
  }
}

rows.sort((p, q) => (p.id < q.id ? -1 : p.id > q.id ? 1 : 0));
if (process.argv.includes('--json')) { console.log(JSON.stringify(rows)); process.exit(0); }

const unjudged = rows.filter((r) => {
  const key = `${r.id}|${r.dom}`;
  if (!JUDGED[key]) return true;
  judgedSeen.add(key);
  if (process.argv.includes('--all')) console.log(`JUDGED\t${key}\t${JUDGED[key]}`);
  return false;
});
const stale = Object.keys(JUDGED).filter((k) => !judgedSeen.has(k));
if (stale.length) {
  console.log(`STALE-LEDGER: ${stale.length} judged row(s) this run no longer reaches: ${stale.join(', ')}.`);
  console.log('A reason cannot outlive what it describes -- re-read the field and remove the row.');
}
rows.length = 0;
rows.push(...unjudged);
console.log(`${rows.length} field(s) across ${new Set(rows.map((r) => r.id)).size} calculator(s) round a fraction to the nearest whole number without saying so.`);
console.log(`Reach: ${tiles} calculators with a working example, ${fields} whole-number fields where one step changes the answer.\n`);
for (const r of rows) console.log(`  ${r.id}  ${r.dom}: ${r.x + 0.49} -> ${r.x}, ${r.x + 0.51} -> ${r.x + 1}  (${r.label})`);
