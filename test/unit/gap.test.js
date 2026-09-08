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

// spec-v1154: GAP runs higher-is-better, so a blank systolic read as 0 scored the
// hypotensive band and INVENTED an alarm rather than softening the reading.
test('gap: a blank systolic is a gap, and the worst case is labelled as one', () => {
  const stated = gap({ gcs: 15, ageLt60: true, sbp: 130 });
  assert.equal(stated.score, 24);
  assert.equal(stated.risk, 'low');
  assert.equal(stated.sbpStated, true);

  // The defect, stated: 24 -> 18, and "low risk" -> "moderate risk".
  const blank = gap({ gcs: 15, ageLt60: true, sbp: null });
  assert.equal(blank.score, 18);
  assert.equal(blank.sbpStated, false);
  assert.equal(blank.risk, null);
  assert.match(blank.band, /WORST case/);
  assert.match(blank.band, /would make it 24 and low risk/);
  assert.match(blank.band, /Enter the systolic BP/);

  // A typed 0 is an answer: the hypotensive band is real.
  const typedZero = gap({ gcs: 15, ageLt60: true, sbp: 0 });
  assert.equal(typedZero.sbpStated, true);
  assert.equal(typedZero.score, 18);
  assert.equal(typedZero.risk, 'moderate');

  // Rule 25: when every value the missing field could take lands in the same band,
  // the reading stands rather than hedging.
  const decided = gap({ gcs: 3, ageLt60: false, sbp: null });
  assert.equal(decided.risk, 'high');
  assert.match(decided.band, /every value it could take leaves the band at high/);
});
