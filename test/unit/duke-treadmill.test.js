// spec-v90 §2.4: Duke Treadmill Score (Mark 1987).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dukeTreadmill } from '../../lib/cardio-v90.js';

test('worked example: time 7, ST 1, angina 0 -> DTS 2, moderate, 95% survival', () => {
  // 7 - (5 x 1) - (4 x 0) = 2
  const r = dukeTreadmill({ exerciseTime: 7, stDeviation: 1, anginaIndex: 0 });
  assert.equal(r.valid, true);
  assert.equal(r.score, 2);
  assert.equal(r.risk, 'moderate');
  assert.equal(r.survival, 95);
});

test('low-risk band flip at +5', () => {
  // 10 - 5 - 0 = 5 -> low (>= +5)
  const at = dukeTreadmill({ exerciseTime: 10, stDeviation: 1, anginaIndex: 0 });
  assert.equal(at.score, 5);
  assert.equal(at.risk, 'low');
  assert.equal(at.survival, 99);
  // 9 - 5 - 0 = 4 -> moderate
  const below = dukeTreadmill({ exerciseTime: 9, stDeviation: 1, anginaIndex: 0 });
  assert.equal(below.score, 4);
  assert.equal(below.risk, 'moderate');
});

test('high-risk band flip at -11', () => {
  // 4 - (5 x 3) - 0 = -11 -> high
  const at = dukeTreadmill({ exerciseTime: 4, stDeviation: 3, anginaIndex: 0 });
  assert.equal(at.score, -11);
  assert.equal(at.risk, 'high');
  assert.equal(at.survival, 79);
  // 5 - 15 - 0 = -10 -> moderate
  const above = dukeTreadmill({ exerciseTime: 5, stDeviation: 3, anginaIndex: 0 });
  assert.equal(above.score, -10);
  assert.equal(above.risk, 'moderate');
});

test('the angina index contributes 4 points each', () => {
  const none = dukeTreadmill({ exerciseTime: 10, stDeviation: 0, anginaIndex: 0 });
  const limiting = dukeTreadmill({ exerciseTime: 10, stDeviation: 0, anginaIndex: 2 });
  assert.equal(none.score, 10);
  assert.equal(limiting.score, 2); // 10 - 8
});

test('the angina index clamps to 0..2', () => {
  const r = dukeTreadmill({ exerciseTime: 10, stDeviation: 0, anginaIndex: 9 });
  assert.equal(r.score, 2); // angina clamped to 2 -> 10 - 8
});

test('a blank input renders the complete-the-fields fallback', () => {
  assert.equal(dukeTreadmill({ exerciseTime: 7 }).valid, false);
  assert.equal(dukeTreadmill({ stDeviation: 1 }).valid, false);
});
