// spec-v254: worked examples for the ENT / urology / psychiatry screening tools.
// Point systems spec-v97 verified (Belafsky 2002; Lund & Mackay 1993; Abrams 1999;
// Heatherton 1991).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { refluxSymptomIndex, lundMackay, bladderOutletObstructionIndex, fagerstromFtnd } from '../../lib/enturopsych-v254.js';

test('rsi: > 13 suggests LPR', () => {
  const r = refluxSymptomIndex({ hoarseness: 3, clearing: 3, mucus: 3, swallowing: 3, cough1: 3 });
  assert.equal(r.score, 15);
  assert.equal(r.abnormal, true);
});
test('rsi: <= 13 normal', () => {
  assert.equal(refluxSymptomIndex({ hoarseness: 5, clearing: 5 }).abnormal, false);
});

test('lund-mackay: sums sinuses + OMC', () => {
  const r = lundMackay({ maxR: 2, aethR: 1, omcR: true, maxL: 1 }); // 2+1+2+1
  assert.equal(r.score, 6);
});

test('bladder-outlet: > 40 obstructed', () => {
  const r = bladderOutletObstructionIndex({ pdet: 80, qmax: 10 }); // BOOI 60, BCI 130
  assert.equal(r.score, 60);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /BCI 130/);
});
test('bladder-outlet: unobstructed', () => {
  const r = bladderOutletObstructionIndex({ pdet: 30, qmax: 15 }); // BOOI 0
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
});

test('fagerstrom: high dependence', () => {
  const r = fagerstromFtnd({ timeToFirst: 3, perDay: 3 });
  assert.equal(r.score, 6);
  assert.match(r.band, /high/);
});
test('fagerstrom: very low', () => {
  const r = fagerstromFtnd({ refrain: true });
  assert.equal(r.score, 1);
  assert.equal(r.abnormal, false);
});
