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

test('spec-v1132: an unstated angina index is not "no angina"', () => {
  // `anginaIndex = 0` was a default parameter, and 0 is the best of the three
  // levels -- worth 8 points on a scale whose middle band is 15 wide. Omitting
  // it answered exactly as a patient who exercised without angina, and quoted a
  // cited 5-year survival for it.
  const omitted = dukeTreadmill({ exerciseTime: 12, stDeviation: 0 });
  assert.equal(omitted.valid, false);
  assert.match(omitted.band, /Enter the exercise angina index/);
  assert.match(omitted.band, /between 4 and 12/);
  assert.match(omitted.band, /moderate risk at one end and low at the other/);

  // Stated, the same test answers as before.
  const stated = dukeTreadmill({ exerciseTime: 12, stDeviation: 0, anginaIndex: 0 });
  assert.equal(stated.valid, true);
  assert.equal(stated.score, 12);
  assert.equal(stated.risk, 'low');
});

test('spec-v1132: where the index cannot change the band, the tile answers', () => {
  // Rule 25: the unit of a guard is a reading, not a field. The index is 0, 1 or
  // 2, so an unstated one puts the score in a known 8-point range; where both
  // ends sit in one band the verdict holds whatever the angina was.
  const moderate = dukeTreadmill({ exerciseTime: 9, stDeviation: 1 });
  assert.equal(moderate.valid, true);
  assert.equal(moderate.anginaStated, false);
  assert.equal(moderate.risk, 'moderate');
  assert.match(moderate.band, /between -4 and 4/);
  assert.match(moderate.band, /whatever the angina index turns out to be/);

  const high = dukeTreadmill({ exerciseTime: 2, stDeviation: 4 });
  assert.equal(high.valid, true);
  assert.equal(high.risk, 'high');
  assert.match(high.band, /high risk/);
});

test('spec-v1132: a blank select is not a zero', () => {
  // Number('') is 0, which is the level the guard exists to stop being assumed.
  for (const blank of [null, undefined, '', '  ']) {
    const r = dukeTreadmill({ exerciseTime: 12, stDeviation: 0, anginaIndex: blank });
    assert.equal(r.valid, false, `blank ${JSON.stringify(blank)} answered`);
  }
});
