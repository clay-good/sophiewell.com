// spec-v564: the PROPKD score, predicting renal survival in autosomal dominant polycystic kidney disease.
// "propkd" was zero-hit across corpus.json, app.js and lib/meta.js, and `grep -c "id: 'propkd'" app.js`
// returned 0.
//
// A COMPANION TO `mayo-adpkd` ON A DIFFERENT AXIS, NOT A DUPLICATE. The Mayo imaging classification
// stratifies from KIDNEY VOLUME on a scan. PROPKD stratifies from GENOTYPE AND CLINICAL HISTORY, and needs
// no imaging at all. The two disagree on real patients, which is the point of having both.
//
// FOUR VARIABLES, TOTAL 0 TO 9:
//   male sex                                      1
//   hypertension before age 35                    2
//   first urologic event before age 35            2
//   mutation: PKD2 0, non-truncating PKD1 2, truncating PKD1 4
//
// **THE MUTATION TERM IS A SINGLE CATEGORICAL VARIABLE WORTH UP TO 4 OF THE 9 POINTS.** It is mutually
// exclusive and non-linear, and it can supply nearly half the score on its own. A truncating PKD1 mutation
// alone puts a patient in the intermediate band before any clinical variable is counted.
//
// **"PKD2 MUTATION, 0 POINTS" IS AN EXPLICIT SELECTABLE STATE AND IS NOT THE SAME AS AN UNKNOWN GENOTYPE.**
// Scoring 0 for the mutation term asserts that PKD2 was FOUND. A patient who has not been genotyped has no
// PROPKD score at all -- the variable is missing, not zero -- and treating the two alike would hand an
// ungenotyped patient a low-risk result built on an assertion nobody made. This lib requires the mutation
// category and offers no scoring option for "not tested", which is exactly the trap a zero-point level
// invites.
//
// **THE SCORE IS INAPPLICABLE TO PATIENTS WITH NO PKD1 OR PKD2 MUTATION FOUND.** There is no category for
// them: the model was built on genotyped patients and offers nothing for a genetically unresolved case.
// This lib says so rather than defaulting such a patient into the PKD2 level.
//
// **BOTH CLINICAL VARIABLES ARE AGE-GATED AT 35, AND THE CONSEQUENCE IS A DOCUMENTED LIMITATION THIS TILE
// CARRIES.** Hypertension and a first urologic event count only if they occurred BEFORE age 35. A later
// analysis notes the consequence directly: the score may not help identify rapid progression in patients
// under 35 unless they are ALREADY hypertensive and have already had urologic complications. The instrument
// is therefore least informative in exactly the young patients a clinician most wants to stratify, and the
// result says so when the patient is under 35.
//
// A UROLOGIC EVENT MEANS SOMETHING SPECIFIC HERE: gross hematuria, cyst infection, or flank pain related to
// cysts. It is not any urological problem.
//
// BAND BOUNDARY NOTE. The low-risk band is 0 to 3. One widely circulated slide renders the band strip
// starting at 1, which would leave a score of 0 unbanded; the paper says 0 to 3, and that is used here
// (spec-v97).
//
// THE PREDICTIVE VALUES COME FROM A DIFFERENT PAPER FROM THE SCORE. The negative predictive value of 81.4
// percent for reaching end-stage renal disease before 60, and the positive predictive value of 90.9
// percent, are quoted from a separate review rather than from the derivation paper, and are labeled as such.
//
// HIGH-STAKES: this predicts the AGE AT WHICH end-stage renal disease is reached, at a group level. The
// band medians are population figures, not a forecast for the patient in front of you, and the spread
// around them is wide. It does NOT diagnose ADPKD and does not measure current kidney function -- a
// high-risk score says nothing about today's eGFR. It is not by itself an indication for a vasopressin
// receptor antagonist or for any other treatment, and it does not decide transplant or dialysis timing
// (spec-v11 section 5.3). The nephrology decision stays with the clinician.
//
// VARIABLES, WEIGHTS AND BANDS RE-FETCHED, NEVER RECALLED (spec-v97), transcribed from the derivation
// paper's own abstract and an independent reproduction of the scoring table that agrees on every weight and
// every band:
//   - Cornec-Le Gall E, Audrezet MP, Rousseau A, et al. The PROPKD score: a new algorithm to predict renal
//     survival in autosomal dominant polycystic kidney disease. J Am Soc Nephrol. 2016;27(3):942-951.

export const MUTATION_CATEGORIES = [
  { value: 'pkd2', points: 0, text: 'PKD2 mutation found' },
  { value: 'pkd1-nontruncating', points: 2, text: 'Non-truncating PKD1 mutation' },
  { value: 'pkd1-truncating', points: 4, text: 'Truncating PKD1 mutation' },
];

export const CLINICAL_VARIABLES = [
  { key: 'male', points: 1, text: 'Male sex' },
  { key: 'earlyHypertension', points: 2, text: 'Hypertension before 35 years of age' },
  { key: 'earlyUrologicEvent', points: 2, text: 'First urologic event before 35 years of age' },
];

export const UROLOGIC_EVENT_DEFINITION = 'A urologic event means gross hematuria, cyst infection, or flank pain related to cysts. It is not any urological problem.';

export const PROPKD_MAX = 9;
export const AGE_GATE = 35;

const BANDS = [
  { max: 3, label: 'Low risk', medianEsrdAge: 70.6 },
  { max: 6, label: 'Intermediate risk', medianEsrdAge: 56.9 },
  { max: PROPKD_MAX, label: 'High risk', medianEsrdAge: 49 },
];

const GENOTYPE_TEXT = 'The mutation category is required and has no "not tested" option: scoring 0 asserts that a PKD2 mutation was FOUND, which is not the same as an unknown genotype. A patient who has not been genotyped has no PROPKD score, because the variable is missing rather than zero.';

const AGE_GATE_TEXT = `Both clinical variables are gated at age ${AGE_GATE}: hypertension and a first urologic event count only if they occurred BEFORE that age.`;

const YOUNG_PATIENT_CAVEAT = `This patient is under ${AGE_GATE}. A later analysis notes that the score may not help identify rapid progression below that age unless the patient is ALREADY hypertensive and has ALREADY had urologic complications, so the instrument is least informative in exactly the young patients one most wants to stratify.`;

const PREDICTIVE_VALUES = 'A negative predictive value of 81.4 percent for eliminating progression to end-stage renal disease before 60, and a positive predictive value of 90.9 percent for forecasting it, are quoted from a separate review rather than from the derivation paper.';

const BAND_NOTE = 'The low-risk band runs 0 to 3. One widely circulated slide draws the band strip starting at 1, which would leave a score of 0 unbanded; the paper is followed here.';

const NOTE = 'The PROPKD score (Cornec-Le Gall and colleagues 2016) predicts renal survival in autosomal dominant polycystic kidney disease from four variables, totalling 0 to 9: male sex 1 point, hypertension before 35 years of age 2 points, a first urologic event before 35 years of age 2 points, and the mutation, scoring 0 for PKD2, 2 for a non-truncating PKD1 mutation and 4 for a truncating PKD1 mutation. It is a companion to the Mayo imaging classification rather than a duplicate: that stratifies from kidney volume on a scan while this stratifies from genotype and clinical history and needs no imaging, and the two disagree on real patients. The bands are 0 to 3 low risk, 4 to 6 intermediate and 7 to 9 high, with median ages for end-stage renal disease of 70.6, 56.9 and 49 years respectively. The mutation term is a single categorical variable worth up to four of the nine points, so a truncating PKD1 mutation alone reaches the intermediate band before any clinical variable is counted. The PKD2 level scores zero but is an explicit finding, not an absence: scoring it asserts that PKD2 was found, and a patient who has not been genotyped has no PROPKD score at all because the variable is missing rather than zero. The score is also inapplicable to patients in whom no PKD1 or PKD2 mutation was found, since no category exists for them. Both clinical variables are age-gated at 35, and a later analysis notes the consequence directly: the score may not help identify rapid progression in patients under 35 unless they are already hypertensive and have already had urologic complications, so the instrument is least informative in exactly the young patients one most wants to stratify. A urologic event means gross hematuria, cyst infection, or flank pain related to cysts, not any urological problem. The negative predictive value of 81.4 percent and positive predictive value of 90.9 percent for end-stage renal disease before 60 come from a separate review rather than from the derivation paper. This predicts the age at which end-stage renal disease is reached at a group level, and the band medians are population figures rather than a forecast for an individual, with wide spread around them. It does not diagnose ADPKD and does not measure current kidney function, so a high-risk score says nothing about today’s estimated glomerular filtration rate. It is not by itself an indication for a vasopressin receptor antagonist or any other treatment, and it does not decide transplant or dialysis timing.';

function readBool(v) {
  if (v === '' || v === null || v === undefined) return null;
  if (v === true || v === 1) return true;
  if (v === false || v === 0) return false;
  const s = String(v).trim().toLowerCase();
  if (['yes', 'y', '1', 'true'].includes(s)) return true;
  if (['no', 'n', '0', 'false'].includes(s)) return false;
  return NaN;
}

// input:
//   mutation           -- 'pkd2', 'pkd1-nontruncating' or 'pkd1-truncating'. REQUIRED, no unknown option.
//   male               -- yes/no.
//   earlyHypertension  -- yes/no, hypertension before age 35.
//   earlyUrologicEvent -- yes/no, first urologic event before age 35.
//   age                -- optional, years. Only used to attach the under-35 caveat.
export function propkd(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const rawMutation = o.mutation;
  if (rawMutation === '' || rawMutation === null || rawMutation === undefined) {
    return { valid: false, message: `Choose the mutation category. ${GENOTYPE_TEXT} The score is also inapplicable when no PKD1 or PKD2 mutation was found, because no category exists for that.` };
  }
  const mutation = MUTATION_CATEGORIES.find((m) => m.value === String(rawMutation).trim().toLowerCase());
  if (!mutation) {
    return { valid: false, message: `The mutation category must be one of: ${MUTATION_CATEGORIES.map((m) => m.value).join(', ')}. There is no option for an untested or mutation-negative patient, who has no PROPKD score.` };
  }

  const read = CLINICAL_VARIABLES.map((v) => ({ v, value: readBool(o[v.key]) }));
  const missing = read.filter((r) => r.value === null);
  if (missing.length) {
    return { valid: false, message: `Answer every clinical variable. ${AGE_GATE_TEXT} Still needed: ${missing.map((r) => r.v.key).join(', ')}.` };
  }
  const bad = read.filter((r) => Number.isNaN(r.value));
  if (bad.length) {
    return { valid: false, message: `Each clinical variable must be yes or no. Unrecognized: ${bad.map((r) => r.v.key).join(', ')}.` };
  }

  let age = null;
  const rawAge = o.age;
  if (rawAge !== '' && rawAge !== null && rawAge !== undefined) {
    const n = Number(String(rawAge).trim());
    if (!Number.isFinite(n) || n < 0 || n > 120) {
      return { valid: false, message: 'Age, if given, must be a number of years between 0 and 120. It does not enter the score and is used only to flag the under-35 limitation.' };
    }
    age = n;
  }

  const clinicalPoints = read.filter((r) => r.value).reduce((a, r) => a + r.v.points, 0);
  const total = clinicalPoints + mutation.points;
  const band = BANDS.find((b) => total <= b.max);
  const youngPatient = age !== null && age < AGE_GATE;

  return {
    valid: true,
    total,
    max: PROPKD_MAX,
    mutation: mutation.value,
    mutationPoints: mutation.points,
    clinicalPoints,
    band: band.label,
    medianEsrdAge: band.medianEsrdAge,
    youngPatient,
    bandLabel: `PROPKD ${total} of ${PROPKD_MAX}, ${band.label.toLowerCase()}`,
    bandText: `PROPKD ${total} of ${PROPKD_MAX}: ${band.label.toLowerCase()}. The reported median age for end-stage renal disease in this band is ${band.medianEsrdAge} years, which is a population figure rather than a forecast for an individual. Mutation contributed ${mutation.points} of the ${total}. ${GENOTYPE_TEXT} ${AGE_GATE_TEXT} ${UROLOGIC_EVENT_DEFINITION}${youngPatient ? ` ${YOUNG_PATIENT_CAVEAT}` : ''} ${BAND_NOTE} ${PREDICTIVE_VALUES} This does not measure current kidney function and is not an indication for treatment.`,
    note: NOTE,
  };
}
