// spec-v459: the Thompson-Epstein classification of posterior hip dislocations, by the associated acetabular
// or femoral-head fracture — types I / II / III / IV / V. It is the standard grading of the traumatic
// posterior hip dislocation and companions the femoral-head fracture tile (Pipkin). "thompson-epstein" /
// "posterior hip dislocation" routed to nothing.
//
// HIGH-STAKES: this reports the injury TYPE the clinician has determined, NOT a diagnosis, a treatment
// decision, or a prognosis for an individual patient (spec-v11 §5.3). The management decision stays with the
// orthopedic team.
//
// TYPES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Thompson VP, Epstein HC. Traumatic dislocation of the hip: a survey of two hundred and four cases.
//     J Bone Joint Surg Am. 1951;33-A(3):746-778.
//   - Orthopedic / radiology references reproducing the same no/minor-fracture (I) / single-large-rim (II) /
//     comminuted-rim (III) / acetabular-floor (IV) / femoral-head (V) grouping.
//
// Types (associated fracture):
//   I   : dislocation with no fracture or only a minor fracture of the posterior acetabular rim.
//   II  : dislocation with a single large fracture of the posterior acetabular rim.
//   III : dislocation with a comminuted fracture of the posterior acetabular rim.
//   IV  : dislocation with a fracture of the acetabular rim and floor.
//   V   : dislocation with a fracture of the femoral head.

const TYPES = {
  I: { type: 'I', text: 'Thompson-Epstein type I - dislocation with no fracture or only a minor fracture of the posterior acetabular rim.' },
  II: { type: 'II', text: 'Thompson-Epstein type II - dislocation with a single large fracture of the posterior acetabular rim.' },
  III: { type: 'III', text: 'Thompson-Epstein type III - dislocation with a comminuted fracture of the posterior acetabular rim.' },
  IV: { type: 'IV', text: 'Thompson-Epstein type IV - dislocation with a fracture of the acetabular rim and floor.' },
  V: { type: 'V', text: 'Thompson-Epstein type V - dislocation with a fracture of the femoral head.' },
};

const NOTE = 'The Thompson-Epstein classification (Thompson & Epstein 1951) grades posterior hip dislocations by the associated fracture. I: no or minor rim fracture. II: a single large posterior rim fracture. III: a comminuted rim fracture. IV: an acetabular rim and floor fracture. V: a femoral-head fracture. This reports the type the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III', IV: 'IV', V: 'V',
  1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V',
};

// input:
//   type: 'I'..'V' (case-insensitive; also accepts 1-5).
export function thompsonEpstein(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the Thompson-Epstein type (I, II, III, IV, or V).' };
  }
  return {
    valid: true,
    type: t.type,
    bandLabel: `Thompson-Epstein type ${t.type}`,
    band: t.text,
    note: NOTE,
  };
}
