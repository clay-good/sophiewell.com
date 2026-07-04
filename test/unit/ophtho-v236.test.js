// spec-v236: worked examples for the ophthalmology / refractive calculators.
// Formulas spec-v97 verified (StatPearls SE; vertex optics; Santhiago 2014;
// Randleman 2008).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sphericalEquivalent, vertexDistance, percentTissueAltered, randlemanErss } from '../../lib/ophtho-v236.js';

test('spherical-equivalent: S + C/2', () => {
  assert.equal(sphericalEquivalent({ sphere: 2.5, cylinder: -0.5 }).score, 2.25);
  assert.equal(sphericalEquivalent({ sphere: -3, cylinder: -2 }).score, -4);
});

test('vertex-distance: Fc = Fs/(1 - d*Fs)', () => {
  assert.equal(vertexDistance({ power: 5, vertexMm: 12 }).score, 5.32); // 5/0.94
  assert.equal(vertexDistance({ power: -10, vertexMm: 12 }).score, -8.93); // -10/1.12
});

test('percent-tissue-altered: >= 40% high risk', () => {
  const low = percentTissueAltered({ flap: 110, ablation: 80, cct: 550 }); // 34.5
  assert.equal(low.score, 34.5);
  assert.equal(low.abnormal, false);
  const high = percentTissueAltered({ flap: 130, ablation: 100, cct: 500 }); // 46
  assert.equal(high.score, 46);
  assert.equal(high.abnormal, true);
});

test('randleman-erss: high-risk sums to 18', () => {
  const r = randlemanErss({ topo: 3, rsb: 250, age: 20, cct: 445, mrse: -15 });
  assert.equal(r.score, 18);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /high/);
});
test('randleman-erss: low-risk case', () => {
  const r = randlemanErss({ topo: 0, rsb: 320, age: 40, cct: 550, mrse: -3 });
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
});
