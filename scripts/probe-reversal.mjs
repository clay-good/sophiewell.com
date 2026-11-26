#!/usr/bin/env node
// spec-v1718: a formula that runs BACKWARDS at one end of its own input range.
//
// `kdri-kdpi` shipped with OPTN's Table 1 transcribed exactly and the guide's
// extreme-value rule missed. The two creatinine terms sum to a slope of 0.2128 -
// 0.2199 = -0.0071 per mg/dL above 1.5, so the published formula FALLS as
// creatinine rises; the cap at 8 mg/dL is what bounds it, and without the cap it
// fell without end. The guide's own example donor read KDPI 67% at a creatinine
// of 1.7 and 54% at 20: a sicker kidney reported as a better one.
//
// That defect has a SHAPE, and the shape is findable without reading a source.
// A piecewise formula with a correction term is monotone over most of its range
// and then turns, once, and keeps going to the fence. A point-based score is
// non-monotone too -- APACHE gives points for a sodium that is high OR low -- but
// it turns in a step, often more than once, and its plateaus are flat. One clean
// turn that runs on to the edge of the range is the smell of a cap nobody read.
//
// A ROW IS A SUSPECT, NOT A DEFECT, and the false positives here are honest
// ones: plenty of clinical quantities really are U-shaped in an input. What the
// row asks is whether the SOURCE bounds that input and the tool does not.
//
// WHAT IT FOUND, first run (spec-v1718). 2,894 field sweeps, 404 of them over a
// range the tool declares; 93 rows across 37 calculators, every one read.
//
//   ONE defect: `bess-balance-error`. Its `errs()` returned 0 for any value it
//   did not like, so a rater who recorded 11 errors on a stance scored that
//   stance as if they had recorded NONE -- with the other five at 3 each, 10
//   errors read BESS 25 and 11 read BESS 15. A silent zero in the reassuring
//   direction, on a concussion measure, from a plausible typo. It had a passing
//   unit test called "caps each stance at 10" whose body asserted that 99 errors
//   score zero.
//
//   The other 36 are faithful instruments, and that is the honest false-positive
//   profile of this probe: a severity score gives points for a sodium that is
//   high OR low, so APACHE II, SAPS II, NEWS2, MEWS, REMS, LODS, OASIS, PIM3,
//   FGSI, MEOWS and psofa all turn once by design; `predicted-spirometry` peaks
//   in the early twenties because lungs do; `palbi` is quadratic in log platelets
//   because its published formula is; `adult-appendicitis-score` really does
//   score a CRP over 152 LOWER than one of 50 after 24 hours of symptoms; NNT and
//   the percent-difference tools turn where their denominator crosses zero.
//
// A SIGNATURE THAT LOOKED SHARP AND IS NOT. The defect's series returned to
// EXACTLY its starting value (15 -> 25 -> 15), which reads like a discarded
// input. Tested across the catalog, 37 rows do that and 36 are symmetric
// severity scores, where an extreme high and an extreme low are the same points
// on purpose. It is not a discriminator; it was tried and dropped.
//
// Asserts nothing; prints a report.
//
//   node scripts/probe-reversal.mjs
//   node scripts/probe-reversal.mjs --id kdri-kdpi
//   node scripts/probe-reversal.mjs --json

import { META } from '../lib/meta.js';
import { allCalculators } from '../mcp/catalog.js';
import { computeCalculator } from '../mcp/tools.js';

const arg = (name) => { const i = process.argv.indexOf(name); return i > -1 ? process.argv[i + 1] : null; };
const onlyId = arg('--id');
const asJson = process.argv.includes('--json');
const say = asJson ? ((...a) => console.error(...a)) : ((...a) => console.log(...a));

const POINTS = 33;
// How much of the sweep each leg must cover before one turn counts as a turn
// rather than a kink at the edge, and how far back the series must come.
const MIN_LEG = 0.2;
const MIN_RETRACE = 0.25;

function sweepValues(min, max) {
  const out = [];
  // Geometric where the range spans orders of magnitude, so a fence of 0.01 to
  // 40 is not sampled as thirty-three values all above 1.
  const geometric = min > 0 && max / min > 100;
  for (let i = 0; i < POINTS; i += 1) {
    const t = i / (POINTS - 1);
    out.push(geometric ? min * (max / min) ** t : min + t * (max - min));
  }
  return out;
}

// The numeric outputs a result carries, flattened one level. A string that is
// wholly a number counts: several tiles round for display and return the string.
function numbers(result) {
  const out = {};
  if (!result || typeof result !== 'object') return out;
  for (const [k, v] of Object.entries(result)) {
    if (typeof v === 'number' && Number.isFinite(v)) out[k] = v;
    else if (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v))) out[k] = Number(v);
  }
  return out;
}

// One clean turn, both legs long, and the series comes back past a quarter of
// its own swing. Plateaus do not break a leg; a second turn does.
function reversal(series) {
  const n = series.length;
  const lo = Math.min(...series); const hi = Math.max(...series);
  const swing = hi - lo;
  if (!(swing > 0)) return null;
  const eps = swing * 1e-9;
  let turns = 0; let dir = 0; let turnAt = -1;
  for (let i = 1; i < n; i += 1) {
    const d = series[i] - series[i - 1];
    if (Math.abs(d) <= eps) continue;
    const s = d > 0 ? 1 : -1;
    if (dir === 0) { dir = s; continue; }
    if (s !== dir) { turns += 1; dir = s; turnAt = i - 1; if (turns > 1) return null; }
  }
  if (turns !== 1 || turnAt < 0) return null;
  if (turnAt < MIN_LEG * n || turnAt > (1 - MIN_LEG) * n) return null;
  const peak = series[turnAt];
  const retrace = Math.abs(series[n - 1] - peak) / swing;
  if (retrace < MIN_RETRACE) return null;
  return { turnAt, peak, retrace, first: series[0], last: series[n - 1], swing };
}

// spec-v1816: the calculators that have been READ, with the reason each one turns, and the number of its
// outputs that turned when it was read.
//
// The unit is the CALCULATOR, not the output or the field, because every reason here is a property of the
// instrument: a severity score that gives points for a sodium that is high or low turns in each of its
// vital-sign fields for one reason, and nothing is learned by writing it eleven times. So the count is
// part of the judgement -- a tool whose row count MOVES prints again, because a new field turning in an
// instrument somebody has read is a new thing to read.
//
// None of these is a defect. The one defect this probe has ever found, `bess-balance-error`, is in its
// header; this is the honest false-positive profile of the method, and the gate is for the next row.
const JUDGED = {
  'apache2': { rows: 14, why: 'A symmetric severity score: it gives points for a vital sign or analyte that is too HIGH or too LOW, so every one of its measured fields turns once at the normal band and runs to both fences. Published that way, and spec-v1718 read these first' },
  'saps-ii': { rows: 4, why: 'A symmetric severity score: it gives points for a vital sign or analyte that is too HIGH or too LOW, so every one of its measured fields turns once at the normal band and runs to both fences. Published that way, and spec-v1718 read these first' },
  'news2': { rows: 3, why: 'A symmetric severity score: it gives points for a vital sign or analyte that is too HIGH or too LOW, so every one of its measured fields turns once at the normal band and runs to both fences. Published that way, and spec-v1718 read these first' },
  'mews': { rows: 3, why: 'A symmetric severity score: it gives points for a vital sign or analyte that is too HIGH or too LOW, so every one of its measured fields turns once at the normal band and runs to both fences. Published that way, and spec-v1718 read these first' },
  'rems': { rows: 3, why: 'A symmetric severity score: it gives points for a vital sign or analyte that is too HIGH or too LOW, so every one of its measured fields turns once at the normal band and runs to both fences. Published that way, and spec-v1718 read these first' },
  'lods': { rows: 4, why: 'A symmetric severity score: it gives points for a vital sign or analyte that is too HIGH or too LOW, so every one of its measured fields turns once at the normal band and runs to both fences. Published that way, and spec-v1718 read these first' },
  'oasis': { rows: 8, why: 'A symmetric severity score: it gives points for a vital sign or analyte that is too HIGH or too LOW, so every one of its measured fields turns once at the normal band and runs to both fences. Published that way, and spec-v1718 read these first' },
  'pim3': { rows: 2, why: 'A symmetric severity score: it gives points for a vital sign or analyte that is too HIGH or too LOW, so every one of its measured fields turns once at the normal band and runs to both fences. Published that way, and spec-v1718 read these first' },
  'fgsi': { rows: 6, why: 'A symmetric severity score: it gives points for a vital sign or analyte that is too HIGH or too LOW, so every one of its measured fields turns once at the normal band and runs to both fences. Published that way, and spec-v1718 read these first' },
  'meows': { rows: 4, why: 'A symmetric severity score: it gives points for a vital sign or analyte that is too HIGH or too LOW, so every one of its measured fields turns once at the normal band and runs to both fences. Published that way, and spec-v1718 read these first' },
  'psofa': { rows: 1, why: 'A symmetric severity score: it gives points for a vital sign or analyte that is too HIGH or too LOW, so every one of its measured fields turns once at the normal band and runs to both fences. Published that way, and spec-v1718 read these first' },
  'iss-rts': { rows: 1, why: 'A symmetric severity score: it gives points for a vital sign or analyte that is too HIGH or too LOW, so every one of its measured fields turns once at the normal band and runs to both fences. Published that way, and spec-v1718 read these first' },
  'crusade': { rows: 1, why: 'A symmetric severity score: it gives points for a vital sign or analyte that is too HIGH or too LOW, so every one of its measured fields turns once at the normal band and runs to both fences. Published that way, and spec-v1718 read these first' },
  'cpis-vap': { rows: 1, why: 'A BANDED criterion whose own label states the bands: points are earned inside a range, so the count turns at the range\'s edge. The label is the source' },
  'refeeding-risk': { rows: 2, why: 'A BANDED criterion whose own label states the bands: points are earned inside a range, so the count turns at the range\'s edge. The label is the source' },
  'erez-dic': { rows: 1, why: 'A BANDED criterion whose own label states the bands: points are earned inside a range, so the count turns at the range\'s edge. The label is the source' },
  'arc-hbr': { rows: 1, why: 'A BANDED criterion whose own label states the bands: points are earned inside a range, so the count turns at the range\'s edge. The label is the source' },
  'mcisaac': { rows: 1, why: 'A BANDED criterion whose own label states the bands: points are earned inside a range, so the count turns at the range\'s edge. The label is the source' },
  'kings-college-nonapap': { rows: 1, why: 'A BANDED criterion whose own label states the bands: points are earned inside a range, so the count turns at the range\'s edge. The label is the source' },
  'predicted-spirometry': { rows: 3, why: 'A published formula with a squared, logarithmic or reciprocal term in this input, so the turn is the formula\'s and not a missed cap; and the lung function it predicts really does peak in the early twenties' },
  'palbi': { rows: 2, why: 'A published formula with a squared, logarithmic or reciprocal term in this input, so the turn is the formula\'s and not a missed cap; PALBI is quadratic in log platelets as published' },
  'prevent': { rows: 4, why: 'A published formula with a squared, logarithmic or reciprocal term in this input, so the turn is the formula\'s and not a missed cap; the PREVENT equations center and square the systolic pressure and the BMI' },
  'fullpiers': { rows: 2, why: 'A published formula with a squared, logarithmic or reciprocal term in this input, so the turn is the formula\'s and not a missed cap; fullPIERS carries a log and a squared term for the platelet count and the AST' },
  'two-compartment-params': { rows: 3, why: 'A published formula with a squared, logarithmic or reciprocal term in this input, so the turn is the formula\'s and not a missed cap; the micro-constants of a two-compartment fit are not monotone in the slow-phase intercept' },
  'ddi-static-aucr': { rows: 2, why: 'A published formula with a squared, logarithmic or reciprocal term in this input, so the turn is the formula\'s and not a missed cap; the static AUCR sums a competing inhibition and induction term, which cross' },
  'tmic-beta-lactam': { rows: 2, why: 'A published formula with a squared, logarithmic or reciprocal term in this input, so the turn is the formula\'s and not a missed cap' },
  'vanc-auc': { rows: 2, why: 'A published formula with a squared, logarithmic or reciprocal term in this input, so the turn is the formula\'s and not a missed cap; the dip is four units wide at a trough below 0.07 mg/L' },
  'delta-gap': { rows: 1, why: 'A published formula with a squared, logarithmic or reciprocal term in this input, so the turn is the formula\'s and not a missed cap; the bicarbonate appears in the anion gap and again in the delta, with opposite signs' },
  'mgus-risk': { rows: 1, why: 'A two-sided reference interval: the finding is abnormal both below and above it, so the count of abnormal findings turns inside the interval' },
  'min-weighable-quantity': { rows: 1, why: 'A published formula with a squared, logarithmic or reciprocal term in this input, so the turn is the formula\'s and not a missed cap' },
  'nnt-arr': { rows: 2, why: 'A reciprocal of a difference: the output turns where its denominator passes through its smallest value, which is arithmetic rather than a cap' },
  'or-rr-to-nnt': { rows: 1, why: 'A reciprocal of a difference: the output turns where its denominator passes through its smallest value, which is arithmetic rather than a cap' },
  'preg-dating': { rows: 1, why: 'The output is a DISTANCE or a disagreement between two figures, so it is smallest where they agree and grows in both directions by construction' },
  'inr-variability': { rows: 2, why: 'The output is a DISTANCE or a disagreement between two figures, so it is smallest where they agree and grows in both directions by construction; the variance growth rate is a squared deviation from the target' },
  'pppa-special-packaging-check': { rows: 1, why: 'The output is a DISTANCE or a disagreement between two figures, so it is smallest where they agree and grows in both directions by construction' },
  'compound-copy-check': { rows: 1, why: 'The output is a DISTANCE or a disagreement between two figures, so it is smallest where they agree and grows in both directions by construction' },
  'sample-size-proportion': { rows: 3, why: 'A published formula with a squared, logarithmic or reciprocal term in this input, so the turn is the formula\'s and not a missed cap; a sample size for a proportion is largest at 50% because p(1-p) is' },
  'fap-discount': { rows: 1, why: 'The swept field is a POLICY parameter, not a measurement, and the sweep drives the schedule into an order its author would not write. The reading names the tier it used and its discount, and the note says the tiers are the hospital\'s own policy as entered' },
  'niosh-lifting': { rows: 1, why: 'The tool already says the task is outside the equation past this input\'s limit -- \"The recommended weight limit computes to 0 lb because a vertical height of 71 inches, beyond the 70 inch limit. That is the equation saying this task is outside what it can evaluate, not that the safe weight is zero\" -- which is the cap, stated' },
};
const judgedSeen = new Set();
const judgedPrinted = new Set();

const rows = [];
let swept = 0;
let sweptGuessed = 0;
for (const calc of allCalculators()) {
  const id = calc.id;
  if (onlyId && id !== onlyId) continue;
  const ex = META[id] && META[id].example && META[id].example.fields;
  if (!ex) continue;
  const base = computeCalculator({ id, inputs: { ...ex } });
  if (!base || base.valid === false) continue;

  for (const f of calc.fields || []) {
    if (f.kind !== 'number') continue;
    // Declared bounds are the sound range: the tool itself says a value in it is
    // one it will answer. Only 573 of the catalog's 13,230 fields declare both,
    // so a field without them is swept around its own worked example instead,
    // over the band below, and reported separately -- the range is this probe's
    // guess there, not the tool's claim, which is a weaker row and said to be.
    const declared = Number.isFinite(f.min) && Number.isFinite(f.max) && f.max > f.min;
    let min; let max;
    if (declared) { min = f.min; max = f.max; } else {
      const seed = Number(ex[f.dom]);
      if (!Number.isFinite(seed) || seed <= 0) continue;
      min = seed / 50; max = seed * 50;
    }
    const values = sweepValues(min, max);
    const kept = [];
    for (const v of values) {
      const r = computeCalculator({ id, inputs: { ...ex, [f.dom]: String(v) } });
      if (!r || r.valid === false || !r.result) continue;
      kept.push({ v, nums: numbers(r.result) });
    }
    if (kept.length < 12) continue;
    swept += 1;
    if (!declared) sweptGuessed += 1;
    const keys = Object.keys(kept[0].nums).filter((k) => kept.every((p) => k in p.nums));
    for (const key of keys) {
      const series = kept.map((p) => p.nums[key]);
      const rev = reversal(series);
      if (!rev) continue;
      rows.push({
        id, dom: f.dom, label: f.label, min, max, declared, key,
        atMin: rev.first, atPeak: rev.peak, atMax: rev.last,
        peakValue: kept[rev.turnAt].v, retrace: rev.retrace,
      });
    }
  }
}

// Declared ranges first: a row there is the tool's own claim about what it will
// answer, and a row from a guessed band is a question about a range nobody set.
rows.sort((a, b) => (b.declared ? 1 : 0) - (a.declared ? 1 : 0) || b.retrace - a.retrace);

if (asJson) { console.log(JSON.stringify(rows, null, 2)); }

// Judged by calculator AND by how many of its outputs turned, so a new turning field in a tool somebody
// has read is still a row.
const counts = {};
for (const r of rows) counts[r.id] = (counts[r.id] || 0) + 1;
const unjudged = rows.filter((r) => {
  const j = JUDGED[r.id];
  if (!j) return true;
  judgedSeen.add(r.id);
  if (j.rows !== counts[r.id]) return true;          // the instrument gained or lost a turning output
  if (process.argv.includes('--all')) {
    if (!judgedPrinted.has(r.id)) {
      judgedPrinted.add(r.id);
      console.log(`JUDGED\t${r.id}\t${j.rows} output(s)\t${j.why}`);
    }
  }
  return false;
});
const stale = Object.keys(JUDGED).filter((k) => !judgedSeen.has(k));
if (stale.length) {
  console.log(`STALE-LEDGER: ${stale.length} judged calculator(s) this run no longer reaches: ${stale.join(', ')}.`);
  console.log('A reason cannot outlive what it describes -- re-read the tool and remove the row.');
}
rows.length = 0;
rows.push(...unjudged);
const declaredRows = rows.filter((r) => r.declared);
say(`${rows.length} output(s) across ${new Set(rows.map((r) => r.id)).size} calculator(s) turn once and run on`);
say(`to the edge of their input range: ${declaredRows.length} on a range the tool declares,`);
say(`${rows.length - declaredRows.length} on a band guessed around the worked example.\n`);
say(`Reach: ${swept} field sweeps, ${swept - sweptGuessed} of them over a declared range.`);
say('A field with no declared range and no positive numeric example cannot be swept at all.\n');
say('Each row: does the SOURCE bound this input where the tool does not?\n');
if (!asJson) {
  const f2 = (x) => Number(x.toPrecision(6));
  for (const r of rows) {
    const f = f2;
    say(`  ${r.id} | ${r.dom} "${r.label}"  [${f2(r.min)}, ${f2(r.max)}]${r.declared ? '' : '  (band guessed around the example)'}`);
    say(`      ${r.key}: ${f(r.atMin)} at ${r.min} -> ${f(r.atPeak)} at ${f(r.peakValue)} -> ${f(r.atMax)} at ${r.max}`);
    say(`      retrace ${(100 * r.retrace).toFixed(0)}% of the swing`);
  }
}
