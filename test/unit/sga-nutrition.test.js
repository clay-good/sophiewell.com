// spec-v208 2.1: Subjective Global Assessment (Detsky) - an A/B/C clinician
// gestalt recorder (no numeric score). Structure spec-v97 cross-verified
// (Detsky 1987 + standard nutrition references).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sga } from '../../lib/nutrition-maternal-v208.js';

test('rating C -> severely malnourished (worked example)', () => {
  const r = sga({ rating: 'C' });
  assert.equal(r.valid, true);
  assert.equal(r.rating, 'C');
  assert.equal(r.abnormal, true);
  assert.match(r.band, /severely malnourished/);
});

test('rating A -> well nourished, not abnormal', () => {
  const r = sga({ rating: 'A' });
  assert.equal(r.abnormal, false);
  assert.match(r.band, /well nourished/);
});

test('rating B -> moderate/suspected malnutrition', () => {
  const r = sga({ rating: 'B' });
  assert.equal(r.abnormal, true);
  assert.match(r.band, /moderately/);
});

test('no rating -> complete-the-fields', () => {
  const r = sga({});
  assert.equal(r.valid, false);
  assert.match(r.message, /overall SGA rating/);
});

test('an invalid rating is rejected', () => {
  const r = sga({ rating: 'D' });
  assert.equal(r.valid, false);
});
