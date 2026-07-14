// spec-v304: 1-mg overnight dexamethasone suppression test (DST). Worked-example
// tests: the µg/dL cutoff (<1.8 suppressed, >=1.8 fails), the nmol/L cutoff (<50
// vs >=50), the boundary (strict: below cutoff suppresses), the default unit, the
// negative / non-numeric guards, and the empty-input guard. Cutoff cross-verified
// against the Endocrine Society 2008 Cushing guideline and current reviews
// (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dexSuppressionTest } from '../../lib/dst-v304.js';

test('cortisol below 1.8 µg/dL is normal suppression', () => {
  const r = dexSuppressionTest({ cortisol: '1.2', unit: 'µg/dL' });
  assert.equal(r.valid, true);
  assert.equal(r.cutoff, 1.8);
  assert.equal(r.suppressed, true);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /normal suppression/);
});

test('cortisol at or above 1.8 µg/dL is a failure to suppress', () => {
  const r = dexSuppressionTest({ cortisol: '3', unit: 'µg/dL' });
  assert.equal(r.suppressed, false);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /failure to suppress/);
});

test('the 1.8 µg/dL boundary is strict: 1.8 fails to suppress, 1.79 suppresses', () => {
  assert.equal(dexSuppressionTest({ cortisol: '1.8', unit: 'µg/dL' }).suppressed, false);
  assert.equal(dexSuppressionTest({ cortisol: '1.79', unit: 'µg/dL' }).suppressed, true);
});

test('the nmol/L unit uses the 50 nmol/L cutoff', () => {
  assert.equal(dexSuppressionTest({ cortisol: '40', unit: 'nmol/L' }).suppressed, true);
  assert.equal(dexSuppressionTest({ cortisol: '60', unit: 'nmol/L' }).abnormal, true);
  assert.equal(dexSuppressionTest({ cortisol: '50', unit: 'nmol/L' }).cutoff, 50);
});

test('the unit defaults to µg/dL when unspecified or unrecognized', () => {
  assert.equal(dexSuppressionTest({ cortisol: '1' }).unit, 'µg/dL');
  assert.equal(dexSuppressionTest({ cortisol: '1', unit: 'mg/dL' }).cutoff, 1.8);
});

test('a negative or non-numeric cortisol throws; empty input is a guarded message', () => {
  assert.throws(() => dexSuppressionTest({ cortisol: '-1' }), RangeError);
  assert.throws(() => dexSuppressionTest({ cortisol: 'abc' }), RangeError);
  assert.equal(dexSuppressionTest({ cortisol: '' }).valid, false);
  assert.equal(dexSuppressionTest({}).valid, false);
});

test('the worked example (3 µg/dL) matches the documented META expected output', () => {
  const r = dexSuppressionTest({ cortisol: '3' });
  assert.equal(r.cortisol, 3);
  assert.equal(r.cutoff, 1.8);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /Post-dexamethasone cortisol 3 µg\/dL/);
});
