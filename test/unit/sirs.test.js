// spec-v12 §3.9.1 wave 12-8: SIRS Criteria boundary examples per
// Bone RC, et al. Chest. 1992;101(6):1644-1655.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sirs } from '../../lib/scoring-v4.js';

test('sirs low: 0 of 4 -> SIRS-negative', () => {
  const r = sirs({ tempAbnormal: false, hrGt90: false, rrOrPaco2: false, wbcOrBands: false });
  assert.equal(r.count, 0);
  assert.equal(r.sirsPositive, false);
  assert.match(r.band, /SIRS-negative/);
});

test('sirs at threshold: 2 of 4 -> SIRS-positive', () => {
  const r = sirs({ tempAbnormal: true, hrGt90: true, rrOrPaco2: false, wbcOrBands: false });
  assert.equal(r.count, 2);
  assert.equal(r.sirsPositive, true);
  assert.match(r.band, /SIRS-positive/);
});

test('sirs 1 of 4 below threshold -> SIRS-negative', () => {
  const r = sirs({ tempAbnormal: false, hrGt90: true, rrOrPaco2: false, wbcOrBands: false });
  assert.equal(r.count, 1);
  assert.equal(r.sirsPositive, false);
});

test('sirs high: all 4 -> SIRS-positive', () => {
  const r = sirs({ tempAbnormal: true, hrGt90: true, rrOrPaco2: true, wbcOrBands: true });
  assert.equal(r.count, 4);
  assert.equal(r.sirsPositive, true);
});

test('sirs band surfaces Sepsis-3 (Singer 2016) context', () => {
  const r = sirs({ tempAbnormal: true, hrGt90: true, rrOrPaco2: false, wbcOrBands: false });
  assert.match(r.band, /Sepsis-3|Singer 2016/);
});
