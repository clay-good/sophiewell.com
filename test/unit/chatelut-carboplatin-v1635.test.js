// spec-v1635 tool 2: carboplatin clearance and dose by the Chatelut formula.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chatelutCarboplatin } from '../../lib/chatelut-carboplatin-v1635.js';

const base = { weight: 70, age: 60, sex: 'male', creatinine: 80, creatinineUnit: 'micromol-l', targetAuc: 5 };
const c = (i) => chatelutCarboplatin({ ...base, ...i });

test('the formula, term by term', () => {
  const r = c({});
  // 0.134 x 70 = 9.38; 218 x 70 x (1 - 0.2742) / 80 = 138.447; total 147.83; x 5 = 739.
  assert.deepEqual([r.clearance, r.dose, r.flag], [147.8, 739, 'dose']);
});

test('male and female with the same inputs differ by the 0.314 factor on the renal term only', () => {
  const m = c({}); const f = c({ sex: 'female' });
  const renal = (r) => r.clearance - 0.134 * 70;
  assert.ok(Math.abs(renal(f) / renal(m) - 0.686) < 0.001);
  assert.equal(f.clearance, 104.4);
});

test('mg/dL is converted by 88.4 before the formula', () => {
  assert.equal(c({ creatinine: 80 / 88.4, creatinineUnit: 'mg-dl' }).clearance, 147.8);
  assert.match(c({ creatinine: 1, creatinineUnit: 'mg-dl' }).notes.join(' '), /1 mg\/dL × 88\.4 = 88\.4 µmol\/L/);
});

test('it reproduces the form Kinoshita 2006 printed, given the Jaffé creatinine that study used', () => {
  const enzymatic = 0.8;
  const kinoshita = 0.134 * 70 + (218 * 70 * (1 - 0.00457 * 60)) * 113 * 1.03e-4 / (enzymatic + 0.276);
  const r = c({ creatinine: 0.97 * enzymatic + 0.27, creatinineUnit: 'mg-dl' });
  assert.ok(Math.abs(r.clearance - kinoshita) < 0.5, `${r.clearance} vs ${kinoshita}`);
});

test('the Calvert dose is shown beside it only when a GFR is entered, with no cap on either', () => {
  assert.equal(c({}).calvertDose, null);
  const r = c({ gfr: 90 });
  assert.equal(r.calvertDose, 575);
  assert.match(r.notes.join(' '), /5 × \(90 \+ 25\) = 575 mg, 164 mg below the Chatelut dose/);
  assert.equal(c({ gfr: 200 }).calvertDose, 1125);
  assert.equal(c({ creatinine: 30 }).dose, Math.round(5 * (9.38 + 218 * 70 * (1 - 0.00457 * 60) / 30)));
});

test('an age outside 23 to 84 years is flagged, not refused; a child is refused', () => {
  assert.deepEqual((({ flag, abnormal }) => [flag, abnormal])(c({ age: 90 })), ['age-outside-study', true]);
  assert.equal(c({ age: 84 }).flag, 'dose');
  assert.equal(c({ age: 12 }).valid, false);
});

test('nothing is defaulted', () => {
  assert.match(chatelutCarboplatin({}).message, /^Choose the sex/);
  assert.match(chatelutCarboplatin({ sex: 'male' }).message, /^Choose the creatinine unit/);
  assert.match(chatelutCarboplatin({ sex: 'male', creatinineUnit: 'mg-dl' }).message, /^Enter the weight/);
  assert.match(c({ targetAuc: '' }).message, /^Enter the target AUC/);
  assert.equal(chatelutCarboplatin(null).valid, false);
});
