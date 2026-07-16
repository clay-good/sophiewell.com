// spec-v353: Crowe classification of developmental dysplasia of the hip (DDH) in adults (grades I-IV) —
// the most commonly used grading of a dysplastic hip for total-hip-arthroplasty planning, by the extent
// of proximal femoral-head subluxation on an AP pelvis radiograph. The catalog carries the fracture
// classifications (garden, weber, schatzker, ...) but had no adult-DDH grade. "crowe classification" /
// "hip dysplasia grade" / "ddh grade" routed to nothing.
//
// HIGH-STAKES: this reports the Crowe GRADE the clinician has determined from the radiograph, NOT a
// diagnosis, a treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). The
// arthroplasty-complexity association (higher grades = greater reconstruction difficulty) is the
// classically taught pattern, not an order; the surgical decision stays with the orthopedic surgeon.
//
// BANDS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Crowe JF, Mani VJ, Ranawat CS. Total hip replacement in congenital dislocation and dysplasia of
//     the hip. J Bone Joint Surg Am. 1979;61(1):15-23 (the original grade I-IV subluxation bands).
//   - Orthopedic references (CORR "In Brief" / Radiopaedia / Wheeless) reproducing the same
//     <50% / 50-75% / 75-100% / >100% femoral-head subluxation definitions.
//
// Grades (proximal femoral-head subluxation, % of femoral-head vertical height):
//   I   : < 50% subluxation.
//   II  : 50-75% subluxation.
//   III : 75-100% subluxation.
//   IV  : > 100% subluxation (high / complete dislocation). Flagged.
// (Grade III is also flagged as a higher-grade, more complex reconstruction.)

const GRADES = {
  I: { grade: 'I', severe: false, text: 'Crowe grade I - less than 50% proximal femoral-head subluxation; the mildest adult hip dysplasia.' },
  II: { grade: 'II', severe: false, text: 'Crowe grade II - 50 to 75% proximal femoral-head subluxation.' },
  III: { grade: 'III', severe: true, text: 'Crowe grade III - 75 to 100% proximal femoral-head subluxation. A higher grade / more complex reconstruction.' },
  IV: { grade: 'IV', severe: true, text: 'Crowe grade IV - greater than 100% subluxation (high / complete dislocation); the most severe. A higher grade / more complex reconstruction.' },
};

const NOTE = 'The Crowe classification (Crowe, Mani & Ranawat 1979) grades adult developmental dysplasia of the hip by the extent of proximal femoral-head subluxation on an AP pelvis radiograph. I: <50%. II: 50-75%. III: 75-100%. IV: >100% (high / complete dislocation). It is the most commonly used adult-DDH grade for total-hip-arthroplasty planning; higher grades imply a more complex reconstruction, which is the classically taught pattern, not an order. This reports the grade the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III', IV: 'IV',
  1: 'I', 2: 'II', 3: 'III', 4: 'IV',
};

// input:
//   grade: 'I' / 'II' / 'III' / 'IV' (case-insensitive; also accepts 1-4)
export function croweDdh(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.grade == null ? '' : o.grade).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const g = GRADES[key];
  if (!g) {
    return { valid: false, message: 'Select the Crowe grade (I, II, III, or IV; equivalently 1-4).' };
  }
  return {
    valid: true,
    grade: g.grade,
    severe: g.severe,
    abnormal: g.severe,
    bandLabel: `Crowe grade ${g.grade}`,
    band: g.text,
    note: NOTE,
  };
}
