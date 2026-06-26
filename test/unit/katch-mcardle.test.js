// spec-v152 2.3: Katch-McArdle BMR (lean-mass). BMR = 370 + 21.6*LBM(kg); LBM =
// weight*(1 - bodyfat%/100). Body-fat path range-guarded 0 < BF < 100.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { katchMcArdle } from '../../lib/nutrition-energy-v152.js';

test('tile example: from body-fat % (80 kg, 20% fat -> LBM 64 -> BMR 1752)', () => {
  // LBM = 80*(1-0.20) = 64; BMR = 370 + 21.6*64 = 370 + 1382.4 = 1752.4 -> 1752.
  const r = katchMcArdle({ weight: 80, bodyFat: 20 });
  assert.equal(r.valid, true);
  assert.equal(r.lbm, 64);
  assert.equal(r.base, 1752);
});

test('direct LBM path matches the derived path', () => {
  const r = katchMcArdle({ lbm: 64 });
  assert.equal(r.valid, true);
  assert.equal(r.base, 1752);
});

test('activity factor -> TDEE (sedentary 1.2)', () => {
  const r = katchMcArdle({ lbm: 64, activity: 'sedentary' });
  assert.equal(r.tdee, Math.round(1752 * 1.2)); // 2102
});

test('body-fat out of range guarded (>=100, <=0)', () => {
  assert.equal(katchMcArdle({ weight: 80, bodyFat: 100 }).valid, false);
  assert.equal(katchMcArdle({ weight: 80, bodyFat: 0 }).valid, false);
  assert.equal(katchMcArdle({ weight: 80, bodyFat: -5 }).valid, false);
});

test('blank input -> valid:false', () => {
  assert.equal(katchMcArdle({}).valid, false);
  assert.equal(katchMcArdle({ weight: 80 }).valid, false);
});
