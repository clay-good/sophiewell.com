import test from 'node:test';
import assert from 'node:assert/strict';
import { heds2017 as h } from '../../lib/heds-2017-v822.js';

const fiveA = { a1: true, a2: true, a3: true, a4: true, a5: true };
const cleared = { noSkinFragility: true, otherCtdExcluded: true, alternativesExcluded: true };
const met = { ...fiveA, familyHistory: true, ...cleared, beightonScore: 6 };

test('heds: all three criteria together', () => {
  const r = h(met);
  assert.equal(r.criteriaMet, true);
  assert.equal(r.criterion1, true);
  assert.equal(r.criterion2, true);
  assert.equal(r.criterion3, true);
});

test('heds: the Beighton cutoff is age- and sex-adjusted', () => {
  const at = (score, group) => h({ ...met, beightonScore: score, ageGroup: group }).criterion1;
  assert.equal(at(6, 'prepubertal-or-adolescent'), true);
  assert.equal(at(5, 'prepubertal-or-adolescent'), false);   // one below, no questionnaire
  assert.equal(at(5, 'pubertal-to-50'), true);
  assert.equal(at(4, 'pubertal-to-50'), false);
  assert.equal(at(4, 'over-50'), true);
  assert.equal(at(3, 'over-50'), false);
  assert.equal(h({ ...met, ageGroup: 'over-50' }).beightonCutoff, 4);
});

test('heds: the questionnaire rescues a score exactly ONE point below the cutoff', () => {
  const oneBelow = { ...met, beightonScore: 4, ageGroup: 'pubertal-to-50' };
  assert.equal(h(oneBelow).criterion1, false);
  assert.equal(h({ ...oneBelow, q1: true }).criterion1, false);          // one item is not enough
  assert.equal(h({ ...oneBelow, q1: true, q2: true }).criterion1, true); // two is
  assert.ok(h({ ...oneBelow, q1: true, q2: true }).rescueNote.includes('meets criterion 1'));

  // TWO points below is not rescued, however many questionnaire items are positive.
  const twoBelow = { ...met, beightonScore: 3, ageGroup: 'pubertal-to-50', q1: true, q2: true, q3: true, q4: true, q5: true };
  assert.equal(h(twoBelow).criterion1, false);
  assert.equal(h(twoBelow).rescueNote, null);
});

test('heds: feature A needs five of the twelve', () => {
  assert.equal(h({ ...met, a5: false }).features.a, false);
  assert.equal(h({ ...met, a5: false }).featureACount, 4);
  assert.equal(h(met).featureACount, 5);
});

test('heds: criterion 2 is any two of A, B and C in the ordinary case', () => {
  assert.equal(h({ ...cleared, beightonScore: 6, ...fiveA, familyHistory: true }).criterion2, true);
  assert.equal(h({ ...cleared, beightonScore: 6, ...fiveA, c1: true }).criterion2, true);
  assert.equal(h({ ...cleared, beightonScore: 6, familyHistory: true, c1: true }).criterion2, true);
  // One feature alone is not enough.
  assert.equal(h({ ...cleared, beightonScore: 6, familyHistory: true }).criterion2, false);
});

test('heds: with an ACQUIRED connective-tissue disorder, A and B are required and C counts for nothing', () => {
  // The rule that catches people, and it bites in exactly the group most often assessed.
  const bPlusC = { ...cleared, beightonScore: 6, familyHistory: true, c1: true, acquiredCtd: true };
  assert.equal(h(bPlusC).criterion2, false);
  assert.equal(h(bPlusC).criteriaMet, false);
  assert.ok(h(bPlusC).acquiredNote.includes('cannot be counted'));

  const aPlusC = { ...cleared, beightonScore: 6, ...fiveA, c1: true, acquiredCtd: true };
  assert.equal(h(aPlusC).criterion2, false);

  // A and B together does meet it.
  const aPlusB = { ...cleared, beightonScore: 6, ...fiveA, familyHistory: true, acquiredCtd: true };
  assert.equal(h(aPlusB).criterion2, true);
  assert.equal(h(aPlusB).criteriaMet, true);

  // Without the acquired disorder, the same B+C combination passes.
  assert.equal(h({ ...bPlusC, acquiredCtd: false }).criterion2, true);
  assert.equal(h(met).featureCCounted, true);
  assert.equal(h(aPlusB).featureCCounted, false);
});

test('heds: criterion 3 needs all three prerequisites, not two', () => {
  assert.equal(h({ ...met, noSkinFragility: false }).criterion3, false);
  assert.equal(h({ ...met, otherCtdExcluded: false }).criterion3, false);
  assert.equal(h({ ...met, alternativesExcluded: false }).criterion3, false);
});

test('heds: empty, invalid and out-of-range input', () => {
  const empty = h({});
  assert.equal(empty.valid, true);
  assert.equal(empty.criteriaMet, false);
  assert.equal(empty.rescueNote, null);
  assert.equal(empty.acquiredNote, null);
  assert.equal(h({ beightonScore: 10 }).valid, false);
  assert.equal(h({ beightonScore: 1e308 }).valid, false);
  assert.equal(h({ ageGroup: 'middle-aged' }).valid, false);
  assert.equal(h().valid, true);
  assert.doesNotMatch(JSON.stringify(h(met)), /NaN|Infinity/);
});
