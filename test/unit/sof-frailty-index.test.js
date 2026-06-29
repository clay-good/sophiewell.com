// spec-v177 §2.5: SOF frailty index. 3 items, 0 robust / 1 pre-frail / >= 2 frail.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sofFrailtyIndex } from '../../lib/ltcga-v177.js';

const z = { weightLoss5pct: 'no', cannotRise5x: 'no', reducedEnergy: 'no' };

test('SOF 0 -> robust', () => {
  assert.match(sofFrailtyIndex(z).band, /robust/);
});

test('SOF 1 -> pre-frail; 2 -> frail (the band edges)', () => {
  assert.match(sofFrailtyIndex({ ...z, weightLoss5pct: 'yes' }).band, /pre-frail/);
  assert.match(sofFrailtyIndex({ ...z, weightLoss5pct: 'yes', cannotRise5x: 'yes' }).band, /frail \(/);
});

test('SOF 3 -> frail', () => {
  const r = sofFrailtyIndex({ weightLoss5pct: 'yes', cannotRise5x: 'yes', reducedEnergy: 'yes' });
  assert.equal(r.total, 3);
  assert.match(r.band, /frail/);
});

test('SOF blank -> complete-the-fields', () => {
  assert.equal(sofFrailtyIndex({ ...z, weightLoss5pct: '' }).valid, false);
  assert.equal(sofFrailtyIndex({}).valid, false);
});
