// spec-v664: ASE/EACVI 2016 LV diastolic function screen (normal EF).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { diastolicFunctionAse } from '../../lib/diastolic-function-ase-v664.js';

test('all four abnormal = diastolic dysfunction', () => {
  const r = diastolicFunctionAse({ avgEe: '16', septalE: '6', trVelocity: '3.0', lavi: '40' });
  assert.equal(r.category, 'dysfunction');
  assert.equal(r.positive, 4);
  assert.equal(r.available, 4);
  assert.equal(r.abnormal, true);
});

test('all four normal = normal diastolic function', () => {
  const r = diastolicFunctionAse({ avgEe: '10', septalE: '9', lateralE: '12', trVelocity: '2.0', lavi: '28' });
  assert.equal(r.category, 'normal');
  assert.equal(r.positive, 0);
});

test('exactly half abnormal = indeterminate (2 of 4)', () => {
  const r = diastolicFunctionAse({ avgEe: '16', septalE: '9', lateralE: '12', trVelocity: '2.0', lavi: '40' }); // Ee+ lavi+ (annular-, tr-)
  assert.equal(r.available, 4);
  assert.equal(r.positive, 2);
  assert.equal(r.category, 'indeterminate');
});

test('strict inequalities: values on the threshold are normal', () => {
  const r = diastolicFunctionAse({ avgEe: '14', septalE: '7', lateralE: '10', trVelocity: '2.8', lavi: '34' });
  assert.equal(r.positive, 0);
  assert.equal(r.category, 'normal');
});

test('annular e-prime criterion fires on either arm; septal < 7 or lateral < 10', () => {
  assert.equal(diastolicFunctionAse({ septalE: '6', lateralE: '12' }).positive, 1); // septal < 7
  assert.equal(diastolicFunctionAse({ septalE: '8', lateralE: '9' }).positive, 1); // lateral < 10
  assert.equal(diastolicFunctionAse({ septalE: '8', lateralE: '12' }).positive, 0);
});

test('denominator is the number of AVAILABLE criteria, not always 4', () => {
  // Only 3 provided: E/e' abnormal, TR normal, LAVI abnormal -> 2/3 > 50% -> dysfunction
  const r = diastolicFunctionAse({ avgEe: '16', trVelocity: '2.0', lavi: '40' });
  assert.equal(r.available, 3);
  assert.equal(r.positive, 2);
  assert.equal(r.category, 'dysfunction');
  assert.equal(r.fewCriteria, false);
});

test('at least one criterion is required', () => {
  assert.equal(diastolicFunctionAse({}).valid, false);
  assert.equal(diastolicFunctionAse({}).code, 'MISSING_INPUT');
});
