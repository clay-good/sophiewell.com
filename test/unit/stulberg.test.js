// spec-v457: Stulberg Perthes residual-deformity classification (classes I-V).
// Worked-example tests: each class and its sphericity/congruency description, numeric input, invalid-class guard.
// Classes transcribed from Stulberg 1981 (J Bone Joint Surg Am) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stulberg } from '../../lib/stulberg-v457.js';

test('class III: non-spherical but not flat (the META example)', () => {
  const r = stulberg({ cls: 'III' });
  assert.equal(r.valid, true);
  assert.equal(r.cls, 'III');
  assert.match(r.band, /non-spherical head \(ovoid, mushroom, or umbrella shaped\) but not flat/);
});

test('class I: normal spherical head', () => {
  assert.match(stulberg({ cls: 'I' }).band, /normal spherical femoral head/);
});

test('class II: spherical with coxa magna', () => {
  assert.match(stulberg({ cls: 'II' }).band, /coxa magna/);
});

test('class IV: flat head, congruent', () => {
  assert.match(stulberg({ cls: 'IV' }).band, /aspherical congruency/);
});

test('class V: flat head, incongruent', () => {
  const r = stulberg({ cls: 'V' });
  assert.equal(r.cls, 'V');
  assert.match(r.band, /aspherical incongruency/);
});

test('numeric input maps to the classes', () => {
  assert.equal(stulberg({ cls: 1 }).cls, 'I');
  assert.equal(stulberg({ cls: 5 }).cls, 'V');
});

test('a missing or out-of-range class is invalid', () => {
  assert.equal(stulberg({}).valid, false);
  assert.equal(stulberg({ cls: 'VI' }).valid, false);
  assert.equal(stulberg({ cls: '0' }).valid, false);
});
