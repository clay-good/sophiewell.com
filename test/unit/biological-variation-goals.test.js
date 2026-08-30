// spec-v923: analytical goals from biological variation. The test that matters is that all three
// tiers always come back, because "the" specification is not a thing.

import test from 'node:test';
import assert from 'node:assert/strict';
import { biologicalVariationGoals, BV_GOALS_NOTE } from '../../lib/biological-variation-goals-v923.js';

test('biological-variation-goals: the within-subject variation is required', () => {
  assert.equal(biologicalVariationGoals({}).valid, false);
  assert.equal(biologicalVariationGoals({ cvWithinSubject: 0 }).valid, false);
  assert.match(biologicalVariationGoals({}).message, /within-subject biological variation/);
});

test('biological-variation-goals: imprecision is a quarter, a half and three quarters of CVi', () => {
  const r = biologicalVariationGoals({ cvWithinSubject: 4.4 });
  assert.deepEqual(r.tiers.map((t) => t.imprecision), [1.1, 2.2, 3.3]);
});

test('biological-variation-goals: bias uses both variations combined', () => {
  const r = biologicalVariationGoals({ cvWithinSubject: 4.4, cvBetweenSubject: 12.9 });
  const combined = Math.sqrt(4.4 ** 2 + 12.9 ** 2);
  assert.equal(r.combinedVariation, Math.round(combined * 100) / 100);
  assert.equal(r.tiers[1].bias, Math.round(0.25 * combined * 100) / 100);
});

test('biological-variation-goals: total error is 1.65 x imprecision plus bias, at each tier', () => {
  const r = biologicalVariationGoals({ cvWithinSubject: 4.4, cvBetweenSubject: 12.9 });
  // Each figure is rounded once, from the unrounded value, so recomputing from the rounded
  // imprecision and bias lands within a rounding step rather than exactly.
  for (const t of r.tiers) {
    assert.ok(Math.abs(t.totalError - (1.65 * t.imprecision + t.bias)) < 0.02,
      `${t.tier}: ${t.totalError} against ${1.65 * t.imprecision + t.bias}`);
  }
});

test('biological-variation-goals: all three tiers come back, always', () => {
  const r = biologicalVariationGoals({ cvWithinSubject: 4.4, cvBetweenSubject: 12.9 });
  assert.deepEqual(r.tiers.map((t) => t.tier), ['optimum', 'desirable', 'minimum']);
  assert.match(r.band, /Optimum and minimum are reported beside it/);
  assert.match(r.tiersNote, /three tiers, not one specification/);
});

test('biological-variation-goals: optimum is twice as hard as desirable, minimum half as hard', () => {
  const r = biologicalVariationGoals({ cvWithinSubject: 4.4, cvBetweenSubject: 12.9 });
  const [opt, des, min] = r.tiers;
  assert.ok(Math.abs(opt.imprecision * 2 - des.imprecision) < 0.01);
  assert.ok(Math.abs(des.imprecision * 1.5 - min.imprecision) < 0.01);
  assert.ok(opt.totalError < des.totalError && des.totalError < min.totalError);
});

test('biological-variation-goals: without the between-subject variation, only imprecision stands', () => {
  const r = biologicalVariationGoals({ cvWithinSubject: 4.4 });
  assert.equal(r.hasBiasSpecifications, false);
  assert.deepEqual(r.tiers.map((t) => t.bias), [null, null, null]);
  assert.deepEqual(r.tiers.map((t) => t.totalError), [null, null, null]);
  assert.match(r.band, /was not entered/);
  assert.match(r.biasInputNote, /needs the between-subject variation too/);
});

test('biological-variation-goals: a specification is not a finding, so nothing is flagged', () => {
  assert.equal(biologicalVariationGoals({ cvWithinSubject: 40, cvBetweenSubject: 90 }).abnormal, false);
});

test('biological-variation-goals: the source and hierarchy lines print on every result', () => {
  const r = biologicalVariationGoals({ cvWithinSubject: 4.4 });
  assert.match(r.sourceNote, /not thereby unusable/);
  assert.match(r.hierarchyNote, /Milan hierarchy/);
  assert.match(r.scopeNote, /does not judge a method/);
  assert.match(BV_GOALS_NOTE, /three tiers, not one/);
});
