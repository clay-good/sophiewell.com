// spec-v488: Bigliani acromion morphology classification (types I-III).
// Worked-example tests: each type and its acromial-undersurface description, numeric input, invalid guard.
// Types transcribed from Bigliani 1986 (Orthop Trans) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { biglianiAcromion } from '../../lib/bigliani-acromion-v488.js';

test('type II: curved acromion (the META example)', () => {
  const r = biglianiAcromion({ type: 'II' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 'II');
  assert.match(r.band, /curved acromion \(the undersurface curves/);
});

test('type I: flat acromion', () => {
  assert.match(biglianiAcromion({ type: 'I' }).band, /flat acromion/);
});

test('type III: hooked acromion, impingement', () => {
  const r = biglianiAcromion({ type: 'III' });
  assert.equal(r.type, 'III');
  assert.match(r.band, /hooked acromion.*rotator cuff tears/);
});

test('numeric input maps to the types', () => {
  assert.equal(biglianiAcromion({ type: 1 }).type, 'I');
  assert.equal(biglianiAcromion({ type: 3 }).type, 'III');
});

test('a missing or out-of-range type is invalid', () => {
  assert.equal(biglianiAcromion({}).valid, false);
  assert.equal(biglianiAcromion({ type: 'IV' }).valid, false);
  assert.equal(biglianiAcromion({ type: '0' }).valid, false);
});
