// spec-v1513 tools 2 and 4: MPR, PDC and gap days; the medication synchronization plan.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mprGapDays as m, medSyncPlan as s } from '../../lib/adherence-v1513.js';

const fills = '2026-01-05, 30\n2026-02-01, 30\n2026-03-15, 30\n2026-04-10, 90';

test('early refills shift forward for PDC; MPR counts every day supplied', () => {
  const r = m({ fills, periodEnd: '2026-06-30' });
  assert.equal(r.pdc, 94.9);
  assert.equal(r.mpr, 97.2);
  assert.match(r.notes.join(' '), /Gap of 9 days: March 6, 2026 to March 14, 2026/);
});

test('the gap threshold hides shorter gaps', () => {
  assert.match(m({ fills, periodEnd: '2026-06-30', gapDays: '10' }).notes.join(' '), /No gap longer than 10 days/);
});

test('below 80% is flagged', () => {
  const r = m({ fills: '2026-01-01, 30\n2026-03-01, 30', periodEnd: '2026-04-30' });
  assert.equal(r.abnormal, true);
  assert.equal(r.pdc, 50);
});

test('bad lines and empty input ask', () => {
  assert.equal(m({}).valid, false);
  assert.match(m({ fills: '2026-01-05 thirty' }).message, /Line 1/);
  assert.match(m({ fills: '2026-02-30, 30' }).message, /not a real date/);
  assert.equal(m({ fills, periodStart: '2027-01-01', periodEnd: '2027-12-31' }).valid, false);
});

const meds = 'lisinopril 10 mg, 2026-09-20, 30, 1\natorvastatin 40 mg, 2026-09-28, 30, 1\nmetformin 500 mg, 2026-10-02, 30, 2';

test('med-sync-plan: the earliest practical sync date is the latest next due date', () => {
  const r = s({ meds });
  assert.equal(r.syncDate, '2026-11-01');
  assert.match(r.notes.join(' '), /lisinopril 10 mg: a one-time short fill of 12 days \(12 units\) on October 20, 2026/);
});

test('med-sync-plan: a short fill rounds up to whole tablets', () => {
  const r = s({ meds: 'a, 2026-09-01, 30, 1.5\nb, 2026-09-06, 30, 1' });
  assert.match(r.notes.join(' '), /a: a one-time short fill of 5 days \(8 units\)/);
});

test('med-sync-plan: a sync date before a medication is due is refused; one medication asks', () => {
  assert.equal(s({ meds, syncDate: '2026-10-15' }).valid, false);
  assert.equal(s({ meds: 'a, 2026-09-01, 30, 1' }).valid, false);
  assert.match(s({ meds: 'a, 2026-09-01, 30' }).message, /Line 1/);
});
