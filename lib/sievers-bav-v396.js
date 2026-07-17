// spec-v396: Sievers classification of a bicuspid aortic valve (BAV) — types 0 / 1 / 2 by the number of
// raphes, the standard morphological typing used in echocardiography, CT, and aortic-valve surgery /
// TAVR planning. It sits beside the valve / cardiology tiles in the catalog. "sievers" / "bicuspid aortic
// valve type" routed to nothing.
//
// HIGH-STAKES: this reports the Sievers TYPE the clinician has determined from the imaging, NOT a
// diagnosis, a treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). The type
// informs repair / TAVR planning, but that decision stays with the cardiology / cardiac-surgery team.
//
// TYPES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Sievers HH, Schmidtke C. A classification system for the bicuspid aortic valve from 304 surgical
//     specimens. J Thorac Cardiovasc Surg. 2007;133(5):1226-1233 (the 0/1/2 typing by raphe number, with
//     spatial-position and function subcategories).
//   - Cardiology / echocardiography references reproducing the same no-raphe (0) / one-raphe (1,
//     most common; L-R / R-N / N-L subtypes) / two-raphe (2) grouping.
//
// Types (number of raphes):
//   0 : no raphe - two (usually symmetrical) leaflets and two commissures.
//   1 : one raphe - a raphe formed by the fusion of two underdeveloped cusps; the most common type,
//       sub-categorized by the fused sinuses (L-R, R-N, or N-L).
//   2 : two raphes - the least common type.

const TYPES = {
  0: { type: '0', text: 'Sievers type 0 - no raphe; two (usually symmetrical) leaflets and two commissures.' },
  1: { type: '1', text: 'Sievers type 1 - one raphe, formed by the fusion of two underdeveloped cusps; the most common type, sub-categorized by the fused sinuses (L-R, R-N, or N-L).' },
  2: { type: '2', text: 'Sievers type 2 - two raphes; the least common type.' },
};

const NOTE = 'The Sievers classification types a bicuspid aortic valve by the number of raphes: 0 (no raphe, two symmetrical leaflets), 1 (one raphe, the most common; sub-typed by the fused sinuses L-R / R-N / N-L), 2 (two raphes, least common). The type informs aortic-valve repair and TAVR planning, but this reports the type the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = { 0: '0', 1: '1', 2: '2' };

// input:
//   type: '0' / '1' / '2'
export function sieversBav(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the Sievers type (0, 1, or 2).' };
  }
  return {
    valid: true,
    type: t.type,
    bandLabel: `Sievers type ${t.type}`,
    band: t.text,
    note: NOTE,
  };
}
