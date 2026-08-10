// spec-v696: Framingham criteria for heart failure.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { framinghamHfCriteria } from '../../lib/framingham-hf-criteria-v696.js';

test('nothing present -> not met', () => {
  const r = framinghamHfCriteria({});
  assert.equal(r.valid, true);
  assert.equal(r.major, 0);
  assert.equal(r.minor, 0);
  assert.equal(r.met, false);
  assert.equal(r.abnormal, false);
});

test('two major criteria -> met', () => {
  const r = framinghamHfCriteria({ rales: true, s3Gallop: true });
  assert.equal(r.major, 2);
  assert.equal(r.met, true);
  assert.match(r.band, /heart failure \(2 major, 0 minor\)/);
});

test('one major alone -> not met', () => {
  const r = framinghamHfCriteria({ rales: true });
  assert.equal(r.major, 1);
  assert.equal(r.met, false);
});

test('one major + two minor -> met (worked example)', () => {
  const r = framinghamHfCriteria({ rales: 'true', ankleEdema: 'true', dyspneaExertion: 'true' });
  assert.equal(r.major, 1);
  assert.equal(r.minor, 2);
  assert.equal(r.met, true);
  assert.match(r.band, /heart failure \(1 major, 2 minor\)/);
});

test('one major + one minor -> not met', () => {
  const r = framinghamHfCriteria({ rales: true, ankleEdema: true });
  assert.equal(r.met, false);
});

test('many minor but no major -> not met', () => {
  const r = framinghamHfCriteria({ ankleEdema: true, dyspneaExertion: true, hepatomegaly: true, nocturnalCough: true });
  assert.equal(r.major, 0);
  assert.equal(r.minor, 4);
  assert.equal(r.met, false);
});
