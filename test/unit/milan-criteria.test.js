// spec-v93 §2.6: Milan criteria for HCC liver-transplant eligibility.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { milanCriteria } from '../../lib/hepgi-v93.js';

test('within: a single tumor <= 5 cm', () => {
  const r = milanCriteria({ nodules: 1, largestSize: 4.5 });
  assert.equal(r.within, true);
  assert.match(r.band, /single HCC <= 5 cm/);
});

test('within: <= 3 nodules each <= 3 cm', () => {
  const r = milanCriteria({ nodules: 3, largestSize: 2.8 });
  assert.equal(r.within, true);
});

test('size edges: single 5.0 within, 5.1 exceeds; three 3.0 within, 3.1 exceeds', () => {
  assert.equal(milanCriteria({ nodules: 1, largestSize: 5.0 }).within, true);
  assert.equal(milanCriteria({ nodules: 1, largestSize: 5.1 }).within, false);
  assert.equal(milanCriteria({ nodules: 3, largestSize: 3.0 }).within, true);
  assert.equal(milanCriteria({ nodules: 3, largestSize: 3.1 }).within, false);
});

test('count > 3 exceeds even when small', () => {
  const r = milanCriteria({ nodules: 4, largestSize: 2 });
  assert.equal(r.within, false);
  assert.match(r.failed.join(' '), /size\/count/);
});

test('macrovascular invasion or extrahepatic spread fails the AND-gate', () => {
  const inv = milanCriteria({ nodules: 1, largestSize: 3, macrovascular: 'yes' });
  assert.equal(inv.within, false);
  assert.match(inv.failed.join(' '), /macrovascular invasion/);
  const spread = milanCriteria({ nodules: 1, largestSize: 3, extrahepatic: 'yes' });
  assert.equal(spread.within, false);
  assert.match(spread.failed.join(' '), /extrahepatic spread/);
});

test('missing count/size returns a surfaced guard', () => {
  assert.equal(milanCriteria({}).valid, false);
  assert.equal(milanCriteria({ nodules: 0, largestSize: 3 }).valid, false);
});
