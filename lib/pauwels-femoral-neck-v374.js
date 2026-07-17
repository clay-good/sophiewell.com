// spec-v374: Pauwels classification of a femoral neck fracture (types I-III), by the angle of the
// fracture line relative to the horizontal — the classic biomechanical grading of the compression-vs-
// shear balance across the fracture. It is the shear-angle counterpart to the Garden classification
// (which grades femoral neck fractures by displacement) already in the catalog. "pauwels" / "pauwels
// classification" / "femoral neck fracture angle" routed to nothing.
//
// HIGH-STAKES: this reports the Pauwels TYPE the clinician has determined from the radiograph, NOT a
// diagnosis, a treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). The
// rising-nonunion-risk association (I -> III, more vertical = more shear) is the classically taught
// pattern, not an order; the fixation / osteotomy decision stays with the orthopedic surgeon.
//
// ANGLES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Pauwels F. Der Schenkelhalsbruch, ein mechanisches Problem. Stuttgart: Ferdinand Enke; 1935 (the
//     original type I-III angle thresholds).
//   - Orthopedic references (OrthopaedicsOne / Radiopaedia / update reviews) reproducing the same
//     < 30 / 30-50 / > 50 degree thresholds and the compression-to-shear gradient.
//
// Types (angle of the fracture line from the horizontal):
//   I   : < 30 degrees - compressive forces dominate; the most stable pattern.
//   II  : 30-50 degrees - shear forces appear; intermediate.
//   III : > 50 degrees - shear forces dominate; the highest risk of nonunion and avascular necrosis.
//         Flagged.

const TYPES = {
  I: { type: 'I', highShear: false, text: 'Pauwels type I - fracture-line angle less than 30 degrees from the horizontal; compressive forces dominate (the most stable pattern).' },
  II: { type: 'II', highShear: false, text: 'Pauwels type II - fracture-line angle 30 to 50 degrees from the horizontal; shear forces appear (intermediate).' },
  III: { type: 'III', highShear: true, text: 'Pauwels type III - fracture-line angle greater than 50 degrees from the horizontal; shear forces dominate, with the highest risk of nonunion and avascular necrosis.' },
};

const NOTE = 'The Pauwels classification (Pauwels 1935) grades a femoral neck fracture by the angle of the fracture line from the horizontal, reflecting the compression-vs-shear balance. I: < 30 degrees, compression dominant (most stable). II: 30-50 degrees, shear appears. III: > 50 degrees, shear dominant, highest nonunion / avascular-necrosis risk. It is the shear-angle counterpart to the Garden classification (displacement). A more vertical fracture experiences higher shear and a greater complication risk, which is the classically taught pattern, not an order. This reports the type the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III',
  1: 'I', 2: 'II', 3: 'III',
};

// input:
//   type: 'I' / 'II' / 'III' (case-insensitive; also accepts 1-3)
export function pauwelsFemoralNeck(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the Pauwels type (I, II, or III; equivalently 1-3).' };
  }
  return {
    valid: true,
    type: t.type,
    highShear: t.highShear,
    abnormal: t.highShear,
    bandLabel: `Pauwels type ${t.type}`,
    band: t.text,
    note: NOTE,
  };
}
