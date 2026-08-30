// spec-v920: the reference change value. The test that matters is that a change inside it is
// never called stable.

import test from 'node:test';
import assert from 'node:assert/strict';
import { referenceChangeValue, RCV_NOTE, PROBABILITY_OPTIONS } from '../../lib/reference-change-value-v920.js';

const CVS = { cvAnalytical: 2.2, cvIntraindividual: 4.4 };

test('reference-change-value: both coefficients of variation are required', () => {
  assert.equal(referenceChangeValue({}).valid, false);
  assert.match(referenceChangeValue({}).message, /analytical imprecision/);
  assert.match(referenceChangeValue({ cvAnalytical: 2.2 }).message, /within-subject biological variation/);
  assert.equal(referenceChangeValue({ cvAnalytical: -1, cvIntraindividual: 4 }).valid, false);
});

test('reference-change-value: the arithmetic is sqrt(2) x Z x sqrt(CVa^2 + CVi^2)', () => {
  const r = referenceChangeValue(CVS);
  const expected = Math.SQRT2 * 1.96 * Math.sqrt(2.2 ** 2 + 4.4 ** 2);
  assert.equal(r.rcv, Math.round(expected * 100) / 100);
  assert.equal(r.z, 1.96);
});

test('reference-change-value: the sidedness and the confidence both move the factor', () => {
  assert.equal(referenceChangeValue({ ...CVS, probability: 'two-95' }).z, 1.96);
  assert.equal(referenceChangeValue({ ...CVS, probability: 'one-95' }).z, 1.65);
  assert.equal(referenceChangeValue({ ...CVS, probability: 'two-99' }).z, 2.58);
  assert.equal(referenceChangeValue({ ...CVS, probability: 'one-99' }).z, 2.33);
  assert.ok(referenceChangeValue({ ...CVS, probability: 'one-95' }).rcv
    < referenceChangeValue({ ...CVS, probability: 'two-95' }).rcv);
});

test('reference-change-value: an unrecognized probability falls back to two-sided 95%', () => {
  assert.equal(referenceChangeValue({ ...CVS, probability: 'whatever' }).probability, 'two-95');
});

test('reference-change-value: a change inside it is never called stable', () => {
  const r = referenceChangeValue({ ...CVS, previousResult: 1.0, currentResult: 1.08 });
  assert.equal(r.exceeded, false);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /not the same as stable/);
  assert.match(r.notStableNote, /different statements/);
});

test('reference-change-value: a change outside it is real, and said not to be necessarily important', () => {
  const r = referenceChangeValue({ ...CVS, previousResult: 1.0, currentResult: 1.15 });
  assert.equal(r.exceeded, true);
  assert.equal(r.abnormal, true);
  assert.equal(r.observedChangePercent, 15);
  assert.match(r.notImportantNote, /says nothing about whether the movement matters/);
});

test('reference-change-value: a fall is measured on its size, not its sign', () => {
  const r = referenceChangeValue({ ...CVS, previousResult: 1.2, currentResult: 1.0 });
  assert.equal(r.exceeded, true);
  assert.match(r.band, /observed fall of 16.7%/);
});

test('reference-change-value: two identical results read as identical, not as a change', () => {
  const r = referenceChangeValue({ ...CVS, previousResult: 1.0, currentResult: 1.0 });
  assert.equal(r.exceeded, false);
  assert.match(r.band, /The two results are identical/);
});

test('reference-change-value: with no pair to compare it reports the threshold alone', () => {
  const r = referenceChangeValue(CVS);
  assert.equal(r.exceeded, null);
  assert.equal(r.observedChangePercent, null);
  assert.match(r.band, /has to exceed/);
});

test('reference-change-value: a previous result of zero cannot give a percent change', () => {
  const r = referenceChangeValue({ ...CVS, previousResult: 0, currentResult: 5 });
  assert.equal(r.exceeded, null);
  assert.equal(r.valid, true);
});

test('reference-change-value: the sided note matches the factor chosen', () => {
  assert.match(referenceChangeValue({ ...CVS, probability: 'one-95' }).sidedNote, /one-sided factor/);
  assert.match(referenceChangeValue({ ...CVS, probability: 'two-95' }).sidedNote, /harder to pass than the question asked for/);
});

test('reference-change-value: the steady-state, source and asymmetry lines always print', () => {
  const r = referenceChangeValue(CVS);
  assert.match(r.steadyStateNote, /assumes a steady state/);
  assert.match(r.sourceOfCviNote, /property of the analyte/);
  assert.match(r.asymmetryNote, /log-normal/);
  assert.match(r.scopeNote, /does not decide whether a change matters/);
  assert.match(RCV_NOTE, /is not stable/);
  assert.equal(PROBABILITY_OPTIONS.length, 4);
});
