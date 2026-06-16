// spec-v94 §2.3: FLIPI + IPI lymphoma prognostic indices.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { flipi } from '../../lib/hemonc-v94.js';

test('worked example: FLIPI 3 high, IPI 3 high-intermediate', () => {
  const r = flipi({ ageOver60: 'yes', stageAdvanced: 'yes', ldhHigh: 'yes' });
  assert.equal(r.flipiScore, 3);
  assert.equal(r.flipiBand, 'high');
  assert.equal(r.ipiScore, 3);
  assert.equal(r.ipiBand, 'high-intermediate');
  assert.match(r.band, /FLIPI 3 \(high\); IPI 3 \(high-intermediate\)\./);
});

test('no factors -> both low', () => {
  const r = flipi({});
  assert.equal(r.flipiScore, 0);
  assert.equal(r.flipiBand, 'low');
  assert.equal(r.ipiScore, 0);
  assert.equal(r.ipiBand, 'low');
});

test('FLIPI band edges: 1 low, 2 intermediate, 3 high', () => {
  assert.equal(flipi({ ageOver60: 'yes' }).flipiBand, 'low');
  assert.equal(flipi({ ageOver60: 'yes', hgbLow: 'yes' }).flipiBand, 'intermediate');
  assert.equal(flipi({ ageOver60: 'yes', hgbLow: 'yes', nodalOver4: 'yes' }).flipiBand, 'high');
});

test('IPI band edges: 2 low-int, 3 high-int, 5 high', () => {
  assert.equal(flipi({ ageOver60: 'yes', stageAdvanced: 'yes' }).ipiBand, 'low-intermediate');
  assert.equal(flipi({ ageOver60: 'yes', stageAdvanced: 'yes', ecogOver2: 'yes' }).ipiBand, 'high-intermediate');
  assert.equal(flipi({ ageOver60: 'yes', stageAdvanced: 'yes', ecogOver2: 'yes', ldhHigh: 'yes', extranodalOver1: 'yes' }).ipiBand, 'high');
});
