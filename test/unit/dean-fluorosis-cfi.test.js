// spec-v1484: Dean's Community Fluorosis Index.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ASKING } from '../lib/asking-language.js';
import { deanFluorosisCfi as cfi } from '../../lib/dean-fluorosis-cfi-v1484.js';

const zero = { normal: 0, questionable: 0, veryMild: 0, mild: 0, moderate: 0, severe: 0 };

test('the worked example: 0.88 across 100 people is a slight public health concern', () => {
  const r = cfi({ normal: '40', questionable: '20', veryMild: '15', mild: '15', moderate: '7', severe: '3' });
  assert.equal(r.band, 'Community Fluorosis Index 0.88 across 100 people: slight public health concern.');
  assert.equal(r.abnormal, true);
});

test('the weights and the bands, with shared endpoints read into the lower band', () => {
  assert.equal(cfi({ ...zero, normal: 1 }).cfi, 0);
  assert.equal(cfi({ ...zero, severe: 1 }).cfi, 4);
  assert.match(cfi({ ...zero, normal: 6, veryMild: 4 }).bandLabel, /negative/); // 0.4
  assert.match(cfi({ ...zero, normal: 6, veryMild: 4 }).notes.join(' '), /shared endpoint/);
  assert.match(cfi({ ...zero, normal: 1, veryMild: 1 }).bandLabel, /borderline/); // 0.5
  assert.equal(cfi({ ...zero, normal: 4, veryMild: 6 }).abnormal, false); // 0.6
  assert.equal(cfi({ ...zero, normal: 3, veryMild: 7 }).abnormal, true); // 0.7
});

test('every count is asked for, and none may be fractional', () => {
  for (const r of [cfi({}), cfi({ ...zero, normal: '' }), cfi(zero), cfi({ ...zero, normal: 1.5 })]) {
    assert.equal(r.valid, false);
    assert.match(r.message, ASKING);
  }
});
