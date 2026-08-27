import test from 'node:test';
import assert from 'node:assert/strict';
import { trigeminalNeuralgiaIchd3 as tn } from '../../lib/trigeminal-neuralgia-ichd3-v817.js';

const full = {
  unilateralParoxysms: true, noRadiationBeyond: true,
  briefDuration: true, severeIntensity: true, shockLikeQuality: true,
  triggeredByInnocuousStimuli: true, noBetterExplanation: true,
};

test('trigeminal: all four criteria met', () => {
  const r = tn(full);
  assert.equal(r.criteriaMet, true);
  assert.deepEqual(r.criteria, { a: true, b: true, c: true, d: true });
  assert.equal(r.painFeatureCount, 3);
});

test('trigeminal: criterion B is ALL THREE, not at least two', () => {
  // ICHD-3 uses "at least two of four" for migraine and "all of the following" here. Two of
  // three is not trigeminal neuralgia.
  const twoOfThree = tn({ ...full, shockLikeQuality: false });
  assert.equal(twoOfThree.painFeatureCount, 2);
  assert.equal(twoOfThree.criteria.b, false);
  assert.equal(twoOfThree.criteriaMet, false);
  assert.ok(twoOfThree.allThreeNote.includes('ALL THREE'));

  for (const drop of ['briefDuration', 'severeIntensity', 'shockLikeQuality']) {
    assert.equal(tn({ ...full, [drop]: false }).criteria.b, false);
  }
});

test('trigeminal: the trigger in criterion C is mandatory', () => {
  // Everything else textbook, no trigger: not 13.1.
  const noTrigger = tn({ ...full, triggeredByInnocuousStimuli: false });
  assert.equal(noTrigger.criteria.a, true);
  assert.equal(noTrigger.criteria.b, true);
  assert.equal(noTrigger.criteria.c, false);
  assert.equal(noTrigger.criteriaMet, false);
  assert.ok(noTrigger.triggerNote.includes('requires one'));
});

test('trigeminal: the trigger note is raised only when it is the thing standing in the way', () => {
  // If the pain characteristics are also incomplete, the trigger is not the story.
  const messy = tn({ ...full, triggeredByInnocuousStimuli: false, severeIntensity: false });
  assert.equal(messy.triggerNote, null);
  assert.ok(messy.allThreeNote);
});

test('trigeminal: pain radiating beyond the trigeminal distribution fails criterion A', () => {
  assert.equal(tn({ ...full, noRadiationBeyond: false }).criteria.a, false);
  assert.equal(tn({ ...full, unilateralParoxysms: false }).criteria.a, false);
});

test('trigeminal: the etiologic subtype is deliberately not claimed', () => {
  // Classical vs secondary vs idiopathic turns on imaging and an underlying disease, which
  // this tile does not take. It must not imply otherwise.
  const r = tn(full);
  const text = JSON.stringify(r).toLowerCase();
  assert.ok(!text.includes('"classical'));
  assert.ok(!text.includes('idiopathic trigeminal neuralgia met'));
  assert.ok(r.detail.includes('does not sort classical'));
});

test('trigeminal: empty input', () => {
  const empty = tn({});
  assert.equal(empty.valid, true);
  assert.equal(empty.criteriaMet, false);
  assert.equal(empty.missing.length, 4);
  assert.equal(empty.allThreeNote, null);
  assert.equal(empty.triggerNote, null);
  assert.equal(tn().criteriaMet, false);
});
