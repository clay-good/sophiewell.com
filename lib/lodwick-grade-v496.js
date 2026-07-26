// spec-v496: the Lodwick grading of the radiographic aggressiveness of a focal bone lesion (grades IA, IB,
// IC, II, III), read from the lesion margin and the pattern of bone destruction. It joins the bone-tumor tiles
// (enneking surgical staging, mirels-score fracture risk), which grade different axes entirely; the
// geographic / moth-eaten / permeative axis was uncovered. "lodwick" routed to nothing.
//
// HIGH-STAKES: this reports the radiographic GRADE the clinician has determined, NOT a diagnosis, a claim that
// a lesion is benign or malignant, a biopsy decision, or a prognosis (spec-v11 section 5.3). A higher grade
// indicates a faster-growing, more aggressive-appearing lesion, not a specific tumor. The management decision
// stays with the musculoskeletal radiology and orthopedic-oncology team.
//
// GRADES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Lodwick GS, Wilson AJ, Farrell C, et al. Determining growth rates of focal lesions of bone from
//     radiographs. Radiology. 1980;134(3):577-583.
//   - Musculoskeletal-radiology references reproducing the same geographic-sclerotic-margin (IA) through
//     moth-eaten-or-permeative (III) ordering.
//
// Grades (increasing aggressiveness / growth rate):
//   IA  : geographic, with a sclerotic margin.
//   IB  : geographic, with a well-defined margin but no sclerotic rim.
//   IC  : geographic, with an ill-defined margin.
//   II  : geographic with moth-eaten or permeative areas - a combined pattern.
//   III : moth-eaten or permeative throughout, with no geographic component.

const GRADES = {
  IA: { grade: 'IA', text: 'Lodwick grade IA - a geographic lesion with a sclerotic margin: the least aggressive radiographic appearance.' },
  IB: { grade: 'IB', text: 'Lodwick grade IB - a geographic lesion with a well-defined margin but no sclerotic rim.' },
  IC: { grade: 'IC', text: 'Lodwick grade IC - a geographic lesion with an ill-defined margin.' },
  II: { grade: 'II', text: 'Lodwick grade II - a geographic lesion with moth-eaten or permeative areas: a combined pattern.' },
  III: { grade: 'III', text: 'Lodwick grade III - a moth-eaten or permeative lesion with no geographic component: the most aggressive radiographic appearance.' },
};

const NOTE = 'The Lodwick grading (Lodwick and colleagues 1980) describes how aggressive a focal bone lesion looks on radiographs, from the margin and the pattern of bone destruction. IA: geographic with a sclerotic margin. IB: geographic, well-defined, no sclerotic rim. IC: geographic with an ill-defined margin. II: geographic with moth-eaten or permeative areas. III: moth-eaten or permeative throughout. A higher grade indicates a faster-growing, more aggressive-appearing lesion. This reports the grade the clinician has determined, not a diagnosis, a benign-or-malignant call, or a biopsy decision.';

const ALIAS = {
  IA: 'IA', IB: 'IB', IC: 'IC', II: 'II', III: 'III',
  '1A': 'IA', '1B': 'IB', '1C': 'IC',
  2: 'II', 3: 'III',
};

// input:
//   grade: 'IA' / 'IB' / 'IC' / 'II' / 'III' (case-insensitive; also accepts 1A, 1B, 1C, 2, 3).
//   Bare 'I' is ambiguous across IA/IB/IC and is rejected.
export function lodwickGrade(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.grade == null ? '' : o.grade).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const g = GRADES[key];
  if (!g) {
    return { valid: false, message: 'Select the Lodwick grade (IA, IB, IC, II, or III).' };
  }
  return {
    valid: true,
    grade: g.grade,
    bandLabel: `Lodwick grade ${g.grade}`,
    band: g.text,
    note: NOTE,
  };
}
