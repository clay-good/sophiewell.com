// spec-v1638 tools 21 and 23: PRN psychotropic 14-day limit and the medication error rate.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { medPassErrorRate } from '../../lib/med-pass-error-rate-v1638.js';
import { psychotropicPrnClock } from '../../lib/psychotropic-prn-clock-v1638.js';

const now = new Date(2026, 9, 12);
const rate = (dosesGiven, dosesOmitted, errors, significantErrors = 0) => medPassErrorRate({ dosesGiven, dosesOmitted, errors, significantErrors });

test('error rate: errors over doses given plus doses ordered but not given', () => {
  const r = rate(48, 2, 2);
  assert.deepEqual([r.opportunities, r.ratePercent, r.atOrOverFivePercent, r.flag], [50, 4, false, 'under-five-percent']);
});

test('error rate: 4.6% is not rounded up to 5%; exactly 5% is "5% or greater"', () => {
  // 23 of 500 is 4.6%.
  assert.deepEqual([rate(500, 0, 23).ratePercent, rate(500, 0, 23).atOrOverFivePercent], [4.6, false]);
  // 49 of 981 is 4.9949%: truncated to 4.9, and under.
  assert.deepEqual([rate(981, 0, 49).ratePercent, rate(981, 0, 49).atOrOverFivePercent], [4.9, false]);
  assert.deepEqual([rate(100, 0, 5).ratePercent, rate(100, 0, 5).atOrOverFivePercent], [5, true]);
});

test('error rate: a significant error fails whatever the rate', () => {
  const r = rate(100, 0, 1, 1);
  assert.deepEqual([r.atOrOverFivePercent, r.flag, r.abnormal], [false, 'significant-error', true]);
});

test('error rate: how far the count is from the 5% line', () => {
  // 3 of 40 is 7.5%: 21 more error-free opportunities gives 3 of 61, 4.9%.
  assert.equal(rate(40, 0, 3).errorFreeOpportunitiesToGoUnder, 21);
  assert.equal(3 * 20 < 40 + 21, true);
  assert.equal(3 * 20 < 40 + 20, false);
  // 2 of 50 is 4%: one more error is 3 of 51, 5.88%.
  assert.equal(rate(48, 2, 2).furtherErrorsToReachFivePercent, 1);
  // 0 of 100: 6 more errors is 6 of 106 (5.66%); 5 is 5 of 105 (4.76%).
  assert.equal(rate(100, 0, 0).furtherErrorsToReachFivePercent, 6);
});

test('error rate: refusals', () => {
  assert.match(medPassErrorRate({}).message, /^Enter the doses observed/);
  assert.match(rate(50, 0, 2, 3).message, /no more significant errors/);
  assert.match(rate(5, 0, 6).message, /no more errors than opportunities/);
  assert.match(rate(0, 0, 0).message, /no opportunities/);
  assert.match(rate(50.5, 0, 1).message, /whole number/);
});

test('PRN clock: day 1 is the start date, so the last day is the start plus 13', () => {
  const r = psychotropicPrnClock({ kind: 'other-psychotropic-prn', started: '2026-10-01', extension: 'no-documented-extension' }, now);
  assert.deepEqual([r.lastDay, r.fourteenDayEnd, r.daysLeft, r.flag], ['2026-10-14', '2026-10-14', 2, 'fourteen-day-limit']);
});

test('PRN clock: another psychotropic runs longer only with a documented rationale and duration', () => {
  const r = psychotropicPrnClock({ kind: 'other-psychotropic-prn', started: '2026-10-01', extension: 'rationale-with-duration-documented', durationDays: 30 }, now);
  assert.deepEqual([r.lastDay, r.flag], ['2026-10-30', 'extended-by-documentation']);
  assert.match(psychotropicPrnClock({ kind: 'other-psychotropic-prn', started: '2026-10-01', extension: 'rationale-with-duration-documented' }, now).message, /^Enter the documented duration/);
  assert.match(psychotropicPrnClock({ kind: 'other-psychotropic-prn', started: '2026-10-01' }, now).message, /^Choose whether the prescriber documented/);
});

test('PRN clock: an antipsychotic is never extended, and a staff report is not an evaluation', () => {
  const r = psychotropicPrnClock({ kind: 'antipsychotic-prn', started: '2026-09-20', extension: 'rationale-with-duration-documented', durationDays: 60 }, now);
  assert.deepEqual([r.lastDay, r.flag], ['2026-10-03', 'order-has-run-out']);
  assert.match(r.note, /cannot be extended/);
  assert.match(r.note, /a report from staff to the prescriber is not an evaluation/);
  assert.match(psychotropicPrnClock({ started: '2026-10-01' }, now).message, /^Choose whether the PRN order is for an antipsychotic/);
  assert.match(psychotropicPrnClock({ kind: 'antipsychotic-prn' }, now).message, /^Enter the date the PRN order started/);
});
