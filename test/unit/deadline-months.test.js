// spec-v1501 §5: month windows, first-of-next-month, and midnight counting.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addMonthsUtc, firstOfNextMonth, countMidnights, fmtUtc, parseIsoStrict as d, deadline } from '../../lib/deadline.js';

test('month arithmetic clamps to the last day of a short month', () => {
  assert.equal(fmtUtc(addMonthsUtc(d('2026-01-31'), 1)), '2026-02-28');
  assert.equal(fmtUtc(addMonthsUtc(d('2028-01-31'), 1)), '2028-02-29');
  assert.equal(fmtUtc(addMonthsUtc(d('2028-02-29'), 12)), '2029-02-28');
  assert.equal(fmtUtc(addMonthsUtc(d('2026-03-15'), 18)), '2027-09-15');
  assert.equal(fmtUtc(addMonthsUtc(d('2026-03-31'), -1)), '2026-02-28');
  assert.equal(fmtUtc(addMonthsUtc(d('2026-11-30'), 3)), '2027-02-28');
  assert.throws(() => addMonthsUtc(d('2026-01-01'), 1.5), TypeError);
});

test('month arithmetic round-trips on every day of a leap year for day-of-month <= 28', () => {
  for (let t = Date.UTC(2028, 0, 1); t < Date.UTC(2029, 0, 1); t += 86400000) {
    const x = new Date(t);
    if (x.getUTCDate() > 28) continue;
    assert.equal(fmtUtc(addMonthsUtc(addMonthsUtc(x, 7), -7)), fmtUtc(x));
  }
});

test('first of next month, including from the first and the last day', () => {
  assert.equal(fmtUtc(firstOfNextMonth(d('2026-03-01'))), '2026-04-01');
  assert.equal(fmtUtc(firstOfNextMonth(d('2026-03-31'))), '2026-04-01');
  assert.equal(fmtUtc(firstOfNextMonth(d('2026-12-15'))), '2027-01-01');
});

test('midnights: Monday to Thursday is three, same day is none, across a DST change is exact', () => {
  assert.equal(countMidnights(d('2026-09-21'), d('2026-09-24')), 3);
  assert.equal(countMidnights(d('2026-09-21'), d('2026-09-21')), 0);
  assert.equal(countMidnights(d('2026-03-07'), d('2026-03-10')), 3);
  assert.throws(() => countMidnights(d('2026-09-24'), d('2026-09-21')), RangeError);
});

test('rollForward moves a weekend or holiday deadline to the next business day', () => {
  assert.equal(deadline({ anchor: '2026-09-01', days: 4, rollForward: true, now: new Date('2026-09-01T00:00:00Z') }).deadline, '2026-09-08');
  assert.equal(deadline({ anchor: '2026-09-01', days: 4, now: new Date('2026-09-01T00:00:00Z') }).deadline, '2026-09-05');
});
