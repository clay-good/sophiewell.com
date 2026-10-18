// spec-v1634 tool 24: Medication Appropriateness Index, summated (weighted) score for one drug.
//
// Sources: Hanlon JT et al. J Clin Epidemiol 1992;45:1045-1051 (the index) and Samsa GP et al. J Clin Epidemiol
// 1994;47:891-896 (the weights); neither is open. Built on the owner's rule of October 17, 2026 that a verified
// reprint is a source. The weights for an "inappropriate" rating were read in open papers:
//   PMC5585512 (Medicine 2017): indication 3, effectiveness 3; dosage, correct directions, drug-drug and
//     drug-disease interactions 2; practical directions, duplication, duration and cost 1.
//   PMC7690110 (2020): the same (it scores nine items, leaving out cost).
//   PMC9007813 (2022): indication and effectiveness 3, dosage and correct directions 2, practical directions 1.
//   PMC3780501 (Pharm Pract 2012) gives practical directions 2 and drug-disease interactions 1, against the three
//     above on practical directions; every source, and the developers' 2013 review (PMC3831621), gives 18 as the
//     highest score per drug, which with the other nine weights fixes drug-disease interactions at 2. Not followed.
// Only an "inappropriate" rating carries the weight; "appropriate" and "marginal" score 0 (the papers above call
// the summated score dichotomized). The ten criteria are the site's own short labels.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const RATINGS = [
  { value: 'appropriate', text: 'Appropriate' },
  { value: 'marginal', text: 'Marginally appropriate' },
  { value: 'inappropriate', text: 'Inappropriate' },
];
export const CRITERIA = [
  ['indication', 'Indication', 3],
  ['effectiveness', 'Effectiveness', 3],
  ['dosage', 'Dosage', 2],
  ['directionsCorrect', 'Directions correct', 2],
  ['interactionsDrug', 'Drug-drug interactions', 2],
  ['interactionsDisease', 'Drug-disease interactions', 2],
  ['directionsPractical', 'Directions practical', 1],
  ['duplication', 'Duplication', 1],
  ['duration', 'Duration', 1],
  ['expense', 'Expense', 1],
];
const NOTE = 'The summated Medication Appropriateness Index (Hanlon 1992, weights Samsa 1994) as printed in open papers: 0 is appropriate on every criterion and 18 the most inappropriate for one drug. A structured review aid, not a prescribing decision.';

export function maiScore(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const ok = (v) => v === 'appropriate' || v === 'marginal' || v === 'inappropriate';
  const missing = CRITERIA.filter(([k]) => !ok(o[k])).map(([, label]) => label);
  if (missing.length) return { valid: false, message: `Rate each criterion; still unrated: ${missing.join(', ')}.` };
  const bad = CRITERIA.filter(([k]) => o[k] === 'inappropriate');
  const marginal = CRITERIA.filter(([k]) => o[k] === 'marginal').map(([, label]) => label);
  const score = bad.reduce((s, [, , w]) => s + w, 0);
  const notes = [];
  notes.push(bad.length ? `Inappropriate: ${bad.map(([, label, w]) => `${label} (${w})`).join(', ')}.` : 'No criterion was rated inappropriate.');
  if (marginal.length) notes.push(`Rated marginal, which scores 0 in the summated index: ${marginal.join(', ')}.`);
  let regimen = null;
  const others = String(o.otherScores ?? '').split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
  if (others.length) {
    for (const s of others) {
      const f = inputFault([['another drug\'s score', s, 0, 18, '']]);
      if (f) return { valid: false, message: f };
    }
    regimen = score + others.reduce((t, s) => t + Number(s), 0);
    notes.push(`Regimen total, with ${others.length} other drug score${others.length === 1 ? '' : 's'} entered: ${regimen}.`);
  }
  notes.push('Weights for an inappropriate rating: indication and effectiveness 3; dosage, correct directions, drug-drug and drug-disease interactions 2; practical directions, duplication, duration and expense 1.');
  return {
    valid: true, score, regimenScore: regimen,
    band: `MAI for this drug: ${score} of 18${regimen != null ? `; regimen ${regimen}` : ''}.`,
    bandLabel: `${score} of 18`, abnormal: score > 0, notes, note: NOTE,
  };
}
