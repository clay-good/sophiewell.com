// spec-v142 2.2: P-POSSUM (Prytherch 1998). Portsmouth-recalibrated mortality on
// the identical 18 POSSUM variables; reported beside the original POSSUM mortality.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pPossum } from '../../lib/surg-v142.js';

const KEYS = ['age', 'cardiac', 'respiratory', 'sbp', 'pulse', 'gcs', 'hb', 'wcc', 'urea', 'sodium', 'potassium', 'ecg', 'opSeverity', 'procedures', 'bloodLoss', 'soiling', 'malignancy', 'urgency'];
const floor = () => Object.fromEntries(KEYS.map((k) => [k, 1]));

test('minimum 12/6 scores show the low-risk divergence: P-POSSUM 0.2% vs POSSUM 1.1%', () => {
  const r = pPossum(floor());
  assert.equal(r.valid, true);
  assert.equal(r.physScore, 12);
  assert.equal(r.opScore, 6);
  assert.equal(r.mortality, 0.2);
  assert.equal(r.possumMortality, 1.1);
  assert.ok(r.mortality < r.possumMortality, 'P-POSSUM under-predicts vs POSSUM at the low end');
  assert.match(r.band, /recalibrated predicted mortality 0\.2% \(original POSSUM equation 1\.1%\)/);
});

test('higher scores converge toward POSSUM (phys 32 / op 18 -> 29.7% vs 50%)', () => {
  const r = pPossum({ ...floor(), age: 4, pulse: 4, hb: 4, urea: 4, ecg: 4, sbp: 2, cardiac: 2, respiratory: 2, wcc: 2, sodium: 2, opSeverity: 4, bloodLoss: 4, soiling: 4, urgency: 4 });
  assert.equal(r.physScore, 32);
  assert.equal(r.opScore, 18);
  assert.equal(r.mortality, 29.7);
  assert.equal(r.possumMortality, 50);
});

test('a blank variable -> valid:false', () => {
  const partial = floor();
  delete partial.sodium;
  assert.equal(pPossum(partial).valid, false);
  assert.equal(pPossum({}).valid, false);
});
