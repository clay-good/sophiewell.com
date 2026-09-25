// spec-v1496: the Turesky modification of the Quigley-Hein plaque index, beside the Silness-Loe index.
//
// Sources, read 2026-09-25:
//   Turesky S, Gilmore ND, Glickman I. Reduced plaque formation by the chloromethyl analogue of
//     victamine C. J Periodontol. 1970;41(1):41-43 (the original).
//   Scores as stated in Int Dent J 2026 (PMC13094486): "0 = no plaque; 1 = separate flecks of plaque at
//     the gingival margin; 2 = a thin continuous band of plaque (<=1 mm) at the gingival margin;
//     3 = plaque covering more than 1 mm but less than one-third of the tooth surface; 4 = plaque
//     covering at least one-third but less than two-thirds of the tooth surface; 5 = plaque covering
//     two-thirds or more of the tooth surface."
//
// The index is the mean score over the surfaces examined; the reader enters how many surfaces scored
// each value (0 if none). Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const TQH_SCORES = [
  [0, 'no plaque'],
  [1, 'separate flecks at the gingival margin'],
  [2, 'a thin continuous band (up to 1 mm) at the margin'],
  [3, 'more than 1 mm but under a third of the surface'],
  [4, 'a third to under two thirds of the surface'],
  [5, 'two thirds of the surface or more'],
];

export function tureskyPlaque(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const fault = inputFault(TQH_SCORES.map(([s]) => [`the number of surfaces scored ${s} (0 if none)`, o[`n${s}`], 0, 200, '']));
  if (fault) return { valid: false, message: fault };
  const n = TQH_SCORES.map(([s]) => Number(o[`n${s}`]));
  if (!n.every(Number.isInteger)) return { valid: false, message: 'Enter each number of surfaces as a whole number.' };
  const surfaces = n.reduce((a, b) => a + b, 0);
  if (!surfaces) return { valid: false, message: 'Enter the surfaces examined: every count is 0.' };
  const mean = n.reduce((a, c, s) => a + c * s, 0) / surfaces;
  const m = Math.round(mean * 100) / 100;
  const heavy = n[3] + n[4] + n[5];
  const pct = Math.round((heavy / surfaces) * 100);
  return {
    valid: true,
    index: m,
    surfaces,
    abnormal: m > 0,
    band: `Turesky plaque index ${m.toFixed(2)} across ${surfaces} surfaces; ${heavy} (${pct}%) scored 3 or more, plaque beyond 1 mm from the margin.`,
    bandLabel: `TQHPI ${m.toFixed(2)}`,
    notes: [
      'The index is the mean score over the surfaces examined, so it depends on which teeth and surfaces were included.',
      'Compare readings taken on the same surfaces; a different set of surfaces changes the mean.',
    ],
    note: 'Turesky S et al, J Periodontol 1970, modifying Quigley and Hein; scores as stated in Int Dent J 2026.',
  };
}
