// spec-v233: worked examples for the quantitative bedside estimators. Formulas /
// cutoffs spec-v97 verified (Evans 1942; O'Hayon 1998 / Ambati 2019; ADJUST-PE
// 2014; Deurenberg 1991 + ACE categories).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evansIndex, fohr, ageAdjustedDDimer, deurenberg } from '../../lib/estimators-v233.js';

test('evans-index: > 0.30 is ventricular enlargement', () => {
  const r = evansIndex({ frontal: 45, skull: 140 }); // 0.321
  assert.equal(r.score, 0.32);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /enlargement/);
});
test('evans-index: <= 0.25 normal', () => {
  const r = evansIndex({ frontal: 30, skull: 140 }); // 0.214
  assert.equal(r.abnormal, false);
  assert.match(r.band, /normal/);
});
test('evans-index: frontal cannot exceed skull', () => {
  assert.equal(evansIndex({ frontal: 150, skull: 140 }).valid, false);
});

test('fohr: >= 0.55 significant ventriculomegaly', () => {
  const r = fohr({ frontal: 60, occipital: 66, bpd: 110 }); // 126/220 = 0.573
  assert.equal(r.abnormal, true);
  assert.match(r.band, /ventriculomegaly/);
});
test('fohr: normal near 0.37', () => {
  const r = fohr({ frontal: 38, occipital: 42, bpd: 110 }); // 80/220 = 0.36
  assert.equal(r.score, 0.36);
  assert.equal(r.abnormal, false);
});

test('age-adjusted-d-dimer: >50 uses age x 10', () => {
  const r = ageAdjustedDDimer({ age: 75, ddimer: 600 }); // cutoff 750
  assert.equal(r.score, 750);
  assert.equal(r.abnormal, false); // 600 < 750
});
test('age-adjusted-d-dimer: <=50 uses 500', () => {
  const r = ageAdjustedDDimer({ age: 40, ddimer: 600 }); // cutoff 500
  assert.equal(r.score, 500);
  assert.equal(r.abnormal, true); // 600 >= 500
});

test('deurenberg: obese category for high BMI male', () => {
  const r = deurenberg({ bmi: 30, age: 40, sex: 'male' }); // 36 + 9.2 - 10.8 - 5.4 = 29.0
  assert.equal(r.score, 29);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /obese/);
});
test('deurenberg: female uses 0 for sex term', () => {
  const r = deurenberg({ bmi: 22, age: 30, sex: 'female' }); // 1.2*22+0.23*30-0-5.4 = 26.4+6.9-5.4 = 27.9
  assert.equal(r.score, 27.9);
  assert.equal(r.abnormal, false); // 27.9 < 32
});
test('deurenberg: needs a valid sex', () => {
  assert.equal(deurenberg({ bmi: 22, age: 30, sex: '' }).valid, false);
});
