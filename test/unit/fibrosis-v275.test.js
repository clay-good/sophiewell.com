// spec-v275: worked examples for the RDW-to-platelet ratio (RPR). Formula spec-v97
// verified against Chen 2013 (PLoS One): RPR = RDW (%) / platelet count (10^9/L).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rpr } from '../../lib/fibrosis-v275.js';

test('rpr: an elevated (>= 0.1) worked example', () => {
  const r = rpr({ rdw: 16, platelets: 100 });
  // 16 / 100 = 0.16.
  assert.equal(r.valid, true);
  assert.equal(r.score, 0.16);
  assert.equal(r.abnormal, true);
  assert.ok(r.band.includes('RDW-to-platelet ratio 0.16'));
  assert.ok(r.band.includes('~0.1'));
});

test('rpr: a low (< 0.1) profile', () => {
  const r = rpr({ rdw: 14, platelets: 250 });
  // 14 / 250 = 0.056 -> r2 0.06.
  assert.equal(r.score, 0.06);
  assert.equal(r.abnormal, false);
});

test('rpr: missing / out-of-range inputs are invalid', () => {
  assert.equal(rpr({ rdw: 14 }).valid, false);
  assert.equal(rpr({}).valid, false);
  assert.equal(rpr().valid, false);
  assert.equal(rpr({ rdw: 14, platelets: 0 }).valid, false);
});
