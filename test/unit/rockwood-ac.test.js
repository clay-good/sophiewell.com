// spec-v487: Rockwood acromioclavicular joint injury classification (types I-VI).
// Worked-example tests: each type and its ligament/displacement description, numeric input, invalid guard.
// Types transcribed from Rockwood (Fractures in Adults) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rockwoodAc } from '../../lib/rockwood-ac-v487.js';

test('type III: both ligaments torn, CC 25-100% (the META example)', () => {
  const r = rockwoodAc({ type: 'III' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 'III');
  assert.match(r.band, /coracoclavicular distance is increased 25% to 100%/);
});

test('type I: AC sprain, ligaments intact', () => {
  assert.match(rockwoodAc({ type: 'I' }).band, /AC and CC ligaments intact; radiographs normal/);
});

test('type II: AC torn, CC intact', () => {
  assert.match(rockwoodAc({ type: 'II' }).band, /AC ligaments torn, CC ligaments sprained but intact/);
});

test('type IV: posterior displacement', () => {
  assert.match(rockwoodAc({ type: 'IV' }).band, /displaced posteriorly into or through the trapezius/);
});

test('type V: gross superior displacement (CC 100-300%)', () => {
  assert.match(rockwoodAc({ type: 'V' }).band, /coracoclavicular distance 100% to 300% of normal/);
});

test('type VI: inferior displacement', () => {
  const r = rockwoodAc({ type: 'VI' });
  assert.equal(r.type, 'VI');
  assert.match(r.band, /displaced inferiorly \(subacromial or subcoracoid\)/);
});

test('numeric input maps to the types', () => {
  assert.equal(rockwoodAc({ type: 1 }).type, 'I');
  assert.equal(rockwoodAc({ type: 6 }).type, 'VI');
});

test('a missing or out-of-range type is invalid', () => {
  assert.equal(rockwoodAc({}).valid, false);
  assert.equal(rockwoodAc({ type: 'VII' }).valid, false);
  assert.equal(rockwoodAc({ type: '0' }).valid, false);
});
