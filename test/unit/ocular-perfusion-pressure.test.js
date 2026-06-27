// spec-v164 2.3: ocular perfusion pressure. Mean OPP = ⅔·MAP − IOP plus the
// systolic/diastolic variants; the subtraction is guarded.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ocularPerfusionPressure } from '../../lib/ophtho-v164.js';

test('tile example: 120/80, IOP 15 → mean OPP 47.2, low', () => {
  // MAP = 80 + (40/3) = 93.33; mean OPP = (2/3)·93.33 − 15 = 47.2
  const r = ocularPerfusionPressure({ sbp: 120, dbp: 80, iop: 15 });
  assert.equal(r.valid, true);
  assert.equal(r.meanOpp, 47.2);
  assert.equal(r.systolicOpp, 105);
  assert.equal(r.diastolicOpp, 65);
  assert.equal(r.abnormal, true);
});

test('higher BP / lower IOP raises mean OPP above the low threshold', () => {
  const r = ocularPerfusionPressure({ sbp: 140, dbp: 90, iop: 12 });
  // MAP = 90 + 50/3 = 106.67; mean OPP = 71.1 − 12 = 59.1
  assert.ok(r.meanOpp >= 50);
  assert.equal(r.abnormal, false);
});

test('the 50 mmHg low boundary flags', () => {
  const low = ocularPerfusionPressure({ sbp: 120, dbp: 80, iop: 16 });
  assert.ok(low.meanOpp < 50);
  assert.equal(low.abnormal, true);
});

test('guards: DBP >= SBP, blank inputs', () => {
  assert.equal(ocularPerfusionPressure({ sbp: 80, dbp: 80, iop: 15 }).valid, false);
  assert.equal(ocularPerfusionPressure({ sbp: 120, dbp: 80 }).valid, false);
  assert.equal(ocularPerfusionPressure({}).valid, false);
});
