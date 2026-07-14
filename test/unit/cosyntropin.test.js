// spec-v299: Cosyntropin (ACTH) stimulation test interpretation. Worked-example
// tests: the µg/dL threshold (≥18 normal, <18 below), the nmol/L threshold
// (≥500 normal, <500 below), the boundary value, the default unit, the negative /
// non-numeric guards, and the empty-input guard. Threshold cross-verified against
// the Endocrine Society 2016 guideline and StatPearls (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cosyntropinTest } from '../../lib/cosyntropin-v299.js';

test('peak cortisol at/above 18 µg/dL is a normal adrenal response', () => {
  const r = cosyntropinTest({ cortisol: '22', unit: 'µg/dL' });
  assert.equal(r.valid, true);
  assert.equal(r.threshold, 18);
  assert.equal(r.normal, true);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /normal adrenal response/);
});

test('peak cortisol below 18 µg/dL is suggestive of adrenal insufficiency', () => {
  const r = cosyntropinTest({ cortisol: '12', unit: 'µg/dL' });
  assert.equal(r.normal, false);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /suggestive of adrenal insufficiency/);
});

test('the 18 µg/dL boundary is inclusive (normal)', () => {
  assert.equal(cosyntropinTest({ cortisol: '18', unit: 'µg/dL' }).normal, true);
  assert.equal(cosyntropinTest({ cortisol: '17.9', unit: 'µg/dL' }).normal, false);
});

test('the nmol/L unit uses the 500 nmol/L threshold', () => {
  assert.equal(cosyntropinTest({ cortisol: '520', unit: 'nmol/L' }).normal, true);
  assert.equal(cosyntropinTest({ cortisol: '480', unit: 'nmol/L' }).abnormal, true);
  assert.equal(cosyntropinTest({ cortisol: '500', unit: 'nmol/L' }).threshold, 500);
});

test('the unit defaults to µg/dL when unspecified or unrecognized', () => {
  assert.equal(cosyntropinTest({ cortisol: '20' }).unit, 'µg/dL');
  assert.equal(cosyntropinTest({ cortisol: '20', unit: 'mg/dL' }).threshold, 18);
});

test('a negative or non-numeric cortisol throws; empty input is a guarded message', () => {
  assert.throws(() => cosyntropinTest({ cortisol: '-1' }), RangeError);
  assert.throws(() => cosyntropinTest({ cortisol: 'abc' }), RangeError);
  assert.equal(cosyntropinTest({ cortisol: '' }).valid, false);
  assert.equal(cosyntropinTest({}).valid, false);
});

test('the worked example (22 µg/dL) matches the documented META expected output', () => {
  const r = cosyntropinTest({ cortisol: '22' });
  assert.equal(r.cortisol, 22);
  assert.equal(r.threshold, 18);
  assert.equal(r.normal, true);
  assert.match(r.band, /Peak cortisol 22 µg\/dL/);
});
