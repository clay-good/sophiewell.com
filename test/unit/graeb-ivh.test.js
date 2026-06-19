// spec-v118 2.2: Modified Graeb Score (Morgan 2013). Eight compartments summed to
// a max of 32: four large (fill 0-4 + 1 expansion = max 5) + four horns (fill 0-2
// + 1 expansion = max 3). The expansion bonus is an independent additive modifier
// on top of the fill grade (PMC6800016: max 32 = every compartment filled AND
// expanded).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { graebIvh } from '../../lib/neuro-v118.js';

const ALL_FILLED = {
  rightLateral: 4, leftLateral: 4, third: 4, fourth: 4,
  rightOccipital: 2, leftOccipital: 2, rightTemporal: 2, leftTemporal: 2,
};
const ALL_EXP = {
  rightLateralExp: true, leftLateralExp: true, thirdExp: true, fourthExp: true,
  rightOccipitalExp: true, leftOccipitalExp: true, rightTemporalExp: true, leftTemporalExp: true,
};

test('no blood -> total 0', () => {
  const r = graebIvh({});
  assert.equal(r.valid, true);
  assert.equal(r.total, 0);
  assert.equal(r.abnormal, false);
  assert.match(r.scored, /no intraventricular blood/);
});

test('all compartments filled but not expanded -> 24 (4x4 + 4x2)', () => {
  const r = graebIvh(ALL_FILLED);
  assert.equal(r.total, 24);
});

test('all compartments filled AND expanded -> exactly 32 (4x5 + 4x3)', () => {
  const r = graebIvh({ ...ALL_FILLED, ...ALL_EXP });
  assert.equal(r.total, 32);
  assert.equal(r.abnormal, true);
});

test('expansion adds +1 on top of the fill grade (fill 2 + expanded = 3)', () => {
  const r = graebIvh({ rightLateral: 2, rightLateralExp: true });
  assert.equal(r.total, 3);
  assert.match(r.scored, /right lateral ventricle \+3 \(expanded\)/);
});

test('expansion with no blood (fill 0) contributes nothing', () => {
  const r = graebIvh({ third: 0, thirdExp: true });
  assert.equal(r.total, 0);
});

test('a mid-range scan sums correctly', () => {
  const r = graebIvh({ rightLateral: 3, leftLateral: 2, third: 1, fourth: 0, rightTemporal: 2 });
  assert.equal(r.total, 8);
  assert.match(r.scored, /right lateral ventricle \+3/);
  assert.match(r.scored, /right temporal horn \+2/);
});

test('over-grading a large compartment fill is clamped to 4 (5 with expansion)', () => {
  assert.equal(graebIvh({ rightLateral: 9 }).total, 4);
  assert.equal(graebIvh({ rightLateral: 9, rightLateralExp: true }).total, 5);
});

test('over-grading a horn fill is clamped to 2 (3 with expansion)', () => {
  assert.equal(graebIvh({ rightTemporal: 9 }).total, 2);
  assert.equal(graebIvh({ rightTemporal: 9, rightTemporalExp: true }).total, 3);
});

test('total can never exceed 32 even with over-grading everywhere', () => {
  const r = graebIvh({
    rightLateral: 99, leftLateral: 99, third: 99, fourth: 99,
    rightOccipital: 99, leftOccipital: 99, rightTemporal: 99, leftTemporal: 99,
    ...ALL_EXP,
  });
  assert.equal(r.total, 32);
});

test('the per-point outcome framing is reported, not a fabricated cutoff', () => {
  const r = graebIvh({ third: 2 });
  assert.match(r.band, /12%/);
  assert.doesNotMatch(r.band, />= 11/);
});
