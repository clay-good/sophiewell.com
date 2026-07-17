// spec-v383: Risser sign (US grading, 0-5) — skeletal-maturity staging by the ossification and fusion of
// the iliac crest apophysis, used in scoliosis to gauge the remaining growth potential (and, with it, the
// likelihood of curve progression). It sits beside the other maturity / staging tiles (Tanner, bone age)
// in the catalog. "risser" / "iliac apophysis skeletal maturity" routed to nothing.
//
// This is a MATURITY indicator, not a measure of pathology: like Tanner staging, the tile reports the
// grade the clinician has read from the radiograph and does NOT flag any grade as abnormal or assert a
// diagnosis, a treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). The
// falling-growth-potential association (0 -> 5) is the classically taught pattern, not an order; the
// management decision stays with the treating team.
//
// GRADES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Risser JC. The iliac apophysis: an invaluable sign in the management of scoliosis. Clin Orthop.
//     1958;11:111-119 (the original sign).
//   - Radiology / orthopedic references for the US six-stage system (0 none, 1 ~25%, 2 ~50%, 3 ~75%, 4
//     100% ossified but unfused, 5 ossified AND fused).
//
// Grades (US system; ossification of the iliac apophysis, then fusion):
//   0 : no ossification of the iliac apophysis; skeletally immature, maximum growth potential remaining.
//   1 : ~25% ossification (anterolateral); prepuberty / early puberty.
//   2 : ~50% ossification.
//   3 : ~75% ossification.
//   4 : 100% ossification of the apophysis, but not yet fused; little growth remains.
//   5 : complete ossification AND fusion to the iliac crest; full skeletal maturity.

const GRADES = {
  0: { grade: '0', mature: false, growth: 'substantial', text: 'Risser grade 0 - no ossification of the iliac apophysis; skeletally immature, with the maximum growth potential remaining.' },
  1: { grade: '1', mature: false, growth: 'substantial', text: 'Risser grade 1 - about 25% ossification of the iliac apophysis (anterolateral); prepuberty or early puberty.' },
  2: { grade: '2', mature: false, growth: 'substantial', text: 'Risser grade 2 - about 50% ossification of the iliac apophysis.' },
  3: { grade: '3', mature: false, growth: 'some', text: 'Risser grade 3 - about 75% ossification of the iliac apophysis; the growth rate is slowing.' },
  4: { grade: '4', mature: false, growth: 'minimal', text: 'Risser grade 4 - 100% ossification of the iliac apophysis, but not yet fused; little growth remains.' },
  5: { grade: '5', mature: true, growth: 'none', text: 'Risser grade 5 - complete ossification and fusion of the apophysis to the iliac crest; full skeletal maturity.' },
};

const NOTE = 'The Risser sign (US grading) stages skeletal maturity by the ossification and fusion of the iliac crest apophysis. 0: none. 1: ~25%. 2: ~50%. 3: ~75%. 4: 100% ossified but unfused. 5: ossified and fused (mature). The remaining growth potential (and the likelihood of scoliosis-curve progression) falls 0 to 5, which is the classically taught pattern, not an order. This is a maturity grade, not a measure of pathology. This reports the grade the clinician has read from the radiograph, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  0: '0', 1: '1', 2: '2', 3: '3', 4: '4', 5: '5',
};

// input:
//   grade: '0'..'5'
export function risserSign(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.grade == null ? '' : o.grade).trim();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const g = GRADES[key];
  if (!g) {
    return { valid: false, message: 'Select the Risser grade (0 to 5).' };
  }
  return {
    valid: true,
    grade: g.grade,
    skeletallyMature: g.mature,
    growthPotentialRemaining: g.growth,
    abnormal: false,
    bandLabel: `Risser grade ${g.grade}`,
    band: g.text,
    note: NOTE,
  };
}
