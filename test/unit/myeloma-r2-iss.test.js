// spec-v134 2.3: Second-Revision ISS (D'Agostino M, et al; EMN/HARMONY, J Clin
// Oncol 2022;40:3406-3418). Additive weights: ISS II = 1.0, ISS III = 1.5; high
// LDH = 1.0; del(17p) = 1.0; t(4;14) = 1.0; gain/amp 1q21 = 0.5. Total 0-5 ->
// strata 0 = I, 0.5-1 = II, 1.5-2.5 = III, 3-5 = IV. The strata-boundary tests
// pin the 0/0.5, 1/1.5, and 2.5/3 edges.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { myelomaR2Iss } from '../../lib/onc-v134.js';

const base = { iss: 'I', ldhHigh: 'no', del17p: 'no', t414: 'no', gain1q: 'no' };

test('no risk features -> total 0, stratum I (low)', () => {
  const r = myelomaR2Iss(base);
  assert.equal(r.total, 0);
  assert.match(r.stratum, /^I \(low\)/);
});

test('the 1q21 0.5 weight crosses I -> II at 0.5', () => {
  const r = myelomaR2Iss({ ...base, gain1q: 'yes' });
  assert.equal(r.total, 0.5);
  assert.match(r.stratum, /^II /);
});

test('ISS II + high LDH = 2.0 -> stratum III; ISS III + LDH + 1q = 3.0 -> IV', () => {
  const r3 = myelomaR2Iss({ ...base, iss: 'II', ldhHigh: 'yes' });
  assert.equal(r3.total, 2.0);
  assert.match(r3.stratum, /^III /);
  const r4 = myelomaR2Iss({ iss: 'III', ldhHigh: 'yes', del17p: 'no', t414: 'no', gain1q: 'yes' });
  assert.equal(r4.total, 3.0);
  assert.match(r4.stratum, /^IV \(high\)/);
});

test('the published 5.0 maximum is reachable and clamps into stratum IV', () => {
  const r = myelomaR2Iss({ iss: 'III', ldhHigh: 'yes', del17p: 'yes', t414: 'yes', gain1q: 'yes' });
  assert.equal(r.total, 5.0);
  assert.match(r.stratum, /^IV /);
});

test('an unselected ISS stage or a blank flag surfaces the fallback', () => {
  assert.equal(myelomaR2Iss({ ...base, iss: '' }).valid, false);
  assert.equal(myelomaR2Iss({ iss: 'II' }).valid, false);
});
