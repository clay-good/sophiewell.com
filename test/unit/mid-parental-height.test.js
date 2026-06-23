// spec-v141 2.3: mid-parental target height (Tanner 1970).
// Boy (F + M + 13)/2; girl (F + M - 13)/2; target range +/- 8.5 cm.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { midParentalHeight } from '../../lib/peds-growth-v141.js';

test('boy: (180 + 165 + 13)/2 = 179 cm with +/- 8.5 cm range', () => {
  const r = midParentalHeight({ sex: 'male', motherCm: 165, fatherCm: 180 });
  assert.equal(r.valid, true);
  assert.equal(r.targetHeight, 179);
  assert.equal(r.rangeLow, 170.5);
  assert.equal(r.rangeHigh, 187.5);
});

test('girl: (180 + 165 - 13)/2 = 166 cm', () => {
  const r = midParentalHeight({ sex: 'female', motherCm: 165, fatherCm: 180 });
  assert.equal(r.targetHeight, 166);
  assert.equal(r.rangeLow, 157.5);
  assert.equal(r.rangeHigh, 174.5);
});

test('equal parents: boy gains +6.5, girl loses -6.5 vs the average', () => {
  assert.equal(midParentalHeight({ sex: 'male', motherCm: 170, fatherCm: 170 }).targetHeight, 176.5);
  assert.equal(midParentalHeight({ sex: 'female', motherCm: 170, fatherCm: 170 }).targetHeight, 163.5);
});

test('guards: missing parent, implausible height, missing sex -> valid:false', () => {
  assert.equal(midParentalHeight({ sex: 'male', motherCm: 165 }).valid, false);
  assert.equal(midParentalHeight({ sex: 'male', motherCm: 165, fatherCm: 50 }).valid, false);
  assert.equal(midParentalHeight({ motherCm: 165, fatherCm: 180 }).valid, false);
  assert.equal(midParentalHeight(0).valid, false);
});
