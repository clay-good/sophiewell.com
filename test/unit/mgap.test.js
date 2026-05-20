import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mgap } from '../../lib/scoring-v4.js';

test('mgap blunt + GCS 15 + age<60 + SBP 130 -> 29 low risk', () => {
  const r = mgap({ mechanismBlunt: true, gcs: 15, ageLt60: true, sbp: 130 });
  assert.equal(r.score, 4 + 15 + 5 + 5);
  assert.equal(r.risk, 'low');
  assert.match(r.band, /low risk per Sartorius 2010/);
});

test('mgap penetrating + GCS 8 + age>=60 + SBP 80 -> 11 high risk', () => {
  const r = mgap({ mechanismBlunt: false, gcs: 8, ageLt60: false, sbp: 80 });
  assert.equal(r.score, 0 + 8 + 0 + 3);
  assert.equal(r.risk, 'high');
});

test('mgap boundary 18 -> moderate, 17 -> high', () => {
  const lo = mgap({ mechanismBlunt: true, gcs: 9, ageLt60: false, sbp: 130 });
  assert.equal(lo.score, 18);
  assert.equal(lo.risk, 'moderate');
  const hi = mgap({ mechanismBlunt: true, gcs: 8, ageLt60: false, sbp: 130 });
  assert.equal(hi.score, 17);
  assert.equal(hi.risk, 'high');
});

test('mgap rejects out-of-range GCS', () => {
  assert.throws(() => mgap({ mechanismBlunt: true, gcs: 2, ageLt60: true, sbp: 100 }));
  assert.throws(() => mgap({ mechanismBlunt: true, gcs: 16, ageLt60: true, sbp: 100 }));
});
