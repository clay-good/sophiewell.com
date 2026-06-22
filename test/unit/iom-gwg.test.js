// spec-v138 2.6: IOM gestational weight gain (IOM 2009 / ACOG CO 548). Pre-pregnancy
// BMI category -> total gain range + 2nd/3rd-trimester weekly rate. BMI = 703*lb/in^2.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { iomGwg } from '../../lib/ob-v138.js';

test('worked example obese-category singleton -> 11-20 lb', () => {
  const r = iomGwg({ weight: 200, height: 64 });
  assert.equal(r.valid, true);
  assert.equal(r.bmi, 34.3);
  assert.equal(r.category, 'obese');
  assert.match(r.band, /11-20 lb/);
  assert.match(r.band, /singleton/);
});

test('normal-weight singleton -> 25-35 lb', () => {
  const r = iomGwg({ weight: 130, height: 65 });
  assert.equal(r.category, 'normal weight');
  assert.match(r.band, /25-35 lb/);
});

test('overweight twin -> 31-50 lb provisional range', () => {
  const r = iomGwg({ weight: 170, height: 64, twin: 'yes' });
  assert.equal(r.category, 'overweight');
  assert.match(r.band, /31-50 lb/);
  assert.match(r.band, /twin/);
});

test('underweight twin -> no IOM recommendation', () => {
  const r = iomGwg({ weight: 100, height: 66, twin: 'yes' });
  assert.equal(r.category, 'underweight');
  assert.match(r.band, /no twin recommendation/);
});

test('non-positive / missing inputs -> valid:false', () => {
  assert.equal(iomGwg({ weight: 0, height: 64 }).valid, false);
  assert.equal(iomGwg({ weight: 150 }).valid, false);
  assert.equal(iomGwg(5).valid, false);
});
