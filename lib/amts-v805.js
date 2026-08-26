// spec-v805: AMTS (Abbreviated Mental Test Score), Hodkinson 1972.
//
// Source:
//   Hodkinson HM. Evaluation of a mental test score for assessment of mental impairment
//   in the elderly. Age Ageing. 1972;1(4):233-238. (PMID 4669880.)
//
// Ten questions, one point each, total 0-10. Higher is better.
//   age; time to the nearest hour; recall of an address given at the start; the current
//   year; the name of the place; recognizing two people; date of birth; the year the First
//   World War started; the name of the present monarch; counting backward from 20 to 1.
//
// TWO CUTOFFS ARE IN COMMON USE AND THEY DISAGREE. The validation literature reports a
// threshold of 7, meaning 6 or below suggests impairment; widespread clinical practice,
// particularly in the United Kingdom, uses under 8. A score of exactly 7 therefore falls
// BETWEEN them - impaired by the second rule, not by the first. This tile reports the score
// and both rules rather than picking one, because that gap is real and a clinician looking
// at a 7 needs to see it.
//
// Pure: no DOM, no clock, no network.

export const AMTS_NOTE = 'The Abbreviated Mental Test Score (Hodkinson HM, Age Ageing 1972;1(4):233-238) asks ten questions worth one point each, so the total runs 0 to 10 and higher is better. They cover age, the time to the nearest hour, recall of an address given at the start of the test, the current year, the name of the place, recognizing two people, date of birth, the year the First World War started, the name of the present monarch, and counting backward from twenty to one. Two cutoffs are in common use and they do not agree: the validation literature reports a threshold of 7, meaning 6 or below suggests impairment, while widespread clinical practice, particularly in the United Kingdom, treats anything under 8 as impaired. A score of exactly 7 falls between them, impaired by the second rule and not by the first, so this tile reports the score against both rather than picking one. It is a brief screen that flags the need for fuller assessment, it is affected by education and by language, and it does not diagnose dementia or delirium or tell the two apart.';

export const QUESTIONS = [
  { arg: 'age', text: 'age' },
  { arg: 'time', text: 'time to the nearest hour' },
  { arg: 'addressRecall', text: 'recall of the address given at the start' },
  { arg: 'year', text: 'the current year' },
  { arg: 'place', text: 'the name of the place' },
  { arg: 'twoPersons', text: 'recognizing two people' },
  { arg: 'dateOfBirth', text: 'date of birth' },
  { arg: 'warYear', text: 'the year the First World War started' },
  { arg: 'monarch', text: 'the name of the present monarch' },
  { arg: 'countBackwards', text: 'counting backward from 20 to 1' },
];

function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }

export function amts(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const correct = QUESTIONS.filter((q) => truthy(o[q.arg]));
  const score = correct.length;

  // The two published rules, kept separate on purpose.
  const impairedByValidation = score <= 6;
  const impairedByPractice = score < 8;
  const between = impairedByPractice && !impairedByValidation;

  let reading;
  if (between) {
    reading = 'between the two rules in common use: impaired by the widely used under-8 rule, not by the 6-or-below threshold from the validation literature';
  } else if (impairedByValidation) {
    reading = 'below both cutoffs in common use, so impaired on either rule';
  } else {
    reading = 'at or above 8, so not impaired on either rule in common use';
  }

  return {
    valid: true,
    score,
    correct: correct.map((q) => q.text),
    impairedByValidation,
    impairedByPractice,
    between,
    // The practice rule is the more inclusive of the two, so it is the one that decides
    // whether anything is flagged at all.
    abnormal: impairedByPractice,
    bandLabel: `AMTS ${score} of 10`,
    band: `AMTS ${score} of 10 — ${reading}.`,
    detail: 'Ten questions, one point each. Two cutoffs are in common use and they disagree: 6 or below from the validation literature, and under 8 from widespread clinical practice. A score of exactly 7 falls between them. Both are reported here rather than one being chosen.',
    note: AMTS_NOTE,
  };
}
