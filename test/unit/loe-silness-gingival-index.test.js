// spec-v722: Loe-Silness Gingival Index.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { loeSilnessGingivalIndex } from '../../lib/loe-silness-gingival-index-v722.js';

test('worked example: 20/40/30/10 -> GI 1.3 (moderate)', () => {
  const r = loeSilnessGingivalIndex({ score0: '20', score1: '40', score2: '30', score3: '10' });
  assert.equal(r.valid, true);
  assert.equal(r.surfaces, 100);
  assert.equal(r.index, 1.3); // (40 + 60 + 30) / 100
  assert.equal(r.tier, 'moderate');
  assert.equal(r.abnormal, true);
});

test('index is the weighted mean of surface scores', () => {
  const r = loeSilnessGingivalIndex({ score0: '0', score1: '0', score2: '2', score3: '0' });
  assert.equal(r.index, 2); // all surfaces score 2
});

test('all-zero surfaces -> GI 0, healthy', () => {
  const r = loeSilnessGingivalIndex({ score0: '28', score1: '0', score2: '0', score3: '0' });
  assert.equal(r.index, 0);
  assert.equal(r.tier, 'healthy');
  assert.equal(r.abnormal, false);
});

test('bands: 0 healthy, 0.1-1.0 mild, 1.1-2.0 moderate, 2.1-3.0 severe', () => {
  assert.equal(loeSilnessGingivalIndex({ score1: '1', score0: '1' }).tier, 'mild');     // 0.5
  assert.equal(loeSilnessGingivalIndex({ score1: '10' }).tier, 'mild');                  // 1.0
  assert.equal(loeSilnessGingivalIndex({ score2: '10', score1: '5' }).tier, 'moderate'); // 25/15=1.67
  assert.equal(loeSilnessGingivalIndex({ score3: '10', score2: '2' }).tier, 'severe');   // (30+4)/12=2.83
});

test('requires at least one surface; counts validated', () => {
  assert.equal(loeSilnessGingivalIndex({}).valid, false);
  assert.equal(loeSilnessGingivalIndex({}).code, 'MISSING_INPUT');
  assert.equal(loeSilnessGingivalIndex({ score0: '-1' }).valid, false);
});
