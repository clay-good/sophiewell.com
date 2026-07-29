// spec-v598: the Japan Thyroid Association (JTA) diagnostic criteria for thyroid storm. A COMPANION WITH A
// DIFFERENT CONSTRUCTION to `burch-wartofsky`, already in the catalog: the Burch-Wartofsky Point Scale is a
// WEIGHTED POINT SCALE read against a threshold, while these are CATEGORICAL COMBINATION RULES. The two are
// the pair used worldwide, and they are known to disagree. Every slug spelling and filename search returned
// 0.
//
// **CENTRAL NERVOUS SYSTEM MANIFESTATIONS ARE PRIVILEGED, AND NOTHING ELSE IS.** With a CNS manifestation
// present, ONE other feature is enough for TS1. Without one, THREE are required. No other feature in the set
// carries that weight, so a patient with fever and tachycardia alone is TS2 while a patient with delirium
// and fever alone is TS1. This asymmetry is the whole architecture of the criteria and an implementation
// that counts features equally will get it wrong in both directions.
//
// **TS1 AND TS2 ARE DEFINITE AND SUSPECTED, NOT MILD AND SEVERE.** They are grades of DIAGNOSTIC CERTAINTY,
// not of severity. A TS2 patient is not less sick than a TS1 patient; the criteria are less sure.
//
// **TS2 HAS A SECOND ROUTE THAT IS "TS1 WITHOUT LABORATORY CONFIRMATION".** A patient who meets the TS1
// pattern but whose thyroid function tests are unavailable, with clinical evidence of thyroid disease, is
// TS2 rather than TS1. THE SAME CLINICAL PICTURE DROPS A GRADE PURELY ON WHETHER A BLOOD TEST HAS COME BACK.
// This lib models that route explicitly rather than refusing to compute.
//
// **THYROTOXICOSIS IS A PREREQUISITE, NOT A SCORED ITEM.** No combination of features qualifies without an
// elevated free T3 or free T4 -- with the single exception of that TS2 no-laboratory route.
//
// **THE HEART-FAILURE CRITERION IS SET AT A SEVERE LEVEL, NOT AT ANY HEART FAILURE.** It means pulmonary
// edema, moist rales over more than half the lung fields, or cardiogenic shock, corresponding to New York
// Heart Association class IV or Killip class III or above. Counting mild decompensation here over-diagnoses.
//
// **THE EXCLUSION CLAUSE IS DELIBERATELY NOT MECHANICAL.** The source says conditions clearly causing the
// symptoms -- pneumonia causing fever, a psychiatric disorder causing altered consciousness, myocardial
// infarction causing heart failure, viral hepatitis causing liver dysfunction -- warrant exclusion, AND THEN
// says those same conditions may themselves TRIGGER thyroid storm, so the judgment cannot be automated. This
// tool therefore asks the question and reports the answer; it does not decide it.
//
// **ONE OPERATOR DIVERGES BETWEEN REPRODUCTIONS.** The bilirubin element of the gastrointestinal and hepatic
// criterion is printed as "above 3 mg/dL" in one source and "3.0 mg/dL or more" in another; they differ only
// at exactly 3.0. The at-or-above reading is applied here and the divergence is stated (spec-v97).
//
// HIGH-STAKES: thyroid storm is a life-threatening emergency with mortality above 10 percent. These criteria
// classify; they do NOT treat. They do not select or sequence thionamides, iodine, beta-blockade or
// corticosteroids, do not indicate the order in which iodine must follow a thionamide, and do not decide on
// intensive care. FAILING THE CRITERIA DOES NOT EXCLUDE THYROID STORM, and treatment of a patient who looks
// like they are in storm should not wait for a criteria set or for thyroid function tests to return
// (spec-v11 section 5.3).
//
// CRITERIA AND COMBINATION RULES RE-FETCHED AND DOUBLE-CONFIRMED ACROSS TWO INDEPENDENT SOURCES, NEVER
// RECALLED (spec-v97):
//   - Akamizu T, Satoh T, Isozaki O, et al. Diagnostic criteria, clinical features, and incidence of thyroid
//     storm based on nationwide surveys. Thyroid. 2012;22(7):661-679.

export const FEVER_THRESHOLD_C = 38;
export const TACHYCARDIA_THRESHOLD = 130;      // beats per minute
export const BILIRUBIN_THRESHOLD = 3.0;        // mg/dL, at or above
export const GCS_THRESHOLD = 14;               // 14 or below
export const TS1_FEATURES_WITH_CNS = 1;
export const TS1_FEATURES_WITHOUT_CNS = 3;
export const TS2_FEATURES = 2;

export const CNS_DESCRIPTION = 'Restlessness, delirium, mental aberration or psychosis, somnolence or lethargy, convulsion, or coma - equivalently a Glasgow Coma Scale of 14 or below, or a Japan Coma Scale of 1 or above.';
export const CHF_DESCRIPTION = `Pulmonary edema, moist rales over more than half the lung fields, or cardiogenic shock - New York Heart Association class IV or Killip class III or above. NOT any heart failure.`;
export const GI_DESCRIPTION = `Nausea, vomiting, diarrhea, or a total bilirubin of ${BILIRUBIN_THRESHOLD} mg/dL or more.`;

export const NON_CNS_FEATURES = [
  { key: 'fever', text: `Fever of ${FEVER_THRESHOLD_C} degrees C or higher` },
  { key: 'tachycardia', text: `Heart rate of ${TACHYCARDIA_THRESHOLD} beats per minute or more` },
  { key: 'heartFailure', text: 'Congestive heart failure at a severe level' },
  { key: 'giHepatic', text: 'Gastrointestinal or hepatic disturbance' },
];

export const CNS_PRIVILEGE_NOTE = `Central nervous system manifestations are PRIVILEGED and nothing else is: with one present, ${TS1_FEATURES_WITH_CNS} other feature is enough for TS1; without one, ${TS1_FEATURES_WITHOUT_CNS} are required. A patient with fever and tachycardia alone is TS2, while a patient with delirium and fever alone is TS1.`;
export const GRADE_NOTE = 'TS1 and TS2 are DEFINITE and SUSPECTED - grades of diagnostic CERTAINTY, not of severity. A TS2 patient is not less sick than a TS1 patient; the criteria are less sure.';
export const NO_LABS_NOTE = 'TS2 has a second route that is "TS1 without laboratory confirmation": a patient meeting the TS1 pattern whose thyroid function tests are unavailable, with clinical evidence of thyroid disease, is TS2 rather than TS1. The same clinical picture drops a grade purely on whether a blood test has come back.';
export const EXCLUSION_NOTE = 'The exclusion clause is deliberately NOT mechanical. The source says conditions clearly causing the symptoms warrant exclusion, and then says those same conditions may themselves TRIGGER thyroid storm, so the judgment cannot be automated. This tool asks the question and reports the answer; it does not decide it.';
export const BILIRUBIN_OPERATOR_NOTE = `One operator diverges between reproductions: the bilirubin element is printed as "above ${BILIRUBIN_THRESHOLD} mg/dL" in one source and "${BILIRUBIN_THRESHOLD} mg/dL or more" in another, differing only at exactly ${BILIRUBIN_THRESHOLD}. The at-or-above reading is applied here.`;
export const COMPANION_NOTE = 'The Burch-Wartofsky Point Scale in this catalog answers the same question with a different construction: a weighted POINT SCALE read against a threshold, against these CATEGORICAL COMBINATION RULES. The two are known to disagree, and a Burch-Wartofsky total cannot be converted into a JTA grade.';

const NOTE = `The Japan Thyroid Association criteria (Akamizu and colleagues 2012) grade thyroid storm as TS1 or TS2. Thyrotoxicosis, meaning an elevated free T3 or free T4, is a PREREQUISITE rather than a scored item. The features are central nervous system manifestations, fever of ${FEVER_THRESHOLD_C} degrees C or higher, a heart rate of ${TACHYCARDIA_THRESHOLD} or more, congestive heart failure at a severe level, and gastrointestinal or hepatic disturbance. TS1 is thyrotoxicosis plus at least one CNS manifestation plus at least ${TS1_FEATURES_WITH_CNS} of the other four, OR thyrotoxicosis plus at least ${TS1_FEATURES_WITHOUT_CNS} of the other four. TS2 is thyrotoxicosis plus at least ${TS2_FEATURES} of the other four, or a patient meeting the TS1 pattern whose thyroid function tests are unavailable but who has clinical evidence of thyroid disease. Central nervous system manifestations are privileged and nothing else is, so a patient with fever and tachycardia alone is TS2 while a patient with delirium and fever alone is TS1. TS1 and TS2 are definite and suspected, grades of diagnostic certainty and not of severity, so a TS2 patient is not less sick. The heart-failure criterion means pulmonary edema, moist rales over more than half the lung fields, or cardiogenic shock, corresponding to New York Heart Association class IV or Killip class III or above, and counting mild decompensation over-diagnoses. The exclusion clause is deliberately not mechanical, because the conditions that would explain the symptoms may themselves trigger thyroid storm. The Burch-Wartofsky Point Scale in this catalog answers the same question with a weighted point scale rather than combination rules, the two are known to disagree, and a total cannot be converted into a grade. Thyroid storm is a life-threatening emergency with mortality above 10 percent. These criteria classify and do not treat: they do not select or sequence thionamides, iodine, beta-blockade or corticosteroids, do not indicate that iodine must follow a thionamide, and do not decide on intensive care. Failing the criteria does not exclude thyroid storm, and treatment of a patient who looks to be in storm should not wait for a criteria set or for thyroid function tests to return.`;

function readBool(v, name) {
  if (v === '' || v === null || v === undefined) return null;
  const s = String(v).trim().toLowerCase();
  if (['yes', 'y', 'true', '1'].includes(s)) return true;
  if (['no', 'n', 'false', '0'].includes(s)) return false;
  throw new Error(`${name} must be yes or no.`);
}

// input: thyrotoxicosis ('confirmed' | 'labs-unavailable' | 'absent'), clinicalThyroidDisease,
// cnsManifestation, fever, tachycardia, heartFailure, giHepatic, alternativeCauseExcluded.
export function jtaThyroidStorm(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const THYRO = ['confirmed', 'labs-unavailable', 'absent'];
  let thyro, clinicalDisease, cns, features, excluded;
  try {
    thyro = o.thyrotoxicosis === '' || o.thyrotoxicosis === undefined || o.thyrotoxicosis === null
      ? null : String(o.thyrotoxicosis).trim();
    if (thyro !== null && !THYRO.includes(thyro)) {
      throw new Error(`Thyrotoxicosis must be one of: ${THYRO.join(', ')}.`);
    }
    cns = readBool(o.cnsManifestation, 'CNS manifestation');
    features = NON_CNS_FEATURES.map((f) => ({ f, v: readBool(o[f.key], f.text) }));
    clinicalDisease = readBool(o.clinicalThyroidDisease, 'Clinical evidence of thyroid disease');
    excluded = readBool(o.alternativeCauseExcluded, 'Alternative cause excluded');
  } catch (err) {
    return { valid: false, message: err.message };
  }
  const missing = [];
  if (thyro === null) missing.push('thyrotoxicosis');
  if (cns === null) missing.push('cnsManifestation');
  missing.push(...features.filter((x) => x.v === null).map((x) => x.f.key));
  if (clinicalDisease === null) missing.push('clinicalThyroidDisease');
  if (excluded === null) missing.push('alternativeCauseExcluded');
  if (missing.length) {
    return { valid: false, message: `Answer every item. Still needed: ${missing.join(', ')}. Thyrotoxicosis is a PREREQUISITE, not a scored item.` };
  }

  const met = features.filter((x) => x.v).map((x) => x.f.key);
  const count = met.length;

  // The TS1 pattern, evaluated independently of laboratory availability.
  const meetsTs1Pattern = (cns && count >= TS1_FEATURES_WITH_CNS) || (count >= TS1_FEATURES_WITHOUT_CNS);
  const meetsTs2Pattern = count >= TS2_FEATURES;

  let grade = 'Neither TS1 nor TS2';
  let viaNoLabsRoute = false;
  if (thyro === 'confirmed') {
    if (meetsTs1Pattern) grade = 'TS1';
    else if (meetsTs2Pattern) grade = 'TS2';
  } else if (thyro === 'labs-unavailable') {
    if (meetsTs1Pattern && clinicalDisease) { grade = 'TS2'; viaNoLabsRoute = true; }
  }

  const parts = [];
  parts.push(grade === 'Neither TS1 nor TS2'
    ? `Does not meet TS1 or TS2. ${cns ? 'A CNS manifestation is present' : 'No CNS manifestation'}, with ${count} of the other four features.`
    : `${grade}${grade === 'TS1' ? ' (DEFINITE thyroid storm)' : ' (SUSPECTED thyroid storm)'}. ${cns ? 'A CNS manifestation is present' : 'No CNS manifestation'}, with ${count} of the other four features${met.length ? ` (${met.join(', ')})` : ''}.`);
  if (viaNoLabsRoute) {
    parts.push(`THIS IS TS2 THROUGH THE NO-LABORATORY ROUTE, NOT THROUGH THE FEATURE COUNT. The clinical picture meets the TS1 pattern, but thyroid function tests are unavailable, so the grade drops to TS2. ${NO_LABS_NOTE}`);
  }
  if (thyro === 'absent') {
    parts.push('Thyrotoxicosis is a PREREQUISITE and is recorded as absent, so neither grade can be met however many features are present.');
  }
  parts.push(CNS_PRIVILEGE_NOTE);
  if (!cns && count === TS1_FEATURES_WITHOUT_CNS - 1 && thyro === 'confirmed') {
    parts.push(`Note the asymmetry directly: with ${count} features and no CNS manifestation this is TS2, and a single CNS manifestation would have made the same patient TS1.`);
  }
  parts.push(GRADE_NOTE);
  parts.push(`Heart failure here means: ${CHF_DESCRIPTION}`);
  parts.push(`Gastrointestinal or hepatic disturbance means: ${GI_DESCRIPTION} ${BILIRUBIN_OPERATOR_NOTE}`);
  parts.push(excluded
    ? `An alternative cause has been considered and excluded. ${EXCLUSION_NOTE}`
    : `AN ALTERNATIVE CAUSE HAS NOT BEEN EXCLUDED. ${EXCLUSION_NOTE}`);
  parts.push(COMPANION_NOTE);
  parts.push('Thyroid storm is a life-threatening emergency. These criteria classify and do not treat, and FAILING THEM DOES NOT EXCLUDE THYROID STORM: treatment of a patient who looks to be in storm should not wait for a criteria set or for thyroid function tests to return.');

  return {
    valid: true,
    grade,
    meetsTs1: grade === 'TS1',
    meetsTs2: grade === 'TS2',
    cnsManifestation: cns,
    otherFeatureCount: count,
    metFeatures: met,
    viaNoLabsRoute,
    alternativeCauseExcluded: excluded,
    band: grade,
    bandLabel: `${grade}${cns ? ', CNS present' : ''} (${count} of 4 other features)`,
    bandText: parts.join(' '),
    note: NOTE,
  };
}
