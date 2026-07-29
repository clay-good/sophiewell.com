// spec-v597: the PANC 3 score.
//
// The load-bearing tests are that two of three is NOT positive, and that every negative result carries the
// rule-in warning -- because the score's sensitivity is its failure mode.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  panc3, CRITERIA, CRITERIA_REQUIRED, CRITERIA_TOTAL,
  HEMATOCRIT_THRESHOLD, BMI_THRESHOLD,
} from '../../lib/panc3-v597.js';

const NEG = { hematocrit: '40', bmi: '25', pleuralEffusion: 'no' };
const at = (over = {}) => panc3({ ...NEG, ...over });
const POS = { hematocrit: '46', bmi: '32', pleuralEffusion: 'yes' };

test('there are three criteria and all three are required', () => {
  assert.equal(CRITERIA.length, CRITERIA_TOTAL);
  assert.equal(CRITERIA_TOTAL, 3);
  assert.equal(CRITERIA_REQUIRED, CRITERIA_TOTAL);
});

// THE conjunction.
test('all three present predicts severe pancreatitis', () => {
  const r = panc3(POS);
  assert.equal(r.total, 3);
  assert.equal(r.predictsSevere, true);
  assert.equal(r.band, 'Predicts severe acute pancreatitis');
});

test('every two-of-three combination is negative', () => {
  const keys = Object.keys(POS);
  for (const dropped of keys) {
    const patient = { ...POS, [dropped]: NEG[dropped] };
    const r = panc3(patient);
    assert.equal(r.total, 2, `dropping ${dropped}`);
    assert.equal(r.predictsSevere, false, `two of three must not be positive (dropped ${dropped})`);
    assert.equal(r.oneCriterionShort, true);
    assert.match(r.bandText, /Two of three is NOT a positive PANC 3/);
  }
});

test('the all-three rule is stated in every result', () => {
  assert.match(at().bandText, new RegExp(`ALL ${CRITERIA_REQUIRED}, not a majority`));
  assert.match(at().bandText, /conjunction wearing a score's clothing/);
});

// Each criterion alone.
test('each criterion alone scores exactly one', () => {
  assert.equal(at({ hematocrit: '46' }).total, 1);
  assert.equal(at({ bmi: '32' }).total, 1);
  assert.equal(at({ pleuralEffusion: 'yes' }).total, 1);
});

test('the thresholds are strictly above', () => {
  assert.equal(at({ hematocrit: String(HEMATOCRIT_THRESHOLD) }).total, 0);
  assert.equal(at({ hematocrit: '44.1' }).total, 1);
  assert.equal(at({ bmi: String(BMI_THRESHOLD) }).total, 0);
  assert.equal(at({ bmi: '30.1' }).total, 1);
});

// THE rule-in asymmetry.
test('every negative result warns that it is weak evidence', () => {
  for (const over of [{}, { hematocrit: '46' }, { hematocrit: '46', bmi: '32' }]) {
    const r = at(over);
    assert.equal(r.predictsSevere, false);
    assert.match(r.bandText, /THIS NEGATIVE RESULT IS WEAK EVIDENCE/, JSON.stringify(over));
    assert.match(r.bandText, /NOT a reason to send the patient home/);
  }
});

test('a positive result does not carry the negative-result warning', () => {
  assert.equal(/THIS NEGATIVE RESULT IS WEAK EVIDENCE/.test(panc3(POS).bandText), false);
});

test('the sensitivity-specificity asymmetry is stated in every result', () => {
  assert.match(at().bandText, /RULE-IN test/);
  assert.match(at().bandText, /MISSES BETWEEN A QUARTER AND A HALF/);
});

// THE unit trap.
test('the wrong units in circulating reproductions are called out', () => {
  const hct = CRITERIA.find((c) => c.key === 'hematocrit');
  const bmi = CRITERIA.find((c) => c.key === 'bmi');
  assert.equal(hct.unit, '%');
  assert.equal(bmi.unit, 'kg/m^2');
  assert.match(hct.unitTrap, /mg\/dL/);
  assert.match(bmi.unitTrap, /mg\/kg squared/);
  assert.match(at().bandText, /hematocrit as "mg\/dL" when it is a percentage/);
});

test('the missing-input message states the correct units', () => {
  const r = panc3({});
  assert.equal(r.valid, false);
  assert.match(r.message, /hematocrit as a PERCENTAGE/);
  assert.match(r.message, /kg\/m\^2/);
});

// Timing and the absent enzymes.
test('the admission timing and the 48-hour outcome are both stated', () => {
  assert.match(at().bandText, /available AT ADMISSION/);
  assert.match(at().bandText, /PERSISTING BEYOND 48 HOURS/);
  assert.match(at().bandText, /modified Marshall/);
});

test('amylase and lipase are not inputs', () => {
  assert.equal(CRITERIA.some((c) => /amylase|lipase/i.test(c.key)), false);
  const withEnzymes = panc3({ ...NEG, lipase: '5000', amylase: '4000' });
  assert.equal(withEnzymes.total, 0);
  assert.match(at().bandText, /none of them is amylase or lipase/);
});

// Scope.
test('the scope note refuses diagnosis, cause, fluids and antibiotics', () => {
  const r = at();
  assert.match(r.note, /does not diagnose pancreatitis/);
  assert.match(r.note, /does not identify the cause/);
  assert.match(r.note, /not indicated for sterile necrosis/);
  assert.match(r.note, /negative result is not a reason to withhold monitoring/);
});
