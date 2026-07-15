// spec-v312: Acute cholangitis DIAGNOSIS (Tokyo Guidelines TG18/TG13 diagnostic
// criteria) — the diagnostic companion to the spec-v310 severity grade. Classifies a
// presentation as "definite", "suspected", or "does not meet criteria" from the three
// diagnostic categories the clinician has determined (a catalog gap: the biliary
// probe found no TG18 diagnostic tile, only the severity grade shipped this session).
//
// This reports the classification's own diagnostic category, NOT a diagnosis or an
// order (spec-v11 §5.3) — the diagnosis stays with the clinician, who has already
// determined each item (fever, jaundice, imaging, etc.) at the bedside.
//
// CRITERIA RE-FETCHED, NEVER RECALLED (spec-v97), transcribed verbatim from Table 1
// (TG18/TG13 diagnostic criteria for acute cholangitis) of:
//   - Miura F, Okamoto K, Takada T, et al. Tokyo Guidelines 2018: initial management
//     of acute biliary infection and flowchart for acute cholangitis. J Hepatobiliary
//     Pancreat Sci. 2018;25(1):31-40 (Table 1, cited from Kiriyama et al.).
//   - Kiriyama S, Kozaka K, Takada T, et al. Tokyo Guidelines 2018: diagnostic
//     criteria and severity grading of acute cholangitis. J Hepatobiliary Pancreat
//     Sci. 2018;25(1):17-30 (the source of Table 1).

// Category A (systemic inflammation): A-1 fever/chills, A-2 lab inflammatory response.
const A_KEYS = [
  ['fever', 'A-1 fever and/or shaking chills (BT > 38 C)'],
  ['inflammation', 'A-2 laboratory evidence of inflammatory response (WBC < 4 or > 10 x1000/uL, or CRP >= 1 mg/dL)'],
];
// Category B (cholestasis): B-1 jaundice, B-2 abnormal liver function tests.
const B_KEYS = [
  ['jaundice', 'B-1 jaundice (total bilirubin >= 2 mg/dL)'],
  ['abnormalLfts', 'B-2 abnormal liver function tests (ALP, GGT, AST, or ALT > 1.5x upper limit of normal)'],
];
// Category C (imaging): C-1 biliary dilatation, C-2 evidence of the etiology.
const C_KEYS = [
  ['biliaryDilatation', 'C-1 biliary dilatation on imaging'],
  ['etiologyImaging', 'C-2 evidence of the etiology on imaging (stricture, stone, stent, etc.)'],
];

const NOTE = 'Acute cholangitis diagnosis (Tokyo Guidelines TG18/TG13, Kiriyama 2018). Category A (systemic inflammation): fever/chills > 38 C, or lab inflammatory response (abnormal WBC or CRP >= 1). Category B (cholestasis): jaundice (T-Bil >= 2), or abnormal LFTs (ALP/GGT/AST/ALT > 1.5x ULN). Category C (imaging): biliary dilatation, or evidence of the etiology (stricture/stone/stent). Suspected diagnosis: one item in A + one item in either B or C. Definite diagnosis: one item in A + one in B + one in C. This reports the diagnostic category, not a diagnosis or an order, which stays with the clinician.';

// input booleans (each defaults false): fever, inflammation (category A); jaundice,
// abnormalLfts (category B); biliaryDilatation, etiologyImaging (category C).
// Returns the TG18 diagnostic category: definite / suspected / not met.
export function cholangitisDiagnosis(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const a = A_KEYS.filter(([k]) => o[k] === true).map(([, label]) => label);
  const b = B_KEYS.filter(([k]) => o[k] === true).map(([, label]) => label);
  const c = C_KEYS.filter(([k]) => o[k] === true).map(([, label]) => label);
  const hasA = a.length >= 1, hasB = b.length >= 1, hasC = c.length >= 1;

  let category, definite, suspected;
  if (hasA && hasB && hasC) { category = 'definite'; definite = true; suspected = false; }
  else if (hasA && (hasB || hasC)) { category = 'suspected'; definite = false; suspected = true; }
  else { category = 'not met'; definite = false; suspected = false; }

  const label = definite ? 'Definite acute cholangitis'
    : suspected ? 'Suspected acute cholangitis'
    : 'Does not meet TG18 criteria for acute cholangitis';

  const fired = [...a, ...b, ...c];
  let band;
  if (definite) {
    band = `${label} (TG18) — one item in each of A (systemic inflammation), B (cholestasis), and C (imaging): ${fired.join('; ')}.`;
  } else if (suspected) {
    band = `${label} (TG18) — one item in A plus one in ${hasB ? 'B' : 'C'} (definite needs one item in each of A, B, and C): ${fired.join('; ')}.`;
  } else {
    const have = fired.length ? `only: ${fired.join('; ')}` : 'no criteria selected';
    band = `${label} — suspected needs one item in A plus one in B or C (${have}).`;
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
