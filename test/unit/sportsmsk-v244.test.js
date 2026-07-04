// spec-v244: worked examples for the sports-medicine / MSK measures. Point systems
// spec-v97 verified (Lysholm & Gillquist 1982; Marx 2001; Redmond 2006; Riemann &
// Guskiewicz).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lysholm, marxActivity, footPostureIndex, bess } from '../../lib/sportsmsk-v244.js';

test('lysholm: good band', () => {
  const r = lysholm({ limp: 5, support: 5, locking: 15, instability: 20, pain: 20, swelling: 10, stair: 10, squat: 5 });
  assert.equal(r.score, 90);
  assert.match(r.band, /good/);
});
test('lysholm: perfect is excellent', () => {
  const r = lysholm({ limp: 5, support: 5, locking: 15, instability: 25, pain: 25, swelling: 10, stair: 10, squat: 5 });
  assert.equal(r.score, 100);
  assert.equal(r.abnormal, false);
});

test('marx: sum 0-16', () => {
  const r = marxActivity({ running: 4, cutting: 3, deceleration: 3, pivoting: 2 });
  assert.equal(r.score, 12);
});

test('foot-posture-index: pronated band', () => {
  const r = footPostureIndex({ talar: 1, supra: 1, calcaneal: 1, talonavicular: 1, arch: 1, forefoot: 1 });
  assert.equal(r.score, 6);
  assert.match(r.band, /pronated/);
});
test('foot-posture-index: supinated negative sum', () => {
  const r = footPostureIndex({ talar: -1, supra: -1, calcaneal: -1 });
  assert.equal(r.score, -3);
  assert.match(r.band, /supinated/);
});

test('bess: sum of errors', () => {
  const r = bess({ dlFirm: 3, slFirm: 3, tandemFirm: 3, dlFoam: 3, slFoam: 3, tandemFoam: 3 });
  assert.equal(r.score, 18);
});
test('bess: caps each stance at 10', () => {
  const r = bess({ dlFirm: 99 }); // out of range -> 0
  assert.equal(r.score, 0);
});
