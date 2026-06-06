// spec-v61 §3.6: magnesium repletion estimate.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { magnesiumReplacement } from '../../lib/clinical-v7.js';

test('example: moderate severity -> 2-4 g', () => {
  const r = magnesiumReplacement({ serumMg: 1.2, severity: 2 });
  assert.equal(r.doseLow, 2);
  assert.equal(r.doseHigh, 4);
});
test('severe severity -> 4-8 g', () => {
  const r = magnesiumReplacement({ serumMg: 0.8, severity: 3 });
  assert.equal(r.doseLow, 4);
  assert.equal(r.doseHigh, 8);
});
test('impossible severity (out of 1-3) throws RangeError', () => {
  assert.throws(() => magnesiumReplacement({ serumMg: 1.2, severity: 5 }), RangeError);
});
