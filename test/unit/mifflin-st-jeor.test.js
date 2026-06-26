// spec-v152 2.1: Mifflin-St Jeor REE (Mifflin 1990). REE = 10*wt + 6.25*ht -
// 5*age + s, s = +5 (male) / -161 (female); TDEE = REE * activity factor.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mifflinStJeor } from '../../lib/nutrition-energy-v152.js';

test('tile example: male 70 kg / 175 cm / 40 yr -> REE 1599', () => {
  // 10*70 + 6.25*175 - 5*40 + 5 = 700 + 1093.75 - 200 + 5 = 1598.75 -> 1599.
  const r = mifflinStJeor({ weight: 70, height: 175, age: 40, sex: 'male' });
  assert.equal(r.valid, true);
  assert.equal(r.base, 1599);
  assert.equal(r.tdee, undefined);
});

test('male vs female +/- constant pair on identical anthropometrics (diff 166)', () => {
  const m = mifflinStJeor({ weight: 70, height: 175, age: 40, sex: 'male' });
  const f = mifflinStJeor({ weight: 70, height: 175, age: 40, sex: 'female' });
  assert.equal(m.sexConstant, 5);
  assert.equal(f.sexConstant, -161);
  // 1598.75 (male) vs 1432.75 (female); rounded 1599 vs 1433, gap 166.
  assert.equal(f.base, 1433);
  assert.equal(m.base - f.base, 166);
});

test('activity factor multiplies REE into TDEE (moderate 1.55)', () => {
  const r = mifflinStJeor({ weight: 70, height: 175, age: 40, sex: 'male', activity: 'moderate' });
  assert.equal(r.base, 1599);
  assert.equal(r.activityFactor, 1.55);
  assert.equal(r.tdee, Math.round(1599 * 1.55)); // 2478
});

test('blank weight/height/age -> valid:false complete-the-fields', () => {
  assert.equal(mifflinStJeor({ height: 175, age: 40 }).valid, false);
  assert.equal(mifflinStJeor({ weight: 70, age: 40 }).valid, false);
  assert.equal(mifflinStJeor({}).valid, false);
});
