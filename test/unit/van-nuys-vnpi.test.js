// spec-v652: USC/Van Nuys Prognostic Index (VNPI) for DCIS.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { vanNuysVnpi } from '../../lib/van-nuys-vnpi-v652.js';

test('range: minimum 4 (all best) and maximum 12 (all worst)', () => {
  assert.equal(vanNuysVnpi({ size: '10', margin: '15', classification: '1', age: '70' }).total, 4);
  assert.equal(vanNuysVnpi({ size: '50', margin: '0.5', classification: '3', age: '30' }).total, 12);
});

test('size binning: <=15 = 1, 16-40 = 2, >=41 = 3', () => {
  assert.equal(vanNuysVnpi({ size: '15', margin: '15', classification: '1', age: '70' }).sizeScore, 1);
  assert.equal(vanNuysVnpi({ size: '16', margin: '15', classification: '1', age: '70' }).sizeScore, 2);
  assert.equal(vanNuysVnpi({ size: '40', margin: '15', classification: '1', age: '70' }).sizeScore, 2);
  assert.equal(vanNuysVnpi({ size: '41', margin: '15', classification: '1', age: '70' }).sizeScore, 3);
});

test('margin binning: >=10 = 1, 1 to <10 = 2, <1 = 3', () => {
  assert.equal(vanNuysVnpi({ size: '10', margin: '10', classification: '1', age: '70' }).marginScore, 1);
  assert.equal(vanNuysVnpi({ size: '10', margin: '9.9', classification: '1', age: '70' }).marginScore, 2);
  assert.equal(vanNuysVnpi({ size: '10', margin: '1', classification: '1', age: '70' }).marginScore, 2);
  assert.equal(vanNuysVnpi({ size: '10', margin: '0.9', classification: '1', age: '70' }).marginScore, 3);
});

test('age binning: >60 = 1, 40-60 = 2, <40 = 3 (endpoints 40 and 60 are the middle band)', () => {
  assert.equal(vanNuysVnpi({ size: '10', margin: '15', classification: '1', age: '61' }).ageScore, 1);
  assert.equal(vanNuysVnpi({ size: '10', margin: '15', classification: '1', age: '60' }).ageScore, 2);
  assert.equal(vanNuysVnpi({ size: '10', margin: '15', classification: '1', age: '40' }).ageScore, 2);
  assert.equal(vanNuysVnpi({ size: '10', margin: '15', classification: '1', age: '39' }).ageScore, 3);
});

test('risk bands: 4-6 low, 7-9 intermediate, 10-12 high (exact boundaries)', () => {
  assert.equal(vanNuysVnpi({ size: '10', margin: '15', classification: '2', age: '50' }).group, 'low'); // 1+1+2+2=6
  assert.equal(vanNuysVnpi({ size: '20', margin: '15', classification: '2', age: '50' }).group, 'intermediate'); // 2+1+2+2=7
  assert.equal(vanNuysVnpi({ size: '20', margin: '5', classification: '3', age: '50' }).group, 'intermediate'); // 2+2+3+2=9
  assert.equal(vanNuysVnpi({ size: '50', margin: '5', classification: '3', age: '50' }).group, 'high'); // 3+2+3+2=10
});

test('META example: 20 mm (2) + 5 mm margin (2) + high grade (3) + age 45 (2) = 9, intermediate', () => {
  const r = vanNuysVnpi({ size: '20', margin: '5', classification: '3', age: '45' });
  assert.equal(r.total, 9);
  assert.equal(r.group, 'intermediate');
  assert.equal(r.groupLabel, 'intermediate risk');
  assert.match(r.bandLabel, /USC\/VNPI 9 of 12/);
  assert.match(r.bandLabel, /intermediate risk/);
});

test('all four factors required; ranges enforced', () => {
  assert.equal(vanNuysVnpi({ size: '20', margin: '5', classification: '3' }).valid, false);
  assert.equal(vanNuysVnpi({ size: '20', margin: '5', classification: '3' }).code, 'MISSING_INPUT');
  assert.equal(vanNuysVnpi({ size: '0', margin: '5', classification: '3', age: '45' }).valid, false);
  assert.equal(vanNuysVnpi({ size: '20', margin: '-1', classification: '3', age: '45' }).valid, false);
  assert.equal(vanNuysVnpi({ size: '20', margin: '5', classification: '4', age: '45' }).valid, false);
});
