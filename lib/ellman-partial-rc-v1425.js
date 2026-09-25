// spec-v1425: Ellman classification of partial-thickness rotator cuff tears, seen at arthroscopy.
//
// Sources, read 2026-09-24:
//   Ellman H. Diagnosis and treatment of incomplete rotator cuff tears. Clin Orthop Relat Res
//     1990;(254):64-74 (PubMed 2182260) -- the original.
//   Bi AS, Verma NN. Classifications in brief: the Ellman and Snyder classifications of
//     partial-thickness rotator cuff tears. Clin Orthop Relat Res 2025;483(3):411-414
//     (PMC11827997). Its Table 1: location "A. Articular", "B. Bursal", "C. Intratendinous";
//     grade 1 "< 3 mm deep", 2 "3-6 mm deep", 3 "> 6 mm deep". Text: based on "an assumption that
//     the normal rotator cuff is 10 to 12 mm thick"; later correlated as < 25%, 25% to 50% and > 50%
//     of thickness, a conversion with "little scientific basis"; measure with "a 3-mm bent probe or
//     a suction shaver of known diameter", and also the base width and retraction.
//     Reliability at arthroscopy: kappa 0.85 for full versus partial, 0.85 for articular versus
//     bursal, 0.19 for the grade; on MRI 0.77, 0.44 and -0.11. The review: "insufficiently reliable
//     to classify" partial tears.
//
// SNYDER'S GRADING IS NOT ENCODED. The same review gives Snyder's 0-4 partial-tear grades by size
// (< 1 cm; < 2 cm but > 1 cm; 2 to 3 cm; > 3 cm), leaves a tear of exactly 1 cm in no grade, and
// says "it is not even clear in what dimension or anatomic plane the cutoffs ... refer to". A
// size field would have to guess both.
//
// The grade is derived from the measured depth: exactly 3 mm and exactly 6 mm are grade 2 (the
// table's "3-6 mm"). The 30 mm ceiling is a sanity envelope only (the source assumes a 10 to 12 mm
// tendon); it is not a criterion. Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const ELLM_LOCATION = [
  { value: 'articular', text: 'A: articular side' },
  { value: 'bursal', text: 'B: bursal side' },
  { value: 'intratendinous', text: 'C: intratendinous (interstitial)' },
  { value: 'full', text: 'Full thickness (not a partial tear)' },
];

const LETTER = { articular: 'A', bursal: 'B', intratendinous: 'C' };
const SIDE = { articular: 'articular-side', bursal: 'bursal-side', intratendinous: 'intratendinous' };
const DEPTH = { 1: 'less than 3 mm deep', 2: '3 to 6 mm deep', 3: 'more than 6 mm deep' };

const RELIABILITY = 'Surgeons agree on full versus partial thickness (kappa 0.85 at arthroscopy) and on the side (0.85), but not on the grade (0.19 at arthroscopy, -0.11 on MRI). The review advises against using the grade for communication, research or prognosis.';

export function ellmanPartialRc(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const location = ELLM_LOCATION.some((x) => x.value === o.location) ? o.location : null;
  if (!location) return { valid: false, message: 'Choose where the tear is: articular side, bursal side, intratendinous, or full thickness.' };

  const note = 'Ellman H, Clin Orthop Relat Res 1990; table as given by Bi AS and Verma NN, Clin Orthop Relat Res 2025. '
    + 'An arthroscopic classification: it describes the tear and does not choose the treatment. Snyder\'s size-based grading, in the same review, is not included because its size cutoffs are not defined well enough to apply.';

  if (location === 'full') {
    return {
      valid: true,
      abnormal: true,
      type: 'full',
      band: 'A full-thickness tear: the Ellman partial-thickness grades do not apply.',
      bandLabel: 'Full thickness',
      notes: ['Telling full from partial thickness is the one use the review supports for this classification.', RELIABILITY],
      note,
    };
  }

  const fault = inputFault([['tear depth', o.depthMm, null, 30, 'mm']]);
  if (fault) return { valid: false, message: fault };
  const depth = Number(String(o.depthMm).trim());

  const grade = depth < 3 ? 1 : depth <= 6 ? 2 : 3;
  const notes = [];
  if (depth > 12) {
    notes.push(`A depth of ${depth} mm is more than the 10 to 12 mm Ellman took as the whole tendon's thickness; check that the tear is not full thickness.`);
  }
  notes.push('Ellman advised measuring depth with a 3 mm bent probe or a shaver of known diameter, and recording the base width and retraction as well.');
  notes.push('Later work equated the grades with less than 25%, 25% to 50% and more than 50% of tendon thickness; the review finds little basis for that conversion, since tendon thickness varies.');
  notes.push(RELIABILITY);

  return {
    valid: true,
    abnormal: true,
    type: LETTER[location],
    grade,
    band: `Ellman grade ${grade}, type ${LETTER[location]}: a partial-thickness ${SIDE[location]} tear ${DEPTH[grade]}.`,
    bandLabel: `Grade ${grade}, type ${LETTER[location]}`,
    notes,
    note,
  };
}
