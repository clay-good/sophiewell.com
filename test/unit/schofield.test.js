// spec-v779: Schofield basal metabolic rate equations.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { schofield } from '../../lib/schofield-v779.js';

test('worked example: 70 kg male aged 40 -> 1676 kcal/day', () => {
  const r = schofield({ weight: 70, age: 40, sex: 'male' });
  assert.equal(r.valid, true);
  assert.equal(r.bmr, 1676);
  assert.equal(r.ageBand, '30 to 60 years');
  assert.match(r.band, /Schofield BMR 1676 kcal\/day/);
});

test('the female coefficients differ from the male ones at the same age and weight', () => {
  const male = schofield({ weight: 60, age: 40, sex: 'male' });
  const female = schofield({ weight: 60, age: 40, sex: 'female' });
  assert.equal(male.bmr, 1561);
  assert.equal(female.bmr, 1333);
  assert.notEqual(male.coefficient, female.coefficient);
});

test('bands are closed below and open above: age 30 uses the 30-to-60 equation', () => {
  assert.equal(schofield({ weight: 70, age: 29, sex: 'male' }).ageBand, '18 to 30 years');
  assert.equal(schofield({ weight: 70, age: 30, sex: 'male' }).ageBand, '30 to 60 years');
  assert.equal(schofield({ weight: 70, age: 60, sex: 'male' }).ageBand, 'over 60 years');
});

test('every age band resolves, including the youngest and oldest', () => {
  assert.equal(schofield({ weight: 12, age: 2, sex: 'male' }).ageBand, 'under 3 years');
  assert.equal(schofield({ weight: 25, age: 7, sex: 'female' }).ageBand, '3 to 10 years');
  assert.equal(schofield({ weight: 50, age: 15, sex: 'female' }).ageBand, '10 to 18 years');
  assert.equal(schofield({ weight: 65, age: 75, sex: 'female' }).ageBand, 'over 60 years');
});

test('the under-3 constants are negative, so a small weight can still compute', () => {
  const r = schofield({ weight: 5, age: 1, sex: 'female' });
  assert.equal(r.constant, -31.1);
  assert.equal(r.bmr, Math.round(58.317 * 5 - 31.1));
});

test('a missing weight, age or sex falls back rather than computing NaN', () => {
  assert.equal(schofield({ age: 40, sex: 'male' }).field, 'weight');
  assert.equal(schofield({ weight: 70, sex: 'male' }).field, 'age');
  assert.equal(schofield({ weight: 70, age: 40 }).field, 'sex');
  assert.equal(schofield({ weight: 0, age: 40, sex: 'male' }).valid, false);
  assert.equal(schofield({ weight: 70, age: 200, sex: 'male' }).valid, false);
});
