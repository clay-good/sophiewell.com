// spec-v1634 tool 25: GerontoNet ADR risk score for a hospitalized patient 65 or older.
//
// Source: Onder G, Petrovic M, Tangiisuran B, et al. Development and validation of a score to assess risk of
// adverse drug reactions among in-hospital patients 65 years or older: the GerontoNet ADR risk score. Arch
// Intern Med. 2010;170(13):1142-1148. Read in full at jamanetwork.com on October 17, 2026 (the spec's build gate
// was that the paper had not been opened).
//   Table 2 points: 4 or more comorbid conditions 1; heart failure 1; liver disease 1; number of drugs "<=5" 0,
//   "5-7" 1, ">=8" 4; previous ADR 2; renal failure 1. Range 0 to 10.
//   Renal failure: "A glomerular filtration rate of less than 60 mL/min was used to define renal failure" (MDRD).
//   Derivation: ADRs rose "from 2.0% among patients with a score of 0 to 1 to 21.7% among those with a score of
//   8 or more"; "A cut point between 3 and 4 seemed to have a good balance between sensitivity (68%) and
//   specificity (65%)". Validation (483 patients): 4.5% at 0-1, 4.2% at 2-3, 7.0% at 4-5, 11.5% at 6-7, 28% at 8
//   or more.
//
// The paper's tables print the drug bands as "<=5" and "5-7", which overlap at 5; its text writes "<5". Exactly 5
// drugs therefore scores 0 or 1 depending on which the reader takes, and the result gives both rather than
// choosing (the owner's rule for a misprinted band: no inferred reading).
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const YES_NO = [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }];
const ITEMS = [
  ['previousAdr', 'a previous adverse drug reaction', 2],
  ['comorbidities', '4 or more comorbid conditions', 1],
  ['heartFailure', 'heart failure', 1],
  ['liverDisease', 'liver disease', 1],
  ['renalFailure', 'renal failure (GFR under 60 mL/min)', 1],
];
const NOTE = 'A risk score from one Italian inpatient cohort aged 65 or older (Onder 2010), with an area under the ROC curve of about 0.7. It points to who might need a closer medication review; it does not predict an ADR for one patient.';
const VALIDATION = [
  [1, '4.5% at a score of 0 to 1'], [3, '4.2% at 2 to 3'], [5, '7.0% at 4 to 5'], [7, '11.5% at 6 to 7'], [Infinity, '28% at 8 or more'],
];

function drugPoints(n) {
  if (n < 5) return [0];
  if (n === 5) return [0, 1];
  if (n <= 7) return [1];
  return [4];
}

export function gerontonetAdrRisk(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the number of drugs', o.drugs, 0, 100, '']]);
  if (f) return { valid: false, message: f };
  const drugs = Number(o.drugs);
  if (!Number.isInteger(drugs)) return { valid: false, message: 'Enter the number of drugs as a whole number.' };
  const missing = ITEMS.filter(([k]) => o[k] !== 'yes' && o[k] !== 'no').map(([, label]) => label);
  if (missing.length) return { valid: false, message: `Answer yes or no for ${missing.join(', ')}: an unanswered item is not a no.` };
  const met = ITEMS.filter(([k]) => o[k] === 'yes');
  const itemPoints = met.reduce((s, [, , p]) => s + p, 0);
  const dp = drugPoints(drugs);
  const scores = dp.map((p) => p + itemPoints);
  const parts = [`${drugs} drug${drugs === 1 ? '' : 's'}: ${dp.length > 1 ? '0 or 1' : dp[0]} point${dp[0] === 1 && dp.length === 1 ? '' : 's'}`, ...met.map(([, label, p]) => `${label}: ${p}`)];
  const band = (s) => VALIDATION.find(([hi]) => s <= hi)[1];
  const notes = [`Points: ${parts.join('; ')}.`];
  if (dp.length > 1) notes.push('The paper\'s tables print the drug bands as 5 or fewer and 5 to 7, which overlap at 5, while its text writes fewer than 5. Both readings are given.');
  notes.push('In the derivation cohort ADRs went from 2.0% at a score of 0 to 1 to 21.7% at 8 or more; the authors found a cut point between 3 and 4 balanced sensitivity (68%) and specificity (65%).');
  if (scores.length > 1) {
    return {
      valid: true, scoreLow: scores[0], scoreHigh: scores[1], ambiguous: true,
      band: `GerontoNet ADR risk score ${scores[0]} or ${scores[1]} of 10, depending on how 5 drugs is read. Validation cohort ADR rate: ${band(scores[0]) === band(scores[1]) ? band(scores[0]) : `${band(scores[0])}; ${band(scores[1])}`}.`,
      bandLabel: `${scores[0]} or ${scores[1]} of 10`, abnormal: scores[1] >= 4, notes, note: NOTE,
    };
  }
  const s = scores[0];
  return {
    valid: true, score: s,
    band: `GerontoNet ADR risk score ${s} of 10${s >= 4 ? ', above the authors\' cut point between 3 and 4' : ''}. Validation cohort ADR rate: ${band(s)}.`,
    bandLabel: `${s} of 10`, abnormal: s >= 4, notes, note: NOTE,
  };
}
