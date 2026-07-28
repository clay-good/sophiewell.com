// spec-v543: the SAVE score.
// Worked-example tests: the MINUS SIX CONSTANT that shifts every patient a full risk class if forgotten, the
// additive (not exclusive) diagnosis and organ-failure groups, the class boundary at exactly 5, the derived
// range, and the guards. Weights and classes read from Schmidt and colleagues 2015 Table 4 (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  saveScore, SAVE_DIAGNOSES, SAVE_ORGAN_FAILURES, SAVE_BINARY, SAVE_AGE_BANDS,
  SAVE_WEIGHT_BANDS, SAVE_INTUBATION_BANDS, SAVE_CONSTANT,
} from '../../lib/save-score-v543.js';

// Every flag "no", and every band chosen so it contributes 0.
function base(over = {}) {
  const args = { ageBand: '63+', weightBand: '>=90', intubationBand: '<=10' };
  for (const f of [...SAVE_DIAGNOSES, ...SAVE_ORGAN_FAILURES, ...SAVE_BINARY]) args[f.key] = 'no';
  return saveScore({ ...args, ...over });
}

test('the constant is minus 6 and is applied to every calculation', () => {
  assert.equal(SAVE_CONSTANT, -6);
  const r = base();
  assert.equal(r.componentTotal, 0);
  assert.equal(r.constant, -6);
  assert.equal(r.total, -6);          // NOT 0
  assert.match(r.band, /constant of -6 is then added/);
});

test('FORGETTING THE CONSTANT WOULD SHIFT A FULL RISK CLASS', () => {
  const r = base();
  assert.equal(r.total, -6);
  assert.equal(r.riskClass, 'IV');    // -6 lands in class IV (-9 to -5)
  // Had the constant been omitted, the same patient would score 0 -> class III.
  const withoutConstant = r.componentTotal;
  assert.equal(withoutConstant, 0);
  assert.notEqual(r.riskClass, 'III');
});

test('diagnosis groups are ADDITIVE, not exclusive', () => {
  const both = base({ myocarditis: 'yes', refractoryVtVf: 'yes' });
  assert.equal(both.componentTotal, 5);   // 3 + 2
  assert.equal(both.total, -1);
  assert.equal(both.selected.length, 2);
});

test('organ failures are ADDITIVE too, and stack to minus 9', () => {
  const all = base({ liverFailure: 'yes', cnsDysfunction: 'yes', renalFailure: 'yes' });
  assert.equal(all.componentTotal, -9);
  assert.equal(all.total, -15);
  assert.equal(all.riskClass, 'V');
});

test('chronic renal failure alone is minus 6, matching the constant', () => {
  const crf = SAVE_BINARY.find((b) => b.key === 'chronicRenalFailure');
  assert.equal(crf.points, -6);
  assert.equal(base({ chronicRenalFailure: 'yes' }).total, -12);
});

test('congenital heart disease is the only negative diagnosis group', () => {
  const negatives = SAVE_DIAGNOSES.filter((d) => d.points < 0);
  assert.equal(negatives.length, 1);
  assert.equal(negatives[0].key, 'congenital');
  assert.equal(negatives[0].points, -3);
});

test('THE CLASS I/II BOUNDARY IS AT EXACTLY 5: 5 is class II, 6 is class I', () => {
  // Age 18-38 (+7) plus PIP<=20 (+3) plus diastolic>=40 (+3) = 13, minus 6 = 7 -> class I.
  const seven = base({ ageBand: '18-38', pipAtOrBelow20: 'yes', diastolicAtOrAbove40: 'yes' });
  assert.equal(seven.total, 7);
  assert.equal(seven.riskClass, 'I');

  // Trim to exactly 5 and exactly 6.
  const five = base({ ageBand: '18-38', weightBand: '65-89', pipAtOrBelow20: 'yes', cardiacArrest: 'yes' });
  assert.equal(five.total, 4); // 7+2+3-2 = 10, -6 = 4
  const six = base({ ageBand: '18-38', pipAtOrBelow20: 'yes', weightBand: '65-89' });
  assert.equal(six.total, 6);  // 7+3+2 = 12, -6 = 6
  assert.equal(six.riskClass, 'I');
  const exactlyFive = base({ ageBand: '18-38', pipAtOrBelow20: 'yes', weightBand: '<=65' });
  assert.equal(exactlyFive.total, 5); // 7+3+1 = 11, -6 = 5
  assert.equal(exactlyFive.riskClass, 'II');
});

test('every class boundary sits where the primary source puts it', () => {
  // Real input combinations that land on each side of every boundary.
  assert.equal(base({ ageBand: '18-38', pipAtOrBelow20: 'yes', weightBand: '65-89' }).riskClass, 'I');   // 6
  assert.equal(base({ ageBand: '18-38', pipAtOrBelow20: 'yes', weightBand: '<=65' }).riskClass, 'II');   // 5
  assert.equal(base({ ageBand: '39-52', weightBand: '65-89', pipAtOrBelow20: 'yes' }).riskClass, 'II');  // 3
  assert.equal(base({ ageBand: '53-62', weightBand: '65-89' }).riskClass, 'III');                        // -1
  assert.equal(base().riskClass, 'IV');                                                                  // -6
  assert.equal(base({ chronicRenalFailure: 'yes' }).riskClass, 'V');                                     // -12
});

test('the survival figures are framed as cohort observations, not predictions', () => {
  const r = base({ ageBand: '18-38' });
  assert.match(r.band, /describes a group of patients who resembled this one/);
  assert.match(r.band, /not a prediction for this patient/);
  assert.match(r.band, /Patients in the lowest class still survived/);
});

test('the copy refuses the offer/withdraw reading and names what it cannot see', () => {
  const n = base().note;
  assert.match(n, /not a tool for deciding whether to offer ECMO or for withdrawing it/);
  assert.match(n, /low predicted survival is not the same as futility/);
  assert.match(n, /bleeding, limb ischemia, neurologic injury/);
  assert.match(n, /RESP score/);
});

test('the guards', () => {
  assert.equal(saveScore({}).valid, false);
  assert.equal(base({ ageBand: '' }).valid, false);
  assert.equal(saveScore({ ageBand: '20-30' }).valid, false);
  assert.equal(base({ myocarditis: 'maybe' }).valid, false);
  assert.deepEqual(SAVE_AGE_BANDS.map((b) => b.points), [7, 4, 3, 0]);
  assert.deepEqual(SAVE_WEIGHT_BANDS.map((b) => b.points), [1, 2, 0]);
  assert.deepEqual(SAVE_INTUBATION_BANDS.map((b) => b.points), [0, -2, -4]);
});
