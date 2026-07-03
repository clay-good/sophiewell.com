// spec-v207 2.3: Termination-of-Resuscitation rule worked examples. BLS needs 3
// facts absent; ALS needs 5 absent. Criteria spec-v97 cross-verified (Morrison
// 2006 BLS / 2007 ALS).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { torRule as tor } from '../../lib/resus-trauma-v207.js';

test('BLS all criteria met -> TOR may be considered', () => {
  const r = tor({ rule: 'bls' });
  assert.equal(r.valid, true);
  assert.equal(r.met, true);
  assert.match(r.band, /may be considered/);
});

test('BLS with ROSC -> not met, continue', () => {
  const r = tor({ rule: 'bls', rosc: true });
  assert.equal(r.met, false);
  assert.match(r.band, /continue/);
  assert.match(r.detail, /ROSC before transport/);
});

test('any of the three BLS facts blocks TOR', () => {
  assert.equal(tor({ rule: 'bls', emsWitnessed: true }).met, false);
  assert.equal(tor({ rule: 'bls', shock: true }).met, false);
});

test('ALS all five criteria met -> TOR may be considered', () => {
  const r = tor({ rule: 'als' });
  assert.equal(r.met, true);
});

test('ALS adds bystander criteria (bystander CPR blocks TOR)', () => {
  const r = tor({ rule: 'als', bystanderCpr: true });
  assert.equal(r.met, false);
  // the same facts would satisfy the BLS rule (which ignores bystander CPR)
  assert.equal(tor({ rule: 'bls', bystanderCpr: true }).met, true);
});

test('no rule -> complete-the-fields', () => {
  const r = tor({});
  assert.equal(r.valid, false);
});
