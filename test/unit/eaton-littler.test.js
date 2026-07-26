// spec-v438: Eaton-Littler thumb CMC arthritis stage (I-IV).
// Worked-example tests: each stage and its radiographic description, numeric input, and the invalid-stage guard.
// Stages transcribed from Eaton & Littler 1973 (J Bone Joint Surg Am) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { eatonLittler } from '../../lib/eaton-littler-v438.js';

test('stage II: slight narrowing (the META example)', () => {
  const r = eatonLittler({ stage: 'II' });
  assert.equal(r.valid, true);
  assert.equal(r.stage, 'II');
  assert.match(r.band, /slight narrowing of the TM joint/);
});

test('stage I: normal or slightly widened', () => {
  const r = eatonLittler({ stage: 'I' });
  assert.equal(r.stage, 'I');
  assert.match(r.band, /normal or slightly widened/);
});

test('stage III: marked narrowing, scaphotrapezial spared', () => {
  assert.match(eatonLittler({ stage: 'III' }).band, /scaphotrapezial joint is spared/);
});

test('stage IV: pantrapezial arthritis', () => {
  const r = eatonLittler({ stage: 'IV' });
  assert.equal(r.stage, 'IV');
  assert.match(r.band, /pantrapezial arthritis/);
});

test('numeric input maps to the stages', () => {
  assert.equal(eatonLittler({ stage: 1 }).stage, 'I');
  assert.equal(eatonLittler({ stage: 4 }).stage, 'IV');
});

test('a missing or out-of-range stage is invalid', () => {
  assert.equal(eatonLittler({}).valid, false);
  assert.equal(eatonLittler({ stage: 'V' }).valid, false);
  assert.equal(eatonLittler({ stage: '0' }).valid, false);
});
