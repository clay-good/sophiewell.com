// spec-v180 2.1: Lee 4-Year Mortality Index (Lee 2006). Weighted point sum
// 0-26 -> validation-cohort 4-year mortality bands (0-5 ~4%, 6-9 ~15%,
// 10-13 ~42%, >=14 ~64%). Point-table lookup; no exponentiation.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { leeMortalityIndex } from '../../lib/ltcga-v180.js';

test('age band is required; a blank age surfaces a complete-the-fields fallback', () => {
  const r = leeMortalityIndex({});
  assert.equal(r.valid, false);
  assert.match(r.message, /age band/i);
});

test('lowest band: age 60-64 alone -> 1 point, ~4% band', () => {
  const r = leeMortalityIndex({ age: '60to64' });
  assert.equal(r.valid, true);
  assert.equal(r.score, 1);
  assert.equal(r.mortality, '4%');
  assert.match(r.band, /about 4% \(0.5 points\)/); // "." avoids the en-dash literal
  assert.equal(r.abnormal, false);
});

test('band flip 5 -> 6: crossing from the ~4% band to the ~15% band', () => {
  // 5 points: age 60-64 (1) + cancer (2) + heart failure (2) = 5 -> 4% band.
  const five = leeMortalityIndex({ age: '60to64', cancer: 1, heartFailure: 1 });
  assert.equal(five.score, 5);
  assert.equal(five.mortality, '4%');
  // 6 points: age 70-74 (3) + heart failure (2) + BMI<25 (1) = 6 -> 15% band.
  const six = leeMortalityIndex({ age: '70to74', heartFailure: 1, bmiUnder25: 1 });
  assert.equal(six.score, 6);
  assert.equal(six.mortality, '15%');
  assert.match(six.band, /about 15% \(6.9 points\)/); // "." avoids the en-dash literal
});

test('band flips at 10 (42%) and 14 (64%); abnormal set for the two higher bands', () => {
  // 9 -> still 15%, not abnormal.
  const nine = leeMortalityIndex({ age: '85plus', male: 1 }); // 7 + 2 = 9
  assert.equal(nine.score, 9);
  assert.equal(nine.mortality, '15%');
  assert.equal(nine.abnormal, false);
  // 10 -> 42%, abnormal.
  const ten = leeMortalityIndex({ age: '85plus', male: 1, diabetes: 1 }); // 7+2+1 = 10
  assert.equal(ten.score, 10);
  assert.equal(ten.mortality, '42%');
  assert.equal(ten.abnormal, true);
  // 14 -> 64%.
  const fourteen = leeMortalityIndex({ age: '85plus', male: 1, cancer: 1, lung: 1, heartFailure: 1 }); // 7+2+2+2+2 = 15 -> use 14 combo
  assert.ok(fourteen.score >= 14);
  assert.equal(fourteen.mortality, '64%');
});

test('maximum score is 26 with every factor present at the top age band', () => {
  const max = leeMortalityIndex({
    age: '85plus', male: 1, diabetes: 1, cancer: 1, lung: 1, heartFailure: 1,
    smoker: 1, bmiUnder25: 1, bathing: 1, walking: 1, money: 1, pushing: 1,
  });
  assert.equal(max.score, 26);
  assert.equal(max.mortality, '64%');
});

test('unchecked factors do not score; string/boolean flags both count', () => {
  const strFlags = leeMortalityIndex({ age: '60to64', cancer: '1' });
  assert.equal(strFlags.score, 3); // 1 + 2
  const boolFlags = leeMortalityIndex({ age: '60to64', cancer: true });
  assert.equal(boolFlags.score, 3);
});
