// spec-v596: the Lepine criteria.
//
// The load-bearing test is that Lepine and the Heffner two-test rule disagree in BOTH directions, because
// their thresholds move oppositely -- so neither dominates the other.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  lepine, LDH_MULTIPLIER, CHOLESTEROL_THRESHOLD, CHOLESTEROL_THRESHOLD_MMOL,
  HEFFNER_LDH_MULTIPLIER, HEFFNER_CHOLESTEROL_THRESHOLD,
  LEPINE_SENSITIVITY, LEPINE_SPECIFICITY, HEFFNER_SENSITIVITY, HEFFNER_SPECIFICITY,
} from '../../lib/lepine-v596.js';
import { LDH_MULTIPLIER as HEFFNER_LIB_LDH, CHOLESTEROL_THRESHOLD as HEFFNER_LIB_CHOL } from '../../lib/heffner-v591.js';

const NEG = { pleuralLdh: '100', serumLdhUln: '250', pleuralCholesterol: '20' };
const at = (over = {}) => lepine({ ...NEG, ...over });

test('either test alone classifies the effusion as an exudate', () => {
  assert.equal(at().exudate, false);
  assert.equal(at({ pleuralCholesterol: '50' }).exudate, true);
  assert.equal(at({ pleuralLdh: '999' }).exudate, true);
  assert.match(at().bandText, /tests do not vote/);
});

test('a negative second test does not outweigh a positive first', () => {
  const r = at({ pleuralCholesterol: '50' });
  assert.equal(r.cholesterolPositive, true);
  assert.equal(r.ldhPositive, false);
  assert.equal(r.exudate, true);
});

// THE contrast with the shipped companion.
test('the constants carried for the contrast match the heffner lib exactly', () => {
  assert.equal(HEFFNER_LDH_MULTIPLIER, HEFFNER_LIB_LDH);
  assert.equal(HEFFNER_CHOLESTEROL_THRESHOLD, HEFFNER_LIB_CHOL);
});

test('the thresholds move in opposite directions', () => {
  assert.ok(LDH_MULTIPLIER > HEFFNER_LDH_MULTIPLIER, 'Lepine LDH bar is higher');
  assert.ok(CHOLESTEROL_THRESHOLD < HEFFNER_CHOLESTEROL_THRESHOLD, 'Lepine cholesterol bar is lower');
  assert.match(at().bandText, /NEITHER RULE DOMINATES THE OTHER/);
});

test('the rules disagree in BOTH directions, so neither dominates', () => {
  // Cholesterol between the two thresholds: Lepine says exudate, Heffner does not.
  const chol = at({ pleuralCholesterol: '42' });
  assert.equal(chol.exudate, true);
  assert.equal(chol.exudateByHeffner, false);
  assert.equal(chol.rulesDisagree, true);
  assert.equal(chol.disagreementAxis, 'cholesterol');
  assert.match(chol.bandText, /ON THE CHOLESTEROL AXIS/);

  // LDH between the two cutoffs: Heffner says exudate, Lepine does not.
  const ldh = at({ pleuralLdh: '130' });   // ULN 250: Heffner 112.5, Lepine 150
  assert.equal(ldh.exudate, false);
  assert.equal(ldh.exudateByHeffner, true);
  assert.equal(ldh.rulesDisagree, true);
  assert.equal(ldh.disagreementAxis, 'ldh');
  assert.match(ldh.bandText, /ON THE LDH AXIS/);
});

test('the rules agree when both tests fall on the same side', () => {
  assert.equal(at().rulesDisagree, false);
  assert.equal(at({ pleuralCholesterol: '60' }).rulesDisagree, false);
  assert.equal(at({ pleuralLdh: '999' }).rulesDisagree, false);
  assert.equal(at().disagreementAxis, null);
});

// The laboratory-dependent cutoffs.
test('both LDH cutoffs are derived from the same local reference', () => {
  const r = at({ serumLdhUln: '250' });
  assert.equal(r.ldhCutoffUsed, 150);                    // 0.6 x 250
  assert.equal(r.heffnerLdhCutoffForContrast, 112.5);    // 0.45 x 250
  const other = at({ serumLdhUln: '200' });
  assert.equal(other.ldhCutoffUsed, 120);
  assert.equal(other.heffnerLdhCutoffForContrast, 90);
});

test('the laboratory reference is required and none is defaulted', () => {
  const r = lepine({ ...NEG, serumLdhUln: '' });
  assert.equal(r.valid, false);
  assert.match(r.message, /LABORATORY'S upper limit of normal for SERUM LDH/);
  assert.match(r.message, /NOT a fixed number/);
});

// Thresholds and their SI equivalents.
test('the cholesterol threshold is strict and carries its SI equivalent', () => {
  assert.equal(at({ pleuralCholesterol: String(CHOLESTEROL_THRESHOLD) }).cholesterolPositive, false);
  assert.equal(at({ pleuralCholesterol: '40.1' }).cholesterolPositive, true);
  assert.equal(CHOLESTEROL_THRESHOLD_MMOL, 1.04);
});

// The specificity trade.
test('the operating characteristics are reported with the direction of the trade', () => {
  assert.ok(LEPINE_SPECIFICITY > HEFFNER_SPECIFICITY);
  assert.ok(LEPINE_SENSITIVITY < HEFFNER_SENSITIVITY);
  assert.match(at().bandText, /statement about SPECIFICITY/);
});

// Input handling and scope.
test('every value is required', () => {
  assert.equal(lepine({}).valid, false);
  assert.match(lepine({ ...NEG, pleuralLdh: 'x' }).message, /must be a number/);
});

test('the scope note refuses the cause and the drainage decision', () => {
  const r = at();
  assert.match(r.note, /does not give the cause/);
  assert.match(r.note, /beginning of the workup rather than the end/);
  assert.match(r.note, /does not indicate or contraindicate drainage/);
  assert.match(r.bandText, /diuresed for heart failure|Diuretic treatment concentrates/);
});
