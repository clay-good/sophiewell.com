// spec-v414: Mayfield classification of progressive perilunar instability (stages I/II/III/IV).
// Worked-example tests: each stage and its ligament-disruption description, numeric input, and the
// invalid-stage guard. Stages transcribed from Mayfield 1980 (J Hand Surg Am) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mayfieldPerilunate } from '../../lib/mayfield-perilunate-v414.js';

test('stage III: midcarpal dislocation (the META example)', () => {
  const r = mayfieldPerilunate({ stage: 'III' });
  assert.equal(r.valid, true);
  assert.equal(r.stage, 'III');
  assert.match(r.band, /disruption of the lunotriquetral ligament/);
});

test('stage I: scapholunate dissociation', () => {
  const r = mayfieldPerilunate({ stage: 'I' });
  assert.equal(r.stage, 'I');
  assert.match(r.band, /scapholunate ligament/);
  assert.match(r.band, /Terry-Thomas sign/);
});

test('stage II: perilunate dislocation at the capitolunate joint', () => {
  const r = mayfieldPerilunate({ stage: 'II' });
  assert.equal(r.stage, 'II');
  assert.match(r.band, /capitolunate joint/);
});

test('stage IV: lunate dislocation, extruded volarly', () => {
  const r = mayfieldPerilunate({ stage: 'IV' });
  assert.equal(r.stage, 'IV');
  assert.match(r.band, /dislocates volarly out of the lunate fossa/);
});

test('numeric input maps to the stages', () => {
  assert.equal(mayfieldPerilunate({ stage: 1 }).stage, 'I');
  assert.equal(mayfieldPerilunate({ stage: 4 }).stage, 'IV');
});

test('a missing or out-of-range stage is invalid', () => {
  assert.equal(mayfieldPerilunate({}).valid, false);
  assert.equal(mayfieldPerilunate({ stage: 'V' }).valid, false);
  assert.equal(mayfieldPerilunate({ stage: '0' }).valid, false);
});
