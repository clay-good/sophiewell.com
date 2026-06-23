// spec-v142 2.6: Surgical Risk Scale (Sutton 2002). CEPOD + ASA + BUPA = 3-14.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { surgicalRiskScale } from '../../lib/surg-v142.js';

test('minimum 1+1+1 = 3, below the high-risk threshold', () => {
  const r = surgicalRiskScale({ cepod: 1, asa: 1, bupa: 1 });
  assert.equal(r.valid, true);
  assert.equal(r.score, 3);
  assert.equal(r.abnormal, false);
});

test('emergency / ASA IV / complex-major = 13, high risk', () => {
  const r = surgicalRiskScale({ cepod: 4, asa: 4, bupa: 5 });
  assert.equal(r.score, 13);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /CEPOD 4 \+ ASA 4 \+ BUPA 5/);
});

test('the >=8 high-risk threshold flips at 8', () => {
  assert.equal(surgicalRiskScale({ cepod: 3, asa: 2, bupa: 2 }).abnormal, false); // 7
  assert.equal(surgicalRiskScale({ cepod: 3, asa: 3, bupa: 2 }).abnormal, true);  // 8
});

test('maximum 4+5+5 = 14; out-of-range or blank -> valid:false', () => {
  assert.equal(surgicalRiskScale({ cepod: 4, asa: 5, bupa: 5 }).score, 14);
  assert.equal(surgicalRiskScale({ cepod: 5, asa: 1, bupa: 1 }).valid, false); // CEPOD max 4
  assert.equal(surgicalRiskScale({}).valid, false);
});
