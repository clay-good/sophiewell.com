// spec-v120 2.1: STESS (Rossetti 2008). Consciousness 0-1, worst seizure type
// 0-2, age >= 65 (+2), no/unknown prior seizures (+1); total 0-6; dichotomy
// >= 3 is unfavorable.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stess } from '../../lib/neuro-v120.js';

test('all 0-point levels -> 0/6, favorable', () => {
  const r = stess({ consciousness: '0', seizureType: '0' });
  assert.equal(r.valid, true);
  assert.equal(r.total, 0);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /favorable score \(0-2\)/);
});

test('comatose + generalized convulsive -> 2/6, still favorable (below >= 3)', () => {
  const r = stess({ consciousness: '1', seizureType: '1' });
  assert.equal(r.total, 2);
  assert.equal(r.abnormal, false);
});

test('comatose + NCSE in coma -> 3/6, crosses the unfavorable threshold', () => {
  const r = stess({ consciousness: '1', seizureType: '2' });
  assert.equal(r.total, 3);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /unfavorable score \(>= 3\)/);
});

test('age >= 65 alone -> 2/6, then adding no-prior crosses to 3/6', () => {
  assert.equal(stess({ age65: true }).total, 2);
  const r = stess({ age65: true, noPrior: true });
  assert.equal(r.total, 3);
  assert.equal(r.abnormal, true);
});

test('every item at maximum -> 6/6 (clamped max)', () => {
  const r = stess({ consciousness: '1', seizureType: '2', age65: true, noPrior: true });
  assert.equal(r.total, 6);
  assert.equal(r.abnormal, true);
});

test('scalar / non-object fuzz arg yields a valid 0/6, never NaN', () => {
  const r = stess(9);
  assert.equal(r.valid, true);
  assert.equal(r.total, 0);
  assert.equal(Number.isFinite(r.total), true);
});
