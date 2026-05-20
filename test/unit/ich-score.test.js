import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ichScore } from '../../lib/scoring-v4.js';

test('ich-score 0 (tile example: GCS 15, age 70, vol 10) -> 0%', () => {
  const r = ichScore({ gcs: 15, age: 70, ichVolumeMl: 10 });
  assert.equal(r.score, 0);
  assert.equal(r.mortality30d, '0%');
});

test('ich-score 1 (age >=80 alone) -> 13%', () => {
  const r = ichScore({ gcs: 15, age: 80, ichVolumeMl: 10 });
  assert.equal(r.score, 1);
  assert.equal(r.mortality30d, '13%');
});

test('ich-score 2 (GCS 5-12 + age>=80) -> 26%', () => {
  const r = ichScore({ gcs: 12, age: 80, ichVolumeMl: 10 });
  assert.equal(r.score, 2);
  assert.equal(r.mortality30d, '26%');
});

test('ich-score 3 (GCS 5-12 + vol>=30 + IVH) -> 72%', () => {
  const r = ichScore({ gcs: 8, age: 50, ichVolumeMl: 50, ivh: true });
  assert.equal(r.score, 3);
  assert.equal(r.mortality30d, '72%');
});

test('ich-score 4 (GCS 3-4 + vol>=30 + IVH) -> 97%', () => {
  const r = ichScore({ gcs: 4, age: 50, ichVolumeMl: 50, ivh: true });
  assert.equal(r.score, 4);
  assert.equal(r.mortality30d, '97%');
});

test('ich-score 6 (all 5 maxima) -> 100%', () => {
  const r = ichScore({ gcs: 3, age: 90, ichVolumeMl: 60, infratentorial: true, ivh: true });
  assert.equal(r.score, 6);
  assert.equal(r.mortality30d, '100%');
});

test('ich-score rejects bad inputs', () => {
  assert.throws(() => ichScore({ gcs: 2, age: 50, ichVolumeMl: 10 }));
  assert.throws(() => ichScore({ gcs: 15, age: -1, ichVolumeMl: 10 }));
  assert.throws(() => ichScore({ gcs: 15, age: 50, ichVolumeMl: -1 }));
});
