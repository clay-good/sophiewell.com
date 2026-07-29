// spec-v608: the Zulewski clinical score for hypothyroidism. A PREDECESSOR/SUCCESSOR gap - the items were
// "originally chosen by Billewicz" and Zulewski and colleagues re-derived which of them still discriminate.
// Every slug spelling and filename search returned 0.
//
// **THE AGE CORRECTION IS THE FINDING, AND MOST REPRODUCTIONS DROP IT.** The original adds ONE POINT when
// the patient is UNDER 55 YEARS. The consequence is concrete: a patient under 55 with NO clinical findings
// at all scores 1, not 0, and the age point is worth exactly as much as a delayed ankle reflex. The
// correction also makes the true maximum 13, not 12.
//
// **THE SPLIT IN THE LITERATURE IS EXACT AND CHECKABLE.** The reproductions that print the twelve-item table
// state the maximum as 12 and do NOT mention the correction; the sources that state the correction do NOT
// print the item table. So the two halves of this instrument are, in practice, published separately. This
// lib carries BOTH and says which is which.
//
// **THE BANDS ARE SET ON THE CORRECTED SCORE.** In the source the diagnostic range is stated in the sentence
// immediately following the correction: 2 or below euthyroid, 3 to 5 intermediate, above 5 overt
// hypothyroid. Applying those bands to an UNcorrected score therefore reads every patient under 55 one point
// too low.
//
// **SKIN IS A QUARTER OF THE INSTRUMENT, ACROSS THREE SEPARATE ITEMS THAT ARE NOT THE SAME QUESTION.** Dry
// skin is a SYMPTOM the patient reports; coarse skin is a SIGN the examiner feels for on the hands, forearms
// and elbows; cold skin is a SIGN read by comparing the patient's hands with the examiner's own. Three of
// twelve items, three different observations. Collapsing them into one "skin" item loses two points.
//
// **IT DOES NOT CORRELATE WITH TSH.** The score correlates with free T4 and free T3, but NOT with TSH - the
// gold standard for thyroid function testing. That is the load-bearing scope limit: this score cannot stand
// in for a thyroid function test, and a high score is a reason to measure TSH, never a substitute for it.
//
// HIGH-STAKES: this is a clinical-suspicion score. It does NOT diagnose hypothyroidism, does NOT grade it,
// and does NOT start, stop or dose levothyroxine (spec-v11 section 5.3). Predictive values from validation
// cohorts are single-sourced and are NOT reported here.
//
// ITEMS, CORRECTION AND BANDS RE-FETCHED AND DOUBLE-CONFIRMED ACROSS INDEPENDENT SOURCES, NEVER RECALLED
// (spec-v97). The twelve-item table is confirmed twice; the age correction and the bands are confirmed twice
// from two further sources:
//   - Zulewski H, Muller B, Exer P, Miserez AR, Staub JJ. Estimation of tissue hypothyroidism by a new
//     clinical score: evaluation of patients with various grades of hypothyroidism and controls.
//     J Clin Endocrinol Metab. 1997;82(3):771-776.

export const AGE_CORRECTION_CUTOFF = 55;
export const AGE_CORRECTION_POINTS = 1;
export const ITEM_MAX = 12;
export const CORRECTED_MAX = ITEM_MAX + AGE_CORRECTION_POINTS;

export const SYMPTOMS = [
  { key: 'sweating', text: 'Diminished sweating' },
  { key: 'hoarseness', text: 'Hoarseness of the voice' },
  { key: 'paresthesia', text: 'Paresthesia' },
  { key: 'drySkin', text: 'Dry skin (patient-reported)' },
  { key: 'constipation', text: 'Constipation' },
  { key: 'hearing', text: 'Impairment of hearing' },
  { key: 'weight', text: 'Weight increase' },
];

export const SIGNS = [
  { key: 'slowMovements', text: 'Slow movements' },
  { key: 'ankleReflex', text: 'Delayed ankle reflex' },
  { key: 'coarseSkin', text: 'Coarse skin - roughness and thickening felt on the hands, forearms and elbows' },
  { key: 'periorbitalPuffiness', text: 'Periorbital puffiness - enough to obscure the curve of the malar bone' },
  { key: 'coldSkin', text: "Cold skin - the patient's hands compared with the examiner's own" },
];

export const BANDS = [
  { max: 2, label: 'Euthyroid', text: '2 or below: euthyroid - no or low suspicion of hypothyroidism.' },
  { max: 5, label: 'Intermediate', text: '3 to 5: intermediate suspicion.' },
  { max: CORRECTED_MAX, label: 'Overt hypothyroid range', text: 'Above 5: the overt hypothyroid range - high suspicion.' },
];

export const AGE_NOTE = `THE AGE CORRECTION IS THE FINDING AND MOST REPRODUCTIONS DROP IT: ${AGE_CORRECTION_POINTS} point is added when the patient is UNDER ${AGE_CORRECTION_CUTOFF} years. A patient under ${AGE_CORRECTION_CUTOFF} with NO clinical findings at all scores ${AGE_CORRECTION_POINTS}, not 0, and the age point is worth exactly as much as a delayed ankle reflex.`;
export const SPLIT_NOTE = `The split in the literature is exact: the reproductions that print the twelve-item table state the maximum as ${ITEM_MAX} and do NOT mention the correction, while the sources that state the correction do NOT print the item table. With the correction the true maximum is ${CORRECTED_MAX}.`;
export const BAND_NOTE = 'The bands are set on the CORRECTED score - in the source the diagnostic range is stated in the sentence immediately after the correction. Applying them to an uncorrected score reads every patient under 55 one point too low.';
export const SKIN_NOTE = 'Skin is a QUARTER of the instrument across THREE separate items that are not the same question: dry skin is a SYMPTOM the patient reports, coarse skin is a SIGN felt on the hands, forearms and elbows, and cold skin is a SIGN read by comparing the patient hands with the examiner own. Collapsing them into one skin item loses two points.';
export const TSH_NOTE = 'IT DOES NOT CORRELATE WITH TSH. The score correlates with free T4 and free T3 but NOT with TSH, the gold standard for thyroid function testing. A high score is a reason to MEASURE TSH, never a substitute for it.';
export const BILLEWICZ_NOTE = 'The items were originally chosen by Billewicz; this score re-derived which of them still discriminate, so it is the successor to that older index rather than an independent instrument.';

const ALL = [...SYMPTOMS, ...SIGNS];

const NOTE = `The Zulewski clinical score (Zulewski and colleagues 1997) rates clinical suspicion of hypothyroidism from ${SYMPTOMS.length} symptoms and ${SIGNS.length} signs, one point each, plus one point when the patient is under 55 years. ${AGE_NOTE} ${SPLIT_NOTE} ${BAND_NOTE} ${SKIN_NOTE} ${TSH_NOTE} ${BILLEWICZ_NOTE} This is a clinical-suspicion score. It does not diagnose hypothyroidism, does not grade it, and does not start, stop or dose levothyroxine. Predictive values from validation cohorts are single-sourced and are not reported here.`;

function readBool(v, name) {
  if (v === '' || v === null || v === undefined) return null;
  const s = String(v).trim().toLowerCase();
  if (['yes', 'y', 'true', '1'].includes(s)) return true;
  if (['no', 'n', 'false', '0'].includes(s)) return false;
  throw new Error(`${name} must be yes or no.`);
}

// input: age (years) plus a yes/no for each SYMPTOMS/SIGNS key.
export function zulewskiScore(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const answers = {};
  let age = null;
  try {
    if (o.age !== '' && o.age !== null && o.age !== undefined) {
      const n = Number(String(o.age).trim());
      if (!Number.isFinite(n) || n < 0 || n > 120) throw new Error('Age must be between 0 and 120 years.');
      age = n;
    }
    for (const item of ALL) answers[item.key] = readBool(o[item.key], item.text);
  } catch (err) {
    return { valid: false, message: err.message };
  }
  const missing = ALL.filter((i) => answers[i.key] === null).length;
  if (age === null || missing > 0) {
    return { valid: false, message: `Enter the age and answer all ${ALL.length} items. ${AGE_NOTE}` };
  }

  const symptomPoints = SYMPTOMS.filter((i) => answers[i.key]).length;
  const signPoints = SIGNS.filter((i) => answers[i.key]).length;
  const itemPoints = symptomPoints + signPoints;
  const ageCorrection = age < AGE_CORRECTION_CUTOFF ? AGE_CORRECTION_POINTS : 0;
  const total = itemPoints + ageCorrection;
  const band = BANDS.find((b) => total <= b.max) || BANDS[BANDS.length - 1];
  const uncorrectedBand = BANDS.find((b) => itemPoints <= b.max) || BANDS[BANDS.length - 1];
  const bandChangedByAge = ageCorrection > 0 && uncorrectedBand.label !== band.label;

  const parts = [];
  parts.push(`Zulewski clinical score ${total} of ${CORRECTED_MAX}: ${symptomPoints} of ${SYMPTOMS.length} symptoms, ${signPoints} of ${SIGNS.length} signs, and an age correction of ${ageCorrection}. ${band.text}`);
  if (ageCorrection) {
    parts.push(`The patient is under ${AGE_CORRECTION_CUTOFF}, so ${AGE_CORRECTION_POINTS} point was ADDED. Without the correction the score would be ${itemPoints}${bandChangedByAge ? `, which reads as "${uncorrectedBand.label}" instead of "${band.label}" - the age point alone moves the band` : ''}.`);
  } else {
    parts.push(`The patient is ${AGE_CORRECTION_CUTOFF} or over, so no age point applies.`);
  }
  parts.push(AGE_NOTE);
  parts.push(SPLIT_NOTE);
  parts.push(BAND_NOTE);
  parts.push(SKIN_NOTE);
  parts.push(TSH_NOTE);
  parts.push(BILLEWICZ_NOTE);
  parts.push('This is a clinical-suspicion score. It does not diagnose hypothyroidism, does not grade it, and does not start, stop or dose levothyroxine.');

  return {
    valid: true,
    score: total,
    max: CORRECTED_MAX,
    itemPoints,
    symptomPoints,
    signPoints,
    ageCorrection,
    uncorrectedScore: itemPoints,
    bandChangedByAge,
    uncorrectedBand: uncorrectedBand.label,
    band: band.label,
    bandLabel: `Zulewski clinical score ${total} of ${CORRECTED_MAX} - ${band.label}`,
    bandText: parts.join(' '),
    note: NOTE,
  };
}
