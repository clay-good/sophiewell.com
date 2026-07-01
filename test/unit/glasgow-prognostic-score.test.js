// spec-v187 §2.5: modified Glasgow Prognostic Score (mGPS).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { glasgowPrognosticScore } from '../../lib/onc-staging-v187.js';

test('tile example: elevated CRP with hypoalbuminemia -> 2', () => {
  const r = glasgowPrognosticScore({ crp: 25, albumin: 3.0 });
  assert.equal(r.valid, true);
  assert.equal(r.score, 2);
  assert.equal(r.abnormal, true);
});

test('CRP <= 10 is 0 regardless of albumin', () => {
  assert.equal(glasgowPrognosticScore({ crp: 5, albumin: 3.0 }).score, 0);
  assert.equal(glasgowPrognosticScore({ crp: 10, albumin: 2.5 }).score, 0);
});

test('CRP > 10 with preserved albumin (>= 3.5) is 1', () => {
  const r = glasgowPrognosticScore({ crp: 25, albumin: 4.0 });
  assert.equal(r.score, 1);
});

test('the albumin 3.5 boundary splits 1 vs 2', () => {
  assert.equal(glasgowPrognosticScore({ crp: 25, albumin: 3.5 }).score, 1);
  assert.equal(glasgowPrognosticScore({ crp: 25, albumin: 3.49 }).score, 2);
});

test('guards: CRP and albumin required', () => {
  assert.equal(glasgowPrognosticScore({ crp: 25 }).valid, false);
  assert.equal(glasgowPrognosticScore({}).valid, false);
});
