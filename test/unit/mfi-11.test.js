// spec-v143 2.2: Modified 11-Item Frailty Index (Velanovich 2013). Fraction count/11.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mfi11 } from '../../lib/frailty-v143.js';

test('no deficits -> 0/11, 0%', () => {
  const r = mfi11({});
  assert.equal(r.valid, true);
  assert.equal(r.score, 0);
  assert.equal(r.fractionPct, 0);
});

test('three deficits -> 3/11 = 27.3%', () => {
  const r = mfi11({ diabetes: 1, chf: 1, mi: 1 });
  assert.equal(r.score, 3);
  assert.equal(r.fractionPct, 27.3);
  assert.match(r.band, /3\/11/);
});

test('the divisor is the fixed constant 11 (all eleven -> 100%)', () => {
  const r = mfi11({ diabetes: 1, dependent: 1, copd: 1, chf: 1, mi: 1, cardiac: 1, hypertension: 1, pvd: 1, sensorium: 1, tia: 1, cvaDeficit: 1 });
  assert.equal(r.score, 11);
  assert.equal(r.fractionPct, 100);
});

test('unrecognized keys are ignored, fraction stays finite', () => {
  const r = mfi11({ bogus: 1, diabetes: 1 });
  assert.equal(r.score, 1);
  assert.ok(Number.isFinite(r.fractionPct));
});
