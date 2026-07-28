// spec-v575: the Peradeniya Organophosphorus Poisoning scale.
//
// The load-bearing tests are the unscoreable heart rate of exactly 40, the fasciculation conjunction, and
// the asymmetric maximum of 11 rather than 12.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  peradeniyaOp, PUPIL_LEVELS, RESPIRATORY_LEVELS, CONSCIOUSNESS_LEVELS, SEIZURE_LEVELS,
  POP_MAX, NAIVE_SYMMETRIC_MAX, UNSCOREABLE_HEART_RATE,
} from '../../lib/peradeniya-op-v575.js';

const base = (over = {}) => ({
  pupil: 'at-least-2mm', respiratory: 'under-20', heartRate: '80',
  fasciculationGeneralized: 'no', fasciculationContinuous: 'no',
  consciousness: 'conscious', seizures: 'absent', ...over,
});
const score = (over = {}) => peradeniyaOp(base(over));

test('the maximum is 11, not 12, because seizures is half weight', () => {
  assert.equal(POP_MAX, 11);
  assert.equal(NAIVE_SYMMETRIC_MAX, 12);
  assert.deepEqual(SEIZURE_LEVELS.map((l) => l.points), [0, 1]);
  const top = score({
    pupil: 'pinpoint', respiratory: 'at-least-20-cyanosis', heartRate: '30',
    fasciculationGeneralized: 'yes', fasciculationContinuous: 'yes',
    consciousness: 'none', seizures: 'present',
  });
  assert.equal(top.total, POP_MAX);
});

test('five parameters run 0-2 and only seizures runs 0-1', () => {
  for (const ladder of [PUPIL_LEVELS, RESPIRATORY_LEVELS, CONSCIOUSNESS_LEVELS]) {
    assert.deepEqual(ladder.map((l) => l.points), [0, 1, 2]);
  }
  assert.equal(Math.max(...SEIZURE_LEVELS.map((l) => l.points)), 1);
});

test('the minimum is 0', () => {
  assert.equal(score().total, 0);
});

// THE hole.
test('a heart rate of exactly 40 is refused, not assigned to a neighbour', () => {
  const r = score({ heartRate: String(UNSCOREABLE_HEART_RATE) });
  assert.equal(r.valid, false);
  assert.match(r.message, /UNSCOREABLE/);
  assert.match(r.message, /falls in none of them/);
});

test('the heart-rate levels around the hole score as published', () => {
  assert.equal(score({ heartRate: '80' }).heartRatePoints, 0);
  assert.equal(score({ heartRate: '61' }).heartRatePoints, 0);
  assert.equal(score({ heartRate: '60' }).heartRatePoints, 1);
  assert.equal(score({ heartRate: '41' }).heartRatePoints, 1);
  assert.equal(score({ heartRate: '39' }).heartRatePoints, 2);
});

test('the hole is an INTERVAL, not a single value: 40 up to but not including 41', () => {
  // The published levels are >60, 41-60 and <40, so everything in [40, 41) is unscoreable.
  assert.equal(score({ heartRate: '39.9' }).valid, true, 'below 40 scores 2');
  assert.equal(score({ heartRate: '40' }).valid, false);
  assert.equal(score({ heartRate: '40.5' }).valid, false, 'still inside the hole');
  assert.equal(score({ heartRate: '41' }).valid, true, '41 is the bottom of the 41-60 band');
  assert.match(score({ heartRate: '40.5' }).message, /INTERVAL, not the single value 40/);
});

// THE conjunction.
test('fasciculation scores 1 for either attribute and 2 only for both', () => {
  assert.equal(score().fasciculationPoints, 0);
  assert.equal(score({ fasciculationGeneralized: 'yes' }).fasciculationPoints, 1);
  assert.equal(score({ fasciculationContinuous: 'yes' }).fasciculationPoints, 1);
  const both = score({ fasciculationGeneralized: 'yes', fasciculationContinuous: 'yes' });
  assert.equal(both.fasciculationPoints, 2);
  assert.equal(both.bothFasciculationAttributes, true);
});

test('the two fasciculation attributes are symmetric: neither alone outranks the other', () => {
  assert.equal(score({ fasciculationGeneralized: 'yes' }).total,
    score({ fasciculationContinuous: 'yes' }).total);
});

test('the result states that fasciculation is a conjunction, not a ladder', () => {
  assert.match(score().bandText, /conjunction rather than a severity ladder/);
  assert.match(score().bandText, /Intensity is not the axis/);
});

// Pupil precedence.
test('pinpoint outranks under-2mm, and the precedence is stated', () => {
  assert.equal(score({ pupil: 'pinpoint' }).total, 2);
  assert.equal(score({ pupil: 'under-2mm' }).total, 1);
  assert.match(score().bandText, /Pinpoint takes precedence/);
});

// Bands.
test('the bands tile the range exactly', () => {
  assert.equal(score({ pupil: 'under-2mm' }).band, 'Mild poisoning');           // 1
  assert.equal(score({ pupil: 'pinpoint', respiratory: 'at-least-20' }).band, 'Mild poisoning'); // 3
  assert.equal(score({ pupil: 'pinpoint', respiratory: 'at-least-20-cyanosis' }).band, 'Moderate poisoning'); // 4
  assert.equal(score({
    pupil: 'pinpoint', respiratory: 'at-least-20-cyanosis', heartRate: '30', consciousness: 'impaired',
  }).band, 'Moderate poisoning'); // 7
  assert.equal(score({
    pupil: 'pinpoint', respiratory: 'at-least-20-cyanosis', heartRate: '30', consciousness: 'none',
  }).band, 'Severe poisoning'); // 8
});

// Timing and scope.
test('the result states the before-treatment precondition', () => {
  assert.match(score().bandText, /must be applied BEFORE treatment/);
  assert.match(score().bandText, /Atropine reverses miosis and bradycardia/);
});

test('the result refuses to be a dosing instrument', () => {
  assert.match(score().bandText, /NOT a dosing instrument/);
  assert.match(score().bandText, /does not indicate or titrate atropine/);
});

// Input handling.
test('missing inputs are refused', () => {
  assert.equal(peradeniyaOp({}).valid, false);
  assert.equal(score({ heartRate: '' }).valid, false);
  assert.equal(score({ seizures: '' }).valid, false);
});

test('the seizures refusal names the half weight', () => {
  const r = score({ seizures: '' });
  assert.match(r.message, /HALF WEIGHT/);
  assert.match(r.message, /and not 12/);
});

test('the scope note names carbamate and the later syndromes', () => {
  const r = score();
  assert.match(r.note, /carbamate poisoning/);
  assert.match(r.note, /Intermediate syndrome and delayed neuropathy/);
  assert.match(r.note, /not a dosing instrument/);
});
