// spec-v485: the Dejour classification of trochlear dysplasia, by the radiographic / CT appearance of the
// femoral trochlea — types A / B / C / D. It underlies patellofemoral instability assessment and joins the
// knee tiles. "dejour" / "trochlear dysplasia type" routed to nothing.
//
// HIGH-STAKES: this reports the imaging TYPE the clinician has determined, NOT a diagnosis, a treatment
// decision, or a prognosis for an individual patient (spec-v11 §5.3). The management decision stays with the
// orthopedic team.
//
// TYPES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Dejour D, Le Coultre B. Osteotomies in patello-femoral instabilities. Sports Med Arthrosc Rev.
//     2007;15(1):39-46.
//   - Knee references reproducing the same shallow-symmetric (A) / flat-or-convex-with-spur (B) /
//     facet-asymmetry-no-spur (C) / asymmetry-plus-spur (D) grouping. Type A is low-grade; B, C, and D are
//     high-grade dysplasia.
//
// Types (trochlear morphology):
//   A : a shallow but still symmetric, concave trochlea (crossing sign present); low-grade dysplasia.
//   B : a flat or convex trochlea with a supratrochlear spur (crossing sign plus spur); high-grade.
//   C : asymmetry of the facets - a convex lateral facet and a hypoplastic medial facet (crossing sign plus
//       double-contour sign), without a spur; high-grade.
//   D : features of both B and C - facet asymmetry (double contour) plus a supratrochlear spur, with a
//       vertical "cliff" between the facets; high-grade.

const TYPES = {
  A: { type: 'A', text: 'Dejour type A - a shallow but still symmetric, concave trochlea (crossing sign present); low-grade dysplasia.' },
  B: { type: 'B', text: 'Dejour type B - a flat or convex trochlea with a supratrochlear spur (crossing sign plus spur); high-grade dysplasia.' },
  C: { type: 'C', text: 'Dejour type C - facet asymmetry, a convex lateral facet and a hypoplastic medial facet (crossing sign plus double-contour sign), without a spur; high-grade dysplasia.' },
  D: { type: 'D', text: 'Dejour type D - features of both B and C: facet asymmetry (double contour) plus a supratrochlear spur, with a vertical "cliff" between the facets; high-grade dysplasia.' },
};

const NOTE = 'The Dejour classification (Dejour 2007) grades trochlear dysplasia by trochlear morphology. A: shallow but symmetric (low-grade). B: flat or convex with a supratrochlear spur (high-grade). C: facet asymmetry (double contour) without a spur (high-grade). D: asymmetry plus a spur with a facet "cliff" (high-grade). This reports the type the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  A: 'A', B: 'B', C: 'C', D: 'D',
  1: 'A', 2: 'B', 3: 'C', 4: 'D',
};

// input:
//   type: 'A' / 'B' / 'C' / 'D' (case-insensitive; also accepts 1-4).
export function dejourTrochlea(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the Dejour type (A, B, C, or D).' };
  }
  return {
    valid: true,
    type: t.type,
    bandLabel: `Dejour type ${t.type}`,
    band: t.text,
    note: NOTE,
  };
}
