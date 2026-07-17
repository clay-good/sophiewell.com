// spec-v394: Borrmann classification of advanced gastric cancer (types I-IV). Worked-example tests: each
// type and its gross-appearance description, roman + numeric input, and the invalid-type guard. Types
// transcribed from Borrmann 1926 (+ a modern review) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { borrmannGastric } from '../../lib/borrmann-gastric-v394.js';

test('type IV: diffusely infiltrative, linitis plastica (the META example)', () => {
  const r = borrmannGastric({ type: 'IV' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 'IV');
  assert.match(r.band, /diffusely infiltrative/);
  assert.match(r.band, /linitis plastica/);
  assert.match(r.band, /worst prognosis/);
});

test('type I: polypoid, demarcated', () => {
  const r = borrmannGastric({ type: 'I' });
  assert.equal(r.type, 'I');
  assert.match(r.band, /polypoid/);
});

test('type II: fungating / ulcerated', () => {
  const r = borrmannGastric({ type: 'II' });
  assert.match(r.band, /fungating \/ ulcerated/);
});

test('type III: ulcerated and infiltrative', () => {
  const r = borrmannGastric({ type: 'III' });
  assert.match(r.band, /ulcerated and infiltrative/);
});

test('numeric input maps to the types', () => {
  assert.equal(borrmannGastric({ type: 4 }).type, 'IV');
  assert.equal(borrmannGastric({ type: '1' }).type, 'I');
});

test('a missing or out-of-range type is invalid', () => {
  assert.equal(borrmannGastric({}).valid, false);
  assert.equal(borrmannGastric({ type: 'V' }).valid, false);
  assert.equal(borrmannGastric({ type: '0' }).valid, false);
});
