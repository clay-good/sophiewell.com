// spec-v580: the modified EHRA symptom scale.
//
// The load-bearing tests are that there is no class 2, that the class is a string rather than a number, and
// that 2a and 2b differ only on the subjective question.

import test from 'node:test';
import assert from 'node:assert/strict';
import { ehraAf, EHRA_CLASSES, ACTIVITY_LEVELS, EVALUATED_SYMPTOMS } from '../../lib/ehra-af-v580.js';

const at = (over = {}) => ehraAf({ anySymptoms: 'yes', ...over });

test('the ladder is 1, 2a, 2b, 3, 4 and contains no class 2', () => {
  assert.deepEqual(EHRA_CLASSES.map((c) => c.value), ['1', '2a', '2b', '3', '4']);
  assert.ok(!EHRA_CLASSES.some((c) => c.value === '2'), 'there is no class 2');
});

test('the class is returned as a string, not a number', () => {
  const r = at({ activityImpact: 'not-affected', troubledBySymptoms: 'yes' });
  assert.equal(typeof r.ehraClass, 'string');
  assert.equal(r.ehraClass, '2b');
  assert.notEqual(r.ehraClass, 2);
});

test('storing the class as an integer would collapse 2a into 2b', () => {
  const a = at({ activityImpact: 'not-affected', troubledBySymptoms: 'no' });
  const b = at({ activityImpact: 'not-affected', troubledBySymptoms: 'yes' });
  assert.notEqual(a.ehraClass, b.ehraClass, 'they are distinct classes');
  assert.equal(Number.parseInt(a.ehraClass, 10), Number.parseInt(b.ehraClass, 10),
    'but both parse to the same integer, which is exactly the loss');
});

test('the result warns against integer storage', () => {
  assert.match(at({ activityImpact: 'affected' }).bandText, /cannot be summed, averaged, or stored as an integer/);
});

// THE subjective split.
test('2a and 2b differ only on the troubled question', () => {
  const notTroubled = at({ activityImpact: 'not-affected', troubledBySymptoms: 'no' });
  const troubled = at({ activityImpact: 'not-affected', troubledBySymptoms: 'yes' });
  assert.equal(notTroubled.ehraClass, '2a');
  assert.equal(troubled.ehraClass, '2b');
  assert.equal(notTroubled.subjectiveSplitApplied, true);
  assert.equal(troubled.subjectiveSplitApplied, true);
});

test('the troubled question is required only when activity is unaffected', () => {
  const r = at({ activityImpact: 'not-affected' });
  assert.equal(r.valid, false);
  assert.match(r.message, /TROUBLED by the symptoms/);

  assert.equal(at({ activityImpact: 'affected' }).valid, true);
  assert.equal(at({ activityImpact: 'discontinued' }).valid, true);
});

test('the troubled answer does not change a class decided by function', () => {
  const a = at({ activityImpact: 'affected', troubledBySymptoms: 'no' });
  const b = at({ activityImpact: 'affected', troubledBySymptoms: 'yes' });
  assert.equal(a.ehraClass, b.ehraClass);
  assert.equal(a.ehraClass, '3');
  assert.equal(a.subjectiveSplitApplied, false);
});

test('the result explains that this is the one subjective boundary', () => {
  const r = at({ activityImpact: 'not-affected', troubledBySymptoms: 'yes' });
  assert.match(r.bandText, /Everywhere else on this scale the discriminator is function/);
});

// The functional ladder.
test('the functional levels map as published', () => {
  assert.equal(ehraAf({ anySymptoms: 'no' }).ehraClass, '1');
  assert.equal(at({ activityImpact: 'affected' }).ehraClass, '3');
  assert.equal(at({ activityImpact: 'discontinued' }).ehraClass, '4');
  assert.deepEqual(ACTIVITY_LEVELS.map((a) => a.value), ['not-affected', 'affected', 'discontinued']);
});

test('no symptoms short-circuits to class 1 without needing anything else', () => {
  const r = ehraAf({ anySymptoms: 'no' });
  assert.equal(r.valid, true);
  assert.equal(r.ehraClass, '1');
  assert.equal(r.decidedBy, 'no symptoms');
});

// Symptoms are not inputs.
test('the six evaluated symptoms are named but are not inputs', () => {
  assert.equal(EVALUATED_SYMPTOMS.length, 6);
  const r = at({ activityImpact: 'affected' });
  assert.match(r.bandText, /the domains the rater considers, not inputs/);
  // Passing symptom flags must not change the class.
  const withSymptoms = ehraAf({
    anySymptoms: 'yes', activityImpact: 'affected',
    palpitations: 'yes', fatigue: 'yes', dizziness: 'yes',
  });
  assert.equal(withSymptoms.ehraClass, r.ehraClass);
});

// Scope.
test('the result states that this says nothing about stroke risk', () => {
  assert.match(at({ activityImpact: 'affected' }).bandText, /says nothing about stroke risk/);
  assert.match(at({ activityImpact: 'affected' }).bandText, /CHA2DS2-VASc/);
});

test('the physician-assessed nature and the divergence are stated', () => {
  assert.match(at({ activityImpact: 'affected' }).bandText, /physician-assessed rather than patient-reported/);
  assert.match(at({ activityImpact: 'affected' }).bandText, /frequently diverge/);
});

test('the guideline naming inconsistency is carried', () => {
  assert.match(at({ activityImpact: 'affected' }).bandText, /Same instrument, two names/);
});

// Input handling.
test('the symptoms question is required first', () => {
  const r = ehraAf({});
  assert.equal(r.valid, false);
  assert.match(r.message, /No gives class 1/);
});

test('an unknown activity level is refused', () => {
  assert.equal(at({ activityImpact: 'somewhat' }).valid, false);
});

test('the scope note refuses to indicate ablation or rate versus rhythm control', () => {
  const r = at({ activityImpact: 'discontinued' });
  assert.match(r.note, /does not select rate against rhythm control/);
  assert.match(r.note, /does not indicate ablation/);
  assert.match(r.note, /most damaging misreading/);
});
