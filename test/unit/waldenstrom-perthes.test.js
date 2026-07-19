// spec-v463: Waldenstrom Perthes radiographic staging (stages I-IV).
// Worked-example tests: each stage and its temporal description, numeric input, and the invalid-stage guard.
// Stages transcribed from Waldenstrom 1938 (J Bone Joint Surg) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { waldenstromPerthes } from '../../lib/waldenstrom-perthes-v463.js';

test('stage II: fragmentation (the META example)', () => {
  const r = waldenstromPerthes({ stage: 'II' });
  assert.equal(r.valid, true);
  assert.equal(r.stage, 'II');
  assert.match(r.band, /fragmentation: the epiphysis fragments/);
});

test('stage I: initial (sclerosis)', () => {
  assert.match(waldenstromPerthes({ stage: 'I' }).band, /initial \(sclerosis\)/);
});

test('stage III: reossification (healing)', () => {
  assert.match(waldenstromPerthes({ stage: 'III' }).band, /reossification \(healing\)/);
});

test('stage IV: healed (remodeling)', () => {
  const r = waldenstromPerthes({ stage: 'IV' });
  assert.equal(r.stage, 'IV');
  assert.match(r.band, /healed \(remodeling\)/);
});

test('numeric input maps to the stages', () => {
  assert.equal(waldenstromPerthes({ stage: 1 }).stage, 'I');
  assert.equal(waldenstromPerthes({ stage: 4 }).stage, 'IV');
});

test('a missing or out-of-range stage is invalid', () => {
  assert.equal(waldenstromPerthes({}).valid, false);
  assert.equal(waldenstromPerthes({ stage: 'V' }).valid, false);
  assert.equal(waldenstromPerthes({ stage: '0' }).valid, false);
});
