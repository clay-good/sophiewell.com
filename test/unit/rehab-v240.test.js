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
// spec-v1722: a pain rating of 99 used to read as 0, no symptom burden; refused now.
test('esas: an item above 10, or a fraction, is refused', () => {
  assert.equal(esas({ pain: 99 }).valid, false);
  assert.match(esas({ pain: 99 }).message, /between 0 and 10/);
  assert.match(esas({ pain: 4.5 }).message, /whole number/);
  assert.equal(esas({ pain: 10 }).score, 10);
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

// spec-v1720: a count of 16 -- one more item than the index has -- read RMI 0 of 15, the least mobile a
// patient can be. Found by scripts/probe-impossible-as-zero.mjs and confirmed on the page.
test('rivermead: a count outside 0 to 15, a fraction or a blank is refused, never read as 0', () => {
  assert.equal(rivermead({ count: 15 }).score, 15);
  assert.equal(rivermead({ count: 0 }).score, 0);
  for (const bad of [16, 999999, -1, 2.5, '', null]) assert.equal(rivermead({ count: bad }).valid, false, JSON.stringify(bad));
  assert.match(rivermead({ count: 16 }).message, /between 0 and 15/);
});
