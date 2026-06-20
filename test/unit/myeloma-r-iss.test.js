// spec-v134 2.2: Revised ISS (Palumbo A, et al; IMWG, J Clin Oncol
// 2015;33:2863-2869). Recomputes the ISS from beta2M + albumin, then:
// Stage I = ISS I + normal LDH + no high-risk iFISH; Stage III = ISS III +
// (high LDH OR high-risk iFISH); Stage II = all others. The R-ISS-flip tests
// pin that adding a single risk feature moves the stage.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { myelomaRIss } from '../../lib/onc-v134.js';

test('R-ISS I requires ISS I AND normal LDH AND no high-risk iFISH', () => {
  const r = myelomaRIss({ b2m: 2.0, albumin: 4.0, ldhHigh: 'no', highRiskFish: 'no' });
  assert.equal(r.iss, 'I');
  assert.equal(r.stage, 'I');
});

test('a high LDH flips ISS I from R-ISS I to R-ISS II', () => {
  assert.equal(myelomaRIss({ b2m: 2.0, albumin: 4.0, ldhHigh: 'yes', highRiskFish: 'no' }).stage, 'II');
});

test('high-risk iFISH alone flips ISS I to R-ISS II', () => {
  assert.equal(myelomaRIss({ b2m: 2.0, albumin: 4.0, ldhHigh: 'no', highRiskFish: 'yes' }).stage, 'II');
});

test('R-ISS III needs ISS III AND a risk feature', () => {
  // ISS III but no high LDH and no iFISH -> stays R-ISS II
  assert.equal(myelomaRIss({ b2m: 6.0, albumin: 3.0, ldhHigh: 'no', highRiskFish: 'no' }).stage, 'II');
  // ISS III + high LDH -> R-ISS III
  assert.equal(myelomaRIss({ b2m: 6.0, albumin: 3.0, ldhHigh: 'yes', highRiskFish: 'no' }).stage, 'III');
  // ISS III + iFISH -> R-ISS III
  assert.equal(myelomaRIss({ b2m: 6.0, albumin: 3.0, ldhHigh: 'no', highRiskFish: 'yes' }).stage, 'III');
});

test('blank fields surface the fallback', () => {
  assert.equal(myelomaRIss({ b2m: 2.0, albumin: 4.0, ldhHigh: 'no' }).valid, false);
  assert.equal(myelomaRIss({}).valid, false);
});
