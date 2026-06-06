// spec-v61 §3.11: shift net fluid balance (I&O).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fluidBalance } from '../../lib/clinical-v7.js';

test('example: in 3000, out 2200, 80 kg -> +800 mL, 1.0%', () => {
  const r = fluidBalance({ intakeMl: 3000, outputMl: 2200, weightKg: 80 });
  assert.equal(r.netMl, 800);
  assert.equal(r.pctBodyWeight, 1.0);
});
test('net negative when output exceeds intake', () => {
  assert.equal(fluidBalance({ intakeMl: 2000, outputMl: 2500, weightKg: 80 }).netMl, -500);
});
test('weight 0 -> percent omitted (null)', () => {
  assert.equal(fluidBalance({ intakeMl: 3000, outputMl: 2200, weightKg: 0 }).pctBodyWeight, null);
});
test('impossible (negative intake) throws RangeError', () => {
  assert.throws(() => fluidBalance({ intakeMl: -1, outputMl: 0, weightKg: 80 }), RangeError);
});
