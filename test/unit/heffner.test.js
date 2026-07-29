// spec-v591: the Heffner criteria (abbreviated Light's criteria).
//
// The load-bearing tests are that the LDH cutoff is derived from the local laboratory reference rather than
// hard-coded, and that the two published rules disagree exactly when protein is the only positive test.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  heffner, TESTS, LDH_MULTIPLIER, CHOLESTEROL_THRESHOLD, PROTEIN_THRESHOLD,
  LIGHTS_LDH_MULTIPLIER, THREE_TEST_SENSITIVITY, THREE_TEST_SPECIFICITY,
} from '../../lib/heffner-v591.js';

const NEG = { pleuralLdh: '50', serumLdhUln: '250', pleuralCholesterol: '20', pleuralProtein: '2.0' };
const at = (over = {}) => heffner({ ...NEG, ...over });

test('there are three tests and any one is enough', () => {
  assert.equal(TESTS.length, 3);
  assert.equal(at().exudate, false);
  for (const over of [{ pleuralLdh: '999' }, { pleuralCholesterol: '99' }, { pleuralProtein: '9' }]) {
    const r = at(over);
    assert.equal(r.exudate, true, JSON.stringify(over));
    assert.equal(r.positiveTests.length, 1, 'one positive test is enough');
  }
});

test('two negatives do not outweigh one positive', () => {
  const r = at({ pleuralCholesterol: '99' });
  assert.equal(r.testResults.ldh, false);
  assert.equal(r.testResults.protein, false);
  assert.equal(r.exudate, true);
  assert.match(r.bandText, /the tests do not vote/);
});

// THE laboratory-dependent cutoff.
test('the LDH cutoff is derived from the local laboratory reference, not hard-coded', () => {
  assert.equal(at({ serumLdhUln: '250' }).ldhCutoffUsed, 112.5);
  assert.equal(at({ serumLdhUln: '200' }).ldhCutoffUsed, 90);
  assert.equal(LDH_MULTIPLIER, 0.45);
});

test('the same pleural LDH classifies differently under two laboratory references', () => {
  const ldh = '100';
  assert.equal(at({ pleuralLdh: ldh, serumLdhUln: '250' }).testResults.ldh, false, 'cutoff 112.5');
  assert.equal(at({ pleuralLdh: ldh, serumLdhUln: '200' }).testResults.ldh, true, 'cutoff 90');
});

test('the laboratory reference is required and none is defaulted', () => {
  const r = heffner({ ...NEG, serumLdhUln: '' });
  assert.equal(r.valid, false);
  assert.match(r.message, /LABORATORY'S upper limit of normal for SERUM LDH/);
  assert.match(r.message, /not a fixed number/);
});

// THE two rules.
test('the two published rules disagree exactly when protein is the only positive', () => {
  const proteinOnly = at({ pleuralProtein: '3.5' });
  assert.equal(proteinOnly.exudate, true);
  assert.equal(proteinOnly.exudateByTwoTestRule, false);
  assert.equal(proteinOnly.rulesDisagree, true);
  assert.match(proteinOnly.bandText, /THE TWO PUBLISHED RULES DISAGREE/);

  for (const over of [{}, { pleuralLdh: '999' }, { pleuralCholesterol: '99' },
    { pleuralLdh: '999', pleuralProtein: '3.5' }]) {
    assert.equal(at(over).rulesDisagree, false, JSON.stringify(over));
  }
});

test('the two-test rule is exactly LDH or cholesterol', () => {
  assert.deepEqual(TESTS.filter((t) => t.inTwoTestRule).map((t) => t.key), ['ldh', 'cholesterol']);
});

// The deliberately unrounded thresholds.
test('the thresholds are the published ones and not their round neighbours', () => {
  assert.equal(PROTEIN_THRESHOLD, 2.9);
  assert.notEqual(PROTEIN_THRESHOLD, 3.0);
  assert.equal(at({ pleuralProtein: '2.95' }).testResults.protein, true);
  assert.equal(at({ pleuralProtein: String(PROTEIN_THRESHOLD) }).testResults.protein, false, 'strictly above');
  assert.equal(at({ pleuralCholesterol: String(CHOLESTEROL_THRESHOLD) }).testResults.cholesterol, false);
  assert.equal(at({ pleuralCholesterol: '45.1' }).testResults.cholesterol, true);
});

test('the contrast with Light\'s multiplier is computed from the same reference', () => {
  const r = at({ serumLdhUln: '250' });
  assert.equal(r.lightsLdhCutoffForContrast, Number((LIGHTS_LDH_MULTIPLIER * 250).toFixed(2)));
  assert.ok(r.lightsLdhCutoffForContrast > r.ldhCutoffUsed, 'Heffner triggers on a lower LDH');
  assert.match(r.bandText, /DIFFERENT tests, not roundings of these/);
});

// The trade.
test('the specificity trade is stated in every result', () => {
  const r = at();
  assert.match(r.bandText, new RegExp(`${THREE_TEST_SENSITIVITY} percent sensitive`));
  assert.match(r.bandText, new RegExp(`${THREE_TEST_SPECIFICITY} percent specific`));
  assert.match(r.bandText, /weaker evidence of an exudate than a positive Light/);
  assert.ok(THREE_TEST_SPECIFICITY < 90);
});

test('the diuretic failure mode is stated', () => {
  assert.match(at().bandText, /diuresed for heart failure can be misclassified/);
});

// Input handling and scope.
test('every value is required', () => {
  assert.equal(heffner({}).valid, false);
  assert.match(heffner({ ...NEG, pleuralLdh: 'x' }).message, /must be a number/);
});

test('the scope note refuses the cause and the drainage decision', () => {
  const r = at();
  assert.match(r.note, /does NOT give the cause/);
  assert.match(r.note, /beginning of the workup rather than the end/);
  assert.match(r.note, /does not indicate or contraindicate drainage/);
});
