// spec-v370: Hartofilakidis classification of adult developmental dysplasia of the hip (types A/B/C) —
// the second widely used adult-DDH classification (with the Crowe classification already in the
// catalog), grading the hip by the relationship of the femoral head to the true acetabulum:
// dysplasia (A), low dislocation (B), and high dislocation (C). "hartofilakidis" / "hartofilakidis
// classification" / "low dislocation hip" routed to nothing.
//
// HIGH-STAKES: this reports the Hartofilakidis TYPE the clinician has determined from the radiograph,
// NOT a diagnosis, a treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). The
// reconstruction-complexity association (rising A -> B -> C) is the classically taught pattern, not an
// order; the surgical decision stays with the orthopedic surgeon.
//
// TYPES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Hartofilakidis G, Stamos K, Ioannidis TT. Low friction arthroplasty for old untreated congenital
//     dislocation of the hip. J Bone Joint Surg Br. 1988;70(2):182-186.
//   - CORR "Classifications in Brief" (2019) and orthopedic references reproducing the same three types.
//
// Types (relationship of the femoral head to the true acetabulum):
//   A : dysplasia - the femoral head is within the true acetabulum despite some subluxation, with
//       segmental deficiency of the superior acetabular wall.
//   B : low dislocation - the femoral head forms a false acetabulum that partially overlaps the true
//       acetabulum; complete absence of the superior wall. Flagged.
//   C : high dislocation - the false acetabulum has no connection with the true acetabulum; the femoral
//       head has migrated superiorly and posteriorly and is completely uncovered. Flagged.

const TYPES = {
  A: { type: 'A', dislocation: false, text: 'Hartofilakidis type A (dysplasia) - the femoral head is within the true acetabulum despite some subluxation, with segmental deficiency of the superior acetabular wall.' },
  B: { type: 'B', dislocation: true, text: 'Hartofilakidis type B (low dislocation) - the femoral head forms a false acetabulum that partially overlaps the true acetabulum, with complete absence of the superior wall.' },
  C: { type: 'C', dislocation: true, text: 'Hartofilakidis type C (high dislocation) - the false acetabulum has no connection with the true acetabulum; the femoral head has migrated superiorly and posteriorly and is completely uncovered.' },
};

const NOTE = 'The Hartofilakidis classification (Hartofilakidis 1988) grades adult developmental dysplasia of the hip by the relationship of the femoral head to the true acetabulum. A: dysplasia (head within the true acetabulum). B: low dislocation (false acetabulum partially overlaps the true one). C: high dislocation (false acetabulum with no connection to the true one). It is the second widely used adult-DDH classification alongside Crowe; reconstruction complexity rises A to C, which is the classically taught pattern, not an order. This reports the type the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  A: 'A', B: 'B', C: 'C',
  1: 'A', 2: 'B', 3: 'C',
};

// input:
//   type: 'A' / 'B' / 'C' (case-insensitive; also accepts 1-3)
export function hartofilakidisDdh(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the Hartofilakidis type (A, B, or C).' };
  }
  return {
    valid: true,
    type: t.type,
    dislocation: t.dislocation,
    abnormal: t.dislocation,
    bandLabel: `Hartofilakidis type ${t.type}`,
    band: t.text,
    note: NOTE,
  };
}
