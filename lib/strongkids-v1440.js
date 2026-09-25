// spec-v1440: STRONGkids -- nutritional risk screening for children admitted to hospital.
//
// Sources, read 2026-09-24:
//   Hulst JM, Zwart H, Hop WC, Joosten KF. Dutch national survey to test the STRONGkids nutritional
//     risk screening tool in hospitalized children. Clin Nutr 2010;29(1):106-111 (abstract, PubMed
//     19682776): four items -- subjective clinical assessment, high risk disease, nutritional intake,
//     weight loss; applied to 98% of 424 children in 44 Dutch hospitals.
//   The points and bands, stated identically in three open papers (Front Pediatr 2026, PMC13046502;
//     Ital J Pediatr 2025, PMC11929289; BMC Pediatr 2025, PMC12829223): subjective clinical
//     assessment 1, high risk disease 2, nutritional intake and losses 1, weight loss or poor weight
//     gain 1; "0 points indicating low nutritional risk, 1-3 points indicating moderate risk, and
//     4-5 points indicating high risk"; "Assess following items within 24 h after admission and once
//     a week thereafter".
//
// Every item is a yes/no the screener answers; a blank is asked for, never read as "no".
// Pure: no DOM, no clock, no network.

export const STRONGKIDS_YES_NO = [
  { value: 'yes', text: 'Yes' },
  { value: 'no', text: 'No' },
];

const ITEMS = [
  ['clinical', 'poor nutritional status on clinical assessment', 1],
  ['disease', 'a high risk disease or expected major surgery', 2],
  ['intake', 'reduced intake or losses', 1],
  ['weight', 'weight loss or poor weight gain', 1],
];

export function strongkids(input = {}) {
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
  const risk = score === 0 ? 'low' : score <= 3 ? 'moderate' : 'high';
  return {
    valid: true,
    abnormal: risk !== 'low',
    score,
    risk,
    parts,
    band: `STRONGkids ${score} of 5: ${risk} nutritional risk.`,
    bandLabel: `${score} (${risk})`,
    notes: [
      'A screen, not a nutritional assessment: it flags children to assess; it does not diagnose malnutrition.',
      'Screen within 24 hours of admission and once a week after that.',
    ],
    note: 'STRONGkids (Hulst JM et al, Clin Nutr 2010): poor nutritional status on clinical assessment 1, high risk disease or expected major surgery 2, reduced intake or losses 1, weight loss or poor weight gain 1. Bands 0 low, 1-3 moderate, 4-5 high.',
  };
}
