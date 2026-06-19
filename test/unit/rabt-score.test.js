// spec-v108 2.4: RABT (Joseph 2018). 0-4, >= 2 predicts massive transfusion.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rabtScore } from '../../lib/trauma-v108.js';

test('no inputs -> 0, below threshold', () => {
  const r = rabtScore({});
  assert.equal(r.total, 0);
  assert.equal(r.mt, false);
});

test('shock index > 1 scores a point; <= 1 does not', () => {
  assert.equal(rabtScore({ hr: 130, sbp: 100 }).total, 1); // SI 1.3
  assert.equal(rabtScore({ hr: 90, sbp: 120 }).total, 0); // SI 0.75
});

test('band flip: total crossing 2 into the activation band', () => {
  const one = rabtScore({ hr: 130, sbp: 100 }); // SI > 1 only
  assert.equal(one.total, 1);
  assert.equal(one.mt, false);
  const two = rabtScore({ hr: 130, sbp: 100, pelvis: true });
  assert.equal(two.total, 2);
  assert.equal(two.mt, true);
  assert.equal(two.abnormal, true);
  assert.match(two.band, /massive transfusion predicted/);
});

test('all four items present clamp to 4', () => {
  const r = rabtScore({ hr: 150, sbp: 100, pelvis: true, penetrating: true, fast: true });
  assert.equal(r.total, 4);
  assert.equal(r.mt, true);
});

test('shock index reported when HR and SBP present, null otherwise', () => {
  assert.equal(rabtScore({ hr: 120, sbp: 100 }).shockIndex, 1.2);
  assert.equal(rabtScore({ pelvis: true }).shockIndex, null);
});
