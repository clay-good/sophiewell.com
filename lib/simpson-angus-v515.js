// spec-v515: the Simpson-Angus Scale (SAS), the ten-item rating of drug-induced parkinsonism. Completes the
// antipsychotic movement-side-effect cluster: the catalog already carries the tardive-dyskinesia (AIMS) and
// akathisia (Barnes) scales, but "simpson angus", "extrapyramidal side", and "drug induced parkinsonism" were
// all zero-hit across the corpus and app.js - the parkinsonism axis was missing.
//
// Ten examination items, each 0-4, total 0-40. The scale is conventionally reported as the MEAN item score
// (total divided by 10), not the total, and the threshold in common use is a mean above 0.3. Reporting the
// total where a mean is expected is a ten-fold error, so this returns both and names which is which.
//
// HIGH-STAKES: this sums an examiner's own ratings. It is NOT a diagnosis, NOT a distinction between
// drug-induced parkinsonism and idiopathic Parkinson disease, and NOT an indication to reduce, switch, or
// stop an antipsychotic, or to start an anticholinergic (spec-v11 section 5.3). It also does not rate
// akathisia or tardive dyskinesia, which are different movement side effects with their own scales, and a
// low score does not exclude either. The medication decision stays with the prescriber.
//
// ITEMS AND SCALE RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Simpson GM, Angus JW. A rating scale for extrapyramidal side effects. Acta Psychiatr Scand Suppl.
//     1970;212:11-19.
//   - Psychopharmacology references reproducing the same ten items, the same 0-4 per-item scale, and the same
//     convention of reporting the mean with a threshold above 0.3.

export const SAS_ITEMS = [
  'Gait',
  'Arm dropping',
  'Shoulder shaking',
  'Elbow rigidity',
  'Fixation of position (wrist rigidity)',
  'Leg pendulousness',
  'Head dropping',
  'Glabella tap',
  'Tremor',
  'Salivation',
];

const THRESHOLD_MEAN = 0.3;

const NOTE = 'The Simpson-Angus Scale (Simpson and Angus 1970) rates ten examination items 0 to 4 for drug-induced parkinsonism. It is conventionally reported as the mean item score, total divided by 10, not as the total: a mean above 0.3 is the threshold in common use. This tile reports both and names which is which, because quoting the total where a mean is expected is a ten-fold error. It sums the ratings an examiner assigns. It is not a diagnosis, it does not separate drug-induced parkinsonism from idiopathic Parkinson disease, and it is not an indication to reduce, switch, or stop an antipsychotic or to start an anticholinergic. It does not rate akathisia or tardive dyskinesia, which have their own scales, and a low score does not exclude either.';

function readItem(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  if (!Number.isInteger(n) || n < 0 || n > 4) return NaN;
  return n;
}

// input:
//   q1 .. q10: each 0-4 (all ten required), in SAS_ITEMS order.
export function simpsonAngus(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const vals = [];
  for (let i = 1; i <= SAS_ITEMS.length; i += 1) vals.push(readItem(o[`q${i}`]));

  if (vals.some((n) => n === null)) {
    return { valid: false, message: 'Rate all ten items (each 0 to 4).' };
  }
  if (vals.some((n) => Number.isNaN(n))) {
    return { valid: false, message: 'Each item must be a whole number from 0 to 4.' };
  }

  const total = vals.reduce((a, b) => a + b, 0);
  const mean = Math.round((total / SAS_ITEMS.length) * 100) / 100;
  const aboveThreshold = mean > THRESHOLD_MEAN;

  const text = aboveThreshold
    ? `Simpson-Angus mean ${mean.toFixed(2)} (total ${total} of 40), above the mean of 0.3 in common use as the threshold for drug-induced parkinsonism.`
    : `Simpson-Angus mean ${mean.toFixed(2)} (total ${total} of 40), at or below the mean of 0.3 in common use as the threshold for drug-induced parkinsonism.`;

  return {
    valid: true,
    total,
    mean,
    aboveThreshold,
    bandLabel: `Mean ${mean.toFixed(2)} (total ${total} of 40)`,
    band: text,
    note: NOTE,
  };
}
