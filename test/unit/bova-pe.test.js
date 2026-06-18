// spec-v106 2.3: Bova Score (Bova 2014). 0-7 points, stages I/II/III.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bovaPe } from '../../lib/vte-v106.js';

test('no items -> Stage I (0 points)', () => {
  const r = bovaPe({});
  assert.equal(r.total, 0);
  assert.equal(r.stage, 'I');
  assert.equal(r.mortality, 3.1);
  assert.equal(r.complication, 4.4);
});

test('band flip: total crossing 4 into Stage III', () => {
  // sBP (2) + troponin (2) = 4 -> Stage II
  const ii = bovaPe({ sbp90to100: true, troponin: true });
  assert.equal(ii.total, 4);
  assert.equal(ii.stage, 'II');
  // + HR >= 110 (1) = 5 -> Stage III (> 4)
  const iii = bovaPe({ sbp90to100: true, troponin: true, hr110: true });
  assert.equal(iii.total, 5);
  assert.equal(iii.stage, 'III');
  assert.equal(iii.mortality, 10.5);
});

test('two 2-point items = Stage II boundary lower edge (3-4)', () => {
  const r = bovaPe({ troponin: true, hr110: true }); // 2 + 1 = 3
  assert.equal(r.total, 3);
  assert.equal(r.stage, 'II');
});

test('all four items clamp to the published 0-7 max', () => {
  const r = bovaPe({ sbp90to100: true, troponin: true, rvDysfunction: true, hr110: true });
  assert.equal(r.total, 7);
  assert.equal(r.stage, 'III');
});
