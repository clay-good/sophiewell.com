// spec-v262: pediatric acute-assessment instruments — the Lab-score for serious
// bacterial infection, the CHALICE pediatric head-injury rule, and the Egami score for
// IVIG resistance in Kawasaki disease. Second feature spec of the Bedside Acute-Care
// Instruments program. Each id was verified absent by a fixed-string scan of the
// extracted app.js id/name lists first (spec-v85 §6.2). v262 runs no AI and makes no
// runtime network call.
//
// These compute a risk / eligibility CATEGORY — none is an imaging, lumbar-puncture,
// admission, or prescribing order (spec-v11 §5.3). The scan / tap / admit / treat
// decision stays with the clinician.
//
//   lab-score  - Lab-score for serious bacterial infection (0-9, >= 3 high risk)
//   chalice    - CHALICE pediatric head-injury rule (any of 14 criteria -> CT)
//   egami      - Egami IVIG-resistance score in Kawasaki disease (0-6, >= 3 high risk)
//
// CRITERIA / WEIGHTS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified against the
// primary papers and independent calculators at implementation:
//   Lab-score - Lacour/Galetto-Lacour AG et al., Pediatr Infect Dis J 2008;27(7):654-656;
//               CRP < 40 / 40-99 / >= 100 mg/L = 0/2/4; PCT < 0.5 / 0.5-1.99 / >= 2 ng/mL
//               = 0/2/4 (the lower PCT band is 0.5, NOT 0.05); urine dipstick neg/pos =
//               0/1; range 0-9; cutoff >= 3.
//   CHALICE   - Dunning J et al., Arch Dis Child 2006;91(11):885-891; 14 criteria in 3
//               groups (6 history, 5 examination, 3 mechanism), any positive -> CT head.
//   Egami     - Egami K et al., J Pediatr 2006;149(2):237-240 (Table 1); ALT >= 80 +2,
//               age <= 6 months +1, treatment day <= 4 +1, CRP >= 8 mg/dL +1, platelets
//               <= 300k +1; range 0-6; cutoff >= 3.

// --- Lab-score for serious bacterial infection -------------------------------
const LABSCORE_NOTE = 'Lab-score (Galetto-Lacour 2008): biomarker risk-stratification of serious bacterial infection in children with fever without source. CRP < 40 mg/L (0) / 40-99 (+2) / >= 100 (+4); procalcitonin < 0.5 ng/mL (0) / 0.5-1.99 (+2) / >= 2.0 (+4); urine dipstick negative (0) / positive for leukocyte esterase and/or nitrite (+1). Total 0-9. >= 3 = high risk of serious bacterial infection (derivation sensitivity ~94%, specificity ~81%). A risk band, not a sepsis-workup, antibiotic, or admission order.';
const LABSCORE_CRP = { lt40: [0, 'CRP < 40 mg/L (0)'], mid: [2, 'CRP 40-99 mg/L (+2)'], high: [4, 'CRP >= 100 mg/L (+4)'] };
const LABSCORE_PCT = { lt05: [0, 'PCT < 0.5 ng/mL (0)'], mid: [2, 'PCT 0.5-1.99 ng/mL (+2)'], high: [4, 'PCT >= 2.0 ng/mL (+4)'] };
export function labScore(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let total = 0;
  const fired = [];
  const crp = LABSCORE_CRP[o.crp] || LABSCORE_CRP.lt40;
  total += crp[0]; if (crp[0] > 0) fired.push(crp[1]);
  const pct = LABSCORE_PCT[o.pct] || LABSCORE_PCT.lt05;
  total += pct[0]; if (pct[0] > 0) fired.push(pct[1]);
  if (o.urinePositive === true) { total += 1; fired.push('urine dipstick positive (+1)'); }
  const high = total >= 3;
  return { valid: true, score: total, abnormal: high, bandLabel: `Lab-score ${total}`,
    band: `Lab-score ${total} of 9 — ${high ? 'high risk of serious bacterial infection (>= 3)' : 'low risk of serious bacterial infection (< 3)'}.`,
    detail: `Contributing: ${fired.length ? fired.join(', ') : 'all biomarkers in the low band'}.`, note: LABSCORE_NOTE };
}

// --- CHALICE pediatric head-injury rule --------------------------------------
const CHALICE_NOTE = 'CHALICE rule (Dunning 2006): a sensitivity-first pediatric head-CT rule (~98% sensitivity for a clinically significant intracranial injury). CT head is recommended when ANY of 14 criteria is present. History — witnessed loss of consciousness > 5 min, amnesia > 5 min, abnormal drowsiness, >= 3 vomits after injury, suspicion of non-accidental injury, post-traumatic seizure without epilepsy history. Examination — GCS < 14 (or < 15 if age < 1 year), suspected penetrating/depressed skull injury or tense fontanelle, signs of a basal skull fracture, positive focal neurology, bruise/swelling/laceration > 5 cm if age < 1 year. Mechanism — high-speed road-traffic accident (> 40 mph) as pedestrian/cyclist/occupant, fall > 3 m, high-speed projectile or object. A rule result, not an imaging order.';
const CHALICE_ITEMS = [
  // [key, label, group]
  ['locOver5', 'witnessed loss of consciousness > 5 min', 'history'],
  ['amnesiaOver5', 'amnesia > 5 min', 'history'],
  ['drowsiness', 'abnormal drowsiness', 'history'],
  ['vomits3', '>= 3 vomits after injury', 'history'],
  ['nonAccidental', 'suspicion of non-accidental injury', 'history'],
  ['seizure', 'post-traumatic seizure without epilepsy history', 'history'],
  ['gcsLow', 'GCS < 14 (or < 15 if age < 1 year)', 'examination'],
  ['penetrating', 'suspected penetrating/depressed skull injury or tense fontanelle', 'examination'],
  ['basalSkull', 'signs of a basal skull fracture', 'examination'],
  ['focalNeuro', 'positive focal neurology', 'examination'],
  ['bruise5', 'bruise/swelling/laceration > 5 cm if age < 1 year', 'examination'],
  ['highSpeedRta', 'high-speed road-traffic accident (> 40 mph)', 'mechanism'],
  ['fall3m', 'fall > 3 m', 'mechanism'],
  ['projectile', 'high-speed projectile or object', 'mechanism'],
];
export function chalice(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const fired = [];
  for (const [key, label, group] of CHALICE_ITEMS) {
    if (o[key] === true) fired.push(`${label} (${group})`);
  }
  const n = fired.length;
  const positive = n > 0;
  return { valid: true, score: n, abnormal: positive, bandLabel: positive ? 'CT recommended' : 'CT not required',
    band: positive
      ? `CHALICE positive — CT head recommended by the rule (${n} of 14 criteria present).`
      : 'CHALICE negative — CT not required by the rule (all 14 criteria absent).',
    detail: positive ? `Positive: ${fired.join(', ')}.` : 'No criteria positive.', note: CHALICE_NOTE };
}

// --- Egami score (IVIG resistance in Kawasaki disease) -----------------------
const EGAMI_NOTE = 'Egami score (Egami 2006): predicts resistance to initial IVIG in Kawasaki disease. ALT >= 80 IU/L +2, age <= 6 months +1, treatment on illness day <= 4 +1, CRP >= 8 mg/dL +1, platelets <= 300 x 10^3/mm^3 +1. Total 0-6. >= 3 = high risk of IVIG resistance (derivation sensitivity ~78%, specificity ~76% in the Japanese cohort). Sensitivity drops in non-Japanese/Western and infant populations. A resistance-risk band, not an IVIG, steroid, or intensified-therapy order.';
export function egami(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let total = 0;
  const fired = [];
  const boxes = [
    [o.altHigh, 'ALT >= 80 IU/L (+2)', 2],
    [o.ageYoung, 'age <= 6 months (+1)', 1],
    [o.earlyTreatment, 'treatment on illness day <= 4 (+1)', 1],
    [o.crpHigh, 'CRP >= 8 mg/dL (+1)', 1],
    [o.plateletsLow, 'platelets <= 300k (+1)', 1],
  ];
  for (const [on, label, pts] of boxes) { if (on === true) { total += pts; fired.push(label); } }
  const high = total >= 3;
  return { valid: true, score: total, abnormal: high, bandLabel: `Egami ${total}`,
    band: `Egami ${total} of 6 — ${high ? 'high risk of IVIG resistance (>= 3)' : 'low risk of IVIG resistance (< 3)'}.`,
    detail: `Contributing: ${fired.length ? fired.join(', ') : 'no items positive'}.`, note: EGAMI_NOTE };
}
