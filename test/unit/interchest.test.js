// spec-v693: INTERCHEST clinical prediction rule for chest pain.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { interchest } from '../../lib/interchest-v693.js';

test('young man, no features -> 0, CAD unlikely', () => {
  const r = interchest({ age: '40', sex: 'male' });
  assert.equal(r.valid, true);
  assert.equal(r.score, 0);
  assert.equal(r.tier, 'unlikely');
  assert.equal(r.abnormal, false);
  assert.equal(r.probability, 'about 2.1%');
});

test('age/sex threshold: female >= 65 or male >= 55', () => {
  assert.equal(interchest({ age: '64', sex: 'female' }).score, 0);
  assert.equal(interchest({ age: '65', sex: 'female' }).score, 1);
  assert.equal(interchest({ age: '54', sex: 'male' }).score, 0);
  assert.equal(interchest({ age: '55', sex: 'male' }).score, 1);
});

test('palpation reproducibility subtracts a point', () => {
  const base = { age: '40', sex: 'male', historyCad: true }; // 1
  assert.equal(interchest(base).score, 1);
  assert.equal(interchest({ ...base, reproduciblePalpation: true }).score, 0);
  // palpation alone can drive the score to -1
  assert.equal(interchest({ age: '40', sex: 'male', reproduciblePalpation: true }).score, -1);
});

test('worked example: 60yo male + history CAD + pressure + palpation -> 2 (not excluded)', () => {
  const r = interchest({ age: '60', sex: 'male', historyCad: 'true', pressure: 'true', reproduciblePalpation: 'true' });
  // age/sex(1) + cad(1) + pressure(1) - palpation(1) = 2
  assert.equal(r.score, 2);
  assert.equal(r.tier, 'not-excluded');
  assert.equal(r.abnormal, true);
  assert.equal(r.probability, 'about 43%');
  assert.match(r.band, /INTERCHEST 2/);
});

test('cutoff is >= 2', () => {
  assert.equal(interchest({ age: '70', sex: 'male', historyCad: true }).abnormal, true);  // 2
  assert.equal(interchest({ age: '70', sex: 'male' }).abnormal, false);                    // 1
  // full house minus palpation = 5
  assert.equal(interchest({ age: '70', sex: 'male', historyCad: true, exertion: true, pressure: true, physicianSuspicion: true }).score, 5);
});

test('inputs are validated', () => {
  assert.equal(interchest({}).valid, false);
  assert.equal(interchest({}).code, 'MISSING_INPUT');
  assert.equal(interchest({ age: '60' }).field, 'sex');
  assert.equal(interchest({ sex: 'male' }).field, 'age');
});
