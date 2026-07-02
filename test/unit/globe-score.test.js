// spec-v196 2.2: globeScore worked examples and guards.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { globeScore } from '../../lib/liver-v196.js';

test('non-responder above 0.30', () => {
  const r = globeScore({age:65,bili:1.8,alp:2.5,albumin:0.95,platelets:120});
  assert.equal(r.valid, true);
  assert.equal(r.value, 2.5);
  assert.equal(r.abnormal, true);
});

test('responder below 0.30', () => {
  const r = globeScore({age:50,bili:0.6,alp:1,albumin:1.2,platelets:250});
  assert.equal(r.value, -0.41);
  assert.equal(r.abnormal, false);
});

test('guards: bilirubin must be positive for log', () => {
  const r = globeScore({age:50,bili:0,alp:1,albumin:1.2,platelets:250});
  assert.equal(r.valid, false);
});
