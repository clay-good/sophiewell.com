// spec-v382: (modified) Eichenholtz classification of Charcot neuroarthropathy (stages 0-3), the
// temporal / radiographic staging of the neuropathic foot — the standard framework that tracks a Charcot
// joint from the acute, inflamed, at-risk phase through coalescence to a consolidated, stable deformity.
// It complements the existing diabetic-foot ULCER grade (Wagner-Meggitt) in the catalog. "eichenholtz" /
// "charcot foot staging" routed to nothing.
//
// HIGH-STAKES: this reports the Eichenholtz STAGE the clinician has determined from the exam / imaging,
// NOT a diagnosis, a treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). The
// active-vs-quiescent grouping below is the classically taught pattern, not an order; the management
// (offloading / immobilization / reconstruction) decision stays with the treating team.
//
// STAGES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Eichenholtz SN. Charcot Joints. Springfield, IL: Charles C. Thomas; 1966 (stages 1-3).
//   - Rosenbaum AJ, DiPreta JA. Classifications in Brief: Eichenholtz classification of Charcot
//     arthropathy. Clin Orthop Relat Res. 2015;473(3):1168-1171 (the modified staging, incl. the
//     pre-radiographic Stage 0 added later).
//
// Stages (temporal / radiographic; stages 0-1 are the acutely-active, at-risk phase):
//   0 : prodromal / pre-radiographic — a warm, swollen, erythematous neuropathic foot; radiographs
//       normal or near-normal (MRI shows edema). Active / at-risk. Flagged.
//   1 : development / fragmentation — inflammation with radiographic osseous fragmentation, subluxation,
//       and dislocation. Active / unstable. Flagged.
//   2 : coalescence — decreased inflammation; absorption of fine debris, fusion of large fragments, and
//       sclerosis of the bone ends.
//   3 : reconstruction / consolidation — remodeling with rounding of the bone ends, decreased sclerosis,
//       and a stable, fixed deformity; inflammation resolved.

const STAGES = {
  0: { stage: '0', active: true, text: 'Eichenholtz stage 0 (prodromal / pre-radiographic) - a warm, swollen, erythematous neuropathic foot with normal or near-normal radiographs (MRI shows edema); the acute, at-risk phase.' },
  1: { stage: '1', active: true, text: 'Eichenholtz stage 1 (development / fragmentation) - inflammation with radiographic osseous fragmentation, subluxation, and dislocation; the acute, unstable phase.' },
  2: { stage: '2', active: false, text: 'Eichenholtz stage 2 (coalescence) - decreased inflammation; absorption of fine debris, fusion of large fragments, and sclerosis of the bone ends.' },
  3: { stage: '3', active: false, text: 'Eichenholtz stage 3 (reconstruction / consolidation) - remodeling with rounding of the bone ends, decreased sclerosis, and a stable, fixed deformity; inflammation resolved.' },
};

const NOTE = 'The (modified) Eichenholtz classification stages Charcot neuroarthropathy by temporal and radiographic findings. 0: prodromal / pre-radiographic (warm, swollen; normal radiographs). 1: development / fragmentation (inflammation + fragmentation, subluxation). 2: coalescence (debris absorption, sclerosis). 3: reconstruction / consolidation (remodeling, stable deformity). Stages 0-1 are the acutely-active, at-risk phase; 2-3 are resolving / quiescent. This grouping is the classically taught pattern, not an order. This reports the stage the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  0: '0', 1: '1', 2: '2', 3: '3',
  I: '1', II: '2', III: '3',
};

// input:
//   stage: '0' / '1' / '2' / '3' (also accepts roman I-III for 1-3)
export function eichenholtzCharcot(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.stage == null ? '' : o.stage).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const s = STAGES[key];
  if (!s) {
    return { valid: false, message: 'Select the Eichenholtz stage (0, 1, 2, or 3).' };
  }
  return {
    valid: true,
    stage: s.stage,
    active: s.active,
    abnormal: s.active,
    bandLabel: `Eichenholtz stage ${s.stage}`,
    band: s.text,
    note: NOTE,
  };
}
