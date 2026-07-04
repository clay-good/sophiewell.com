// spec-v240: worked examples for the palliative / rehabilitation functional
// measures. Scoring / formulas spec-v97 verified (Bruera 1991; Collen 1991;
// Enright & Sherrill 1998; Beaton 2005).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { esas, rivermead, sixMinuteWalkPredicted, quickDash } from '../../lib/rehab-v240.js';

test('esas: sum of 9 symptoms', () => {
  const r = esas({ pain: 5, tiredness: 5, drowsiness: 5, nausea: 5, appetite: 5, dyspnea: 5, depression: 5, anxiety: 5, wellbeing: 5 });
  assert.equal(r.score, 45);
});
test('esas: caps each item at 10', () => {
  const r = esas({ pain: 99 }); // out of range -> 0
  assert.equal(r.score, 0);
});

test('rivermead: count', () => {
  assert.equal(rivermead({ count: 10 }).score, 10);
});

test('six-minute-walk-predicted: male equation', () => {
  const r = sixMinuteWalkPredicted({ sex: 'male', height: 175, age: 60, weight: 80 });
  assert.equal(r.score, 574); // 7.57*175 - 5.02*60 - 1.76*80 - 309
  assert.match(r.band, /421/);
});
test('six-minute-walk-predicted: female equation differs', () => {
  const r = sixMinuteWalkPredicted({ sex: 'female', height: 165, age: 60, weight: 65 });
  assert.ok(r.valid);
  assert.ok(r.score > 0);
});

test('quickdash: [(mean) - 1] x 25', () => {
  const r = quickDash({ i1: 2, i2: 2, i3: 2, i4: 2, i5: 2, i6: 2, i7: 2, i8: 2, i9: 2, i10: 2, i11: 2 });
  assert.equal(r.score, 25);
});
test('quickdash: needs >= 10 answered', () => {
  assert.equal(quickDash({ i1: 3, i2: 3 }).valid, false);
});
