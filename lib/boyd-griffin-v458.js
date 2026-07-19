// spec-v458: the Boyd-Griffin classification of trochanteric (intertrochanteric) femur fractures, by fracture
// line and comminution — types I / II / III / IV. It fills the intertrochanteric gap in the proximal-femur
// fracture cluster (neck = Pauwels/Garden/Delbet, subtrochanteric = Seinsheimer). "boyd-griffin" /
// "intertrochanteric fracture" routed to nothing.
//
// HIGH-STAKES: this reports the fracture TYPE the clinician has determined, NOT a diagnosis, a treatment
// decision, or a prognosis for an individual patient (spec-v11 §5.3). The management decision stays with the
// orthopedic team.
//
// TYPES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Boyd HB, Griffin LL. Classification and treatment of trochanteric fractures. Arch Surg.
//     1949;58(6):853-866.
//   - Orthopedic / radiology references reproducing the same simple-intertrochanteric (I) /
//     comminuted-intertrochanteric (II) / subtrochanteric (III) / trochanteric-plus-shaft (IV) grouping.
//
// Types (fracture line and comminution):
//   I   : fracture along the intertrochanteric line from the greater to the lesser trochanter; simple and
//         undisplaced, so reduction is straightforward.
//   II  : comminuted fracture along the intertrochanteric line, with secondary cortical fracture lines
//         (including coronal-plane fractures); reduction is more difficult.
//   III : essentially subtrochanteric, with at least one fracture line crossing the proximal shaft at or just
//         distal to the lesser trochanter; the most difficult to treat.
//   IV  : fracture of the trochanteric region and the proximal shaft in at least two planes (spiral, oblique,
//         or butterfly).

const TYPES = {
  I: { type: 'I', text: 'Boyd-Griffin type I - fracture along the intertrochanteric line from the greater to the lesser trochanter; simple and undisplaced, so reduction is straightforward.' },
  II: { type: 'II', text: 'Boyd-Griffin type II - comminuted fracture along the intertrochanteric line, with secondary cortical fracture lines (including coronal-plane fractures); reduction is more difficult.' },
  III: { type: 'III', text: 'Boyd-Griffin type III - essentially subtrochanteric, with at least one fracture line crossing the proximal shaft at or just distal to the lesser trochanter; the most difficult to treat.' },
  IV: { type: 'IV', text: 'Boyd-Griffin type IV - fracture of the trochanteric region and the proximal shaft in at least two planes (spiral, oblique, or butterfly).' },
};

const NOTE = 'The Boyd-Griffin classification (Boyd & Griffin 1949) grades trochanteric femur fractures by fracture line and comminution. I: simple intertrochanteric, undisplaced. II: comminuted intertrochanteric with secondary cortical lines. III: essentially subtrochanteric (line at or just distal to the lesser trochanter). IV: trochanteric region plus proximal shaft in at least two planes. This reports the type the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III', IV: 'IV',
  1: 'I', 2: 'II', 3: 'III', 4: 'IV',
};

// input:
//   type: 'I'..'IV' (case-insensitive; also accepts 1-4).
export function boydGriffin(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the Boyd-Griffin type (I, II, III, or IV).' };
  }
  return {
    valid: true,
    type: t.type,
    bandLabel: `Boyd-Griffin type ${t.type}`,
    band: t.text,
    note: NOTE,
  };
}
