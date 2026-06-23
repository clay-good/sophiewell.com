// spec-v142 2.1: POSSUM (Copeland 1991). Physiological + operative scores drive
// two logistic equations for predicted 30-day morbidity and mortality.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { possum } from '../../lib/surg-v142.js';

const FULL = { age: 4, cardiac: 2, respiratory: 2, sbp: 2, pulse: 4, gcs: 1, hb: 4, wcc: 2, urea: 4, sodium: 2, potassium: 1, ecg: 4, opSeverity: 4, procedures: 1, bloodLoss: 4, soiling: 4, malignancy: 1, urgency: 4 };

test('phys 32 / op 18 -> morbidity 93.3%, mortality 50% (logit 0)', () => {
  const r = possum(FULL);
  assert.equal(r.valid, true);
  assert.equal(r.physScore, 32);
  assert.equal(r.opScore, 18);
  assert.equal(r.mortality, 50);
  assert.equal(r.morbidity, 93.3);
  assert.match(r.band, /morbidity 93\.3%, mortality 50%/);
});

test('minimum scores (12 / 6) -> low predicted rates', () => {
  const floor = {};
  for (const k of Object.keys(FULL)) floor[k] = 1;
  const r = possum(floor);
  assert.equal(r.physScore, 12);
  assert.equal(r.opScore, 6);
  // mortality logit = -7.04 + 0.13*12 + 0.16*6 = -4.52 -> ~1.08%
  assert.ok(r.mortality > 0.9 && r.mortality < 1.3, `mortality ${r.mortality}`);
});

test('a blank variable -> valid:false (no probability from NaN)', () => {
  const partial = { ...FULL };
  delete partial.urea;
  assert.equal(possum(partial).valid, false);
  assert.equal(possum({}).valid, false);
});

test('an out-of-band grade is rejected (clamped to the allowed set)', () => {
  // age has no 8-point band; a stray 8 is not in [1,2,4] -> valid:false
  assert.equal(possum({ ...FULL, age: 8 }).valid, false);
});
