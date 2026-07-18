// spec-v411: Levine-Edwards classification of hangman's fractures (types I/II/IIa/III).
// Worked-example tests: each type and its displacement/angulation description, roman + numeric + 2a input,
// and the invalid-type guard. Types transcribed from Levine-Edwards 1985 (J Bone Joint Surg Am) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { levineEdwards } from '../../lib/levine-edwards-v411.js';

test('type II: translation with angulation, unstable (the META example)', () => {
  const r = levineEdwards({ type: 'II' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 'II');
  assert.match(r.band, /more than 3 mm of translation/);
  assert.match(r.band, /Unstable/);
});

test('type I: minimal translation, stable', () => {
  const r = levineEdwards({ type: 'I' });
  assert.equal(r.type, 'I');
  assert.match(r.band, /less than 3 mm of translation/);
  assert.match(r.band, /Stable/);
});

test('type IIa: flexion-angulation, traction contraindicated', () => {
  const r = levineEdwards({ type: 'IIa' });
  assert.equal(r.type, 'IIa');
  assert.match(r.band, /axial traction is contraindicated/);
});

test('type III: with bilateral facet dislocation', () => {
  const r = levineEdwards({ type: 'III' });
  assert.equal(r.type, 'III');
  assert.match(r.band, /bilateral C2-C3 facet dislocation/);
});

test('numeric and 2a input map to the types', () => {
  assert.equal(levineEdwards({ type: 1 }).type, 'I');
  assert.equal(levineEdwards({ type: '2a' }).type, 'IIa');
  assert.equal(levineEdwards({ type: 3 }).type, 'III');
});

test('a missing or out-of-range type is invalid', () => {
  assert.equal(levineEdwards({}).valid, false);
  assert.equal(levineEdwards({ type: 'IV' }).valid, false);
  assert.equal(levineEdwards({ type: '0' }).valid, false);
});
