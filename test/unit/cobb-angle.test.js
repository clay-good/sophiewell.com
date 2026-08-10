// spec-v694: Cobb angle scoliosis severity interpretation.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { cobbAngle } from '../../lib/cobb-angle-v694.js';

test('bands: <10 none, 10-24 mild, 25-44 moderate, >=45 severe', () => {
  assert.equal(cobbAngle({ angle: '5' }).category, 'none');
  assert.equal(cobbAngle({ angle: '18' }).category, 'mild');
  assert.equal(cobbAngle({ angle: '30' }).category, 'moderate');
  assert.equal(cobbAngle({ angle: '60' }).category, 'severe');
});

test('band boundaries are exact (10, 25, 45)', () => {
  assert.equal(cobbAngle({ angle: '9' }).category, 'none');
  assert.equal(cobbAngle({ angle: '10' }).category, 'mild');
  assert.equal(cobbAngle({ angle: '24' }).category, 'mild');
  assert.equal(cobbAngle({ angle: '25' }).category, 'moderate');
  assert.equal(cobbAngle({ angle: '44' }).category, 'moderate');
  assert.equal(cobbAngle({ angle: '45' }).category, 'severe');
});

test('scoliosis flag is set at >= 10 degrees', () => {
  assert.equal(cobbAngle({ angle: '9' }).isScoliosis, false);
  assert.equal(cobbAngle({ angle: '10' }).isScoliosis, true);
});

test('abnormal flag set at >= 25 (management-relevant)', () => {
  assert.equal(cobbAngle({ angle: '20' }).abnormal, false);
  assert.equal(cobbAngle({ angle: '25' }).abnormal, true);
});

test('detail mentions bracing zone (25-40) and surgery zone (>=45)', () => {
  assert.match(cobbAngle({ angle: '30' }).detail, /bracing/);
  assert.match(cobbAngle({ angle: '50' }).detail, /surgery/);
});

test('META example: 30 degrees -> moderate scoliosis', () => {
  const r = cobbAngle({ angle: '30' });
  assert.equal(r.category, 'moderate');
  assert.match(r.band, /Cobb 30/);
});

test('angle is a required 0-180 number', () => {
  assert.equal(cobbAngle({}).valid, false);
  assert.equal(cobbAngle({}).code, 'MISSING_INPUT');
  assert.equal(cobbAngle({ angle: '-5' }).valid, false);
  assert.equal(cobbAngle({ angle: '200' }).valid, false);
});
