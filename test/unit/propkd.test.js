// spec-v564: the PROPKD score.
//
// The load-bearing test is that a zero-point mutation level is an explicit finding, not a default: there
// must be no way to score an ungenotyped patient.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  propkd, MUTATION_CATEGORIES, CLINICAL_VARIABLES, PROPKD_MAX, AGE_GATE,
} from '../../lib/propkd-v564.js';

const score = (mutation, { male = 'no', earlyHypertension = 'no', earlyUrologicEvent = 'no', age } = {}) =>
  propkd({ mutation, male, earlyHypertension, earlyUrologicEvent, ...(age === undefined ? {} : { age: String(age) }) });

test('the weights are the published ones', () => {
  assert.deepEqual(MUTATION_CATEGORIES.map((m) => [m.value, m.points]),
    [['pkd2', 0], ['pkd1-nontruncating', 2], ['pkd1-truncating', 4]]);
  assert.deepEqual(CLINICAL_VARIABLES.map((v) => [v.key, v.points]),
    [['male', 1], ['earlyHypertension', 2], ['earlyUrologicEvent', 2]]);
  assert.equal(PROPKD_MAX, 9);
  assert.equal(AGE_GATE, 35);
});

test('the extremes are 0 and 9', () => {
  assert.equal(score('pkd2').total, 0);
  assert.equal(score('pkd1-truncating',
    { male: 'yes', earlyHypertension: 'yes', earlyUrologicEvent: 'yes' }).total, PROPKD_MAX);
});

// THE zero-point trap.
test('there is no unknown or not-tested mutation category', () => {
  const values = MUTATION_CATEGORIES.map((m) => m.value);
  for (const forbidden of ['unknown', 'not-tested', 'none', 'negative']) {
    assert.ok(!values.includes(forbidden), `${forbidden} must not be selectable`);
  }
});

test('a missing mutation category is refused, not defaulted to zero', () => {
  const r = propkd({ male: 'yes', earlyHypertension: 'yes', earlyUrologicEvent: 'yes' });
  assert.equal(r.valid, false);
  assert.match(r.message, /asserts that a PKD2 mutation was FOUND/);
  assert.match(r.message, /inapplicable when no PKD1 or PKD2 mutation was found/);
});

test('an unrecognized mutation value is refused with the reason', () => {
  const r = score('unknown');
  assert.equal(r.valid, false);
  assert.match(r.message, /no option for an untested or mutation-negative patient/);
});

test('the PKD2 level scores zero but still produces a valid score', () => {
  const r = score('pkd2', { male: 'yes' });
  assert.equal(r.valid, true);
  assert.equal(r.mutationPoints, 0);
  assert.equal(r.total, 1);
});

test('the result explains that zero is a finding, not an absence', () => {
  assert.match(score('pkd2').bandText, /not the same as an unknown genotype/);
});

// The mutation term dominates.
test('a truncating PKD1 mutation alone reaches the intermediate band', () => {
  const r = score('pkd1-truncating');
  assert.equal(r.total, 4);
  assert.equal(r.band, 'Intermediate risk');
  assert.equal(r.clinicalPoints, 0);
});

test('the mutation can supply nearly half the total', () => {
  const r = score('pkd1-truncating', { male: 'yes' });
  assert.equal(r.mutationPoints, 4);
  assert.equal(r.total, 5);
});

// Bands.
test('the band boundaries and medians match the paper', () => {
  assert.equal(score('pkd2').band, 'Low risk');
  assert.equal(score('pkd2').medianEsrdAge, 70.6);

  const three = score('pkd1-nontruncating', { male: 'yes' }); // 2 + 1 = 3
  assert.equal(three.total, 3);
  assert.equal(three.band, 'Low risk');

  const four = score('pkd1-truncating'); // 4
  assert.equal(four.band, 'Intermediate risk');
  assert.equal(four.medianEsrdAge, 56.9);

  const six = score('pkd1-nontruncating', { male: 'no', earlyHypertension: 'yes', earlyUrologicEvent: 'yes' });
  assert.equal(six.total, 6);
  assert.equal(six.band, 'Intermediate risk');

  const seven = score('pkd1-truncating', { male: 'yes', earlyHypertension: 'yes' });
  assert.equal(seven.total, 7);
  assert.equal(seven.band, 'High risk');
  assert.equal(seven.medianEsrdAge, 49);
});

test('a score of 0 is banded, not left out', () => {
  const r = score('pkd2');
  assert.equal(r.total, 0);
  assert.equal(r.band, 'Low risk');
  assert.match(r.bandText, /would leave a score of 0 unbanded/);
});

// The age gate.
test('age does not enter the score', () => {
  const young = score('pkd1-truncating', { male: 'yes', age: 25 });
  const old = score('pkd1-truncating', { male: 'yes', age: 60 });
  assert.equal(young.total, old.total);
});

test('an under-35 patient gets the documented limitation attached', () => {
  const r = score('pkd1-truncating', { male: 'yes', age: 25 });
  assert.equal(r.youngPatient, true);
  assert.match(r.bandText, /least informative in exactly the young patients/);
});

test('an over-35 patient does not get the young-patient caveat', () => {
  const r = score('pkd1-truncating', { male: 'yes', age: 60 });
  assert.equal(r.youngPatient, false);
  assert.doesNotMatch(r.bandText, /least informative in exactly the young patients/);
});

test('age is optional', () => {
  const r = score('pkd2');
  assert.equal(r.valid, true);
  assert.equal(r.youngPatient, false);
});

test('an out-of-range age is refused', () => {
  assert.equal(score('pkd2', { age: 200 }).valid, false);
});

// Input handling.
test('a missing clinical variable is refused and named', () => {
  const r = propkd({ mutation: 'pkd2', male: 'yes' });
  assert.equal(r.valid, false);
  assert.match(r.message, /earlyHypertension/);
});

test('the predictive values are attributed to a separate review', () => {
  assert.match(score('pkd2').bandText, /quoted from a separate review/);
});

test('the scope note separates prediction from current function and from treatment', () => {
  const r = score('pkd1-truncating', { male: 'yes', earlyHypertension: 'yes', earlyUrologicEvent: 'yes' });
  assert.match(r.note, /does not measure current kidney function/);
  assert.match(r.note, /population figures rather than a forecast for an individual/);
  assert.match(r.note, /vasopressin receptor antagonist/);
});
