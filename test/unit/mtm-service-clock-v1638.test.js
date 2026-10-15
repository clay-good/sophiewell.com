// spec-v1638 tool 2: MTM review due dates and the CMR completion rate.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mtmServiceClock as mc } from '../../lib/mtm-service-clock-v1638.js';

const run = (enrollees, asOf = '2026-06-30') => mc({ contractYear: 2026, asOf, enrollees });
const row = (r, id) => r.rows.find((x) => x.enrollee === id);
// enrollee, enrolled, prior year, last offer, CMRs, TMRs, opt-out, age, hospice, met
test('CMR offer due: 60 days for a new member, one year from the last offer for a continuing one', () => {
  const r = run(['A, 2026-03-01, no, , , 2026-03-10, , 70, no, yes', 'B, 2026-01-01, yes, 2025-08-15, , 2026-02-01;2026-05-01, , 70, no, yes', 'C, 2026-01-01, yes, , , , , 70, no, yes', 'D, 2026-02-01, no, , 2026-03-01, 2026-02-10;2026-04-10, , 70, no, yes'].join('\n'));
  assert.deepEqual([row(r, 'A').cmrOfferDue, row(r, 'A').daysLeft], ['2026-04-30', -61]);
  assert.deepEqual([row(r, 'B').cmrOfferDue, row(r, 'B').daysLeft], ['2026-08-15', 46]);
  assert.equal(row(r, 'C').cmrOfferDue, undefined);
  assert.match(r.notes.join(' '), /C: carried over from last year with no last CMR offer date entered/);
  assert.equal(row(r, 'D').cmrOfferDue, undefined);
  assert.deepEqual([r.overdueOffers, r.flag], [1, 'offers-past-due']);
});

test('TMR: each quarter of enrollment through the as-of date with no review is listed', () => {
  const r = run('A, 2026-02-15, no, , , 2026-05-01, , 70, no, yes\nB, 2026-01-01, no, , , 2026-01-15;2026-04-15, 2026-04-01, 70, no, yes');
  assert.deepEqual(row(r, 'A').quartersWithoutTmr, ['Q1']);
  // B opted out April 1: enrollment ends March 31, so only Q1 counts.
  assert.deepEqual(row(r, 'B').quartersWithoutTmr, []);
});

test('completion rate: 60 days counted from the enrollment date, not the opt-out date', () => {
  const r = run(['A, 2026-01-01, no, , 2026-02-01, , , 70, no, yes', 'B, 2026-01-01, no, , , , , 70, no, yes',
    'C, 2026-01-01, no, , , , 2026-03-01, 70, no, yes', 'D, 2026-01-01, no, , , , 2026-03-02, 70, no, yes',
    'E, 2026-01-01, no, , 2026-01-20, , 2026-02-01, 70, no, yes', 'F, 2026-01-01, no, , 2026-02-01, , , 17, no, yes',
    'G, 2026-01-01, no, , 2026-02-01, , , 70, yes, yes', 'H, 2026-01-01, no, , 2026-02-01, , , 70, no, no'].join('\n'), '2026-12-31');
  // C: January 1 to February 28 is 59 days, no CMR: out. D: 60 days: in. E: 31 days with a CMR: in both.
  assert.deepEqual([row(r, 'C').daysEnrolled, row(r, 'C').inDenominator, row(r, 'D').daysEnrolled, row(r, 'D').inDenominator], [59, false, 60, true]);
  assert.deepEqual([row(r, 'E').inDenominator, row(r, 'E').cmrInYear], [true, true]);
  assert.deepEqual([r.denominator, r.numerator, r.ratePercent], [4, 2, 50]);
  assert.equal(row(r, 'F').reason, 'under 18 at the start of the year');
  assert.equal(row(r, 'G').reason, 'in hospice during the year');
  assert.equal(row(r, 'H').reason, 'did not meet the CMS targeting criteria');
  assert.match(r.notes.join(' '), /returns to the Star Ratings with the 2029 ratings/);
});

test('refusals', () => {
  assert.match(mc({}).message, /contract year/);
  assert.match(mc({ contractYear: 2026 }).message, /as-of date/);
  assert.match(mc({ contractYear: 2026, asOf: '2025-06-30' }).message, /inside 2026/);
  assert.match(run('').message, /^Enter the enrollees/);
  assert.match(run('A, 2026-01-01, maybe, , , , , 70, no, yes').message, /yes or no/);
  assert.match(run('A, 2026-01-01, no, , 2026-13-01, , , 70, no, yes').message, /CMR dates/);
  assert.match(run('A, 2026-01-01, no, , , , , 70, no, yes\nA, 2026-01-01, no, , , , , 70, no, yes').message, /appears twice/);
});

// 2026 Star Ratings Technical Notes, D11 (re-read October 14, 2026): no CMS rate under 31 in the denominator.
test('a denominator under 31 is flagged: CMS shows "Not enough data available"', () => {
  const line = (i) => `E${i}, 2026-01-01, no, , 2026-02-01, 2026-02-10;2026-04-10, , 70, no, yes`;
  const small = run(Array.from({ length: 30 }, (_, i) => line(i)).join('\n'));
  assert.deepEqual([small.denominator, small.belowCmsMinimum], [30, true]);
  assert.match(small.notes.join(' '), /fewer than 31 enrollees.*Not enough data available/);
  const enough = run(Array.from({ length: 31 }, (_, i) => line(i)).join('\n'));
  assert.deepEqual([enough.denominator, enough.belowCmsMinimum], [31, false]);
  assert.doesNotMatch(enough.notes.join(' '), /Not enough data/);
});
