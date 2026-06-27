// spec-v161 2.3: Free Thyroxine Index (Clark/Horn 1965). FTI = T4 x (T3RU / ref);
// reference mean defaults to 30%. Ratio guarded (ref > 0).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { freeThyroxineIndex } from '../../lib/endo-metab-v161.js';

test('tile example: T4 12, T3RU 25, default reference 30', () => {
  // 12 * (25/30) = 10.0
  const r = freeThyroxineIndex({ t4: 12, t3ru: 25 });
  assert.equal(r.valid, true);
  assert.equal(r.fti, 10);
  assert.equal(r.reference, 30);
});

test('at the reference mean the FTI equals total T4', () => {
  const r = freeThyroxineIndex({ t4: 8, t3ru: 30 });
  assert.equal(r.fti, 8);
});

test('a custom reference mean is honored', () => {
  // 10 * (35/35) = 10
  const r = freeThyroxineIndex({ t4: 10, t3ru: 35, reference: 35 });
  assert.equal(r.fti, 10);
});

test('blanks fall back', () => {
  assert.equal(freeThyroxineIndex({ t4: 12 }).valid, false);
  assert.equal(freeThyroxineIndex({ t3ru: 25 }).valid, false);
  assert.equal(freeThyroxineIndex({}).valid, false);
});
