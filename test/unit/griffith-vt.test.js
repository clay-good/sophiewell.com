// spec-v784: Griffith algorithm for wide-complex tachycardia.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { griffithVt } from '../../lib/griffith-vt-v784.js';

test('nothing ticked -> VT, because VT is the default', () => {
  const r = griffithVt({});
  assert.equal(r.valid, true);
  assert.equal(r.diagnosis, 'VT');
  assert.equal(r.abnormal, true);
});

test('right bundle: both criteria present -> SVT with aberrancy', () => {
  const r = griffithVt({ pattern: 'rbbb', rsrV1: true, rsV6RTaller: true });
  assert.equal(r.diagnosis, 'SVT with aberrancy');
  assert.equal(r.typical, true);
  assert.deepEqual(r.missingCriteria, []);
});

test('right bundle: one criterion missing -> VT, and it names which', () => {
  const r = griffithVt({ pattern: 'rbbb', rsrV1: true });
  assert.equal(r.diagnosis, 'VT');
  assert.deepEqual(r.missingCriteria, ['RS in V6 with R taller than S']);
});

test('left bundle: all three present -> SVT with aberrancy', () => {
  const r = griffithVt({ pattern: 'lbbb', rsOrQsV1V2: 'true', nadirUnder70: 'true', rNoQV6: 'true' });
  assert.equal(r.diagnosis, 'SVT with aberrancy');
  assert.equal(r.typical, true);
});

test('left bundle needs all THREE: two out of three is still VT', () => {
  const r = griffithVt({ pattern: 'lbbb', rsOrQsV1V2: true, nadirUnder70: true });
  assert.equal(r.diagnosis, 'VT');
  assert.equal(r.missingCriteria.length, 1);
});

test('the branches are separate: right bundle ticks do not satisfy left bundle', () => {
  const r = griffithVt({ pattern: 'lbbb', rsrV1: true, rsV6RTaller: true });
  assert.equal(r.diagnosis, 'VT');
  assert.equal(r.missingCriteria.length, 3);
});

test('an unknown pattern is rejected rather than defaulting silently', () => {
  const r = griffithVt({ pattern: 'bifascicular' });
  assert.equal(r.valid, false);
  assert.equal(r.field, 'pattern');
});
