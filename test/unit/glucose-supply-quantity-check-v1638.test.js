// spec-v1638 tool 16: glucose test strip and lancet quantities against LCD L33822.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { glucoseSupplyQuantityCheck as gs } from '../../lib/glucose-supply-quantity-check-v1638.js';

const ok = { cgm: 'no-nonadjunctive-cgm', basicCriteria: 'both-basic-criteria' };

test('usual utilization: 100 and 100 without insulin, 300 and 300 with', () => {
  const a = gs({ ...ok, insulin: 'noninsulintreated', strips: 100, lancets: 100 });
  assert.deepEqual([a.flag, a.usualLimit, a.modifier, a.stripUnits, a.lancetUnits], ['within-usual-utilization', 100, 'KS', 2, 1]);
  const b = gs({ ...ok, insulin: 'insulintreated', strips: 300, lancets: 300 });
  assert.deepEqual([b.flag, b.usualLimit, b.modifier, b.stripUnits, b.lancetUnits], ['within-usual-utilization', 300, 'KX', 6, 3]);
  assert.equal(gs({ ...ok, insulin: 'noninsulintreated', strips: 101, lancets: 100 }).excessStrips, 1);
});

test('tests per day x 90 gives the 3-month quantity', () => {
  const r = gs({ ...ok, insulin: 'insulintreated', testsPerDay: 5 });
  assert.deepEqual([r.strips, r.lancets, r.excessStrips, r.flag], [450, 450, 150, 'above-usual-criteria-not-shown']);
});

test('above usual: the visit within 6 months before the order, and adherence every 6 months', () => {
  const base = { ...ok, insulin: 'insulintreated', strips: 450, lancets: 450, orderDate: '2026-10-01', dispenseDate: '2026-10-05' };
  const met = gs({ ...base, visitDate: '2026-04-01', adherenceVerified: '2026-04-05' });
  assert.deepEqual([met.flag, met.criterionB, met.criterionC, met.abnormal], ['above-usual-criteria-met', 'met', 'met', false]);
  assert.equal(gs({ ...base, visitDate: '2026-03-31', adherenceVerified: '2026-04-05' }).criterionB, 'not-met');
  const lapsed = gs({ ...base, visitDate: '2026-04-01', adherenceVerified: '2026-04-04' });
  assert.deepEqual([lapsed.flag, lapsed.criterionC], ['above-usual-criteria-not-met', 'not-met']);
  assert.match(lapsed.note, /which lapses October 4, 2026/);
  assert.match(lapsed.band, /the excess \(150 strips, 150 lancets\)/);
  assert.equal(gs({ ...base, visitDate: '2026-10-02', adherenceVerified: '2026-04-05' }).criterionB, 'not-met');
});

test('basic criteria, the CGM stop, lancing devices and the 3-month dispensing line', () => {
  assert.equal(gs({ cgm: 'no-nonadjunctive-cgm', basicCriteria: 'not-both-basic-criteria', insulin: 'insulintreated', strips: 100, lancets: 100 }).flag, 'basic-criteria-not-met');
  assert.equal(gs({ cgm: 'nonadjunctive-cgm-supplied' }).flag, 'inside-the-cgm-supply-allowance');
  const r = gs({ ...ok, insulin: 'insulintreated', strips: 300, lancets: 300, lancingDevices: 2, dispenseStrips: 400 });
  assert.match(r.note, /more than one \(code A4258\) per 6 months is not reasonable and necessary/);
  assert.match(r.note, /400 strips to dispense now is more than the 3-month quantity ordered \(300\)/);
});

test('refusals', () => {
  assert.match(gs({}).message, /non-adjunctive continuous glucose monitor/);
  assert.match(gs({ cgm: 'no-nonadjunctive-cgm' }).message, /treated with insulin/);
  assert.match(gs({ cgm: 'no-nonadjunctive-cgm', insulin: 'insulintreated' }).message, /both basic coverage criteria/);
  assert.match(gs({ ...ok, insulin: 'insulintreated' }).message, /^Enter the tests per day, or the test strips ordered/);
  assert.match(gs({ ...ok, insulin: 'insulintreated', strips: 300, lancets: 300, orderDate: 'x' }).message, /order date/);
});
