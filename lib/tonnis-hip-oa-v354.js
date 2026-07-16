// spec-v354: Tonnis classification (grade) of hip osteoarthritis (grades 0-3) — the hip-specific
// radiographic OA grade read off an AP pelvis radiograph, the hip counterpart to the general
// Kellgren-Lawrence radiographic-OA grade already in the catalog. NOT the Tonnis ANGLE (acetabular
// index) — this tile is the OA SEVERITY grade. "tonnis grade" / "tonnis classification hip" /
// "hip osteoarthritis grade" routed to nothing.
//
// HIGH-STAKES: this reports the Tonnis GRADE the clinician has determined from the radiograph, NOT a
// diagnosis, a treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). The
// joint-preservation (lower grades) vs total-hip-arthroplasty (grade 3 end-stage) association is the
// classically taught pattern, not an order; the surgical decision stays with the orthopedic surgeon.
//
// BANDS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Tonnis D. Congenital Dysplasia and Dislocation of the Hip in Children and Adults. Berlin:
//     Springer-Verlag; 1987 (the grade 0-3 radiographic definitions).
//   - Kovalenko B, Bremjit P, Fernando N. Classifications in Brief: Tonnis Classification of Hip
//     Osteoarthritis. Clin Orthop Relat Res. 2018;476(8):1680-1684, and Radiopaedia, reproducing the
//     same grade 0-3 sclerosis / joint-space / cyst / head-sphericity definitions.
//
// Grades (radiographic hip osteoarthritis):
//   0 : no radiographic signs of osteoarthritis.
//   1 : increased sclerosis, slight joint-space narrowing, small osteophytes (marginal lipping); no or
//       slight loss of femoral-head sphericity.
//   2 : small subchondral cysts, moderate joint-space narrowing, moderate loss of head sphericity.
//       Flagged (radiographic OA).
//   3 : large cysts, severe joint-space narrowing or obliteration, severe head deformity, or avascular
//       necrosis; end-stage disease. Flagged.

const GRADES = {
  0: { grade: '0', oa: false, text: 'Tonnis grade 0 - no radiographic signs of hip osteoarthritis.' },
  1: { grade: '1', oa: false, text: 'Tonnis grade 1 - increased sclerosis, slight joint-space narrowing, and small marginal osteophytes; no or slight loss of femoral-head sphericity.' },
  2: { grade: '2', oa: true, text: 'Tonnis grade 2 - small subchondral cysts, moderate joint-space narrowing, and moderate loss of femoral-head sphericity. Radiographic osteoarthritis.' },
  3: { grade: '3', oa: true, text: 'Tonnis grade 3 - large cysts, severe joint-space narrowing or obliteration, severe head deformity, or avascular necrosis; end-stage disease.' },
};

const NOTE = 'The Tonnis classification (Tonnis 1987) grades hip osteoarthritis on an AP pelvis radiograph from 0 to 3 by subchondral sclerosis, joint-space narrowing, subchondral cysts, and femoral-head sphericity. 0: no OA. 1: slight sclerosis / narrowing / small osteophytes. 2: small cysts, moderate narrowing, moderate loss of sphericity. 3: large cysts, severe narrowing, head deformity, or avascular necrosis. A grade of 2 or more defines radiographic hip OA in most studies; grade 3 is end-stage. It is the hip counterpart to the Kellgren-Lawrence grade. This is the OA severity grade, NOT the Tonnis angle. This reports the grade the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

// input:
//   grade: '0' / '1' / '2' / '3' (string or number)
export function tonnisHipOa(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.grade == null ? '' : o.grade).trim();
  const g = Object.prototype.hasOwnProperty.call(GRADES, raw) ? GRADES[raw] : null;
  if (!g) {
    return { valid: false, message: 'Select the Tonnis grade (0, 1, 2, or 3).' };
  }
  return {
    valid: true,
    grade: g.grade,
    osteoarthritis: g.oa,
    abnormal: g.oa,
    bandLabel: `Tonnis grade ${g.grade}`,
    band: g.text,
    note: NOTE,
  };
}
