// spec-v1435: HATCH score for progression of paroxysmal atrial fibrillation.
//
// Sources, read 2026-09-24:
//   de Vos CB, Pisters R, Nieuwlaat R, et al. Progression from paroxysmal to persistent atrial
//     fibrillation: clinical correlates and prognosis. J Am Coll Cardiol 2010;55(8):725-731 (PubMed
//     20170808): 1,219 patients with paroxysmal AF in the Euro Heart Survey; progression in 15% at
//     1 year; "Nearly 50% of the patients with a HATCH score >5 progressed to persistent AF compared
//     with only 6% of the patients with a HATCH score of 0."
//   The points, as restated in Li YG et al, Chest 2019;155(3):510-518 (PMC6437029): "HATCH
//     (hypertension, age >=75, transient ischemic attack or stroke [2 points], COPD, HF [2 point])".
//
// Every item is a yes/no the reader must answer: a blank is asked for, never read as "no".
// Pure: no DOM, no clock, no network.

export const HATCH_YES_NO = [
  { value: 'yes', text: 'Yes' },
  { value: 'no', text: 'No' },
];

const ITEMS = [
  ['htn', 'hypertension', 1],
  ['age75', 'age 75 or older', 1],
  ['tiaStroke', 'prior TIA or stroke', 2],
  ['copd', 'COPD', 1],
  ['hf', 'heart failure', 2],
];

export function hatchAf(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const missing = [];
  let score = 0;
  const parts = {};
  for (const [key, label, pts] of ITEMS) {
    if (o[key] !== 'yes' && o[key] !== 'no') { missing.push(label); continue; }
    parts[key] = o[key] === 'yes' ? pts : 0;
    score += parts[key];
  }
  if (missing.length) {
    return { valid: false, message: `Answer every item: ${missing.join(', ')} ${missing.length === 1 ? 'is' : 'are'} still needed. A blank is not a "no".` };
  }
  let band;
  if (score === 0) band = 'HATCH 0 of 7: about 6% progressed from paroxysmal to persistent atrial fibrillation within a year at this score in the derivation cohort.';
  else if (score > 5) band = `HATCH ${score} of 7: nearly 50% progressed from paroxysmal to persistent atrial fibrillation within a year above 5 in the derivation cohort.`;
  else band = `HATCH ${score} of 7: between the two anchors the derivation paper reports (about 6% progression at 0, nearly 50% above 5); it gives no rate for this score.`;
  return {
    valid: true,
    abnormal: score > 0,
    score,
    parts,
    band,
    bandLabel: `${score} of 7`,
    notes: [
      'For paroxysmal atrial fibrillation: the score estimates progression to a sustained form, not stroke risk, and does not decide anticoagulation.',
    ],
    note: 'de Vos CB et al, J Am Coll Cardiol 2010 (Euro Heart Survey, 1,219 patients, 1-year follow-up); points as restated by Li YG et al, Chest 2019: hypertension 1, age 75 or older 1, TIA or stroke 2, COPD 1, heart failure 2.',
  };
}
