// spec-v128 2.5: Electrolyte-free water clearance (Rose 1986). EFWC = urine
// volume x [1 - (urine Na + urine K) / plasma Na]. Positive = free-water
// excretion (raises plasma Na); negative = free-water retention (lowers plasma
// Na, drives hyponatremia). The result flips as urine Na + K crosses plasma Na.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { efwc } from '../../lib/renal-v128.js';

test('positive EFWC: dilute urine -> free-water excretion (raises Na)', () => {
  const r = efwc({ volume: 2.0, urineNa: 20, urineK: 15, plasmaNa: 140 });
  assert.equal(r.valid, true);
  assert.equal(r.efwc, 1.5); // 2 x (1 - 35/140) = 1.5
  assert.equal(r.abnormal, false);
  assert.match(r.band, /raises plasma sodium/);
});

test('negative EFWC: hypertonic urine -> free-water retention (drives hyponatremia)', () => {
  const r = efwc({ volume: 1.0, urineNa: 100, urineK: 60, plasmaNa: 140 });
  assert.equal(r.efwc, -0.14); // 1 x (1 - 160/140) = -0.1428...
  assert.equal(r.abnormal, true);
  assert.match(r.band, /drives hyponatremia/);
});

test('sign flips exactly as urine Na + K crosses plasma Na', () => {
  // urine Na + K = plasma Na -> EFWC = 0
  const zero = efwc({ volume: 1.5, urineNa: 80, urineK: 60, plasmaNa: 140 });
  assert.equal(zero.efwc, 0);
  assert.match(zero.band, /in balance/);
});

test('urine Na/K of zero allowed; plasma Na and volume must be positive', () => {
  assert.equal(efwc({ volume: 1.0, urineNa: 0, urineK: 0, plasmaNa: 140 }).efwc, 1);
  assert.equal(efwc({ volume: 1.0, urineNa: 20, urineK: 10, plasmaNa: 0 }).valid, false);
  assert.equal(efwc({ urineNa: 20, urineK: 10, plasmaNa: 140 }).valid, false);
  assert.equal(efwc(5).valid, false);
});
