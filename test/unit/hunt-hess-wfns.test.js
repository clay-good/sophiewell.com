import { test } from 'node:test';
import assert from 'node:assert/strict';
import { huntHessWfns } from '../../lib/scoring-v4.js';

test('hunt-hess-wfns 1 / 1 (tile example: GCS 15, HH I) -> WFNS 1', () => {
  const r = huntHessWfns({ huntHess: 1, gcs: 15 });
  assert.equal(r.huntHess, 1);
  assert.equal(r.wfns, 1);
});

test('GCS 14 no focal -> WFNS 2', () => {
  const r = huntHessWfns({ huntHess: 2, gcs: 14 });
  assert.equal(r.wfns, 2);
});

test('GCS 13 with focal -> WFNS 3', () => {
  const r = huntHessWfns({ huntHess: 3, gcs: 13, focalMotorDeficit: true });
  assert.equal(r.wfns, 3);
});

test('GCS 7 -> WFNS 4', () => {
  const r = huntHessWfns({ huntHess: 4, gcs: 7 });
  assert.equal(r.wfns, 4);
});

test('GCS 12 with focal -> WFNS 4', () => {
  const r = huntHessWfns({ huntHess: 4, gcs: 12, focalMotorDeficit: true });
  assert.equal(r.wfns, 4);
});

test('GCS 6 -> WFNS 5', () => {
  const r = huntHessWfns({ huntHess: 5, gcs: 6 });
  assert.equal(r.wfns, 5);
});

test('rejects out-of-range Hunt-Hess or GCS', () => {
  assert.throws(() => huntHessWfns({ huntHess: 0, gcs: 15 }));
  assert.throws(() => huntHessWfns({ huntHess: 6, gcs: 15 }));
  assert.throws(() => huntHessWfns({ huntHess: 3, gcs: 2 }));
});
