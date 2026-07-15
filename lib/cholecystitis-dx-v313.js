// spec-v313: Acute cholecystitis DIAGNOSIS (Tokyo Guidelines TG18/TG13 diagnostic
// criteria) — the diagnostic companion to the spec-v311 severity grade, and the
// fourth tile of the TG18 biliary quartet (cholangitis + cholecystitis, each with a
// diagnosis and a severity grade). Classifies a presentation as "definite",
// "suspected", or "does not meet criteria" from the three diagnostic categories.
//
// This reports the classification's own diagnostic category, NOT a diagnosis or an
// order (spec-v11 §5.3) — the diagnosis stays with the clinician, who has already
// determined each item (Murphy's sign, fever, imaging, etc.) at the bedside.
//
// CRITERIA RE-FETCHED, NEVER RECALLED (spec-v97), transcribed verbatim from Table 2
// (TG18/TG13 diagnostic criteria for acute cholecystitis) of:
//   - Miura F, Okamoto K, Takada T, et al. Tokyo Guidelines 2018: initial management
//     of acute biliary infection and flowchart for acute cholangitis. J Hepatobiliary
//     Pancreat Sci. 2018;25(1):31-40 (Table 2, cited from Yokoe et al.).
//   - Yokoe M, Hata J, Takada T, et al. Tokyo Guidelines 2018: diagnostic criteria
//     and severity grading of acute cholecystitis. J Hepatobiliary Pancreat Sci.
//     2018;25(1):41-54 (the source of Table 2).

// Category A (local signs of inflammation): Murphy's sign, RUQ mass/pain/tenderness.
const A_KEYS = [
  ['murphy', "A Murphy's sign"],
  ['ruq', 'A right-upper-quadrant mass, pain, or tenderness'],
];
// Category B (systemic signs of inflammation): fever, elevated CRP, elevated WBC.
const B_KEYS = [
  ['fever', 'B fever'],
  ['elevatedCrp', 'B elevated CRP'],
  ['elevatedWbc', 'B elevated WBC count'],
];
// Category C (imaging findings): findings characteristic of acute cholecystitis.
const C_KEY = ['imaging', 'C imaging findings characteristic of acute cholecystitis'];

const NOTE = 'Acute cholecystitis diagnosis (Tokyo Guidelines TG18/TG13, Yokoe 2018). Category A (local signs): Murphy’s sign, or RUQ mass/pain/tenderness. Category B (systemic signs): fever, elevated CRP, or elevated WBC. Category C (imaging): findings characteristic of acute cholecystitis. Suspected diagnosis: one item in A + one item in B. Definite diagnosis: one item in A + one item in B + C. Acute hepatitis, other acute abdominal diseases, and chronic cholecystitis should be excluded. This reports the diagnostic category, not a diagnosis or an order, which stays with the clinician.';

// input booleans (each defaults false): murphy, ruq (category A); fever, elevatedCrp,
// elevatedWbc (category B); imaging (category C). Returns the TG18 diagnostic
// category: definite / suspected / not met.
export function cholecystitisDiagnosis(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const a = A_KEYS.filter(([k]) => o[k] === true).map(([, label]) => label);
  const b = B_KEYS.filter(([k]) => o[k] === true).map(([, label]) => label);
  const hasA = a.length >= 1, hasB = b.length >= 1, hasC = o[C_KEY[0]] === true;
  const c = hasC ? [C_KEY[1]] : [];

  let category, definite, suspected;
  if (hasA && hasB && hasC) { category = 'definite'; definite = true; suspected = false; }
  else if (hasA && hasB) { category = 'suspected'; definite = false; suspected = true; }
  else { category = 'not met'; definite = false; suspected = false; }

  const label = definite ? 'Definite acute cholecystitis'
    : suspected ? 'Suspected acute cholecystitis'
    : 'Does not meet TG18 criteria for acute cholecystitis';

  const fired = [...a, ...b, ...c];
  let band;
  if (definite) {
    band = `${label} (TG18) — one item in A (local signs), one in B (systemic signs), and C (imaging): ${fired.join('; ')}.`;
  } else if (suspected) {
    band = `${label} (TG18) — one item in A plus one in B (definite adds a characteristic imaging finding): ${fired.join('; ')}.`;
  } else {
    const have = fired.length ? `only: ${fired.join('; ')}` : 'no criteria selected';
    band = `${label} — suspected needs one item in A (local signs) plus one in B (systemic signs) (${have}).`;
  }

  return {
    valid: true,
    category,
    definite,
    suspected,
    hasA,
    hasB,
    hasC,
    abnormal: definite || suspected,
    bandLabel: label,
    band,
    note: NOTE,
  };
}
