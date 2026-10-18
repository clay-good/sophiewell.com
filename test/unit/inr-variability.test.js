// spec-v1634 tool 27: Fihn variance growth rate, method A as printed in Ibrahim 2013 Figure 1.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inrVariability as vgr } from '../../lib/inr-variability-v1634.js';

test('averages (INR - target)^2 / weeks over the INRs entered', () => {
  // (2.0-2.5)^2/2 + (3.5-2.5)^2/1 + (2.5-2.5)^2/2 = 0.125 + 1 + 0 = 1.125; / 3 = 0.375
  const r = vgr({ series: '2.0 2\n3.5 1\n2.5 2', target: '2.5' });
  assert.equal(r.valid, true);
  assert.equal(r.vgr, 0.375);
  assert.equal(r.n, 3);
  assert.equal(r.band, 'Fihn variance growth rate 0.38 over 3 INRs (target 2.5).');
});

test('every INR on target gives 0; a longer interval weighs a deviation less', () => {
  assert.equal(vgr({ series: '2.5 4\n2.5 4', target: '2.5' }).vgr, 0);
  assert.ok(vgr({ series: '3.5 4', target: '2.5' }).vgr < vgr({ series: '3.5 1', target: '2.5' }).vgr);
});

test('blank, malformed and out-of-range input refuses', () => {
  assert.equal(vgr({ series: '', target: '2.5' }).valid, false);
  assert.equal(vgr({ series: '2.0 2', target: '' }).valid, false);
  assert.equal(vgr({ series: '2.0', target: '2.5' }).valid, false);
  assert.equal(vgr({ series: '2.0 0', target: '2.5' }).valid, false);
  assert.equal(vgr({ series: '2.0 2\n25 1', target: '2.5' }).valid, false);
});
