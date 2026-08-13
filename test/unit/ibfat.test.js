// spec-v731: Infant Breastfeeding Assessment Tool (IBFAT).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { ibfat } from '../../lib/ibfat-v731.js';

test('maximum is 12 -> effective', () => {
  const r = ibfat({ readiness: '3', rooting: '3', fixing: '3', sucking: '3' });
  assert.equal(r.valid, true);
  assert.equal(r.score, 12);
  assert.equal(r.tier, 'effective');
  assert.equal(r.abnormal, false);
});

test('worked example sums to 10 -> effective (band edge)', () => {
  const r = ibfat({ readiness: '3', rooting: '2', fixing: '3', sucking: '2' });
  assert.equal(r.score, 10);
  assert.equal(r.tier, 'effective');
  assert.match(r.band, /IBFAT 10 of 12/);
});

test('the 10 cut: 9 less effective, 10 effective', () => {
  const nine = ibfat({ readiness: '3', rooting: '2', fixing: '2', sucking: '2' }); // 9
  assert.equal(nine.score, 9);
  assert.equal(nine.tier, 'less-effective');
  assert.equal(nine.abnormal, true);
  const ten = ibfat({ readiness: '3', rooting: '3', fixing: '2', sucking: '2' }); // 10
  assert.equal(ten.tier, 'effective');
});

test('all-zero -> 0, less effective', () => {
  const r = ibfat({ readiness: '0', rooting: '0', fixing: '0', sucking: '0' });
  assert.equal(r.score, 0);
  assert.equal(r.tier, 'less-effective');
  assert.equal(r.abnormal, true);
});

test('items require an integer 0-3; all required', () => {
  assert.equal(ibfat({}).valid, false);
  assert.equal(ibfat({}).code, 'MISSING_INPUT');
  assert.equal(ibfat({ readiness: '3', rooting: '3', fixing: '3', sucking: '4' }).valid, false);
  assert.equal(ibfat({ readiness: '3', rooting: '3', fixing: '3' }).field, 'sucking');
});
