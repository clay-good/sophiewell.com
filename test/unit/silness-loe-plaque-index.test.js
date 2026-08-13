// spec-v723: Silness-Loe Plaque Index.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { silnessLoePlaqueIndex } from '../../lib/silness-loe-plaque-index-v723.js';

test('worked example: 20/40/30/10 -> PlI 1.3 (fair)', () => {
  const r = silnessLoePlaqueIndex({ score0: '20', score1: '40', score2: '30', score3: '10' });
  assert.equal(r.valid, true);
  assert.equal(r.surfaces, 100);
  assert.equal(r.index, 1.3);
  assert.equal(r.tier, 'fair');
  assert.equal(r.abnormal, true);
});

test('index is the weighted mean of surface scores', () => {
  const r = silnessLoePlaqueIndex({ score0: '3', score1: '1', score2: '0', score3: '0' });
  assert.equal(r.index, 0.25); // 1/4
  assert.equal(r.tier, 'good');
});

test('all-zero -> PlI 0, excellent', () => {
  const r = silnessLoePlaqueIndex({ score0: '28' });
  assert.equal(r.index, 0);
  assert.equal(r.tier, 'excellent');
  assert.equal(r.abnormal, false);
});

test('bands: 0 excellent, <1 good, 1.0-1.9 fair, >=2 poor', () => {
  assert.equal(silnessLoePlaqueIndex({ score1: '9', score0: '1' }).tier, 'good');   // 0.9
  assert.equal(silnessLoePlaqueIndex({ score1: '10' }).tier, 'fair');               // 1.0
  assert.equal(silnessLoePlaqueIndex({ score2: '10' }).tier, 'poor');               // 2.0
});

test('requires at least one surface; counts validated', () => {
  assert.equal(silnessLoePlaqueIndex({}).valid, false);
  assert.equal(silnessLoePlaqueIndex({}).code, 'MISSING_INPUT');
  assert.equal(silnessLoePlaqueIndex({ score0: '2.5' }).valid, false);
});
