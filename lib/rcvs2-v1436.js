// spec-v1436: RCVS2 score -- reversible cerebral vasoconstriction syndrome vs other arteriopathies.
//
// Sources, read 2026-09-24:
//   Rocha EA, Topcuoglu MA, Silva GS, Singhal AB. RCVS2 score and diagnostic approach for reversible
//     cerebral vasoconstriction syndrome. Neurology 2019;92(7):e639-e647 (abstract, PubMed 30635475):
//     "range -2 to +10; recurrent/single thunderclap headache; carotid artery involvement;
//     vasoconstrictive trigger; sex; subarachnoid hemorrhage". "Score >=5 had 99% specificity and 90%
//     sensitivity for diagnosing RCVS, and score <=2 had 100% specificity and 85% sensitivity for
//     excluding RCVS. Scores 3-4 had 86% specificity and 10% sensitivity". Derived in 30 RCVS vs 80
//     non-RCVS arteriopathy patients; validated against primary angiitis of the CNS.
//   The points, as tabulated in de Sousa IA et al. Reversible cerebral vasoconstriction syndrome: a
//     narrative review. Headache 2026;66(5):1162- (PMC13142216): recurrent or single thunderclap
//     headache present 5; intracranial carotid artery affected -2; vasoconstrictive trigger present 3;
//     female sex 1; subarachnoid hemorrhage present 1.
//
// The score is for a patient ALREADY found to have a large/medium-vessel intracranial arteriopathy
// on vessel imaging; it does not screen headaches. Every item must be answered: the carotid item
// SUBTRACTS, so a blank read as "not affected" would push the total up, and a blank anywhere else
// would push it down. Pure: no DOM, no clock, no network.

export const RCVS2_YES_NO = [
  { value: 'yes', text: 'Yes' },
  { value: 'no', text: 'No' },
];
export const RCVS2_SEX = [
  { value: 'female', text: 'Female' },
  { value: 'male', text: 'Male' },
];

const ITEMS = [
  ['tch', 'recurrent or single thunderclap headache', (v) => (v === 'yes' ? 5 : 0), RCVS2_YES_NO],
  ['carotid', 'intracranial carotid artery involvement', (v) => (v === 'yes' ? -2 : 0), RCVS2_YES_NO],
  ['trigger', 'vasoconstrictive trigger', (v) => (v === 'yes' ? 3 : 0), RCVS2_YES_NO],
  ['sex', 'sex', (v) => (v === 'female' ? 1 : 0), RCVS2_SEX],
  ['sah', 'subarachnoid hemorrhage', (v) => (v === 'yes' ? 1 : 0), RCVS2_YES_NO],
];

export function rcvs2(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const missing = [];
  let score = 0;
  const parts = {};
  for (const [key, label, pts, opts] of ITEMS) {
    if (!opts.some((x) => x.value === o[key])) { missing.push(label); continue; }
    parts[key] = pts(o[key]);
    score += parts[key];
  }
  if (missing.length) {
    return { valid: false, message: `Answer every item: ${missing.join(', ')} ${missing.length === 1 ? 'is' : 'are'} still needed. The carotid item subtracts, so a blank cannot stand for "no".` };
  }
  let reading;
  let band;
  if (score >= 5) {
    reading = 'favors RCVS';
    band = `RCVS2 ${score}: favors reversible cerebral vasoconstriction syndrome (5 or more: 99% specificity, 90% sensitivity in the derivation cohort).`;
  } else if (score <= 2) {
    reading = 'against RCVS';
    band = `RCVS2 ${score}: against reversible cerebral vasoconstriction syndrome (2 or less: 100% specificity for excluding it, 85% sensitivity).`;
  } else {
    reading = 'indeterminate';
    band = `RCVS2 ${score}: indeterminate (3 to 4: 86% specificity but only 10% sensitivity for RCVS in the derivation cohort).`;
  }
  const notes = [
    'For a patient whose vessel imaging already shows a large or medium intracranial arteriopathy. It does not screen headaches or replace repeat vessel imaging, which confirms reversibility.',
  ];
  if (reading === 'indeterminate') {
    notes.push('For scores of 3 to 4, the authors\' bedside approach (recurrent thunderclap headaches, a trigger with normal brain imaging, or convexity subarachnoid hemorrhage) correctly diagnosed 25 of 37 patients.');
  }
  notes.push('Derived in 110 patients (30 with RCVS) at one center; primary angiitis of the CNS, its closest mimic, was the validation comparison.');
  return {
    valid: true,
    abnormal: reading === 'favors RCVS',
    score,
    reading,
    parts,
    band,
    bandLabel: `${score} (${reading})`,
    notes,
    note: 'Rocha EA et al, Neurology 2019; points as tabulated by de Sousa IA et al, Headache 2026: thunderclap headache 5, intracranial carotid involvement -2, vasoconstrictive trigger 3, female 1, subarachnoid hemorrhage 1 (range -2 to 10).',
  };
}
