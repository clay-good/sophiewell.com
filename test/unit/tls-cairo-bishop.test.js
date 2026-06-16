// spec-v88 §2.3: Cairo-Bishop tumor-lysis-syndrome laboratory & clinical grading.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tlsCairoBishop } from '../../lib/metabolic-onc-v88.js';

test('worked example: lab + clinical TLS, Cairo-Bishop grade II', () => {
  const r = tlsCairoBishop({ uricAcid: 9, potassium: 6.5, phosphate: 5, calcium: 6, creatinine: 2.4, creatinineUln: 1.2, arrhythmia: 'none', seizure: 'none' });
  assert.equal(r.valid, true);
  assert.equal(r.labTls, true);
  assert.equal(r.clinicalTls, true);
  assert.equal(r.metCount, 4);
  assert.equal(r.crRatio, 2); // 2.4 / 1.2
  assert.equal(r.gradeRoman, 'II'); // creatinine ratio 2 -> renal grade II
});

test('laboratory TLS at exactly 2 abnormalities (boundary)', () => {
  const r = tlsCairoBishop({ uricAcid: 9, potassium: 6.5, phosphate: 3, calcium: 9 });
  assert.equal(r.metCount, 2); // uric + K only
  assert.equal(r.labTls, true);
  assert.equal(r.clinicalTls, false); // no end-organ criterion
  assert.equal(r.grade, 0);
});

test('one abnormality is not laboratory TLS', () => {
  const r = tlsCairoBishop({ uricAcid: 9, potassium: 5, phosphate: 3, calcium: 9 });
  assert.equal(r.metCount, 1);
  assert.equal(r.labTls, false);
});

test('25%-change criterion fires only when a baseline is supplied', () => {
  // uric 6 (< 8 absolute) but rose 50% from baseline 4 -> met
  const withBase = tlsCairoBishop({ uricAcid: 6, uricBaseline: 4, potassium: 6.2, phosphate: 3, calcium: 9 });
  assert.equal(withBase.criteria.uaMet, true);
  assert.equal(withBase.usedBaseline, true);
  assert.equal(withBase.labTls, true); // uric (by change) + K
  // same uric without a baseline -> absolute threshold only, not met
  const noBase = tlsCairoBishop({ uricAcid: 6, potassium: 6.2, phosphate: 3, calcium: 9 });
  assert.equal(noBase.criteria.uaMet, false);
  assert.equal(noBase.usedBaseline, false);
});

test('pediatric phosphate threshold differs from adult', () => {
  const adult = tlsCairoBishop({ phosphate: 5, potassium: 6.2 });
  assert.equal(adult.criteria.phosMet, true); // 5 >= 4.5
  const peds = tlsCairoBishop({ phosphate: 5, potassium: 6.2, pediatric: true });
  assert.equal(peds.criteria.phosMet, false); // 5 < 6.5
});

test('renal grade I at exactly 1.5x ULN; arrhythmia/seizure drive higher grades', () => {
  const g1 = tlsCairoBishop({ uricAcid: 9, potassium: 6.5, creatinine: 1.5, creatinineUln: 1.0 });
  assert.equal(g1.gradeRoman, 'I');
  const sudden = tlsCairoBishop({ uricAcid: 9, potassium: 6.5, arrhythmia: 'sudden-death' });
  assert.equal(sudden.gradeRoman, 'V');
});

test('corrected calcium reuses the albumin correction', () => {
  // measured Ca 7.4 with albumin 2 -> corrected 7.4 + 0.8*(4-2) = 9.0 (not <= 7)
  const r = tlsCairoBishop({ calcium: 7.4, albumin: 2, potassium: 6.2 });
  assert.equal(r.correctedCa, 9);
  assert.equal(r.criteria.caMet, false);
});

test('no metabolic labs surfaces a guarded fallback', () => {
  const r = tlsCairoBishop({ creatinine: 3, creatinineUln: 1 });
  assert.equal(r.valid, false);
});
