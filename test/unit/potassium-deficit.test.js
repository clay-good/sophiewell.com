// spec-v61 §3.5: potassium deficit estimate.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { potassiumDeficit } from '../../lib/clinical-v7.js';

test('example: serum 3.0, target 4.0 -> ~100 mEq', () => {
  assert.equal(potassiumDeficit({ serumK: 3.0, weightKg: 70, targetK: 4.0 }).deficit, 100);
});
test('serum at/above target -> 0 deficit', () => {
  assert.equal(potassiumDeficit({ serumK: 4.2, weightKg: 70, targetK: 4.0 }).deficit, 0);
});
test('impossible serum K (>15) throws RangeError', () => {
  // spec-v1766: the cap is the potassium envelope (15; survival from 14.0 is in lib/bounds.js).
  assert.throws(() => potassiumDeficit({ serumK: 16, weightKg: 70, targetK: 4.0 }), RangeError);
});
