// spec-v1638 tool 20: the monthly medication regimen review tracker (42 CFR 483.45(c)).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ltcMrrTracker } from '../../lib/ltc-mrr-tracker-v1638.js';

const t = (residents, extra = {}) => ltcMrrTracker({ residents, asOf: '2026-10-12', ...extra });

test('a calendar month with no review on record is listed; the current month is "not yet"', () => {
  const r = t('A, 2026-06-01, 2026-08-20\nB, 2026-06-01, 2026-09-30\nC, 2026-06-01, 2026-10-02');
  assert.deepEqual(r.missed.map((m) => [m.name, m.months]), [['A', ['September 2026']]]);
  assert.deepEqual(r.notYetThisMonth.map((p) => p.name), ['B']);
  assert.equal(r.flag, 'reviews-or-responses-overdue');
});

test('a resident never reviewed is counted from the month of admission', () => {
  const r = t('D, 2026-08-15');
  assert.deepEqual([r.missed[0].months, r.missed[0].never], [['August 2026', 'September 2026'], true]);
  // Admitted this month: nothing missed yet.
  const fresh = t('E, 2026-10-05');
  assert.deepEqual([fresh.missed.length, fresh.notYetThisMonth[0].name, fresh.flag], [0, 'E', 'nothing-overdue']);
});

test('an open irregularity report is overdue only against the facility\'s own time frame', () => {
  const rows = 'F, 2026-06-01, 2026-10-02, 2026-10-02\nG, 2026-06-01, 2026-10-02, 2026-09-01, 2026-09-05';
  const none = t(rows);
  assert.deepEqual([none.openReports.length, none.openReports[0].overdue, none.openReports[0].daysWaiting], [1, null, 10]);
  assert.match(none.note, /No facility time frame was entered/);
  assert.equal(t(rows, { responseDays: 7 }).openReports[0].overdue, true);
  assert.equal(t(rows, { responseDays: 14 }).openReports[0].overdue, false);
});

test('rows that cannot be read are listed; a header row is skipped', () => {
  const r = t('resident, admitted, last review\nH, 2026-06-01, 2026-10-02\nI, June 1\nJ, 2026-11-01');
  assert.deepEqual([r.residents, r.unread.length], [1, 2]);
});

test('refusals: the as-of date is required', () => {
  assert.match(ltcMrrTracker({ residents: 'A, 2026-06-01' }).message, /^Enter the as-of date/);
  assert.match(t('').message, /^Enter the residents/);
  assert.match(t('x').message, /^Enter at least one resident row/);
});
