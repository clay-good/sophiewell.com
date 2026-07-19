// spec-v463: the Waldenstrom radiographic staging of Legg-Calve-Perthes disease, by the temporal appearance of
// the femoral epiphysis — stages I / II / III / IV. It is the standard active-disease staging and completes
// the Perthes set alongside Catterall (extent of necrosis) and Stulberg (residual outcome). "waldenstrom" /
// "perthes stage" routed to nothing.
//
// HIGH-STAKES: this reports the radiographic STAGE the clinician has determined, NOT a diagnosis, a treatment
// decision, or a prognosis for an individual patient (spec-v11 §5.3). The management decision stays with the
// orthopedic team.
//
// STAGES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Waldenstrom H. The first stages of coxa plana. J Bone Joint Surg. 1938;20:559-566.
//   - Orthopedic / radiology references reproducing the same initial-sclerosis (I) / fragmentation (II) /
//     reossification (III) / healed-remodeling (IV) temporal sequence.
//
// Stages (temporal radiographic appearance):
//   I   : initial (sclerosis) - the femoral epiphysis is smaller and denser; the medial joint space widens; a
//         subchondral fracture (crescent) may appear.
//   II  : fragmentation - the epiphysis fragments into areas of increased and decreased density.
//   III : reossification (healing) - new bone forms in the previously radiolucent areas; density normalizes.
//   IV  : healed (remodeling) - the epiphysis is fully reossified and remodels to its residual shape.

const STAGES = {
  I: { stage: 'I', text: 'Waldenstrom stage I - initial (sclerosis): the femoral epiphysis is smaller and denser; the medial joint space widens; a subchondral fracture (crescent) may appear.' },
  II: { stage: 'II', text: 'Waldenstrom stage II - fragmentation: the epiphysis fragments into areas of increased and decreased density.' },
  III: { stage: 'III', text: 'Waldenstrom stage III - reossification (healing): new bone forms in the previously radiolucent areas; density normalizes.' },
  IV: { stage: 'IV', text: 'Waldenstrom stage IV - healed (remodeling): the epiphysis is fully reossified and remodels to its residual shape.' },
};

const NOTE = 'The Waldenstrom staging (Waldenstrom 1938) grades the temporal radiographic sequence of active Legg-Calve-Perthes disease. I: initial (sclerosis). II: fragmentation. III: reossification (healing). IV: healed (remodeling). This reports the stage the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III', IV: 'IV',
  1: 'I', 2: 'II', 3: 'III', 4: 'IV',
};

// input:
//   stage: 'I'..'IV' (case-insensitive; also accepts 1-4).
export function waldenstromPerthes(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.stage == null ? '' : o.stage).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const s = STAGES[key];
  if (!s) {
    return { valid: false, message: 'Select the Waldenstrom stage (I, II, III, or IV).' };
  }
  return {
    valid: true,
    stage: s.stage,
    bandLabel: `Waldenstrom stage ${s.stage}`,
    band: s.text,
    note: NOTE,
  };
}
