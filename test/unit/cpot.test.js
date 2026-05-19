// spec-v13 §3.3.1 wave 13-3: CPOT boundary examples per Gelinas C,
// et al. Am J Crit Care. 2006;15(4):420-427 (cutoff >=3 of 8).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cpot } from '../../lib/scoring-v4.js';

test('cpot 0 -> acceptable pain', () => {
  const r = cpot({ facial: 0, body: 0, muscleTension: 0, complianceOrVocalization: 0 });
  assert.equal(r.score, 0);
  assert.equal(r.unacceptablePain, false);
});

test('cpot 2 -> still acceptable (cutoff is >=3)', () => {
  const r = cpot({ facial: 1, body: 1, muscleTension: 0, complianceOrVocalization: 0 });
  assert.equal(r.score, 2);
  assert.equal(r.unacceptablePain, false);
});

test('cpot threshold 3 -> unacceptable pain', () => {
  const r = cpot({ facial: 1, body: 1, muscleTension: 1, complianceOrVocalization: 0 });
  assert.equal(r.score, 3);
  assert.equal(r.unacceptablePain, true);
});

test('cpot maximum 8 -> unacceptable pain', () => {
  const r = cpot({ facial: 2, body: 2, muscleTension: 2, complianceOrVocalization: 2 });
  assert.equal(r.score, 8);
  assert.equal(r.unacceptablePain, true);
});

test('cpot clamps each input to 0-2', () => {
  const r = cpot({ facial: 99, body: -1, muscleTension: 5, complianceOrVocalization: 2 });
  assert.equal(r.parts.facial, 2);
  assert.equal(r.parts.body, 0);
  assert.equal(r.parts.muscleTension, 2);
});
