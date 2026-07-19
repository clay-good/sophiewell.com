// spec-v457: the Stulberg classification of the residual femoral head after Legg-Calve-Perthes disease, by
// femoral-head sphericity and joint congruency at skeletal maturity — classes I / II / III / IV / V. It is the
// standard outcome grading of healed Perthes and companions the active-disease Perthes tiles (Catterall,
// Herring). "stulberg" / "perthes residual deformity" routed to nothing.
//
// HIGH-STAKES: this reports the radiographic CLASS the clinician has determined, NOT a diagnosis, a treatment
// decision, or a prognosis for an individual patient (spec-v11 §5.3). The management decision stays with the
// orthopedic team.
//
// CLASSES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Stulberg SD, Cooperman DR, Wallensten R. The natural history of Legg-Calve-Perthes disease.
//     J Bone Joint Surg Am. 1981;63(7):1095-1108.
//   - Orthopedic / radiology references reproducing the same spherical-normal (I) / spherical-abnormal (II) /
//     non-spherical (III) / flat-congruent (IV) / flat-incongruent (V) grouping.
//
// Classes (sphericity + congruency at maturity):
//   I   : normal spherical femoral head; normal hip.
//   II  : spherical femoral head (fits concentric Mose circles) but with coxa magna, a short broad neck, or an
//         abnormal acetabulum.
//   III : non-spherical head (ovoid, mushroom, or umbrella shaped) but not flat.
//   IV  : flat femoral head with a flat acetabular segment (aspherical congruency).
//   V   : flat femoral head with a normal neck and acetabulum (aspherical incongruency).

const CLASSES = {
  I: { cls: 'I', text: 'Stulberg class I - normal spherical femoral head; normal hip.' },
  II: { cls: 'II', text: 'Stulberg class II - spherical femoral head (fits concentric Mose circles) but with coxa magna, a short broad neck, or an abnormal acetabulum.' },
  III: { cls: 'III', text: 'Stulberg class III - non-spherical head (ovoid, mushroom, or umbrella shaped) but not flat.' },
  IV: { cls: 'IV', text: 'Stulberg class IV - flat femoral head with a flat acetabular segment (aspherical congruency).' },
  V: { cls: 'V', text: 'Stulberg class V - flat femoral head with a normal neck and acetabulum (aspherical incongruency).' },
};

const NOTE = 'The Stulberg classification (Stulberg 1981) grades the residual femoral head after Perthes disease by sphericity and joint congruency at skeletal maturity. I: normal spherical head. II: spherical but with coxa magna, a short neck, or an abnormal acetabulum. III: non-spherical (ovoid/mushroom/umbrella) but not flat. IV: flat head, congruent (aspherical congruency). V: flat head, incongruent (aspherical incongruency). This reports the class the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III', IV: 'IV', V: 'V',
  1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V',
};

// input:
//   cls: 'I'..'V' (case-insensitive; also accepts 1-5).
export function stulberg(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.cls == null ? '' : o.cls).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const c = CLASSES[key];
  if (!c) {
    return { valid: false, message: 'Select the Stulberg class (I, II, III, IV, or V).' };
  }
  return {
    valid: true,
    cls: c.cls,
    bandLabel: `Stulberg class ${c.cls}`,
    band: c.text,
    note: NOTE,
  };
}
