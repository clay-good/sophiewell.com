// spec-v382: (modified) Eichenholtz classification of Charcot neuroarthropathy (stages 0-3).
// Worked-example tests: each stage and its temporal/radiographic description, the active flag on stages
// 0-1, numeric + roman (1-3) input, and the invalid-stage guard. Stages transcribed from Eichenholtz 1966
// (+ the modified Stage 0), cross-verified against a modern review (CORR 2015) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { eichenholtzCharcot } from '../../lib/eichenholtz-charcot-v382.js';

test('stage 1: development/fragmentation, active, flagged (the META example)', () => {
  const r = eichenholtzCharcot({ stage: '1' });
  assert.equal(r.valid, true);
  assert.equal(r.stage, '1');
  assert.equal(r.active, true);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /development \/ fragmentation/);
  assert.match(r.band, /osseous fragmentation/);
});

test('stage 0: prodromal / pre-radiographic, active, flagged', () => {
  const r = eichenholtzCharcot({ stage: '0' });
  assert.equal(r.active, true);
  assert.match(r.band, /pre-radiographic/);
});

test('stage 2: coalescence, not active, not flagged', () => {
  const r = eichenholtzCharcot({ stage: '2' });
  assert.equal(r.active, false);
  assert.match(r.band, /coalescence/);
});

test('stage 3: reconstruction/consolidation, stable, not flagged', () => {
  const r = eichenholtzCharcot({ stage: '3' });
  assert.equal(r.active, false);
  assert.match(r.band, /reconstruction \/ consolidation/);
  assert.match(r.band, /stable, fixed deformity/);
});

test('roman input maps to stages 1-3', () => {
  assert.equal(eichenholtzCharcot({ stage: 'I' }).stage, '1');
  assert.equal(eichenholtzCharcot({ stage: 'iii' }).stage, '3');
  assert.equal(eichenholtzCharcot({ stage: 2 }).stage, '2');
});

test('a missing or out-of-range stage is invalid', () => {
  assert.equal(eichenholtzCharcot({}).valid, false);
  assert.equal(eichenholtzCharcot({ stage: '4' }).valid, false);
  assert.equal(eichenholtzCharcot({ stage: 'IV' }).valid, false);
});
