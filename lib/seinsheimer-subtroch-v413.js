// spec-v413: Seinsheimer classification of subtrochanteric femur fractures, by the number of fragments, the
// fracture-line shape, and the lesser-trochanter attachment — types I / IIA / IIB / IIC / IIIA / IIIB /
// IV / V. It completes the femur-by-region cluster (Pauwels femoral neck, Winquist-Hansen femoral shaft,
// Pipkin femoral head, Delbet pediatric femoral neck). "seinsheimer" / "subtrochanteric fracture" routed
// to nothing.
//
// HIGH-STAKES: this reports the fracture TYPE the clinician has determined from imaging, NOT a diagnosis, a
// treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). The fixation decision stays
// with the orthopedic team.
//
// TYPES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Seinsheimer F. Subtrochanteric fractures of the femur. J Bone Joint Surg Am. 1978;60(3):300-306 (the
//     type I-V classification by fragment count, fracture-line shape, and lesser-trochanter attachment).
//   - Wheeless' Textbook of Orthopaedics and orthopedic references reproducing the same nondisplaced (I) /
//     two-part (II) / three-part (III) / comminuted (IV) / subtrochanteric-intertrochanteric (V) grouping.
//
// Types (fragment count / fracture-line shape / lesser-trochanter attachment):
//   I    : nondisplaced, or any fracture with less than 2 mm of displacement.
//   IIA  : two-part transverse fracture.
//   IIB  : two-part spiral fracture with the lesser trochanter attached to the proximal fragment.
//   IIC  : two-part spiral fracture with the lesser trochanter attached to the distal fragment.
//   IIIA : three-part spiral fracture in which the lesser trochanter is part of the third fragment (which
//          has an inferior cortical spike).
//   IIIB : three-part spiral fracture of the proximal third of the femur with the third part a butterfly
//          fragment.
//   IV   : comminuted fracture with four or more fragments.
//   V    : subtrochanteric-intertrochanteric fracture (any subtrochanteric fracture extending through the
//          greater trochanter).

const TYPES = {
  I: { type: 'I', text: 'Seinsheimer type I - nondisplaced, or any fracture with less than 2 mm of displacement.' },
  IIA: { type: 'IIA', text: 'Seinsheimer type IIA - two-part transverse fracture.' },
  IIB: { type: 'IIB', text: 'Seinsheimer type IIB - two-part spiral fracture with the lesser trochanter attached to the proximal fragment.' },
  IIC: { type: 'IIC', text: 'Seinsheimer type IIC - two-part spiral fracture with the lesser trochanter attached to the distal fragment.' },
  IIIA: { type: 'IIIA', text: 'Seinsheimer type IIIA - three-part spiral fracture in which the lesser trochanter is part of the third fragment (which has an inferior cortical spike).' },
  IIIB: { type: 'IIIB', text: 'Seinsheimer type IIIB - three-part spiral fracture of the proximal third of the femur with the third part a butterfly fragment.' },
  IV: { type: 'IV', text: 'Seinsheimer type IV - comminuted fracture with four or more fragments.' },
  V: { type: 'V', text: 'Seinsheimer type V - subtrochanteric-intertrochanteric fracture (any subtrochanteric fracture extending through the greater trochanter).' },
};

const NOTE = 'The Seinsheimer classification (Seinsheimer 1978) groups a subtrochanteric femur fracture by the number of fragments, the fracture-line shape, and the lesser-trochanter attachment. I: nondisplaced (<2 mm). IIA: two-part transverse. IIB/IIC: two-part spiral, lesser trochanter on the proximal / distal fragment. IIIA: three-part spiral, lesser trochanter in the third fragment. IIIB: three-part spiral with a butterfly fragment. IV: comminuted (four or more fragments). V: subtrochanteric-intertrochanteric (extends through the greater trochanter). This reports the type the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  I: 'I', IIA: 'IIA', IIB: 'IIB', IIC: 'IIC', IIIA: 'IIIA', IIIB: 'IIIB', IV: 'IV', V: 'V',
  1: 'I', 4: 'IV', 5: 'V',
  II: 'IIA', III: 'IIIA',
  '2A': 'IIA', '2B': 'IIB', '2C': 'IIC', '3A': 'IIIA', '3B': 'IIIB',
};

// input:
//   type: 'I' / 'IIA' / 'IIB' / 'IIC' / 'IIIA' / 'IIIB' / 'IV' / 'V' (case-insensitive; also accepts 1/4/5
//   and the arabic-subgroup forms 2a/2b/2c/3a/3b). Bare 'II' resolves to IIA and bare 'III' to IIIA.
export function seinsheimerSubtroch(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the Seinsheimer type (I, IIA, IIB, IIC, IIIA, IIIB, IV, or V).' };
  }
  return {
    valid: true,
    type: t.type,
    bandLabel: `Seinsheimer type ${t.type}`,
    band: t.text,
    note: NOTE,
  };
}
