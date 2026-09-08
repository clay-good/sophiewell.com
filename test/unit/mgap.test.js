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

// spec-v1154: the same shape as gap() -- a blank systolic scored the hypotensive
// band on a score where higher is better.
test('mgap: a blank systolic is a gap, and a decided band still stands', () => {
  const stated = mgap({ mechanismBlunt: true, gcs: 15, ageLt60: true, sbp: 130 });
  assert.equal(stated.score, 29);
  assert.equal(stated.risk, 'low');

  // The worked example's band cannot change, so the reading stands (rule 25).
  const decided = mgap({ mechanismBlunt: true, gcs: 15, ageLt60: true, sbp: null });
  assert.equal(decided.score, 24);
  assert.equal(decided.sbpStated, false);
  assert.equal(decided.risk, 'low');
  assert.match(decided.band, /every value it could take leaves the band at low/);

  // Where it does change, the worst case is labelled as one.
  const moves = mgap({ mechanismBlunt: false, gcs: 14, ageLt60: false, sbp: null });
  assert.equal(moves.risk, null);
  assert.match(moves.band, /WORST case/);
  assert.match(moves.band, /Enter the systolic BP/);

  // A typed 0 is an answer.
  assert.equal(mgap({ mechanismBlunt: true, gcs: 15, ageLt60: true, sbp: 0 }).sbpStated, true);
});
