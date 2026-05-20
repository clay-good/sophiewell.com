import { test } from 'node:test';
import assert from 'node:assert/strict';
import { big } from '../../lib/scoring-v4.js';

test('big BD 0, INR 1, GCS 15 -> 2.5; below threshold', () => {
  const r = big({ baseDeficit: 0, inr: 1, gcs: 15 });
  assert.equal(r.score, 2.5);
  assert.equal(r.highMortalityRisk, false);
});

test('big BD 8, INR 2, GCS 8 -> 20; high risk', () => {
  const r = big({ baseDeficit: 8, inr: 2, gcs: 8 });
  assert.equal(r.score, 8 + 5 + 7);
  assert.equal(r.highMortalityRisk, true);
  assert.match(r.band, /high predicted mortality per Borgman 2011/);
});

test('big boundary 16 -> high risk', () => {
  const r = big({ baseDeficit: 6, inr: 2, gcs: 10 });
  assert.equal(r.score, 6 + 5 + 5);
  assert.equal(r.highMortalityRisk, true);
});

test('big rejects out-of-range GCS', () => {
  assert.throws(() => big({ baseDeficit: 0, inr: 1, gcs: 2 }));
});
