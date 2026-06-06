// spec-v61 §3.7: Rh immune globulin dose from fetomaternal hemorrhage.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rhigDose } from '../../lib/clinical-v7.js';

test('example: 5000 mL x 1.5% = 75 mL FMH -> 4 vials (2.5 rounds up + 1)', () => {
  const r = rhigDose({ maternalBloodVolumeMl: 5000, fetalCellPct: 1.5 });
  assert.equal(r.fmhMl, 75);
  assert.equal(r.vials, 4);
});
test('exact multiple: 60 mL FMH -> quotient 2.0 -> 2 + 1 = 3 vials', () => {
  assert.equal(rhigDose({ maternalBloodVolumeMl: 5000, fetalCellPct: 1.2 }).vials, 3);
});
test('zero fetal cells -> 0 mL FMH -> 1 safety vial', () => {
  const r = rhigDose({ maternalBloodVolumeMl: 5000, fetalCellPct: 0 });
  assert.equal(r.fmhMl, 0);
  assert.equal(r.vials, 1);
});
test('impossible fetal-cell % (>100) throws RangeError', () => {
  assert.throws(() => rhigDose({ maternalBloodVolumeMl: 5000, fetalCellPct: 150 }), RangeError);
});
