// spec-v599: the myxedema coma diagnostic score.
//
// The load-bearing tests are that the cardiovascular and metabolic blocks are ADDITIVE (not ladders), and
// that the five non-specific metabolic items plus a precipitating event reach the diagnostic threshold
// exactly.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  myxedemaComa, TEMPERATURE_OPTIONS, CNS_OPTIONS, GI_OPTIONS, BRADYCARDIA_OPTIONS,
  CARDIOVASCULAR_ITEMS, METABOLIC_ITEMS, PRECIPITATING_EVENT_POINTS,
  DIAGNOSTIC_THRESHOLD, MIDDLE_BAND_LOW_ADAPTED, MIDDLE_BAND_LOW_PRIMARY,
  MAX_SCORE, METABOLIC_BLOCK_MAX, CARDIOVASCULAR_BLOCK_MAX,
} from '../../lib/myxedema-coma-v599.js';

const CLEAN = {
  temperature: 'above-35', cns: 'absent', gi: 'absent', bradycardia: 'absent',
  precipitatingEvent: 'no',
  ...Object.fromEntries(CARDIOVASCULAR_ITEMS.map((i) => [i.key, 'no'])),
  ...Object.fromEntries(METABOLIC_ITEMS.map((i) => [i.key, 'no'])),
};
const at = (over = {}) => myxedemaComa({ ...CLEAN, ...over });

test('a patient with nothing scores zero', () => {
  const r = at();
  assert.equal(r.total, 0);
  assert.equal(r.diagnostic, false);
  assert.equal(r.band, 'Myxedema coma unlikely');
});

// THE additive blocks.
test('the metabolic items add independently rather than forming a ladder', () => {
  let expected = 0;
  const acc = {};
  for (const i of METABOLIC_ITEMS) {
    acc[i.key] = 'yes';
    expected += i.points;
    assert.equal(at(acc).categoryPoints.metabolic, expected, i.key);
  }
  assert.equal(expected, METABOLIC_BLOCK_MAX);
  assert.equal(METABOLIC_BLOCK_MAX, 50);
});

test('the cardiovascular items add to the graded bradycardia pick', () => {
  const all = Object.fromEntries(CARDIOVASCULAR_ITEMS.map((i) => [i.key, 'yes']));
  const r = at({ ...all, bradycardia: 'below-40' });
  assert.equal(r.categoryPoints.cardiovascular, CARDIOVASCULAR_BLOCK_MAX);
  assert.equal(CARDIOVASCULAR_BLOCK_MAX, 100);
  assert.ok(CARDIOVASCULAR_BLOCK_MAX > DIAGNOSTIC_THRESHOLD,
    'one category alone exceeds the whole diagnostic threshold');
});

test('the single-pick ladders take one option only', () => {
  for (const [key, list] of [['temperature', TEMPERATURE_OPTIONS], ['cns', CNS_OPTIONS],
    ['gi', GI_OPTIONS], ['bradycardia', BRADYCARDIA_OPTIONS]]) {
    const worst = list.reduce((a, b) => (b.points > a.points ? b : a));
    const r = at({ [key]: worst.value });
    assert.equal(r.total, worst.points, key);
  }
});

test('the additive structure is explained in every result', () => {
  assert.match(at().bandText, /ADDITIVE SUB-CHECKLISTS and the rest are single graded picks/);
  assert.match(at().bandText, /Treating either as a single pick under-scores massively/);
});

// THE non-specific route to the threshold.
test('the five non-specific metabolic items plus a precipitating event reach exactly the threshold', () => {
  const r = at({
    ...Object.fromEntries(METABOLIC_ITEMS.map((i) => [i.key, 'yes'])),
    precipitatingEvent: 'yes',
  });
  assert.equal(r.total, METABOLIC_BLOCK_MAX + PRECIPITATING_EVENT_POINTS);
  assert.equal(r.total, DIAGNOSTIC_THRESHOLD, 'exactly 60');
  assert.equal(r.diagnostic, true);
  assert.equal(r.nonSpecificSharePercent, 83);
  assert.match(r.bandText, /none of which is specific to hypothyroidism/);
});

test('the non-specific share is reported', () => {
  assert.equal(at({ hyponatremia: 'yes' }).nonSpecificSharePercent, 100);
  assert.equal(at({ cns: 'coma-seizures' }).nonSpecificSharePercent, 0);
});

// THE band divergence.
test('the diagnostic threshold is agreed and the middle band is not', () => {
  assert.equal(DIAGNOSTIC_THRESHOLD, 60);
  assert.equal(MIDDLE_BAND_LOW_ADAPTED, 25);
  assert.equal(MIDDLE_BAND_LOW_PRIMARY, 45);
  assert.ok(MIDDLE_BAND_LOW_ADAPTED < MIDDLE_BAND_LOW_PRIMARY);
});

test('scores between the two lower edges are flagged as disputed', () => {
  const disputed = at({ cns: 'somnolent', bradycardia: '50-59', hyponatremia: 'yes' });
  assert.equal(disputed.total, 30);
  assert.equal(disputed.bandsDisagree, true);
  assert.equal(disputed.band, 'Renderings disagree - supportive or unlikely');
  assert.match(disputed.bandText, /WHERE THE PUBLISHED RENDERINGS DISAGREE/);
});

test('scores outside that interval are not flagged', () => {
  assert.equal(at({ cns: 'somnolent' }).bandsDisagree, false, 'below 25');
  assert.equal(at({ cns: 'coma-seizures', bradycardia: '40-49' }).bandsDisagree, false, '50, above 45');
  assert.equal(at({ ...Object.fromEntries(METABOLIC_ITEMS.map((i) => [i.key, 'yes'])), precipitatingEvent: 'yes' }).bandsDisagree, false, 'at the threshold');
});

test('the band at or above the primary lower edge is described as agreed', () => {
  const r = at({ cns: 'coma-seizures', bradycardia: '40-49' });
  assert.equal(r.total, 50);
  assert.equal(r.band, 'Supportive / at risk (both renderings agree)');
});

// The scale.
test('the threshold is a small fraction of the maximum', () => {
  assert.equal(MAX_SCORE, 230);
  assert.ok(DIAGNOSTIC_THRESHOLD / MAX_SCORE < 0.3);
  assert.match(at().bandText, /only about a quarter of the maximum/);
});

// The derivation cohort.
test('the tiny derivation cohort is stated in every result', () => {
  assert.match(at().bandText, /TWENTY-ONE patients/);
  assert.match(at().bandText, /n = 21 is fragile/);
});

// Input handling and scope.
test('every item is required and the additive structure is named in the message', () => {
  assert.equal(myxedemaComa({}).valid, false);
  const r = myxedemaComa({ ...CLEAN, hyponatremia: '' });
  assert.equal(r.valid, false);
  assert.match(r.message, /hyponatremia/);
  assert.match(r.message, /ADDITIVE - each adds independently/);
});

test('the scope note refuses treatment and does not exclude the diagnosis', () => {
  const r = at();
  assert.match(r.note, /does not select or dose thyroid hormone/);
  assert.match(r.note, /unrecognized adrenal insufficiency/);
  assert.match(r.note, /Failing to reach the threshold does not exclude myxedema coma/);
});
