// spec-v130 2.4: PSA doubling time (Pound 1999). PSADT = ln(2) x T / (ln(PSA2)
// - ln(PSA1)), T in months; requires a rising PSA; < 12 months more aggressive.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { psaDoublingTime } from '../../lib/uro-v130.js';

test('doubling from 4 to 8 over 6 months gives exactly 6 months', () => {
  const r = psaDoublingTime({ psa1: 4, psa2: 8, months: 6 });
  assert.equal(r.valid, true);
  assert.equal(r.rising, true);
  assert.equal(r.dt, 6); // ln2*6/ln2
  assert.equal(r.abnormal, true); // < 12 months
  assert.match(r.band, /more aggressive/);
});

test('slow doubling is not flagged aggressive', () => {
  const r = psaDoublingTime({ psa1: 4, psa2: 5, months: 24 });
  // ln2*24/ln(1.25) = 16.642/0.22314 = 74.6 months
  assert.equal(r.dt, 74.6);
  assert.equal(r.abnormal, false);
});

test('non-rising PSA has no doubling time (rising guard)', () => {
  const flat = psaDoublingTime({ psa1: 5, psa2: 5, months: 6 });
  assert.equal(flat.valid, true);
  assert.equal(flat.rising, false);
  assert.equal(flat.dt, null);
  assert.equal(flat.abnormal, false);
  assert.match(flat.band, /not rising/);
  const falling = psaDoublingTime({ psa1: 5, psa2: 4, months: 6 });
  assert.equal(falling.rising, false);
});

test('blank field -> valid:false; scalar -> valid:false', () => {
  assert.equal(psaDoublingTime({ psa1: 4, psa2: 8 }).valid, false);
  assert.equal(psaDoublingTime(7).valid, false);
});
