import test from 'node:test';
import assert from 'node:assert/strict';
import { clinicalObesity as cob, BMI_ASSUMED } from '../../lib/clinical-obesity-v838.js';

test('clinical obesity: body mass index ALONE confirms nothing below 40', () => {
  // The whole reform.
  const r = cob({ bmi: 33 });
  assert.equal(r.confirmed, false);
  assert.equal(r.category, null);
  assert.ok(r.bmiOnlyNote.includes('does not confirm obesity status'));
  assert.ok(r.bmiOnlyNote.includes('population-level surrogate'));
  assert.equal(cob({ bmi: 38 }).confirmed, false);
});

test('clinical obesity: above 40 excess adiposity is assumed', () => {
  assert.equal(BMI_ASSUMED, 40);
  assert.equal(cob({ bmi: 41 }).confirmed, true);
  assert.equal(cob({ bmi: 40 }).confirmed, false);
  assert.equal(cob({ bmi: 41 }).bmiOnlyNote, null);
});

test('clinical obesity: the three confirmation routes', () => {
  // Direct measurement.
  assert.equal(cob({ directBodyFatExcess: true }).confirmed, true);
  // One anthropometric criterion PLUS a raised index.
  assert.equal(cob({ bmi: 33, waistRaised: true }).confirmed, true);
  // A raised index with no anthropometric criterion is not enough.
  assert.equal(cob({ bmi: 33 }).confirmed, false);
  // One anthropometric criterion with a NORMAL index is not enough either.
  assert.equal(cob({ bmi: 24, waistRaised: true }).confirmed, false);
});

test('clinical obesity: TWO anthropometric criteria confirm it regardless of the index', () => {
  // The miss that runs the other way - an index-first screen never reaches this person.
  const r = cob({ bmi: 24, waistRaised: true, waistHeightRaised: true });
  assert.equal(r.confirmed, true);
  assert.equal(r.category, 'Preclinical obesity');
  assert.ok(r.normalBmiNote.includes('regardless of the index'));
  // And with no index at all.
  assert.equal(cob({ waistRaised: true, waistHipRaised: true }).confirmed, true);
});

test('clinical obesity: clinical versus preclinical turns on FUNCTION', () => {
  const base = { bmi: 33, waistRaised: true };
  assert.equal(cob(base).category, 'Preclinical obesity');
  assert.equal(cob({ ...base, organDysfunction: true }).category, 'Clinical obesity');
  assert.equal(cob({ ...base, activityLimitation: true }).category, 'Clinical obesity');
  // A much higher index does NOT make it clinical.
  assert.equal(cob({ bmi: 55 }).category, 'Preclinical obesity');
  assert.ok(cob(base).functionNote.includes('not size'));
});

test('clinical obesity: organ dysfunction without confirmed adiposity is not a diagnosis', () => {
  const r = cob({ organDysfunction: true, activityLimitation: true });
  assert.equal(r.confirmed, false);
  assert.equal(r.category, null);
  assert.equal(r.clinical, false);
});

test('clinical obesity: cutoffs are deliberately not encoded', () => {
  const r = cob({ bmi: 33, waistRaised: true });
  assert.ok(r.cutoffNote.includes('validated cutoffs appropriate to age, gender and ethnicity'));
  assert.equal(cob({ bmi: 45 }).cutoffNote, null);
});

test('clinical obesity: empty and out-of-range input', () => {
  const empty = cob({});
  assert.equal(empty.valid, true);
  assert.equal(empty.category, null);
  assert.equal(empty.bmiOnlyNote, null);
  assert.equal(cob({ bmi: 1e308 }).valid, false);
  assert.equal(cob({ bmi: 2 }).valid, false);
  assert.equal(cob().valid, true);
  assert.doesNotMatch(JSON.stringify(cob({ bmi: 33, waistRaised: true })), /NaN|Infinity/);
});
