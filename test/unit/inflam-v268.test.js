// spec-v268: worked examples for the Advanced Lung Cancer Inflammation Index (ALI).
// Formula spec-v97 verified against Jafri 2013 (BMC Cancer, metastatic NSCLC derivation):
// ALI = BMI (kg/m^2) x serum albumin (g/dL) / NLR, where NLR = ANC / ALC.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ali } from '../../lib/inflam-v268.js';

test('ali: a worked example (NLR 3.0)', () => {
  const r = ali({ bmi: 25, albumin: 4.0, anc: 6.0, alc: 2.0 });
  // NLR = 6.0 / 2.0 = 3.0; ALI = 25 x 4.0 / 3.0 = 100 / 3 = 33.33 -> r1 33.3.
  assert.equal(r.valid, true);
  assert.equal(r.score, 33.3);
  assert.equal(r.abnormal, false);
  assert.ok(r.band.includes('Advanced Lung Cancer Inflammation Index 33.3'));
  assert.ok(r.band.includes('lower value is less favorable'));
  assert.ok(r.detail.includes('NLR 3'));
});

test('ali: a low (less favorable) high-inflammation profile', () => {
  const r = ali({ bmi: 20, albumin: 2.8, anc: 9.0, alc: 1.0 });
  // NLR = 9.0; ALI = 20 x 2.8 / 9.0 = 56 / 9 = 6.22 -> r1 6.2.
  assert.equal(r.valid, true);
  assert.equal(r.score, 6.2);
});

test('ali: missing any field is invalid, not a crash', () => {
  assert.equal(ali({ bmi: 25, albumin: 4.0, anc: 6.0 }).valid, false);
  assert.equal(ali({}).valid, false);
  assert.equal(ali().valid, false);
});

test('ali: out-of-range inputs are rejected', () => {
  assert.equal(ali({ bmi: 25, albumin: 4.0, anc: 6.0, alc: 0 }).valid, false);
  assert.equal(ali({ bmi: -1, albumin: 4.0, anc: 6.0, alc: 2.0 }).valid, false);
});
