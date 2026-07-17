// spec-v380: Young-Burgess classification of a pelvic ring injury — a MECHANISM-based grouping
// (lateral compression LC I-III, anteroposterior compression APC I-III, vertical shear VS, combined
// mechanism CM). It is the companion to the Tile (AO/Tile) stability-based grouping already in the
// catalog. "young burgess" / "pelvic ring injury mechanism" routed to nothing.
//
// HIGH-STAKES: this reports the Young-Burgess PATTERN the clinician has determined from the imaging /
// mechanism, NOT a diagnosis, a treatment decision, or a prognosis for an individual patient
// (spec-v11 §5.3). The stability associations below are the classically taught pattern, not an order;
// the management decision stays with the orthopedic / trauma team.
//
// PATTERNS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Young JW, Burgess AR, Brumback RJ, Poka A. Pelvic fractures: value of plain radiography in early
//     assessment and management. Radiology. 1986;160(2):445-451 (the mechanism-based patterns).
//   - Manson T, et al. Classifications in Brief: Young and Burgess classification of pelvic ring
//     injuries. Clin Orthop Relat Res. 2014 (the LC I-III / APC I-III / VS / CM sub-patterns and their
//     stability).
//
// Patterns (force vector → injury; the flagged patterns are the typically-unstable ones):
//   LC-I  : lateral compression, ipsilateral sacral (ala) compression; stable.
//   LC-II : lateral compression with a crescent (posterior iliac wing / SI) fracture; partially stable.
//   LC-III: "windswept" pelvis — ipsilateral LC + contralateral APC (open-book); unstable. Flagged.
//   APC-I : symphysis widening < 2.5 cm, the anterior SI ligaments intact; stable.
//   APC-II: symphysis widening > 2.5 cm, anterior SI disrupted, posterior SI intact (open-book,
//           rotationally unstable); partially stable. Flagged.
//   APC-III: complete SI disruption (anterior AND posterior); rotationally and vertically unstable.
//           Flagged.
//   VS    : vertical shear — superior/posterior migration of a hemipelvis, complete disruption; unstable.
//           Flagged.
//   CM    : combined mechanism — a combination of the above patterns; unstable. Flagged.

const PATTERNS = {
  'LC-I': { pattern: 'LC-I', unstable: false, text: 'Young-Burgess LC-I - lateral compression with ipsilateral sacral (ala) compression; a stable pattern.' },
  'LC-II': { pattern: 'LC-II', unstable: false, text: 'Young-Burgess LC-II - lateral compression with a crescent (posterior iliac wing / sacroiliac) fracture; partially stable.' },
  'LC-III': { pattern: 'LC-III', unstable: true, text: 'Young-Burgess LC-III - a "windswept" pelvis: ipsilateral lateral compression with contralateral anteroposterior compression (open-book); unstable.' },
  'APC-I': { pattern: 'APC-I', unstable: false, text: 'Young-Burgess APC-I - anteroposterior compression with symphysis widening under 2.5 cm and the anterior sacroiliac ligaments intact; a stable pattern.' },
  'APC-II': { pattern: 'APC-II', unstable: true, text: 'Young-Burgess APC-II - anteroposterior compression with symphysis widening over 2.5 cm, the anterior sacroiliac ligaments disrupted but the posterior intact (open-book, rotationally unstable); partially stable.' },
  'APC-III': { pattern: 'APC-III', unstable: true, text: 'Young-Burgess APC-III - anteroposterior compression with complete sacroiliac disruption (anterior and posterior); rotationally and vertically unstable.' },
  'VS': { pattern: 'VS', unstable: true, text: 'Young-Burgess VS - vertical shear: superior / posterior migration of a hemipelvis with complete disruption; unstable.' },
  'CM': { pattern: 'CM', unstable: true, text: 'Young-Burgess CM - combined mechanism: a combination of the above patterns; unstable.' },
};

const NOTE = 'The Young-Burgess classification groups a pelvic ring injury by the force vector (mechanism). LC (lateral compression) I-III: ipsilateral sacral compression -> crescent fracture -> windswept. APC (anteroposterior compression) I-III: progressive symphysis / sacroiliac disruption (III complete). VS: vertical shear. CM: combined. Lateral-compression patterns are the most common and often stable; APC-II/III, LC-III, VS, and CM are the typically-unstable patterns. These associations are the classically taught pattern, not an order. This reports the pattern the clinician has determined, not a diagnosis, a treatment decision, or a prognosis. Companion: the Tile (AO/Tile) stability-based grouping.';

const ALIAS = {
  'LC-I': 'LC-I', 'LC-II': 'LC-II', 'LC-III': 'LC-III',
  'APC-I': 'APC-I', 'APC-II': 'APC-II', 'APC-III': 'APC-III',
  'VS': 'VS', 'CM': 'CM',
  // space / no-separator forms
  'LC1': 'LC-I', 'LC2': 'LC-II', 'LC3': 'LC-III',
  'APC1': 'APC-I', 'APC2': 'APC-II', 'APC3': 'APC-III',
};

// input:
//   pattern: 'LC-I'..'LC-III', 'APC-I'..'APC-III', 'VS', 'CM' (case-insensitive; LC1/APC2 forms accepted)
export function youngBurgess(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.pattern == null ? '' : o.pattern).trim().toUpperCase().replace(/\s+/g, '');
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const p = PATTERNS[key];
  if (!p) {
    return { valid: false, message: 'Select the Young-Burgess pattern (LC-I to LC-III, APC-I to APC-III, VS, or CM).' };
  }
  return {
    valid: true,
    pattern: p.pattern,
    unstable: p.unstable,
    abnormal: p.unstable,
    bandLabel: `Young-Burgess ${p.pattern}`,
    band: p.text,
    note: NOTE,
  };
}
