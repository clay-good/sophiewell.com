import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gap } from '../../lib/scoring-v4.js';

test('gap GCS 15 + age<60 + SBP 130 -> 24 low risk', () => {
  const r = gap({ gcs: 15, ageLt60: true, sbp: 130 });
  assert.equal(r.score, 15 + 3 + 6);
  assert.equal(r.risk, 'low');
  assert.match(r.band, /low risk per Kondo 2011/);
});

test('gap GCS 5 + age>=60 + SBP 50 -> 5 high risk', () => {
  const r = gap({ gcs: 5, ageLt60: false, sbp: 50 });
  assert.equal(r.score, 5 + 0 + 0);
  assert.equal(r.risk, 'high');
});

test('gap boundary 10 -> high, 11 -> moderate, 19 -> low', () => {
  const a = gap({ gcs: 6, ageLt60: false, sbp: 80 });
  assert.equal(a.score, 10);
  assert.equal(a.risk, 'high');
  const b = gap({ gcs: 7, ageLt60: false, sbp: 80 });
  assert.equal(b.score, 11);
  assert.equal(b.risk, 'moderate');
  const c = gap({ gcs: 13, ageLt60: false, sbp: 130 });
  assert.equal(c.score, 19);
  assert.equal(c.risk, 'low');
});
