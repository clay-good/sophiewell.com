// spec-v506: the Jerger classification of tympanogram shapes (types A, As, Ad, B, C), the standard way a
// tympanometry tracing is reported. Tympanometry was uncovered entirely - "tympanogram", "tympanometry",
// "audiogram", and "jerger" were all zero-hit. The catalog's only otology tile is sade-retraction (tympanic
// membrane retraction), a different measurement.
//
// HIGH-STAKES: this reports the tympanogram TYPE the clinician or audiologist has read from the tracing, NOT
// a diagnosis, a hearing-loss severity, or a treatment decision such as tube placement (spec-v11 section 5.3).
// The type-to-cause associations below are the classic associations, stated descriptively; a type never
// establishes a cause on its own. The management decision stays with the audiology and ENT team.
//
// TYPES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Jerger J. Clinical experience with impedance audiometry. Arch Otolaryngol. 1970;92(4):311-324.
//   - Audiology references reproducing the same A / As / Ad / B / C shapes and the same peak-pressure and
//     compliance descriptions.
//
// Types (by peak pressure and peak compliance of the tracing):
//   A  : a normal peak, at normal middle-ear pressure with normal compliance.
//   As : a shallow peak at normal pressure - reduced compliance (a stiff system).
//   Ad : a deep or very tall peak at normal pressure - abnormally high compliance.
//   B  : a flat tracing with no identifiable peak. With a normal ear-canal volume this is classically middle
//        ear effusion; with a large canal volume it suggests a perforation or a patent tube.
//   C  : a peak shifted to significantly negative pressure - classically eustachian tube dysfunction.

const TYPES = {
  A: { type: 'A', text: 'Jerger type A - a normal peak, at normal middle-ear pressure with normal compliance.' },
  AS: { type: 'As', text: 'Jerger type As - a shallow peak at normal pressure: reduced compliance, a stiff middle-ear system.' },
  AD: { type: 'Ad', text: 'Jerger type Ad - a deep or very tall peak at normal pressure: abnormally high compliance.' },
  B: { type: 'B', text: 'Jerger type B - a flat tracing with no identifiable peak. With a normal ear-canal volume this classically indicates middle ear effusion; with a large canal volume it suggests a perforation or a patent tube.' },
  C: { type: 'C', text: 'Jerger type C - a peak shifted to significantly negative pressure, classically associated with eustachian tube dysfunction.' },
};

const NOTE = 'The Jerger classification (Jerger 1970) reports the shape of a tympanogram by its peak pressure and peak compliance. A: normal peak, normal pressure and compliance. As: shallow peak, reduced compliance (a stiff system). Ad: deep peak, abnormally high compliance. B: flat, no peak - classically effusion at a normal canal volume, or a perforation or patent tube at a large canal volume. C: peak at significantly negative pressure, classically eustachian tube dysfunction. The cause associations are the classic ones, stated descriptively; a type never establishes a cause on its own. This reports the type read from the tracing, not a diagnosis, a hearing-loss severity, or a decision about tubes.';

const ALIAS = {
  A: 'A', AS: 'AS', AD: 'AD', B: 'B', C: 'C',
  'A-S': 'AS', 'A-D': 'AD', 'A S': 'AS', 'A D': 'AD',
};

// input:
//   type: 'A' / 'As' / 'Ad' / 'B' / 'C' (case-insensitive).
export function jergerTympanogram(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim().toUpperCase().replace(/\s+/g, ' ');
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the tympanogram type (A, As, Ad, B, or C).' };
  }
  return {
    valid: true,
    type: t.type,
    bandLabel: `Jerger type ${t.type}`,
    band: t.text,
    note: NOTE,
  };
}
