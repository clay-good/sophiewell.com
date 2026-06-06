// spec-v61 §3.12: carb-counting mealtime insulin bolus.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { carbInsulinBolus } from '../../lib/clinical-v7.js';

test('example: 60 g, IC 10, ISF 50, 180->120 = 6 + 1.2 = 7.2 U', () => {
  const r = carbInsulinBolus({ carbsG: 60, icRatio: 10, isf: 50, currentGlucose: 180, targetGlucose: 120 });
  assert.equal(r.mealBolus, 6);
  assert.equal(r.correctionBolus, 1.2);
  assert.equal(r.totalBolus, 7.2);
});
test('glucose below target -> correction floored at 0', () => {
  const r = carbInsulinBolus({ carbsG: 60, icRatio: 10, isf: 50, currentGlucose: 100, targetGlucose: 120 });
  assert.equal(r.correctionBolus, 0);
  assert.equal(r.floored, true);
  assert.equal(r.totalBolus, 6);
});
test('zero-denominator IC ratio / ISF -> null fallback', () => {
  assert.equal(carbInsulinBolus({ carbsG: 60, icRatio: 0, isf: 50, currentGlucose: 180, targetGlucose: 120 }), null);
});
test('impossible glucose (>2000) throws RangeError', () => {
  assert.throws(() => carbInsulinBolus({ carbsG: 60, icRatio: 10, isf: 50, currentGlucose: 5000, targetGlucose: 120 }), RangeError);
});
