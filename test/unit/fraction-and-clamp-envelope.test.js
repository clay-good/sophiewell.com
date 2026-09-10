// spec-v1233: a fraction has two ends, and only one of them is a quantity the
// envelope table names.
//
// `feNa` divides a URINE sodium by a PLASMA sodium. `BOUNDS.sodium` is serum
// sodium at 90-200 mmol/L; a urine sodium of 20 is normal, and a urine
// creatinine runs in the hundreds where a serum one runs about 1. So on every
// fractional-excretion tile here the plasma end is checked and its urine partner
// is not -- spec-v1205's rule applied to one formula rather than one field.
//
// The same reading of the same rule decides fullPIERS: it takes creatinine in
// umol/L where BOUNDS.scr is mg/dL, so only the platelet count is checked.
//
// And the clamp is not the guard, again (spec-v1224): MAGGIC clamped a systolic
// BP of 3000 mmHg to 300 and reported a 1- and 3-year mortality; CardShock
// clamped a lactate of 400 mmol/L to 40 and reported "high risk (~77%
// in-hospital mortality)".
import test from 'node:test';
import assert from 'node:assert/strict';

import { feNa, feUrea, wintersFormula } from '../../lib/clinical-v4.js';
import { fepo4, femg } from '../../lib/renal-v128.js';
import { maggic, cardShock } from '../../lib/cardio-v102.js';
import { fullPiers, miniPiers } from '../../lib/ob-v138.js';

test('fena/feurea refuse the plasma end and leave the urine end alone', () => {
  assert.throws(() => feNa({ urineNa: 20, plasmaNa: 2000, urineCr: 60, plasmaCr: 2 }), /serum sodium/);
  assert.throws(() => feNa({ urineNa: 20, plasmaNa: 140, urineCr: 60, plasmaCr: 250 }), /serum creatinine/);
  assert.throws(() => feUrea({ urineUrea: 300, plasmaUrea: 3000, urineCr: 60, plasmaCr: 2 }), /blood urea nitrogen/);
  // THE NEGATIVE HALF: a urine sodium of 20 and a urine creatinine of 60 are
  // both outside BOUNDS read as serum values, and both are legitimate here.
  assert.equal(Number(feNa({ urineNa: 20, plasmaNa: 140, urineCr: 60, plasmaCr: 2 }).toFixed(4)), 0.4762);
  assert.equal(feNa({ urineNa: 20, plasmaNa: 140, urineCr: 60 }), null);
});

test('the two other fractional excretions refuse the plasma creatinine only', () => {
  assert.match(fepo4({ urinePhos: 40, plasmaPhos: 2, urineCr: 60, plasmaCr: 250 }).message, /serum creatinine/);
  assert.match(femg({ urineMg: 5, plasmaMg: 2, urineCr: 60, plasmaCr: 250 }).message, /serum creatinine/);
  assert.equal(fepo4({ urinePhos: 40, plasmaPhos: 2, urineCr: 60, plasmaCr: 1.0 }).fe, 33.3);
  assert.equal(femg({ urineMg: 5, plasmaMg: 2, urineCr: 60, plasmaCr: 1.0 }).valid, true);
  assert.match(fepo4({ plasmaPhos: 2, urineCr: 60, plasmaCr: 1.0 }).message, /^Enter urine and plasma phosphate/);
});

test('winters refuses the measured PaCO2 it compares against the expected range', () => {
  assert.throws(() => wintersFormula({ hco3: 14, measuredPaco2: 2000 }), /arterial PaCO2/);
  assert.equal(wintersFormula({ hco3: 14, measuredPaco2: 29 }).secondaryDisorder, 'Appropriate respiratory compensation.');
  // The optional measured PaCO2 stays optional.
  assert.equal(wintersFormula({ hco3: 14 }).secondaryDisorder, null);
});

test('maggic and cardshock refuse what they were clamping', () => {
  const M = { age: 70, male: true, lvef: 35, nyha: '3', sbp: 120, bmi: 26, creatinine: 1.2 };
  assert.match(maggic({ ...M, sbp: 3000 }).band, /systolic blood pressure/);
  assert.match(maggic({ ...M, creatinine: 250 }).band, /serum creatinine/);
  assert.match(maggic(M).band, /^MAGGIC 25 points/);
  assert.match(cardShock({ lactate: 400, egfr: 50 }).band, /serum lactate/);
  assert.match(cardShock({ lactate: 5, egfr: 50 }).band, /^CardShock/);
  assert.match(maggic({ age: 70, male: true, lvef: 35, nyha: '3', bmi: 26, creatinine: 1.2 }).band, /^\(enter age/);
});

test('the two PIERS models refuse the input whose unit matches the table', () => {
  const F = { ga: 32, spo2: 97, platelets: 120, creatinine: 80, ast: 40 };
  assert.match(fullPiers({ ...F, platelets: 20000 }).message, /platelet count/);
  assert.equal(fullPiers(F).valid, true);
  // creatinine 80 is umol/L here and would be far outside BOUNDS.scr read as
  // mg/dL; it must still compute.
  assert.equal(fullPiers({ ...F, creatinine: 300 }).valid, true);
  assert.match(miniPiers({ ga: 32, sbp: 3000, proteinuria: 'lt2' }).message, /systolic blood pressure/);
  assert.equal(miniPiers({ ga: 32, sbp: 160, proteinuria: 'lt2' }).valid, true);
});
