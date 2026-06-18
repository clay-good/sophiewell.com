// spec-v107 2.3: GO-FAR score (Ebell 2013). -15..+76, 4 outcome categories.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { goFar } from '../../lib/eddecision-v107.js';

test('neurologically intact alone (age < 70) -> -15, above average', () => {
  const r = goFar({ age: 60, neuroIntact: true });
  assert.equal(r.total, -15);
  assert.equal(r.category, 'above average');
  assert.equal(r.probability, '> 15%');
  assert.equal(r.abnormal, false);
});

test('no variables, age < 70 -> 0, average', () => {
  const r = goFar({ age: 55 });
  assert.equal(r.total, 0);
  assert.equal(r.category, 'average');
});

test('band flip: total crossing 13 into the low category', () => {
  // age 80-84 (+6) + septicemia (+7) = 13 -> average (upper edge)
  const avg = goFar({ age: 82, septicemia: true });
  assert.equal(avg.total, 13);
  assert.equal(avg.category, 'average');
  // + pneumonia (+1) = 14 -> low
  const low = goFar({ age: 82, septicemia: true, pneumonia: true });
  assert.equal(low.total, 14);
  assert.equal(low.category, 'low');
  assert.equal(low.abnormal, true);
});

test('tile example: age 82 (+6) + septicemia (+7) + respiratory (+4) = 17, low', () => {
  const r = goFar({ age: 82, septicemia: true, respiratory: true });
  assert.equal(r.total, 17);
  assert.equal(r.category, 'low');
  assert.equal(r.probability, '1-3%');
});

test('band flip into very low at 24', () => {
  // age >= 85 (+11) + cancer (+7) + medicalNoncardiac (+7) = 25 -> very low (>= 24)
  const r = goFar({ age: 90, cancer: true, medicalNoncardiac: true });
  assert.equal(r.total, 25);
  assert.equal(r.category, 'very low');
  assert.equal(r.probability, '< 1%');
});

test('age banding is exact at the cut-points', () => {
  assert.equal(goFar({ age: 69 }).total, 0);
  assert.equal(goFar({ age: 70 }).total, 2);
  assert.equal(goFar({ age: 75 }).total, 5);
  assert.equal(goFar({ age: 80 }).total, 6);
  assert.equal(goFar({ age: 85 }).total, 11);
});

test('missing age -> complete-the-fields fallback', () => {
  const r = goFar({ septicemia: true });
  assert.equal(r.valid, false);
  assert.match(r.band, /Enter the patient age/);
});
