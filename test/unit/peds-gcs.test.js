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

test('peds-gcs clamps per-component to component range', () => {
  const r = pedsGcs({ eye: 99, verbal: -1, motor: 99 });
  assert.equal(r.parts.eye, 4);
  assert.equal(r.parts.verbal, 1);
  assert.equal(r.parts.motor, 6);
});

test('peds-gcs band names age group', () => {
  const r = pedsGcs({ eye: 4, verbal: 5, motor: 6, ageBand: 'under-2' });
  assert.match(r.band, /under 2 years/);
});
