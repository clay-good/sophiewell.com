// spec-v249: worked examples for the renal & respiratory bedside formulas.
// Formulas spec-v97 verified (renal failure index; FEUA; ATS/ERS 2022; Nemer 2009).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renalFailureIndex, feua, bronchodilatorResponse, integrativeWeaningIndex } from '../../lib/renalpulm-v249.js';

test('renal-failure-index: < 1 prerenal', () => {
  const r = renalFailureIndex({ urineNa: 10, plasmaCr: 4, urineCr: 60 });
  assert.equal(r.score, 0.67);
  assert.equal(r.abnormal, false);
});
test('renal-failure-index: > 1 ATN', () => {
  const r = renalFailureIndex({ urineNa: 40, plasmaCr: 4, urineCr: 20 });
  assert.equal(r.score, 8);
  assert.equal(r.abnormal, true);
});

test('feua: normal 4-11%', () => {
  const r = feua({ urineUA: 30, serumCr: 1, serumUA: 6, urineCr: 60 });
  assert.equal(r.score, 8.3);
  assert.equal(r.abnormal, false);
});
test('feua: underexcretion flagged', () => {
  const r = feua({ urineUA: 10, serumCr: 1, serumUA: 6, urineCr: 60 });
  assert.ok(r.score < 4);
  assert.equal(r.abnormal, true);
});

test('bronchodilator-response: > 10% significant', () => {
  const r = bronchodilatorResponse({ pre: 2.0, post: 2.4, predicted: 3.0 });
  assert.equal(r.score, 13.3);
  assert.equal(r.abnormal, true);
});

test('integrative-weaning-index: >= 25 success', () => {
  const r = integrativeWeaningIndex({ compliance: 55, sao2: 97, rsbi: 55 });
  assert.equal(r.score, 97);
  assert.equal(r.abnormal, false);
});
test('integrative-weaning-index: < 25 below threshold', () => {
  const r = integrativeWeaningIndex({ compliance: 30, sao2: 90, rsbi: 120 });
  assert.ok(r.score < 25);
  assert.equal(r.abnormal, true);
});
