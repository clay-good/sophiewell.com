// spec-v578: the Nancy histological index.
//
// The load-bearing tests are that ulceration short-circuits everything, and that chronic inflammation is a
// dead end that can never exceed grade 1.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  nancyIndex, NEUTROPHIL_LEVELS, CHRONIC_LEVELS, NANCY_GRADES,
  ULCERATION_GRADE, REMISSION_GRADE, RESPONSE_MAX_GRADE,
} from '../../lib/nancy-index-v578.js';

test('the grade vocabulary runs 0 to 4', () => {
  assert.deepEqual(Object.keys(NANCY_GRADES).map(Number), [0, 1, 2, 3, 4]);
  assert.equal(ULCERATION_GRADE, 4);
});

// THE short circuit.
test('ulceration gives grade 4 without consulting anything else', () => {
  const r = nancyIndex({ ulceration: 'yes' });
  assert.equal(r.valid, true);
  assert.equal(r.grade, ULCERATION_GRADE);
  assert.equal(r.decidedBy, 'ulceration');
  assert.deepEqual(r.featuresConsulted, ['ulceration']);
});

test('a quiet specimen cannot offset ulceration', () => {
  const r = nancyIndex({ ulceration: 'yes', neutrophils: 'none', chronicInflammation: 'none-or-mild' });
  assert.equal(r.grade, ULCERATION_GRADE, 'the other features cannot lower a grade 4');
});

test('the result says the lower features were not consulted', () => {
  assert.match(nancyIndex({ ulceration: 'yes' }).bandText, /were not consulted and cannot lower this grade/);
});

// The neutrophil tier.
test('the neutrophilic infiltrate gives grades 2 and 3', () => {
  assert.equal(nancyIndex({ ulceration: 'no', neutrophils: 'mild' }).grade, 2);
  assert.equal(nancyIndex({ ulceration: 'no', neutrophils: 'moderate-severe' }).grade, 3);
});

test('neutrophils short-circuit the chronic infiltrate', () => {
  const r = nancyIndex({ ulceration: 'no', neutrophils: 'mild', chronicInflammation: 'moderate-severe' });
  assert.equal(r.grade, 2);
  assert.equal(r.decidedBy, 'neutrophils');
  assert.ok(!r.featuresConsulted.includes('chronicInflammation'));
});

// THE dead end.
test('chronic inflammation can never exceed grade 1', () => {
  for (const level of CHRONIC_LEVELS) {
    const r = nancyIndex({ ulceration: 'no', neutrophils: 'none', chronicInflammation: level.value });
    assert.ok(r.grade <= RESPONSE_MAX_GRADE, `${level.value} must not exceed grade ${RESPONSE_MAX_GRADE}`);
  }
});

test('the most florid chronic infiltrate is still only grade 1', () => {
  const r = nancyIndex({ ulceration: 'no', neutrophils: 'none', chronicInflammation: 'moderate-severe' });
  assert.equal(r.grade, 1);
  assert.equal(r.decidedBy, 'chronic inflammation');
  assert.match(r.bandText, /dead end at grade 1/);
});

test('an unremarkable biopsy is grade 0', () => {
  const r = nancyIndex({ ulceration: 'no', neutrophils: 'none', chronicInflammation: 'none-or-mild' });
  assert.equal(r.grade, REMISSION_GRADE);
});

// Remission and response.
test('remission is grade 0 and response is grade 1 or less', () => {
  const zero = nancyIndex({ ulceration: 'no', neutrophils: 'none', chronicInflammation: 'none-or-mild' });
  assert.equal(zero.remission, true);
  assert.equal(zero.response, true);

  const one = nancyIndex({ ulceration: 'no', neutrophils: 'none', chronicInflammation: 'moderate-severe' });
  assert.equal(one.remission, false);
  assert.equal(one.response, true);

  const two = nancyIndex({ ulceration: 'no', neutrophils: 'mild' });
  assert.equal(two.response, false);
});

test('every grade at or below 1 was reached with neutrophils and ulcers absent', () => {
  // The published condition on the threshold is structurally guaranteed by the tree.
  for (const chronic of CHRONIC_LEVELS) {
    const r = nancyIndex({ ulceration: 'no', neutrophils: 'none', chronicInflammation: chronic.value });
    assert.ok(r.grade <= RESPONSE_MAX_GRADE);
    assert.equal(r.decidedBy, 'chronic inflammation', 'only reachable with neutrophils and ulcers absent');
  }
});

test('the result explains that the threshold condition cannot be violated here', () => {
  const r = nancyIndex({ ulceration: 'no', neutrophils: 'none', chronicInflammation: 'none-or-mild' });
  assert.match(r.bandText, /structurally guaranteed here and cannot be violated/);
});

// Denominator and naming.
test('the result states the worst-biopsy-wins denominator', () => {
  assert.match(nancyIndex({ ulceration: 'yes' }).bandText, /the worst biopsy wins/);
  assert.match(nancyIndex({ ulceration: 'yes' }).bandText, /averaged several ratings/);
});

test('the city-not-person naming hazard is noted', () => {
  assert.match(nancyIndex({ ulceration: 'yes' }).bandText, /named after the city of Nancy/);
});

// Input handling.
test('ulceration is required first, and the message explains the tree', () => {
  const r = nancyIndex({});
  assert.equal(r.valid, false);
  assert.match(r.message, /checked FIRST/);
  assert.match(r.message, /decision tree, not a sum/);
});

test('the neutrophil level is required when there is no ulceration', () => {
  const r = nancyIndex({ ulceration: 'no' });
  assert.equal(r.valid, false);
  assert.match(r.message, /neutrophilic infiltrate/);
});

test('the chronic level is required only when neutrophils are absent', () => {
  assert.equal(nancyIndex({ ulceration: 'no', neutrophils: 'mild' }).valid, true);
  assert.equal(nancyIndex({ ulceration: 'no', neutrophils: 'none' }).valid, false);
});

test('the scope note names the mimics and refuses dysplasia assessment', () => {
  const r = nancyIndex({ ulceration: 'yes' });
  assert.match(r.note, /ischemic colitis/);
  assert.match(r.note, /does not assess dysplasia/);
  assert.match(r.note, /does not select or escalate therapy/);
});
