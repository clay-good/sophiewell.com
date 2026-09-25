// spec-v1469: Blackburne-Peel index (patellar height).
//
// A third patellar-height ratio beside the Insall-Salvati ratio and the Caton-Deschamps index.
// Sources, read 2026-09-25:
//   Blackburne JS, Peel TE. A new method of measuring patellar height. J Bone Joint Surg Br.
//   1977;59(2):241-242. doi:10.1302/0301-620X.59B2.873986. Mean in normal knees 0.80 (SD 0.14), as
//   tabulated in Cureus 2023 (PMC10171240) Table 3; normal range 0.54-1.06, as restated in Ann Med
//   Surg (Lond) 2022 (PMC9577418): "The Blackburne-Peel index has a normal value of 0.54-1.06."
//   Rev Bras Ortop 2012 (PMC4799376) Table 1: low patella < 0.80, normal 0.8-1.0, high > 1.0.
//   Cureus 2023 (PMC10171240): A = perpendicular from the inferior articular point of the patella
//   to the tibial plateau line; B = length of the patellar articular surface; knee flexed at least
//   30 degrees.
//   Arthrosc Sports Med Rehabil 2021 (PMC8129056): the index is affected by tibial slope.
//
//   Blackburne-Peel index = A / B (both mm), on a lateral knee radiograph at about 30 degrees.
//
// The two published cutoff sets disagree, so the reading is given against BOTH rather than one
// picked silently. Boundaries: the original range is inclusive (0.54 and 1.06 are within it); the
// categories are low < 0.80, normal 0.80-1.00 inclusive, high > 1.00.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const BP_ORIGINAL = { lo: 0.54, hi: 1.06 };
export const BP_CATEGORIES = { lo: 0.80, hi: 1.00 };
const CUTOFFS = [BP_ORIGINAL.lo, BP_ORIGINAL.hi, BP_CATEGORIES.lo, BP_CATEGORIES.hi];

const RANGE = 'the 0.54 to 1.06 range of the original normal knees';
const CATS = 'the commonly used categories';

function side(x, lo, hi) {
  if (x < lo) return 'low';
  if (x > hi) return 'high';
  return 'normal';
}

function reading(orig, cat) {
  if (orig === 'normal' && cat === 'normal') {
    return `normal patellar height by both the original range (0.54 to 1.06) and ${CATS} (0.80 to 1.00).`;
  }
  if (orig === 'low' && cat === 'low') {
    return `low by both the original range (below 0.54) and ${CATS} (below 0.80).`;
  }
  if (orig === 'high' && cat === 'high') {
    return `high by both the original range (above 1.06) and ${CATS} (above 1.00).`;
  }
  // The categories' normal band sits inside the original range, so the only disagreement is a
  // ratio within the original range that the categories read as low or high.
  return cat === 'low'
    ? `within ${RANGE}, but below 0.80, the low cutoff of ${CATS}.`
    : `within ${RANGE}, but above 1.00, the high cutoff of ${CATS}.`;
}

export function blackburnePeel(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const fault = inputFault([
    ['distance A (inferior patellar articular surface to the tibial plateau line)', o.distanceA, 0, 80, 'mm'],
    ['length B (patellar articular surface)', o.lengthB, 10, 80, 'mm'],
  ]);
  if (fault) return { valid: false, message: fault };
  const a = Number(o.distanceA);
  const b = Number(o.lengthB);
  // Classify on the unrounded ratio. The 1e-9 cleanup only removes floating-point noise, so 16.2 / 30
  // reads as 0.54, not 0.53999...
  const x = Math.round((a / b) * 1e9) / 1e9;
  const index = Math.round(x * 100) / 100;
  // A value just off a cutoff that rounds ONTO it (0.799 -> "0.80") would print a ratio its own
  // reading contradicts; show a third decimal then.
  const shown = CUTOFFS.includes(index) && index !== x ? x.toFixed(3) : index.toFixed(2);
  const orig = side(x, BP_ORIGINAL.lo, BP_ORIGINAL.hi);
  const cat = side(x, BP_CATEGORIES.lo, BP_CATEGORIES.hi);
  return {
    valid: true,
    index,
    original: orig,
    category: cat,
    agree: orig === cat,
    abnormal: orig !== 'normal' || cat !== 'normal',
    band: `Blackburne-Peel index ${shown} (A ${a} mm / B ${b} mm): ${reading(orig, cat)}`,
    bandLabel: `Index ${shown}`,
    notes: [
      'Sources publish different cutoffs: the original normal knees ranged 0.54 to 1.06 (mean 0.80), while a commonly used scheme calls below 0.80 low and above 1.00 high. Which set applies between them is a matter of convention.',
      'The index is affected by the tibial slope (Arthrosc Sports Med Rehabil 2021).',
      'It does not depend on the tibial tubercle, so it can be used when the tubercle is abnormal, for example in Osgood-Schlatter disease or after a tubercle osteotomy.',
      'It is a radiographic measurement; it supports rather than replaces the clinical assessment of patellar instability.',
    ],
    note: 'Blackburne JS, Peel TE, J Bone Joint Surg Br 1977;59(2):241-242. Categories as tabulated in Rev Bras Ortop 2012.',
  };
}
