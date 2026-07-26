// spec-v499: the Dorr classification of proximal femoral bone morphology (types A, B, C), read from the
// cortical thickness and canal shape on a plain radiograph before hip arthroplasty. It joins the arthroplasty
// tiles (barrack-cement, vancouver-periprosthetic, brooker); the pre-operative femoral MORPHOLOGY axis was
// uncovered. "dorr" / "canal calcar" / "stovepipe" all routed to nothing.
//
// HIGH-STAKES: this reports the morphologic TYPE the clinician has determined from the radiograph, NOT a
// diagnosis, a bone-quality or osteoporosis diagnosis, and NOT a recommendation for a cemented or cementless
// stem (spec-v11 section 5.3). The implant decision stays with the arthroplasty surgeon.
//
// TYPES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Dorr LD, Faugere MC, Mackel AM, Gruen TA, Bognar B, Malluche HH. Structural and cellular assessment of
//     bone quality of proximal femur. Bone. 1993;14(3):231-242.
//   - Arthroplasty references reproducing the same champagne-flute (A) / intermediate (B) / stovepipe (C)
//     grouping with the same canal-to-calcar ratio cut points.
//
// Types (decreasing cortical thickness, widening canal):
//   A : the champagne-flute femur - thick medial and posterior cortices, a narrow canal, marked
//       metaphyseal-diaphyseal flare; canal-to-calcar ratio below 0.5.
//   B : intermediate - some loss of the medial and posterior cortices and a wider canal; ratio 0.5 to 0.75.
//   C : the stovepipe femur - extensive cortical loss, a wide canal with little flare; ratio above 0.75.

const TYPES = {
  A: { type: 'A', text: 'Dorr type A - the champagne-flute femur: thick medial and posterior cortices, a narrow canal, and marked metaphyseal-diaphyseal flare, with a canal-to-calcar ratio below 0.5.' },
  B: { type: 'B', text: 'Dorr type B - intermediate: some loss of the medial and posterior cortices with a wider canal, with a canal-to-calcar ratio of 0.5 to 0.75.' },
  C: { type: 'C', text: 'Dorr type C - the stovepipe femur: extensive loss of the medial and posterior cortices and a wide canal with little flare, with a canal-to-calcar ratio above 0.75.' },
};

const NOTE = 'The Dorr classification (Dorr and colleagues 1993) describes proximal femoral bone morphology on a plain radiograph, from the cortical thickness and the canal-to-calcar ratio. A: the champagne-flute femur, thick cortices and a narrow canal, ratio below 0.5. B: intermediate, ratio 0.5 to 0.75. C: the stovepipe femur, thin cortices and a wide canal, ratio above 0.75. This reports the morphologic type the clinician has determined, not a diagnosis, a bone-quality or osteoporosis diagnosis, or a recommendation for a cemented or cementless stem.';

const ALIAS = {
  A: 'A', B: 'B', C: 'C',
  1: 'A', 2: 'B', 3: 'C',
};

// input:
//   type: 'A' / 'B' / 'C' (case-insensitive; also accepts 1-3).
export function dorrFemur(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the Dorr type (A, B, or C).' };
  }
  return {
    valid: true,
    type: t.type,
    bandLabel: `Dorr type ${t.type}`,
    band: t.text,
    note: NOTE,
  };
}
