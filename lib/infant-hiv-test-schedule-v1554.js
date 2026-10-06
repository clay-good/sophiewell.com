// spec-v1554 tool 5: when is the next HIV test due for an HIV-exposed infant, and which test?
//
// Source: WHO. Consolidated guidelines on HIV prevention, testing, treatment, service delivery and
// monitoring, 2021 (HIV21; CC BY-NC-SA 3.0 IGO, facts restated). Read October 6, 2026: Box 2.5 and section
// 2.8.2 with Fig. 2.7 (pp. 40-42):
//   - consider NAT at birth (0-2 days); NAT at 4-6 weeks or at the earliest opportunity after; NAT at 9
//     months for every exposed infant, even after earlier negatives; a final antibody test at 18 months or 3
//     months after breastfeeding ends, whichever is later (breastfeeding past 18 months: at its end, at
//     least 3 months after).
//   - a positive NAT: start ART without delay and repeat NAT to confirm; if the second is negative, a third
//     NAT before stopping ART. Point-of-care NAT is used under 18 months; over 18 months a negative antibody
//     test confirms the child is uninfected and a positive one that the child is infected.
//
// Stated rather than hidden: ages are in weeks; 9 months is read as 39 weeks, 18 months as 78 weeks and 3
// months as 13 weeks. The tile computes the age at which each test is due, not a calendar date.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const FEEDING_OPTIONS = [
  { value: 'never', text: 'Never breastfed' },
  { value: 'ongoing', text: 'Still breastfeeding' },
  { value: 'stopped', text: 'Breastfeeding has stopped' },
];
export const RESULT_OPTIONS = [
  { value: 'notdone', text: 'Not done yet' },
  { value: 'neg', text: 'Negative' },
  { value: 'pos', text: 'Positive' },
];

const NAT6 = 4;
const NAT9 = 39;
const M18 = 78;
const NOTE = 'This follows WHO\'s 2021 consolidated HIV guidelines (Fig. 2.7, the simplified infant diagnosis algorithm). Ages in weeks: 9 months = 39 weeks, 18 months = 78 weeks.';
const wk = (x) => `${Math.round(x * 10) / 10} week${x === 1 ? '' : 's'}`;

export function infantHivTestSchedule(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the infant\'s age', o.age, 0, 260, 'weeks']]);
  if (f) return { valid: false, message: f };
  const age = Number(o.age);
  const feeding = FEEDING_OPTIONS.find((x) => x.value === o.feeding);
  if (!feeding) return { valid: false, message: 'Choose the feeding: never breastfed, still breastfeeding, or stopped. The final test turns on it.' };
  const nat6 = RESULT_OPTIONS.find((x) => x.value === o.nat6);
  const nat9 = RESULT_OPTIONS.find((x) => x.value === o.nat9);
  if (!nat6 || !nat9) return { valid: false, message: 'Choose the 4-6 week and 9-month NAT results (not done yet, negative, or positive).' };
  let stopped = null;
  if (feeding.value === 'stopped') {
    const fs = inputFault([['the age when breastfeeding stopped', o.stoppedAt, 0, 260, 'weeks']]);
    if (fs) return { valid: false, message: fs };
    stopped = Number(o.stoppedAt);
    if (stopped > age) return { valid: false, message: 'Enter an age when breastfeeding stopped that is not after the infant\'s age now.' };
  }
  const out = (band, label, abnormal, notes = []) => ({ valid: true, band, bandLabel: label, abnormal, notes, note: NOTE });
  const when = (due, test) => (age >= due ? `${test} now (due at ${wk(due)} of age).` : `${test} at ${wk(due)} of age, in ${wk(due - age)}.`);

  if (nat6.value === 'pos' || nat9.value === 'pos') {
    return out('A positive NAT: start ART now, without waiting, and repeat the NAT on a new sample to confirm.', 'Start ART, confirm', true,
      ['If the confirming NAT is negative, do a third NAT before stopping ART.']);
  }

  const notes = [];
  if (feeding.value === 'ongoing') notes.push('The risk of infection continues while breastfeeding continues.');
  if (feeding.value !== 'stopped' && String(o.stoppedAt ?? '').trim() !== '') notes.push('The age breastfeeding stopped is used only when breastfeeding has stopped.');
  if (nat6.value === 'notdone' && nat9.value === 'notdone') {
    if (age >= M18) return finalTest(age, feeding.value, stopped, out, notes, 'No NAT was done, and the child is 18 months or older: an antibody test now diagnoses infection.');
    if (age < NAT6) notes.push('A NAT at birth (0 to 2 days) can be considered.');
    return out(`Next: ${when(NAT6, 'NAT')}${age > 6 ? ' The 4-6 week test is late: do it at the earliest opportunity.' : ''}`, 'NAT at 4-6 weeks', false, notes);
  }
  if (nat9.value === 'notdone') {
    if (age >= M18) return finalTest(age, feeding.value, stopped, out, notes, 'The 9-month NAT was missed and the child is 18 months or older.');
    notes.push('Every exposed infant gets the 9-month NAT, even after a negative earlier test.');
    return out(`Next: ${when(NAT9, 'NAT')}`, 'NAT at 9 months', false, notes);
  }
  return finalTest(age, feeding.value, stopped, out, notes, null);
}

function finalTest(age, feeding, stopped, out, notes, lead) {
  if (lead) notes.push(lead);
  if (feeding === 'ongoing') {
    notes.push('Over 18 months a negative antibody test confirms the child is uninfected; under 18 months, a positive test needs a NAT.');
    return out('Next: the final antibody test 3 months after breastfeeding ends, and not before 18 months (78 weeks). HIV is unlikely so far, but the exposure continues while breastfeeding.', 'Final test after weaning', false, notes);
  }
  const due = feeding === 'never' ? M18 : Math.max(M18, stopped + 13);
  const why = feeding === 'never' ? '18 months' : (stopped + 13 > M18 ? '3 months after breastfeeding stopped' : '18 months, which is later than 3 months after breastfeeding stopped');
  notes.push('A negative antibody test then confirms the child is uninfected; a positive one confirms infection.');
  const now = age >= due;
  return out(`Next: the final antibody test ${now ? 'now' : `at ${wk(due)} of age, in ${wk(due - age)}`} (${why}).`, now ? 'Final antibody test now' : 'Final antibody test', false, notes);
}
