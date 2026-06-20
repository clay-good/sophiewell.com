// spec-v132 2.1: PLASMIC score (Bendapudi 2017, Lancet Haematol 4:e157). 1 point
// each: platelet < 30; hemolysis composite; no active cancer; no transplant;
// MCV < 90; INR < 1.5; creatinine < 2.0. Total 0-7. Bands 0-4 low, 5 intermediate,
// 6-7 high. The cancer/transplant points score for the ABSENCE of the condition.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { plasmicTtp } from '../../lib/heme-v132.js';

const base = { platelet: 18, hemolysis: 'yes', activeCancer: 'no', transplant: 'no', mcv: 85, inr: 1.2, creatinine: 2.4 };

test('the 6-7 high-risk band flips when creatinine drops below 2.0', () => {
  const six = plasmicTtp(base);
  assert.equal(six.total, 6); // creatinine 2.4 not counted
  assert.equal(six.tier, 'High');
  assert.equal(six.abnormal, true);
  const seven = plasmicTtp({ ...base, creatinine: 1.4 });
  assert.equal(seven.total, 7);
  assert.equal(seven.tier, 'High');
});

test('the 5 intermediate boundary sits one point below high', () => {
  // base scores 6 (creatinine 2.4 uncounted); dropping hemolysis -> 5 = intermediate
  const r = plasmicTtp({ ...base, hemolysis: 'no' });
  assert.equal(r.total, 5);
  assert.equal(r.tier, 'Intermediate');
});

test('the absence-scored items invert (active cancer / transplant remove the point)', () => {
  const withCancer = plasmicTtp({ ...base, activeCancer: 'yes', creatinine: 1.4 });
  // full 7 minus the cancer point = 6
  assert.equal(withCancer.total, 6);
  const withTransplant = plasmicTtp({ ...base, transplant: 'yes', creatinine: 1.4 });
  assert.equal(withTransplant.total, 6);
});

test('low band and a worked all-favorable-absent case', () => {
  const low = plasmicTtp({ platelet: 200, hemolysis: 'no', activeCancer: 'yes', transplant: 'yes', mcv: 95, inr: 1.6, creatinine: 3.0 });
  assert.equal(low.total, 0);
  assert.equal(low.tier, 'Low');
  assert.equal(low.abnormal, false);
});

test('blank or non-finite inputs surface valid:false, never a partial score', () => {
  assert.equal(plasmicTtp({ platelet: 18 }).valid, false);
  assert.equal(plasmicTtp({ ...base, mcv: null }).valid, false);
  assert.equal(plasmicTtp({ ...base, hemolysis: '' }).valid, false);
  assert.equal(plasmicTtp(7).valid, false);
});
