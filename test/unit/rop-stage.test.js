// spec-v446: ROP (retinopathy of prematurity) stage (1-5).
// Worked-example tests: each stage and its retinal description, alias input, and the invalid-stage guard.
// Stages transcribed from ICROP revisited 2005 (Arch Ophthalmol) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ropStage } from '../../lib/rop-stage-v446.js';

test('stage 3: ridge with fibrovascular proliferation (the META example)', () => {
  const r = ropStage({ stage: '3' });
  assert.equal(r.valid, true);
  assert.equal(r.stage, '3');
  assert.match(r.band, /extraretinal fibrovascular proliferation/);
});

test('stage 1: demarcation line', () => {
  const r = ropStage({ stage: '1' });
  assert.equal(r.stage, '1');
  assert.match(r.band, /demarcation line/);
});

test('stage 2: ridge', () => {
  assert.match(ropStage({ stage: '2' }).band, /a ridge/);
});

test('stage 4: partial detachment, accepts 4A/4B aliases', () => {
  assert.match(ropStage({ stage: '4' }).band, /partial retinal detachment/);
  assert.equal(ropStage({ stage: '4A' }).stage, '4');
  assert.equal(ropStage({ stage: '4b' }).stage, '4');
});

test('stage 5: total retinal detachment', () => {
  const r = ropStage({ stage: '5' });
  assert.equal(r.stage, '5');
  assert.match(r.band, /total retinal detachment/);
});

test('a missing or out-of-range stage is invalid', () => {
  assert.equal(ropStage({}).valid, false);
  assert.equal(ropStage({ stage: '6' }).valid, false);
  assert.equal(ropStage({ stage: '0' }).valid, false);
});
