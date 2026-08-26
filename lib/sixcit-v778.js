// spec-v778: 6CIT (Six-item Cognitive Impairment Test), Kingshill Version 2000.
//
// Source:
//   Brooke P, Bullock R. Validation of a 6 item cognitive impairment test with a view
//   to primary care usage. Int J Geriatr Psychiatry. 1999;14(11):936-940. (PMID 10556864.)
//   Derived by regression from the Blessed Information-Memory-Concentration scale.
//
// An INVERSE score: points are earned for errors, so higher is worse. The six items are
// weighted, giving a maximum of 28:
//   year          correct 0, wrong 4
//   month         correct 0, wrong 3
//   time          correct 0, wrong 3
//   count 20 to 1 correct 0, 1 error 2, more than 1 error 4
//   months back   correct 0, 1 error 2, more than 1 error 4
//   address recall correct 0, then 2 points per component missed up to 10
//
// Scores of 0-7 are normal and 8 or more is significant. The commonly published
// refinement splits the significant range at 8-9 (probably refer) and 10-28 (refer).
//
// Only neutral task labels are used. The Kingshill Research Centre owns the copyright to
// the Kingshill Version 2000 wording and permits free use by healthcare professionals.
//
// Pure: no DOM, no clock, no network.

export const SIXCIT_NOTE = 'The 6CIT, the Six-item Cognitive Impairment Test, Kingshill Version 2000 (Brooke P, Bullock R, Int J Geriatr Psychiatry 1999;14(11):936-940), is a brief dementia screen for primary care. It is an inverse score: points are earned for errors, so higher is worse. Six weighted tasks give a maximum of 28, made up of the year (4), the month (3), the time within an hour (3), counting backward from 20 to 1 (up to 4), saying the months in reverse (up to 4), and recalling a five-part address (2 points per part missed, up to 10). Scores of 0 to 7 are normal and 8 or more is significant, with 8 to 9 usually treated as a reason to consider referral and 10 or more as a reason to refer. It is a screening test that flags the need for a fuller assessment; it does not diagnose dementia or any of its causes.';

const THREE_STEP = { 0: 0, 1: 2, 2: 4 };

function step(v, max) {
  if (v === '' || v === null || v === undefined) return 0;
  const n = typeof v === 'number' ? v : Number(String(v).trim());
  if (!Number.isInteger(n) || n < 0 || n > max) return null;
  return n;
}

function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }

export function sixcit(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  // countErrors / monthsErrors: 0 correct, 1 = one error, 2 = more than one error.
  const countErr = step(o.countErrors, 2);
  if (countErr === null) return { valid: false, code: 'INVALID_INPUT', field: 'countErrors', message: 'Counting backward: 0 correct, 1 for one error, 2 for more than one error.', note: SIXCIT_NOTE };
  const monthsErr = step(o.monthsErrors, 2);
  if (monthsErr === null) return { valid: false, code: 'INVALID_INPUT', field: 'monthsErrors', message: 'Months in reverse: 0 correct, 1 for one error, 2 for more than one error.', note: SIXCIT_NOTE };
  // addressErrors: how many of the five address components were missed, 0 to 5.
  const addrErr = step(o.addressErrors, 5);
  if (addrErr === null) return { valid: false, code: 'INVALID_INPUT', field: 'addressErrors', message: 'Address recall: number of the five components missed, 0 to 5.', note: SIXCIT_NOTE };

  const parts = [];
  let total = 0;
  if (truthy(o.yearWrong)) { total += 4; parts.push('year 4'); }
  if (truthy(o.monthWrong)) { total += 3; parts.push('month 3'); }
  if (truthy(o.timeWrong)) { total += 3; parts.push('time 3'); }
  if (countErr) { total += THREE_STEP[countErr]; parts.push(`counting backward ${THREE_STEP[countErr]}`); }
  if (monthsErr) { total += THREE_STEP[monthsErr]; parts.push(`months in reverse ${THREE_STEP[monthsErr]}`); }
  if (addrErr) { total += addrErr * 2; parts.push(`address recall ${addrErr * 2}`); }

  let tier, label;
  if (total <= 7) { tier = 'normal'; label = 'normal range'; }
  else if (total <= 9) { tier = 'mild'; label = 'significant, in the range usually treated as a reason to consider referral'; }
  else { tier = 'significant'; label = 'significant, in the range usually treated as a reason to refer'; }

  return {
    valid: true,
    score: total,
    tier,
    parts,
    abnormal: total >= 8,
    bandLabel: `6CIT ${total} of 28`,
    band: `6CIT ${total} of 28 — ${label}.`,
    detail: 'An inverse score: points are earned for errors, so higher is worse. Weights are year 4, month 3, time 3, counting backward up to 4, months in reverse up to 4, and address recall 2 per component missed up to 10. Bands: 0-7 normal, 8-9 consider referral, 10-28 refer.',
    note: SIXCIT_NOTE,
  };
}
