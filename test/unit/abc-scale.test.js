// spec-v729: Activities-specific Balance Confidence (ABC) Scale.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { abcScale } from '../../lib/abc-scale-v729.js';

const ALL = (n) => Object.fromEntries(Array.from({ length: 16 }, (_, i) => [`a${i + 1}`, String(n)]));

test('all 60% -> mean 60, increased fall risk (moderate functioning)', () => {
  const r = abcScale(ALL(60));
  assert.equal(r.valid, true);
  assert.equal(r.score, 60);
  assert.equal(r.fallRisk, true);
  assert.equal(r.abnormal, true);
  assert.equal(r.tier, 'moderate');
});

test('score is the mean of the 16 ratings', () => {
  const args = ALL(80);
  args.a1 = '0'; // 15*80 = 1200, /16 = 75
  const r = abcScale(args);
  assert.equal(r.score, 75);
});

test('the 67% fall-risk cutoff', () => {
  // mean 66.9-ish -> fall risk; mean 67 -> not
  const below = abcScale(ALL(66));
  assert.equal(below.fallRisk, true);
  const at67 = abcScale(ALL(67));
  assert.equal(at67.fallRisk, false);
  assert.equal(at67.abnormal, false);
});

test('functioning bands: <50 low, 50-80 moderate, >80 high', () => {
  assert.equal(abcScale(ALL(40)).tier, 'low');
  assert.equal(abcScale(ALL(50)).tier, 'moderate');
  assert.equal(abcScale(ALL(80)).tier, 'moderate');
  assert.equal(abcScale(ALL(90)).tier, 'high');
});

test('all items required and validated 0-100', () => {
  assert.equal(abcScale({}).valid, false);
  assert.equal(abcScale({}).code, 'MISSING_INPUT');
  assert.equal(abcScale({ ...ALL(50), a8: '150' }).valid, false);
});
