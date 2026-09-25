// spec-v1434: C2HEST score for incident atrial fibrillation.
//
// Source, read 2026-09-24: Li YG, Pastori D, Farcomeni A, et al. A simple clinical risk score
// (C2HEST) for predicting incident atrial fibrillation in Asian subjects: derivation in 471,446
// Chinese subjects, with internal validation and external application in 451,199 Korean subjects.
// Chest 2019;155(3):510-518 (PMC6437029):
//   "C2: CAD/COPD (1 point each); H: hypertension (1 point); E: elderly (age >= 75 years, 2
//   points); S: systolic HF (2 points); and T: thyroid disease (hyperthyroidism, 1 point)."
//   Groups: "low (0-1 points, IR 0.34%/year), medium (2-3 points, IR 2.60%/year), and high risk
//   (> 3 points, IR 15.98%/year)". Structural heart disease was EXCLUDED: those patients "should be
//   independently considered as high risk for AF". AUC 0.75 internally, 0.65 in the Korean cohort.
//
// Every item is a yes/no the reader must answer: a blank is asked for, never read as "no".
// Pure: no DOM, no clock, no network.

export const C2HEST_YES_NO = [
  { value: 'yes', text: 'Yes' },
  { value: 'no', text: 'No' },
];

const ITEMS = [
  ['cad', 'coronary artery disease', 1],
  ['copd', 'COPD', 1],
  ['htn', 'hypertension', 1],
  ['age75', 'age 75 or older', 2],
  ['systolicHf', 'systolic heart failure', 2],
  ['hyperthyroid', 'hyperthyroidism', 1],
];

export function c2hest(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (o.shd === 'yes') {
    return {
      valid: true,
      abnormal: true,
      score: null,
      band: 'Structural heart disease: C2HEST does not apply. Its derivation excluded these patients and said they should be considered high risk for atrial fibrillation on their own.',
      bandLabel: 'Not scored (structural heart disease)',
      notes: [],
      note: NOTE,
    };
  }
  const missing = [];
  let score = 0;
  const parts = {};
  for (const [key, label, pts] of ITEMS) {
    if (o[key] !== 'yes' && o[key] !== 'no') { missing.push(label); continue; }
    parts[key] = o[key] === 'yes' ? pts : 0;
    score += parts[key];
  }
  if (o.shd !== 'no') missing.unshift('structural heart disease');
  if (missing.length) {
    return { valid: false, message: `Answer every item: ${missing.join(', ')} ${missing.length === 1 ? 'is' : 'are'} still needed. A blank is not a "no".` };
  }
  const group = score <= 1 ? 'low' : score <= 3 ? 'medium' : 'high';
  const rate = { low: '0.34', medium: '2.60', high: '15.98' }[group];
  return {
    valid: true,
    abnormal: group !== 'low',
    score,
    group,
    parts,
    band: `C2HEST ${score} of 8: ${group} risk of incident atrial fibrillation (${rate}% per year in the derivation cohort).`,
    bandLabel: `${score} (${group})`,
    notes: [
      'Derived in 471,446 Chinese adults; discrimination fell from an AUC of 0.75 there to 0.65 in the Korean cohort, so the per-year rates belong to the derivation population.',
      'It predicts new atrial fibrillation. It is not a stroke-risk score and does not decide anticoagulation.',
    ],
    note: NOTE,
  };
}

const NOTE = 'Li YG et al, Chest 2019 (C2HEST): coronary artery disease or COPD 1 point each, hypertension 1, age 75 or older 2, systolic heart failure 2, hyperthyroidism 1. Groups low 0-1, medium 2-3, high 4 or more.';
