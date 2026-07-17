// spec-v375: Pipkin classification of a femoral HEAD fracture (types I-IV) — the standard grading of a
// femoral head fracture (which typically occurs with a posterior hip dislocation) by its relationship to
// the fovea centralis and any associated femoral neck or acetabular fracture. It sits beside the
// femoral-neck (Garden, Pauwels) and hip-dysplasia (Crowe, Hartofilakidis) classifications in the
// catalog. "pipkin" / "pipkin classification" / "femoral head fracture" routed to nothing.
//
// HIGH-STAKES: this reports the Pipkin TYPE the clinician has determined from the radiograph, NOT a
// diagnosis, a treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). The
// worse-outcome-with-higher-type association (III/IV vs I/II) is the classically taught pattern, not an
// order; the reduction / fixation decision stays with the orthopedic surgeon.
//
// TYPES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Pipkin G. Treatment of grade IV fracture-dislocation of the hip. J Bone Joint Surg Am.
//     1957;39-A(5):1027-1042 (the original type I-IV definitions).
//   - CORR "Classifications in Brief" (2018) and orthopedic references reproducing the same four types.
//
// Types (femoral head fracture, typically with a posterior hip dislocation):
//   I   : fracture caudad to (below) the fovea centralis; does not involve the weight-bearing surface.
//   II  : fracture cephalad to (above) the fovea centralis; involves the weight-bearing surface.
//   III : a type I or II femoral head fracture WITH an associated femoral neck fracture. Flagged.
//   IV  : a type I or II femoral head fracture WITH an associated acetabular fracture (most commonly the
//         posterior wall). Flagged.

const TYPES = {
  I: { type: 'I', complex: false, text: 'Pipkin type I - a femoral head fracture caudad to (below) the fovea centralis; it does not involve the main weight-bearing surface.' },
  II: { type: 'II', complex: false, text: 'Pipkin type II - a femoral head fracture cephalad to (above) the fovea centralis; it involves the weight-bearing surface.' },
  III: { type: 'III', complex: true, text: 'Pipkin type III - a type I or II femoral head fracture with an associated femoral neck fracture.' },
  IV: { type: 'IV', complex: true, text: 'Pipkin type IV - a type I or II femoral head fracture with an associated acetabular fracture (most commonly the posterior wall).' },
};

const NOTE = 'The Pipkin classification (Pipkin 1957) grades a femoral head fracture, which typically occurs with a posterior hip dislocation. I: below the fovea centralis (spares the weight-bearing surface). II: above the fovea centralis (involves the weight-bearing surface). III: type I or II plus an associated femoral neck fracture. IV: type I or II plus an associated acetabular fracture. Types III and IV (with an associated neck or acetabular fracture) carry worse outcomes than I and II, which is the classically taught pattern, not an order. This reports the type the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III', IV: 'IV',
  1: 'I', 2: 'II', 3: 'III', 4: 'IV',
};

// input:
//   type: 'I' / 'II' / 'III' / 'IV' (case-insensitive; also accepts 1-4)
export function pipkinFemoralHead(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the Pipkin type (I, II, III, or IV; equivalently 1-4).' };
  }
  return {
    valid: true,
    type: t.type,
    complex: t.complex,
    abnormal: t.complex,
    bandLabel: `Pipkin type ${t.type}`,
    band: t.text,
    note: NOTE,
  };
}
