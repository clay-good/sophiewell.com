// spec-v311: Acute cholecystitis severity grade (Tokyo Guidelines TG18/TG13) — the
// companion to the spec-v310 acute cholangitis grade. Grade I (mild) / II (moderate)
// / III (severe) from the organ-dysfunction and moderate criteria the clinician has
// determined. The Grade III organ dysfunctions are identical to cholangitis, but the
// Grade II definition differs: acute cholecystitis is Grade II if ANY ONE (not two)
// of four cholecystitis-specific moderate criteria is present.
//
// This reports the classification's own grade, NOT an operative or drainage order
// (spec-v11 §5.3) — the timing of cholecystectomy or gallbladder drainage stays with
// the clinician.
//
// CRITERIA RE-FETCHED, NEVER RECALLED (spec-v97), transcribed verbatim from Table 4
// (TG18/TG13 severity grading for acute cholecystitis) of:
//   - Miura F, Okamoto K, Takada T, et al. Tokyo Guidelines 2018: initial management
//     of acute biliary infection and flowchart for acute cholangitis. J Hepatobiliary
//     Pancreat Sci. 2018;25(1):31-40 (Table 4, cited from Yokoe et al.).
//   - Yokoe M, Hata J, Takada T, et al. Tokyo Guidelines 2018: diagnostic criteria
//     and severity grading of acute cholecystitis. J Hepatobiliary Pancreat Sci.
//     2018;25(1):41-54 (the source of Table 4).

const ROMAN = { 1: 'I', 2: 'II', 3: 'III' };
const GRADE_WORD = { 1: 'mild', 2: 'moderate', 3: 'severe' };

// The six Grade III organ/system dysfunctions — any one present makes it Grade III
// (identical to the acute cholangitis grade).
const ORGAN_KEYS = [
  ['cardiovascular', 'cardiovascular (hypotension needing dopamine >= 5 ug/kg/min or any norepinephrine)'],
  ['neurological', 'neurological (decreased level of consciousness)'],
  ['respiratory', 'respiratory (PaO2/FiO2 ratio < 300)'],
  ['renal', 'renal (oliguria or serum creatinine > 2.0 mg/dL)'],
  ['hepatic', 'hepatic (PT-INR > 1.5)'],
  ['hematological', 'hematological (platelet count < 100,000/mm3)'],
];
// The four Grade II moderate criteria — any one present makes it (at least) Grade II.
const MODERATE_KEYS = [
  ['elevatedWbc', 'elevated WBC count (> 18,000/mm3)'],
  ['tenderMass', 'palpable tender mass in the right upper abdominal quadrant'],
  ['durationOver72h', 'duration of complaints > 72 h'],
  ['markedInflammation', 'marked local inflammation (gangrenous or emphysematous cholecystitis, pericholecystic/hepatic abscess, or biliary peritonitis)'],
];

const NOTE = 'Acute cholecystitis severity (Tokyo Guidelines TG18/TG13, Yokoe 2018). Grade III (severe): any one new-onset organ dysfunction — cardiovascular (dopamine >= 5 ug/kg/min or any norepinephrine), neurological (decreased consciousness), respiratory (PaO2/FiO2 < 300), renal (oliguria or creatinine > 2.0 mg/dL), hepatic (PT-INR > 1.5), or hematological (platelets < 100,000/mm3). Grade II (moderate): any one of WBC > 18,000/mm3, a palpable tender RUQ mass, duration > 72 h, or marked local inflammation (gangrenous/emphysematous cholecystitis, pericholecystic or hepatic abscess, biliary peritonitis). Grade I (mild): neither, in an otherwise healthy patient — cholecystectomy is a safe, low-risk procedure. This reports the classification grade, not an operative or drainage order, which stays with the clinician.';

// input booleans (each defaults false): cardiovascular, neurological, respiratory,
// renal, hepatic, hematological (Grade III organ dysfunctions); elevatedWbc,
// tenderMass, durationOver72h, markedInflammation (Grade II moderate criteria).
// Returns the TG18 acute cholecystitis severity grade (1-3) with the fired criteria.
export function cholecystitisSeverity(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const organs = ORGAN_KEYS.filter(([k]) => o[k] === true).map(([, label]) => label);
  const moderate = MODERATE_KEYS.filter(([k]) => o[k] === true).map(([, label]) => label);

  let grade;
  if (organs.length >= 1) grade = 3;
  else if (moderate.length >= 1) grade = 2;
  else grade = 1;

  const severe = grade === 3;
  const label = `Grade ${ROMAN[grade]} (${GRADE_WORD[grade]}) acute cholecystitis`;

  let band;
  if (grade === 3) {
    band = `${label} — ${organs.length} organ dysfunction${organs.length === 1 ? '' : 's'}: ${organs.join('; ')}.`;
  } else if (grade === 2) {
    band = `${label} — ${moderate.length} moderate criteri${moderate.length === 1 ? 'on' : 'a'}: ${moderate.join('; ')}.`;
  } else {
    band = `${label} — no organ dysfunction and no moderate criteria; cholecystectomy is a safe, low-risk procedure.`;
  }

  return {
    valid: true,
    grade,
    gradeRoman: ROMAN[grade],
    organCount: organs.length,
    moderateCount: moderate.length,
    organs,
    moderate,
    severe,
    abnormal: grade >= 2,
    bandLabel: label,
    band,
    note: NOTE,
  };
}
