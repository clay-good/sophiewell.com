// spec-v543: the SAVE score (Survival After Veno-arterial ECMO). Zero-hit before this tile: "save score" and
// "veno-arterial" across corpus.json, app.js, and lib/meta.js.
//
// A COMPANION GAP AND A DISTINCT QUESTION. The catalog has `resp-score`, the RESP score, which predicts
// survival after RESPIRATORY (veno-venous) ECMO -- SAVE is its VENO-ARTERIAL counterpart, a different
// population with entirely different predictors. It is also distinct from `cardshock-score` and
// `scai-shock`, which grade cardiogenic shock BEFORE and WITHOUT reference to ECMO. SAVE answers a narrower
// question: given that veno-arterial ECMO is being started for refractory cardiogenic shock, what is the
// survival of patients who looked like this one.
//
// **THERE IS A CONSTANT OF MINUS 6 ADDED TO EVERY CALCULATION, AND FORGETTING IT SHIFTS EVERY PATIENT A FULL
// RISK CLASS.** The published table lists it as its own row: "constant value to add to all calculations of
// SAVE-score, -6". A patient whose components sum to 0 has a SAVE score of -6, not 0 -- and since the class
// boundaries sit at 5, 0, -5 and -10, a six-point shift moves most patients across at least one. This tile
// applies the constant, reports the component subtotal and the final score separately so the arithmetic is
// auditable, and a test pins that a patient with no components scores -6.
//
// THE DIAGNOSIS GROUPS AND THE ORGAN FAILURES ARE ADDITIVE, NOT EXCLUSIVE. The source says "select one or
// more" for both. A patient with myocarditis who is also in refractory VT or VF scores +3 AND +2. Treating
// either group as a single-choice list would under-score exactly the sickest and the most salvageable
// patients, in opposite directions.
//
// SEVERAL WEIGHTS ARE NEGATIVE AND ONE IS LARGE: chronic renal failure alone is -6, matching the constant.
// Congenital heart disease is the only negative diagnosis group at -3. Age is the largest positive at +7 for
// 18 to 38.
//
// TOTAL RANGE -35 TO 23. One secondary source states the range as -35 to 17; the primary table says 23, and
// that is what this tile reports. Another secondary source renders class I as "5 or above" and class II as
// "1 to 4", which mis-assigns a score of exactly 5; the primary says class I is ABOVE 5 and class II is 1
// THROUGH 5, and this tile follows the primary. A test pins the boundary at exactly 5.
//
// RISK CLASSES AND REPORTED HOSPITAL SURVIVAL: above 5 class I at 75 percent; 1 to 5 class II at 58; -4 to 0
// class III at 42; -9 to -5 class IV at 30; -10 or below class V at 18. The score was constructed so that
// zero sits near a fifty-fifty chance.
//
// HIGH-STAKES: these are survival figures for a DERIVATION AND VALIDATION COHORT, describing groups of
// patients who resembled this one. They are not a prediction for the individual, and the score is NOT a
// tool for deciding whether to offer ECMO or for withdrawing it once started. Refractory cardiogenic shock
// is fatal without support, so a low predicted survival is not the same as futility, and patients in the
// lowest class still survived. It does not diagnose cardiogenic shock, does not choose a cannulation
// strategy, does not address the ECMO-specific complications that drive much of the mortality, and does not
// account for what happens after cannulation -- bleeding, limb ischemia, neurologic injury, or the
// availability of a durable device or transplant (spec-v11 section 5.3). The decision stays with the ECMO
// team.
//
// VARIABLES, WEIGHTS, THE CONSTANT, AND THE CLASSES RE-FETCHED, NEVER RECALLED (spec-v97), read directly
// from the primary publication's own scoring table and corroborated independently:
//   - Schmidt M, Burrell A, Roberts L, et al. Predicting survival after ECMO for refractory cardiogenic
//     shock: the survival after veno-arterial-ECMO (SAVE)-score. Eur Heart J. 2015;36(33):2246-2256.

export const SAVE_DIAGNOSES = [
  { key: 'myocarditis', text: 'Myocarditis', points: 3 },
  { key: 'refractoryVtVf', text: 'Refractory ventricular tachycardia or fibrillation', points: 2 },
  { key: 'postTransplant', text: 'Post heart or lung transplantation', points: 3 },
  { key: 'congenital', text: 'Congenital heart disease', points: -3 },
];

export const SAVE_ORGAN_FAILURES = [
  { key: 'liverFailure', text: 'Liver failure (bilirubin 33 micromol/L or above, or ALT/AST above 70 U/L)', points: -3 },
  { key: 'cnsDysfunction', text: 'Central nervous system dysfunction (neurotrauma, stroke, encephalopathy, cerebral embolism, seizure)', points: -3 },
  { key: 'renalFailure', text: 'Renal failure (chronic or acute, for example creatinine above 1.5 mg/dL, with or without renal replacement)', points: -3 },
];

export const SAVE_AGE_BANDS = [
  { value: '18-38', text: '18 to 38 years', points: 7 },
  { value: '39-52', text: '39 to 52 years', points: 4 },
  { value: '53-62', text: '53 to 62 years', points: 3 },
  { value: '63+', text: '63 years or older', points: 0 },
];

export const SAVE_WEIGHT_BANDS = [
  { value: '<=65', text: '65 kg or less', points: 1 },
  { value: '65-89', text: '65 to 89 kg', points: 2 },
  { value: '>=90', text: '90 kg or more', points: 0 },
];

export const SAVE_INTUBATION_BANDS = [
  { value: '<=10', text: '10 hours or less', points: 0 },
  { value: '11-29', text: '11 to 29 hours', points: -2 },
  { value: '>=30', text: '30 hours or more', points: -4 },
];

export const SAVE_BINARY = [
  { key: 'chronicRenalFailure', text: 'Chronic renal failure (kidney damage or GFR below 60 for 3 months or more)', points: -6 },
  { key: 'pipAtOrBelow20', text: 'Peak inspiratory pressure 20 cmH2O or less', points: 3 },
  { key: 'cardiacArrest', text: 'Pre-ECMO cardiac arrest', points: -2 },
  { key: 'diastolicAtOrAbove40', text: 'Diastolic blood pressure before ECMO 40 mmHg or above (worst value within 6 hours before cannulation)', points: 3 },
  { key: 'pulsePressureAtOrBelow20', text: 'Pulse pressure before ECMO 20 mmHg or less (worst value within 6 hours before cannulation)', points: -2 },
  { key: 'bicarbAtOrBelow15', text: 'Bicarbonate before ECMO 15 mmol/L or less', points: -3 },
];

export const SAVE_CONSTANT = -6;

const CLASSES = [
  { min: 6, roman: 'I', survival: '75 percent' },
  { min: 1, roman: 'II', survival: '58 percent' },
  { min: -4, roman: 'III', survival: '42 percent' },
  { min: -9, roman: 'IV', survival: '30 percent' },
  { min: -Infinity, roman: 'V', survival: '18 percent' },
];

const NOTE = 'The SAVE score (Schmidt and colleagues 2015) estimates hospital survival after veno-arterial ECMO for refractory cardiogenic shock. A constant of minus 6 is added to every calculation, so a patient whose components sum to zero scores minus 6, not zero; because the class boundaries sit at 5, 0, minus 5 and minus 10, forgetting the constant shifts most patients a full risk class. The diagnosis groups and the acute pre-ECMO organ failures are additive rather than exclusive, since the source says to select one or more of each, so a patient with myocarditis who is also in refractory ventricular tachycardia scores both. Several weights are negative, and chronic renal failure alone is minus 6. The total runs from minus 35 to plus 23. Risk classes and their reported hospital survival are: above 5, class I at 75 percent; 1 to 5, class II at 58 percent; minus 4 to 0, class III at 42 percent; minus 9 to minus 5, class IV at 30 percent; and minus 10 or below, class V at 18 percent. The score was constructed so that zero sits near a fifty-fifty chance. These survival figures describe groups of patients who resembled this one in the derivation and validation cohorts. They are not a prediction for an individual, and the score is not a tool for deciding whether to offer ECMO or for withdrawing it once started. Refractory cardiogenic shock is fatal without support, so a low predicted survival is not the same as futility, and patients in the lowest class still survived. It does not diagnose cardiogenic shock, does not choose a cannulation strategy, does not address the ECMO-specific complications that drive much of the mortality, and does not account for what happens after cannulation, including bleeding, limb ischemia, neurologic injury, or the availability of a durable device or transplant. It is also a different instrument from the RESP score, which predicts survival after respiratory veno-venous ECMO in a different population.';

function readBool(v) {
  if (v === '' || v === null || v === undefined) return null;
  if (v === true || v === 1) return true;
  if (v === false || v === 0) return false;
  const s = String(v).trim().toLowerCase();
  if (['yes', 'y', '1', 'true'].includes(s)) return true;
  if (['no', 'n', '0', 'false'].includes(s)) return false;
  return NaN;
}
function readBand(list, raw) {
  if (raw === '' || raw === null || raw === undefined) return null;
  return list.find((b) => b.value === String(raw).trim()) || undefined;
}

// input: each diagnosis and organ-failure key as yes/no; ageBand, weightBand, intubationBand; each
// SAVE_BINARY key as yes/no.
export function saveScore(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const flags = [...SAVE_DIAGNOSES, ...SAVE_ORGAN_FAILURES, ...SAVE_BINARY];
  const read = flags.map((f) => ({ f, v: readBool(o[f.key]) }));
  const missingFlags = read.filter((r) => r.v === null).map((r) => r.f.key);

  const age = readBand(SAVE_AGE_BANDS, o.ageBand);
  const weight = readBand(SAVE_WEIGHT_BANDS, o.weightBand);
  const intubation = readBand(SAVE_INTUBATION_BANDS, o.intubationBand);
  const missingBands = [];
  if (age === null) missingBands.push('ageBand');
  if (weight === null) missingBands.push('weightBand');
  if (intubation === null) missingBands.push('intubationBand');

  if (missingFlags.length || missingBands.length) {
    return { valid: false, message: `Answer every item. Still needed: ${[...missingBands, ...missingFlags].join(', ')}.` };
  }
  const badFlags = read.filter((r) => Number.isNaN(r.v)).map((r) => r.f.key);
  if (badFlags.length) {
    return { valid: false, message: `Each yes/no item must be yes or no. Unrecognized: ${badFlags.join(', ')}.` };
  }
  if (age === undefined || weight === undefined || intubation === undefined) {
    return { valid: false, message: 'Age, weight, and intubation-duration bands must each be one of the published options.' };
  }

  const selected = read.filter((r) => r.v).map((r) => ({ key: r.f.key, text: r.f.text, points: r.f.points }));
  const componentTotal = selected.reduce((a, c) => a + c.points, 0)
    + age.points + weight.points + intubation.points;
  const total = componentTotal + SAVE_CONSTANT;

  const cls = CLASSES.find((c) => total >= c.min);

  return {
    valid: true,
    componentTotal,
    constant: SAVE_CONSTANT,
    total,
    riskClass: cls.roman,
    survival: cls.survival,
    selected,
    bandLabel: `SAVE score ${total}, risk class ${cls.roman}`,
    band: `Components summed to ${componentTotal}; the published constant of ${SAVE_CONSTANT} is then added, giving a SAVE score of ${total}. That is risk class ${cls.roman}, with reported hospital survival of ${cls.survival} in the derivation and validation cohorts. That figure describes a group of patients who resembled this one; it is not a prediction for this patient, and the score is not a tool for deciding whether to offer ECMO or for withdrawing it. Patients in the lowest class still survived.`,
    note: NOTE,
  };
}
