// spec-v1635 backfill: radioactivity and radiation dose pairs in the unit converter.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { convert } from '../../lib/clinical.js';

test('activity: one curie is 3.7 x 10^10 becquerels (10 CFR 20.1005)', () => {
  assert.equal(convert(1, 'Ci', 'Bq', 'activity'), 3.7e10);
  assert.equal(convert(1, 'mCi', 'MBq', 'activity'), 37);
  assert.equal(convert(370, 'MBq', 'mCi', 'activity'), 10);
  assert.equal(convert(1, 'GBq', 'mCi', 'activity'), 27.027027027);
  // The sealed-source leak test figure, 10 CFR 35.67: 0.005 microcurie is 185 becquerels.
  assert.equal(convert(0.005, 'uCi', 'Bq', 'activity'), 185);
  assert.equal(convert(0.005, 'µCi', 'Bq', 'activity'), 185);
});

test('dose equivalent and absorbed dose (10 CFR 20.1004)', () => {
  // The patient-release figure, 10 CFR 35.75: 0.5 rem is 5 millisieverts.
  assert.equal(convert(0.5, 'rem', 'mSv', 'dose-equivalent'), 5);
  assert.equal(convert(1, 'Sv', 'rem', 'dose-equivalent'), 100);
  assert.equal(convert(100, 'mrem', 'mSv', 'dose-equivalent'), 1);
  assert.equal(convert(1, 'rad', 'Gy', 'absorbed-dose'), 0.01);
  assert.equal(convert(200, 'cGy', 'Gy', 'absorbed-dose'), 2);
  assert.equal(convert(1, 'Gy', 'rad', 'absorbed-dose'), 100);
});

test('an absorbed dose is not converted to a dose equivalent, and an inherited name is not a unit', () => {
  assert.throws(() => convert(1, 'rad', 'rem', 'absorbed-dose'), /unknown unit/);
  assert.throws(() => convert(1, 'rem', 'Gy', 'dose-equivalent'), /unknown unit/);
  assert.throws(() => convert(1, 'constructor', 'Bq', 'activity'), /unknown unit/);
  assert.equal(convert(70, 'kg', 'lb', 'weight'), 70 / 0.45359237);
});
