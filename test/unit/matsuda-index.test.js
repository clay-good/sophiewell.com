// spec-v185 §2.6: Matsuda whole-body insulin-sensitivity index. The radicand
// (product of the four positive inputs) is guarded > 0 before the square root.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matsudaIndex } from '../../lib/gaps-v185.js';

test('tile example: value suggesting insulin resistance', () => {
  // 10000/√(110·20·180·120) = 10000/√47,520,000 = 10000/6893.5 = 1.45
  const r = matsudaIndex({ g0: 110, i0: 20, gMean: 180, iMean: 120 });
  assert.equal(r.valid, true);
  assert.equal(r.index, 1.45);
  assert.equal(r.abnormal, true);
  assert.equal(r.bandLabel, 'Suggests insulin resistance');
});

test('an insulin-sensitive profile bands as sensitive', () => {
  // 10000/√(90·5·120·40) = 10000/√2,160,000 = 10000/1469.7 = 6.80
  const r = matsudaIndex({ g0: 90, i0: 5, gMean: 120, iMean: 40 });
  assert.ok(r.index > 2.5, `index ${r.index}`);
  assert.equal(r.abnormal, false);
});

test('lower insulin/glucose product gives a higher (more sensitive) index', () => {
  const resistant = matsudaIndex({ g0: 110, i0: 25, gMean: 200, iMean: 150 });
  const sensitive = matsudaIndex({ g0: 85, i0: 4, gMean: 110, iMean: 30 });
  assert.ok(sensitive.index > resistant.index);
});

test('guards: any missing / non-positive input falls back', () => {
  assert.equal(matsudaIndex({ g0: 110, i0: 20, gMean: 180 }).valid, false);
  assert.equal(matsudaIndex({ g0: 0, i0: 20, gMean: 180, iMean: 120 }).valid, false);
  assert.equal(matsudaIndex({}).valid, false);
});
