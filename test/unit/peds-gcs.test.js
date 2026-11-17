import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pedsGcs } from '../../lib/scoring-v4.js';

test('peds-gcs 15 of 15 (tile example) -> mild', () => {
  const r = pedsGcs({ eye: 4, verbal: 5, motor: 6, ageBand: 'older' });
  assert.equal(r.score, 15);
  assert.equal(r.severity, 'mild');
  assert.match(r.band, /mild per adult GCS bands/);
});

test('peds-gcs 13 (lower edge of mild)', () => {
  const r = pedsGcs({ eye: 3, verbal: 4, motor: 6 });
  assert.equal(r.score, 13);
  assert.equal(r.severity, 'mild');
});

test('peds-gcs 12 (upper edge of moderate)', () => {
  const r = pedsGcs({ eye: 3, verbal: 4, motor: 5 });
  assert.equal(r.score, 12);
  assert.equal(r.severity, 'moderate');
});

test('peds-gcs 9 (lower edge of moderate)', () => {
  const r = pedsGcs({ eye: 2, verbal: 3, motor: 4 });
  assert.equal(r.score, 9);
  assert.equal(r.severity, 'moderate');
});

test('peds-gcs 8 (upper edge of severe)', () => {
  const r = pedsGcs({ eye: 2, verbal: 2, motor: 4 });
  assert.equal(r.score, 8);
  assert.equal(r.severity, 'severe');
});

test('peds-gcs 3 (min)', () => {
  const r = pedsGcs({ eye: 1, verbal: 1, motor: 1 });
  assert.equal(r.score, 3);
  assert.equal(r.severity, 'severe');
});

// spec-v1756: a component outside its own range is refused, not clamped (eye 1-4, verbal 1-5, motor 1-6).
test('peds-gcs refuses a component outside its range', () => {
  assert.throws(() => pedsGcs({ eye: 99, verbal: 5, motor: 6 }), /Eye opening must be between 1 and 4/);
  assert.throws(() => pedsGcs({ eye: 4, verbal: -1, motor: 6 }), /verbal response must be between 1 and 5/);
  assert.throws(() => pedsGcs({ eye: 4, verbal: 5, motor: 99 }), /motor response must be between 1 and 6/);
});

test('peds-gcs band names age group', () => {
  const r = pedsGcs({ eye: 4, verbal: 5, motor: 6, ageBand: 'under-2' });
  assert.match(r.band, /under 2 years/);
});

// spec-v1755: an ordinal item or a count has no value between its steps; a half-step is refused.
test('spec-v1755: peds-gcs refuses a half-step component; whole values and the worked example answer', () => {
  const ex = { eye: 3, verbal: 4, motor: 5, ageBand: 'older' };
  assert.throws(() => pedsGcs({ ...ex, eye: 3.5 }), /Eye opening must be a whole number/);
  assert.throws(() => pedsGcs({ ...ex, motor: 5.5 }), /whole number/);
  assert.equal(pedsGcs({ ...ex, eye: 4 }).score, 13);
  assert.equal(pedsGcs(ex).score, 12);
});
