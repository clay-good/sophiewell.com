// spec-v310: Acute cholangitis severity grade (Tokyo Guidelines TG18/TG13) — the
// Grade I (mild) / II (moderate) / III (severe) classification from the organ-
// dysfunction and moderate criteria the clinician has determined (a catalog gap
// surfaced by the SESSION-40 biliary probe: no Tokyo-Guidelines tile existed).
// Used constantly on acute-care and hepatobiliary services; the companion acute-
// cholecystitis grade is a separate TG18 scale (spec-v11 §5.3 companion pattern).
//
// This reports the classification's own grade, NOT a treatment/drainage order
// (spec-v11 §5.3) — the timing of biliary drainage and antibiotics stays with the
// clinician. Grade III is defined by new-onset organ dysfunction; Grade II by any
// two moderate criteria at initial diagnosis; Grade I is neither.
//
// CRITERIA RE-FETCHED, NEVER RECALLED (spec-v97), transcribed verbatim from Table 3
// (TG18/TG13 severity assessment criteria for acute cholangitis) of:
//   - Miura F, Okamoto K, Takada T, et al. Tokyo Guidelines 2018: initial management
//     of acute biliary infection and flowchart for acute cholangitis. J Hepatobiliary
//     Pancreat Sci. 2018;25(1):31-40 (Table 3, cited from Kiriyama et al.).
//   - Kiriyama S, Kozaka K, Takada T, et al. Tokyo Guidelines 2018: diagnostic
//     criteria and severity grading of acute cholangitis. J Hepatobiliary Pancreat
//     Sci. 2018;25(1):17-30 (the source of Table 3).

const ROMAN = { 1: 'I', 2: 'II', 3: 'III' };
const GRADE_WORD = { 1: 'mild', 2: 'moderate', 3: 'severe' };

// The six Grade III organ/system dysfunctions — any one present makes it Grade III.
const ORGAN_KEYS = [
  ['cardiovascular', 'cardiovascular (hypotension needing dopamine >= 5 ug/kg/min or any norepinephrine)'],
  ['neurological', 'neurological (disturbance of consciousness)'],
  ['respiratory', 'respiratory (PaO2/FiO2 ratio < 300)'],
  ['renal', 'renal (oliguria or serum creatinine > 2.0 mg/dL)'],
  ['hepatic', 'hepatic (PT-INR > 1.5)'],
  ['hematological', 'hematological (platelet count < 100,000/mm3)'],
];
// The five Grade II moderate criteria — any two present make it (at least) Grade II.
const MODERATE_KEYS = [
  ['abnormalWbc', 'abnormal WBC count (> 12,000 or < 4,000/mm3)'],
  ['highFever', 'high fever (>= 39 C)'],
  ['age', 'age >= 75 years'],
  ['hyperbilirubinemia', 'hyperbilirubinemia (total bilirubin >= 5 mg/dL)'],
  ['hypoalbuminemia', 'hypoalbuminemia (albumin < 0.7 x lower limit of normal)'],
];

const NOTE = 'Acute cholangitis severity (Tokyo Guidelines TG18/TG13, Kiriyama 2018). Grade III (severe): any one new-onset organ dysfunction — cardiovascular (dopamine >= 5 ug/kg/min or any norepinephrine), neurological (disturbed consciousness), respiratory (PaO2/FiO2 < 300), renal (oliguria or creatinine > 2.0 mg/dL), hepatic (PT-INR > 1.5), or hematological (platelets < 100,000/mm3). Grade II (moderate): any two of abnormal WBC (> 12,000 or < 4,000), fever >= 39 C, age >= 75, total bilirubin >= 5 mg/dL, or albumin < 0.7 x lower limit of normal. Grade I (mild): neither at initial diagnosis. TG18 recommends urgent/early biliary drainage for Grade III/II. This reports the classification grade, not a drainage or antibiotic order, which stays with the clinician.';

// input booleans (each defaults false): cardiovascular, neurological, respiratory,
// renal, hepatic, hematological (Grade III organ dysfunctions); abnormalWbc,
// highFever, age, hyperbilirubinemia, hypoalbuminemia (Grade II moderate criteria).
// Returns the TG18 acute cholangitis severity grade (1-3) with the fired criteria.
export function cholangitisSeverity(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const organs = ORGAN_KEYS.filter(([k]) => o[k] === true).map(([, label]) => label);
  const moderate = MODERATE_KEYS.filter(([k]) => o[k] === true).map(([, label]) => label);

  let grade;
  if (organs.length >= 1) grade = 3;
  else if (moderate.length >= 2) grade = 2;
  else grade = 1;

  const severe = grade === 3;
  const label = `Grade ${ROMAN[grade]} (${GRADE_WORD[grade]}) acute cholangitis`;

  let band;
  if (grade === 3) {
    band = `${label} — ${organs.length} organ dysfunction${organs.length === 1 ? '' : 's'}: ${organs.join('; ')}.`;
  } else if (grade === 2) {
    band = `${label} — ${moderate.length} moderate criteria: ${moderate.join('; ')}.`;
  } else {
    const n = moderate.length;
    band = n === 0
      ? `${label} — no organ dysfunction and no moderate criteria.`
      : `${label} — no organ dysfunction and only ${n} moderate criterion (2 needed for Grade II): ${moderate.join('; ')}.`;
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
