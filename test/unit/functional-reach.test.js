// spec-v176 §2.4: Functional Reach Test. Absolute Weiner cut-points (cm) with the
// Duncan age/sex normative mean for context.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { functionalReach } from '../../lib/ltcga-v176.js';

test('Reach < 15.24 cm -> markedly increased; 15.24 boundary -> increased', () => {
  assert.match(functionalReach({ reachCm: 15.23, age: 75, sex: 'female' }).band, /markedly increased/);
  assert.match(functionalReach({ reachCm: 15.24, age: 75, sex: 'female' }).band, /increased fall risk/);
});

test('Reach 25.40 boundary -> increased; > 25.40 -> lower risk', () => {
  assert.match(functionalReach({ reachCm: 25.40, age: 75, sex: 'female' }).band, /increased fall risk/);
  assert.match(functionalReach({ reachCm: 25.41, age: 75, sex: 'female' }).band, /lower fall risk/);
});

test('Reach reports the age/sex normative mean for context', () => {
  assert.equal(functionalReach({ reachCm: 18, age: 75, sex: 'female' }).normMean, 26.60);
  assert.equal(functionalReach({ reachCm: 18, age: 30, sex: 'male' }).normMean, 42.49);
});

test('Reach outside the 20-87 norm strata -> valid:false', () => {
  assert.equal(functionalReach({ reachCm: 18, age: 18, sex: 'female' }).valid, false);
  assert.equal(functionalReach({ reachCm: 18, age: 90, sex: 'male' }).valid, false);
});

test('Reach blank inputs -> complete-the-fields fallback', () => {
  assert.equal(functionalReach({ age: 75, sex: 'female' }).valid, false);
  assert.equal(functionalReach({ reachCm: 18, sex: 'female' }).valid, false);
  assert.equal(functionalReach({}).valid, false);
});
